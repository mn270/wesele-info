"""Generuje QR kod z adresu strony weselnej — wersje do druku i do wklejenia w Canvie.

Użycie:
    pip install -r tools/requirements.txt
    python tools/make_qr.py https://mn270.github.io/wesele-info/

Pliki trafiają do folderu qr/:
    wesele-qr.svg               wektor, grafit na przezroczystym — do drukarni / Canva Pro
    wesele-qr.png               grafit na białym, 2000 px — podgląd i druk
    wesele-qr-transparent.png   grafit na przezroczystym tle — do Canvy (darmowej), kładziesz na kremowe pole
    URL.txt                     adres zakodowany w QR (blokada przed przypadkową zmianą)

Blokada adresu: jeśli qr/URL.txt istnieje i zawiera inny adres, skrypt odmówi pracy.
Zaproszenia są już wydrukowane z tym adresem — zmiana wymaga świadomego --force.
"""
import sys
from pathlib import Path
from urllib.parse import urlparse

import segno

INK = "#3a3a3a"  # grafit tekstu z zaproszenia


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    if not args:
        print(__doc__)
        return 1

    url = args[0].strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        print(f"Niepoprawny adres URL: {url!r} (oczekiwano np. https://login.github.io/wesele-info/)")
        return 1

    out_dir = Path(__file__).resolve().parent.parent / "qr"
    out_dir.mkdir(exist_ok=True)

    lock = out_dir / "URL.txt"
    if lock.exists():
        locked = lock.read_text(encoding="utf-8").strip()
        if locked != url and not force:
            print(f"STOP: QR był już wygenerowany dla adresu {locked}")
            print("Zmiana adresu unieważni wydrukowane zaproszenia. Jeśli wiesz, co robisz: dodaj --force.")
            return 2
    lock.write_text(url + "\n", encoding="utf-8")

    # Korekcja 'h' (30%) — kod czyta się nawet przy lekkim uszkodzeniu lub z małym monogramem w środku.
    qr = segno.make(url, error="h")

    svg_path = out_dir / "wesele-qr.svg"
    png_path = out_dir / "wesele-qr.png"
    png_alpha_path = out_dir / "wesele-qr-transparent.png"
    qr.save(svg_path, scale=10, border=4, dark=INK, light=None)
    qr.save(png_path, scale=40, border=4, dark=INK, light="#ffffff")
    qr.save(png_alpha_path, scale=40, border=4, dark=INK, light=None)

    print(f"URL:  {url}")
    print(f"SVG:  {svg_path}")
    print(f"PNG:  {png_path}")
    print(f"PNG (przezroczysty): {png_alpha_path}")
    print(f"Moduły: {qr.symbol_size(scale=1, border=0)[0]} — druk min. 2×2 cm, wokół zostaw pusty margines.")
    print("Przed drukiem zeskanuj plik telefonem i sprawdź, czy otwiera właściwą stronę.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
