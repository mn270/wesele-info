"""Generuje QR kod (SVG + PNG) z adresu strony weselnej.

Użycie:
    pip install -r tools/requirements.txt
    python tools/make_qr.py https://mn270.github.io/wesele-info/

Pliki trafiają do folderu qr/. SVG jest wektorowy — ten wysyłasz do drukarni.
"""
import sys
from pathlib import Path
from urllib.parse import urlparse

import segno


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1

    url = sys.argv[1].strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        print(f"Niepoprawny adres URL: {url!r} (oczekiwano np. https://login.github.io/wesele-info/)")
        return 1

    out_dir = Path(__file__).resolve().parent.parent / "qr"
    out_dir.mkdir(exist_ok=True)

    # Poziom korekcji błędów 'h' (30%) — QR działa nawet lekko uszkodzony / zadrukowany.
    qr = segno.make(url, error="h")

    svg_path = out_dir / "wesele-qr.svg"
    png_path = out_dir / "wesele-qr.png"
    qr.save(svg_path, scale=10, border=4, dark="#2b2a28", light=None)
    qr.save(png_path, scale=20, border=4, dark="#2b2a28", light="#ffffff")

    print(f"URL:  {url}")
    print(f"SVG:  {svg_path}")
    print(f"PNG:  {png_path}")
    print("Przed drukiem zeskanuj plik telefonem i sprawdź, czy otwiera właściwą stronę.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
