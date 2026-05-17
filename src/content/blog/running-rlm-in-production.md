---
title: "Running Recursive Language Models in production"
description: "Notes from wiring rlm behind a real coding agent: REPL contract holes, the REPL-vs-tool-calling paradigm mismatch, and the mode flag we ended up adding."
pubDate: 2026-05-17
tags: ["rlm", "agents", "llms", "production"]
---

[Recursive Language Models](https://arxiv.org/abs/2512.24601) (RLMs) replace
the canonical `llm.completion(prompt)` call with an `rlm.completion(prompt)`
that exposes the context as a variable inside a REPL, then lets the model
decompose, recurse, and call itself over near-infinite-length inputs. The
reference implementation from MIT OASYS is clean and the paper is fun. None
of that prepares you for what happens when you put it behind a real coding
agent.

Over the last few weeks at Etiya we hooked rlm up to OpenCode (an
OpenAI-spec coding client) with MiniMax-M2.7 as the upstream model and ran
enough real traffic through it to find the bugs that unit tests miss. Two
clusters of findings worth writing down.

## 1. The REPL contract was guessable but not actually correct

The system prompt advertises a small surface area to the model — `llm_query`,
`llm_query_batched`, `rlm_query`, `FINAL`, `FINAL_VAR`, `SHOW_VARS`. The
model emits Python that touches those names. In production trajectories we
saw three failure modes within the first day.

**Kwarg names the model invents.** The canonical signature is
`llm_query_batched(prompts, model=None)`. The model writes
`llm_query_batched(queries=[...])` roughly a third of the time — `queries`
is the more natural English word for a list of LM calls, and it appears all
over the literature. Result: `TypeError: unexpected keyword argument
'queries'`, an unrecoverable scratchpad line, and a wasted iteration before
the model retries with positional args (if at all). We added `queries=` as
an explicit alias on both `llm_query_batched` and `rlm_query_batched`, with
a both-set / neither-set guard that raises a helpful `TypeError`. The fix
also has to land in the docker / e2b / modal / prime / daytona env
templates, not just `local_repl.py` — the same pattern is duplicated in six
files and the bug surfaces in any of them.

**`FINAL(value)` was advertised but undefined.** The prompt teaches both
`FINAL_VAR("name")` (look up a variable by name and return its value as the
final answer) and `FINAL(value)` (return a literal). Only the first was
registered as a REPL global; the second was rescued by a regex parser
sitting on top of stderr. About 60% of the final-answer attempts in our
last trajectory dump hit `NameError: name 'FINAL' is not defined` before
the rescue path kicked in. We defined `FINAL` properly inside the REPL,
added it to the reserved-tools set so user code can't shadow it, and
restored it after every `execute_code` call. The regex rescue still runs
as a safety net but is no longer the primary path.

**Silent stderr.** When the REPL did throw a `NameError` or `TypeError`,
it disappeared. The `repl_complete` event on the SSE stream carried
`stdout` but not `stderr`, so neither the model (in its scratchpad) nor
the operator (in the trace viewer) could see what failed. Plumbing
`stderr_preview` through the hook signature, the JSON path, and the
alternate streaming producer was a one-line idea and an afternoon of
contract drift to fix. There were *two* producers emitting `repl_complete`
payloads with different shapes; the second one needed the new field too.

None of these are dramatic. All three were obvious in retrospect. None
were caught by the existing pytest suite because the suite tested the
canonical signature, the `FINAL_VAR` path, and the happy stdout case —
exactly the things the model didn't do.

## 2. The bigger finding: two paradigms in one socket

The REPL contract bugs are scaffolding. The architectural bug is that
rlm's REPL paradigm and OpenCode's tool-calling paradigm are not the same
shape, and putting them in series doesn't compose.

Concretely: MiniMax models emit tool calls as `<minimax:tool_call>` XML.
rlm's translator catches that XML and rewrites it as a Python REPL block
— `read("/path/to/file")` — assuming `read` is a REPL function. But `read`
is OpenCode's *client-side* tool: it expects the request to halt, the
client to execute the read on the user's filesystem, and the result to
come back as a `tool` role message on the next request. The REPL has no
such function. `NameError: name 'read' is not defined`, server-side,
while OpenCode is waiting for a `delta.tool_calls` chunk that will never
come. Agent loop never closes; user sees scratchpad spew.

The mismatch is total. rlm's tools live as Python functions in the
sandbox's globals; OpenCode's tools live as OpenAI-spec JSON schemas in
the request body. rlm executes calls server-side inside a tmpdir;
OpenCode executes them client-side on the user's actual disk. rlm's call
format is a fenced ` ```repl ... ``` ` Python block after translation;
OpenCode's call format is a `delta.tool_calls` JSON chunk on the SSE
stream. Both are valid agent paradigms. They don't coexist without
explicit translation.

## 3. The fork: `mode="tools"` opt-in

The cleanest fix is to make rlm bimodal. When the OpenAI-compat shim
sees `tools=[...]` or `tool_choice` in the request body, switch the
orchestrator into a different mode: bypass the REPL entirely, translate
`<minimax:tool_call>` XML into OpenAI-spec `delta.tool_calls` chunks,
halt the iteration when a tool call is emitted, and resume when the
client sends back the `tool` role result on the next request.

We landed it in seven phases: (1) the `mode` flag on `RLM` itself with
validation, (2) the egress translator — XML → OpenAI events, streaming-
token-buffered so partial open-tags don't leak as content, (3) the
ingress translator — message history → reconstructed XML, with
orphan-`tool_call_id` detection that surfaces client bugs loudly, (4) a
separate `TOOL_MODE_SYSTEM_PROMPT` that doesn't teach REPL syntax at all
and instead teaches schema-exact parameter binding, (5) the
`_tool_iteration_loop` orchestrator that replaces `find_code_blocks` +
`execute_code` with translator-driven dispatch, (6) shim auto-detection
of tool-mode from the request body, (7) live verification.

Phase 7 surfaced the bug that the mocked tests had missed. The shim was
decomposing tool-mode requests into `(context, root_prompt)` via the
same chunking helper used for long-document analysis. In tool mode,
"context" is empty — the conversation lives in the messages list. The
REPL-paradigm system prompt was being appended anyway: *"Your context
is a str with 0 total characters, broken up into chunks of [...]"*. The
model interpreted this as the empty-context bypass and returned a chatty
`<think>` paragraph instead of calling a tool. Curl probes with
plain-string content didn't catch it; real OpenCode traffic exposed it
within minutes. We now pass the full messages list as a dict through to
the loop and build the message history without going through the REPL
system prompt builder.

A related shape-mismatch lurks in the ingress translator. The Vercel AI
SDK (which OpenCode uses) serializes even trivial single-text user
messages as a list of content blocks — `[{"type": "text", "text":
"selam"}]` rather than a bare string. The translator's
`"\n\n".join(parts)` raised `TypeError: sequence item N: expected str
instance, list found` and surfaced to the user as the same message. A
small `flatten_openai_content` helper now normalises `str | None |
list[block] | dict` shapes at every `msg.get("content")` read; the same
helper backfills the REPL path, which had the identical bug latent.

## Closing notes

Two takeaways worth keeping.

The first is mundane: the contract surface a model is supposed to use
needs adversarial production traffic to be tested, because the model
will invent kwarg names, shadow globals, and reach for functions that
aren't there. Unit tests pinning the canonical signature pin the wrong
thing.

The second is structural: a "single inference paradigm" — a REPL with
sub-LM calls, or a tool-calling agent loop — is fine in a paper. In a
product you almost always end up bimodal, because the clients live in
different paradigms and the model is one fine-tune away from emitting
either format. Pay the cost of the mode flag early; the alternative is
a translator that quietly mis-routes between two correct-looking
systems.

The rlm core is small enough that all of this is a few hundred lines of
additions and one new system prompt. The hard part wasn't writing it.
It was noticing what was wrong.
