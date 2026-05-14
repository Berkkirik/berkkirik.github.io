#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow>=10.0.0"]
# ///
"""
Generate the site's default Open Graph image.

Outputs to /public/og/default.png at 1200x630 (Twitter/LinkedIn/Facebook
canonical OG size). Uses Apple's New York for the italic display name,
falling back to Georgia if New York isn't available.

Run from the repo root:
    python scripts/generate_og.py
or
    ./scripts/generate_og.py
"""
from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent

# Canvas
W, H = 1200, 630

# Palette (matches src/styles/global.css cream + ink tokens)
BG = (246, 241, 231)        # --paper
INK = (22, 21, 19)          # --ink
INK_SOFT = (58, 54, 49)     # --ink-soft
INK_MUTED = (122, 114, 104)  # --ink-muted
INK_FAINT = (183, 173, 157)  # --ink-faint
RULE = (217, 207, 185)      # --rule

# Font candidates in priority order: New York italic > Georgia italic > built-in.
ITALIC_CANDIDATES = [
    "/System/Library/Fonts/NewYorkItalic.ttf",
    "/System/Library/Fonts/Supplemental/Georgia Italic.ttf",
]
REGULAR_CANDIDATES = [
    "/System/Library/Fonts/NewYork.ttf",
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
]


def first_existing(paths: list[str]) -> str:
    for p in paths:
        if Path(p).exists():
            return p
    print("WARN: no preferred serif font found, falling back to PIL default", file=sys.stderr)
    return ""


def load(path: str, size: int) -> ImageFont.FreeTypeFont:
    if not path:
        return ImageFont.load_default()
    return ImageFont.truetype(path, size)


def main() -> None:
    italic_path = first_existing(ITALIC_CANDIDATES)
    regular_path = first_existing(REGULAR_CANDIDATES)

    name_font = load(italic_path, 120)
    role_font = load(regular_path, 44)
    body_font = load(regular_path, 28)
    meta_font = load(regular_path, 22)

    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Layout: generous left margin, content stacked left-aligned
    x = 96
    name_y = 200
    role_y = 360
    tag_y = 420
    rule_y = 540
    meta_y = 568

    draw.text((x, name_y), "Berk Kırık", fill=INK, font=name_font)
    draw.text((x, role_y), "Senior AI Engineer", fill=INK_SOFT, font=role_font)
    draw.text(
        (x, tag_y),
        "Production AI in microservices — LLMs, RAG, agents, Kubernetes.",
        fill=INK_MUTED,
        font=body_font,
    )

    # Hairline above the URL row
    draw.line([(x, rule_y), (W - x, rule_y)], fill=RULE, width=1)

    draw.text((x, meta_y), "berkkirik.github.io", fill=INK_FAINT, font=meta_font)
    # Right-aligned label
    right_label = "/ Curriculum vitae · projects · notes"
    rl_w = draw.textlength(right_label, font=meta_font)
    draw.text((W - x - rl_w, meta_y), right_label, fill=INK_FAINT, font=meta_font)

    out = REPO / "public" / "og" / "default.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG", optimize=True)
    print(f"Wrote {out.relative_to(REPO)} ({out.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
