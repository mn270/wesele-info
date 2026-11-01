"""Konwertuje zdjęcie (HEIC/JPG/PNG) do lekkiego JPG dla strony.

Obraca zgodnie z EXIF, zmniejsza do zadanego dłuższego boku i zapisuje bez metadanych
(usuwa m.in. lokalizację GPS z telefonu).

Użycie:
    python tools/convert_photo.py img/IMG_7684.HEIC img/my.jpg [--max 1600] [--quality 85]
"""
import argparse

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("dst")
    p.add_argument("--max", type=int, default=1600, help="dłuższy bok w px")
    p.add_argument("--quality", type=int, default=85)
    a = p.parse_args()

    img = ImageOps.exif_transpose(Image.open(a.src)).convert("RGB")
    img.thumbnail((a.max, a.max), Image.LANCZOS)
    img.save(a.dst, "JPEG", quality=a.quality, optimize=True, progressive=True)
    print(f"{a.dst}: {img.width}x{img.height}")


if __name__ == "__main__":
    main()
