"""Wycina ilustrację pałacu z pliku zaproszenia (1.png) i zapisuje ją do img/palac.png.

Użycie:
    python tools/extract_palace.py "C:/sciezka/do/1.png"

Skrypt szuka akwareli poniżej napisu „Pałac Romantyczny w Turznie” na lewej karcie,
przycina do treści (bez białych marginesów), wygładza krawędź na biało i zapisuje PNG.
Uruchamiasz raz — potem plik img/palac.png jest po prostu częścią strony.
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = Path(sys.argv[1])
    im = Image.open(src).convert("RGB")

    # Lewa karta zaproszenia: obszar akwareli (współrzędne dla źródła 2000x1414).
    w, h = im.size
    box = (int(w * 0.07), int(h * 0.408), int(w * 0.39), int(h * 0.70))
    region = im.crop(box)

    # Przycięcie do zawartości: wszystko jaśniejsze niż ~247 traktujemy jako tło.
    bg = Image.new("RGB", region.size, (255, 255, 255))
    diff = ImageChops.difference(region, bg).convert("L").point(lambda p: 255 if p > 8 else 0)
    bbox = diff.getbbox()
    if bbox:
        pad = 6
        bbox = (max(bbox[0] - pad, 0), max(bbox[1] - pad, 0), min(bbox[2] + pad, region.width), min(bbox[3] + pad, region.height))
        region = region.crop(bbox)

    out = Path(__file__).resolve().parent.parent / "img" / "palac.png"
    out.parent.mkdir(exist_ok=True)
    region.save(out, optimize=True)
    print(f"Zapisano {out} ({region.width}x{region.height})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
