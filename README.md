# Strona informacyjna wesela (QR na zaproszeniu)

## Prompt, który realizuje ten projekt

> Potrzebuję strony WWW, do której prowadzi QR kod z zaproszenia weselnego. Strona ma zawierać
> najważniejsze informacje dla gości (kto, kiedy, gdzie — ślub i wesele z mapą, plan dnia, RSVP,
> noclegi, transport, dress code, prezenty, FAQ, kontakt). Wymagania:
> 1. **Hosting całkowicie darmowy**, bez reklam, z HTTPS, stabilny URL (QR drukowany raz).
> 2. **Edycja treści prosta i szybka** — jedna osoba nietechniczna ma poprawić godzinę czy adres
>    w 2 minuty z telefonu, bez instalowania czegokolwiek.
> 3. Zaproponuj platformę, uzasadnij wybór, zaprojektuj architekturę (pliki, przepływ edycji
>    i publikacji), a następnie wygeneruj cały kod: responsywna strona (mobile‑first, bo goście
>    skanują QR telefonem), cała treść w jednym pliku danych, odliczanie do ślubu, linki do map,
>    „dodaj do kalendarza”, skrypt generujący QR kod do druku oraz instrukcję wdrożenia i edycji
>    po polsku.

## Decyzja: GitHub Pages + statyczna strona z treścią w `content.json`

| Kryterium | GitHub Pages (wybrane) | Google Sites | Netlify + Decap CMS |
|---|---|---|---|
| Koszt | 0 zł, bez reklam, HTTPS | 0 zł | 0 zł (limity) |
| Stabilny URL do QR | `login.github.io/wesele-info` (lub własna domena) | długi, brzydki URL | tak |
| Edycja treści | edycja **jednego pliku** w przeglądarce/telefonie, publikacja automatyczna w ~1 min | WYSIWYG | panel CMS, ale wymaga konfiguracji OAuth |
| Kontrola wyglądu | pełna | ograniczona | pełna |
| Złożoność wdrożenia | 5 minut | 5 minut | 30+ minut |

**Dlaczego to najlepsze:** zero kosztów i zero utrzymania, a cała treść siedzi w **jednym pliku
`content.json`**. Zmiana godziny = otwarcie pliku na github.com (działa też w aplikacji GitHub
na telefonie) → ołówek → poprawka → „Commit”. Po ok. minucie strona jest zaktualizowana pod tym
samym URL, więc wydrukowany QR nigdy się nie zestarzeje.

## Architektura

```
wesele-info/
├── index.html        # szkielet strony (nie trzeba go dotykać)
├── styles.css        # wygląd; kolory w zmiennych CSS na górze pliku
├── app.js            # wczytuje content.json i buduje sekcje; puste sekcje są ukrywane
├── content.json      # <<< JEDYNY PLIK DO EDYCJI — cała treść strony
├── .nojekyll         # GitHub Pages serwuje pliki „jak są”
├── tools/
│   ├── make_qr.py    # generuje QR (SVG + PNG) z adresu strony do druku
│   └── requirements.txt
└── .vscode/tasks.json # zadanie „Podgląd lokalny” (http://localhost:8080)
```

Przepływ: `content.json` → (commit na GitHub) → GitHub Pages publikuje → gość skanuje QR → przeglądarka
pobiera `index.html` + `app.js`, który wczytuje `content.json` (z pominięciem cache) i renderuje treść.

## Uruchomienie krok po kroku

### 1. Podgląd lokalny
W VS Code: `Terminal → Run Task → Podgląd lokalny`, potem otwórz http://localhost:8080
(lub w terminalu: `python -m http.server 8080`).

### 2. Publikacja na GitHub Pages
1. Załóż darmowe konto na https://github.com i utwórz **publiczne** repozytorium, np. `wesele-info`.
2. Wgraj wszystkie pliki z tego folderu (przez `git push` lub „Add file → Upload files”).
3. W repozytorium: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)` → Save.
4. Po ~1 minucie strona działa pod `https://mn270.github.io/wesele-info/`.

### 3. QR kod do druku
```powershell
pip install -r tools/requirements.txt
python tools/make_qr.py https://mn270.github.io/wesele-info/
```
Powstaną `qr/wesele-qr.svg` (wektor — do drukarni) i `qr/wesele-qr.png`. Przed drukiem zeskanuj
wersję testową telefonem.

## Jak edytować treść (dla osoby nietechnicznej)
1. Wejdź na github.com → repozytorium → plik `content.json` → ikona ołówka.
2. Popraw tekst **między cudzysłowami**. Nie usuwaj cudzysłowów, przecinków ani nawiasów.
3. Kliknij **Commit changes**. Po minucie odśwież stronę.
4. Sekcję, której nie chcesz pokazywać, zostaw pustą (`""` lub `[]`) — zniknie automatycznie.
5. Data w polu `"data"` w formacie `RRRR-MM-DDTGG:MM:SS` (np. `2027-06-19T15:00:00`).

W razie wątpliwości czy plik jest poprawny, wklej go na https://jsonlint.com.
