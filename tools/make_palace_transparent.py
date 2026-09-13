"""Zamienia białe TŁO akwareli pałacu na przezroczystość.

Przezroczyste staje się wyłącznie tło połączone z krawędziami obrazu (flood-fill),
więc jasne ściany i okna wewnątrz budynku pozostają kryjące.

Użycie:  python tools/make_palace_transparent.py
Wejście/wyjście: img/palac.png
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path(__file__).resolve().parents[1] / "img" / "palac.png"
BG_THRESHOLD = 232   # piksel jaśniejszy niż to (0-255) może być tłem
SOFT = 1.2           # rozmycie krawędzi maski (px) - miękkie przejście akwareli


def background_mask(lum: Image.Image) -> Image.Image:
    """255 tam, gdzie tło (jasne i połączone z brzegiem), 0 wszędzie indziej."""
    w, h = lum.size
    px = lum.load()
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i] or px[x, y] < BG_THRESHOLD:
            continue
        seen[i] = 1
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    return Image.frombytes("L", (w, h), bytes(255 if s else 0 for s in seen))


def main() -> None:
    im = Image.open(SRC).convert("RGB")
    lum = im.convert("L")
    bg = background_mask(lum)
    hard = bg.point(lambda v: 255 - v).filter(ImageFilter.GaussianBlur(SOFT))
    # Przy krawędzi tła mieszamy alfę wg jasności, żeby zachować rozmycia akwareli.
    soft = lum.point(lambda v: 0 if v >= 250 else 255 if v <= 200 else int(255 * (250 - v) / 50))
    edge = bg.filter(ImageFilter.GaussianBlur(2.5)).point(lambda v: 255 if 8 < v < 247 else 0)
    alpha = Image.composite(soft, hard, edge)
    out = im.copy()
    out.putalpha(alpha)
    out.save(SRC, optimize=True)
    print(f"Zapisano {SRC} ({out.mode}); przezroczystych px: {sum(1 for a in alpha.getdata() if a == 0)}")


if __name__ == "__main__":
    main()
