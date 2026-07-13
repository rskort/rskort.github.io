#!/usr/bin/env python3
"""Generate raster favicon variants from the Surface Atlas mark."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
BACKGROUND = "#f7f8f5"
ACCENT = "#176b72"
MIDDLE = "#93b8b4"
LIGHT = "#d0ded9"


def render(size: int) -> Image.Image:
    scale = 4
    canvas = size * scale
    image = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    def box(cx: float, cy: float, radius: float) -> tuple[int, int, int, int]:
        return tuple(round(value * canvas) for value in (cx - radius, cy - radius, cx + radius, cy + radius))

    draw.rounded_rectangle((0, 0, canvas - 1, canvas - 1), radius=canvas // 4, fill=BACKGROUND)
    draw.ellipse(box(160 / 512, 181 / 512, 85 / 512), fill=ACCENT)
    draw.ellipse(box(352 / 512, 181 / 512, 64 / 512), fill=MIDDLE)
    draw.ellipse(box(256 / 512, 352 / 512, 64 / 512), fill=LIGHT)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    render(180).save(ROOT / "apple-touch-icon.png", optimize=True)
    render(192).save(ROOT / "favicon-192.png", optimize=True)
    render(512).save(ROOT / "favicon-512.png", optimize=True)
    ico_options = {
        "format": "ICO",
        "sizes": [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    }
    icon = render(256)
    # Keep the conventional fallback and a stable, brand-specific URL. The
    # latter avoids stale caches left by the favicon that preceded Surface Atlas.
    icon.save(ROOT / "favicon.ico", **ico_options)
    icon.save(ROOT / "surface-atlas-favicon.ico", **ico_options)


if __name__ == "__main__":
    main()
