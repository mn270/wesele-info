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

### Etap 2 — dopasowanie do zaproszenia

> Mam gotowe zaproszenie (PNG, 3 karty: save the date z akwarelą pałacu; treść zaproszenia
> z imionami, nazwiskami, datą, godziną i adresem; karta „Potwierdzenie / Podarunki / Q&A”
> z polem na QR). Wyrównaj stronę do stylu i kolorystyki zaproszenia: biel, grafitowy tekst,
> cienka kropkowana ramka, kaligraficzne imiona, kapitaliki z rozstrzelonym literowaniem,
> złota pionowa kreska między datą a godziną. Wytnij akwarelę pałacu z zaproszenia i użyj jej
> w nagłówku. Uzupełnij wszystkie dane, które są już na zaproszeniu; czego nie ma — ukryj lub
> oznacz do uzupełnienia, nic nie wymyślaj. Następnie: push na testy → review tekstu i estetyki
> → poprawki. **Adres w QR („hash”) nie może się zmienić** — zabezpiecz to. Podpowiedz też, jak
> ładnie wtopić QR w zaproszenie w Canvie.

Co z tego wynikło: nowe `styles.css`/`index.html` (paleta i typografia z zaproszenia),
`img/palac.png` wycięty skryptem `tools/extract_palace.py`, `content.json` z realnymi danymi,
`tools/make_qr.py` z blokadą adresu i wariantami pod Canvę oraz sekcje poniżej.

### Etap 3 — review układu, RSVP jednym kliknięciem, kontakt do świadków

> Działaj jak profesjonalny planer przyjęć. (1) Na stronie ta sama pinezka Google Maps
> powtarza się trzy razy („Jak dojechać”, ceremonia, wesele) i adres jest zdublowany — zostaw
> jedną mapę w nagłówku, a ceremonię i wesele połącz w jeden ładny akapit: ślub jest w kaplicy
> na terenie tego samego pałacu. (2) „Noclegi” i „Praktyczne informacje” z jedną pozycją
> wyglądają jak lewy słupek bez prawego — treść ma się skalować na całą szerokość.
> (3) Oceń potwierdzanie obecności jednym kliknięciem i zaproponuj, jak to spiąć z systemem
> (hosting jest statyczny i darmowy). (4) Dodaj świadków do kontaktu: Katarzyna Lamparska
> i Paweł Januszewicz, na razie z numerami-zaslepkami. (5) Wskaż inne przydatne pola,
> których brakuje — ocenimy, co dodać, usunąć lub uzupełnić. Zachowaj styl zaproszenia
> i **nie zmieniaj adresu w QR**.

Co z tego wynikło: `content.json` ma teraz jedno `miejsce` (zamiast `slub`/`wesele`),
elastyczną listę `praktyczne`, RSVP z polami `link_tak`/`link_nie`/`sms_tekst`, kontakt do
świadków; `app.js` nie dubluje mapy; `styles.css` rozciąga pojedyncze karty na pełną
szerokość. Szczegóły w sekcjach „Potwierdzenie obecności jednym kliknięciem” i „Pola do oceny”.

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
├── img/palac.png     # akwarela pałacu wycięta z zaproszenia
├── qr/               # wygenerowane kody QR + URL.txt (blokada adresu)
├── .nojekyll         # GitHub Pages serwuje pliki „jak są”
├── tools/
│   ├── make_qr.py          # generuje QR (SVG + PNG + PNG przezroczysty) z adresu strony
│   ├── extract_palace.py   # jednorazowo: wycina pałac z 1.png zaproszenia
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

## Adres w QR („hash”) nie może się zmienić — jak to zabezpieczone

QR koduje **wyłącznie** `https://mn270.github.io/wesele-info/`. Ten adres zależy tylko od dwóch rzeczy:
loginu GitHub (`mn270`) i nazwy repozytorium (`wesele-info`). Dopóki ich nie zmienisz, każda
edycja treści, wyglądu czy struktury strony jest dla wydrukowanego QR obojętna.

- **Nie zmieniaj nazwy repozytorium ani loginu** po wydruku zaproszeń.
- `qr/URL.txt` przechowuje zakodowany adres; `make_qr.py` **odmówi** wygenerowania QR dla innego
  adresu (trzeba świadomie dodać `--force`). Chroni to przed przypadkową literówką przy regeneracji.
- Repozytorium musi pozostać **publiczne** (darmowe GitHub Pages działa tylko dla publicznych repo).
- Jeśli kiedyś zechcesz własną domenę (np. `agnieszkaimarcin.pl`), ustaw ją w *Settings → Pages →
  Custom domain*. GitHub automatycznie przekierowuje stary adres `mn270.github.io/wesele-info/`
  na nową domenę, więc stary QR dalej działa.

## Jak ładnie wtopić QR w zaproszenie (Canva)

Na trzeciej karcie zaproszenia jest greige'owe pole (`#b6b3a2`) przeznaczone na QR. Wskazówki:

1. **Plik**: użyj `qr/wesele-qr-transparent.png` (grafit `#3a3a3a` na przezroczystym tle,
   2000 px) — w darmowej Canvie wystarczy *Uploads → Upload files*. Jeśli masz Canva Pro,
   lepiej wgrać `qr/wesele-qr.svg` (wektor, ostry w każdej skali).
2. **Tło pod QR**: kontrast musi być wysoki, więc grafitowy QR **nie** na greige, tylko na bieli
   lub bardzo jasnym kremie. Greige zostaw jako cienką ramkę/obwódkę wokół białego kwadratu,
   albo zmniejsz krycie prostokąta do ~20 %. Zasada: tło pod modułami jaśniejsze niż `#e8e8e8`.
3. **Rozmiar i margines**: na druku QR ma mieć **min. 2 × 2 cm** (lepiej 2,5 cm), a wokół
   pusty margines szerokości 4 modułów (ok. 2–3 mm) — tzw. quiet zone. Nie kładź na nim tekstu
   ani ozdób.
4. **Kolor**: QR może przyjąć kolor tekstu zaproszenia (grafit). Jeśli chcesz inny, wygeneruj
   z parametrem w `make_qr.py` (`INK`) — unikaj złota/beżu, są za jasne dla skanerów.
5. **Monogram w środku**: korekcja błędów jest ustawiona na 30 %, więc możesz położyć na środku
   małe „A&M” lub grafikę zajmującą **do ~15 %** powierzchni kodu, z białą poduszką pod spodem.
6. **Podpis pod kodem**: małymi kapitalikami jak na zaproszeniu, np.
   `MN270.GITHUB.IO/WESELE-INFO` — gość bez skanera wpisze adres ręcznie.
7. **Nie rozciągaj** nieproporcjonalnie; nie dodawaj cieni ani „efektów” Canvy na sam kod.
8. **Test przed drukiem**: pobierz z Canvy PDF Print, wydrukuj jedną kartę na domowej drukarce,
   zeskanuj 2–3 telefonami (iPhone + Android) z odległości ~30 cm. Dopiero wtedy drukarnia.

## Proces: testy → review → poprawki

1. `git push` (pierwszy: patrz sekcja 2) → po ~1 min sprawdź https://mn270.github.io/wesele-info/
   na telefonie — to jest „środowisko testowe”; strona nie jest indeksowana (`noindex`).
2. Wyślij link do review (Agnieszka, świadkowie). Uwagi do **treści** poprawiaj w `content.json`,
   uwagi do **estetyki** w zmiennych na górze `styles.css` (kolory, fonty).
3. Każdy commit na `main` publikuje się automatycznie pod tym samym adresem — QR nie wymaga zmian.

> **Zaslepki do podmiany przed wysyłką zaproszeń:** numery świadków w `kontakt`
> (`+48 000 000 001/002`) są celowo niepoprawne (polskie numery nie zaczynają się od 0), żeby
> nikt przypadkiem nie zadzwonił do obcej osoby podczas testów.

## Potwierdzenie obecności jednym kliknięciem — opinia i integracja

**Tak, warto.** Z doświadczenia: im mniej kroków, tym wyższy odsetek odpowiedzi w terminie;
przy telefonicznym RSVP typowo 30–40 % gości trzeba dopytywać. Strona jest statyczna (GitHub
Pages nie ma backendu), więc „kliknięcie” musi trafić do darmowego serwisu zewnętrznego:

| Opcja | Koszt | Gdzie lądują odpowiedzi | Wysiłek | Werdykt |
|---|---|---|---|---|
| **Google Forms** | 0 zł, bez limitu | Arkusz Google (lista gości, diety, +1) | 15 min | **rekomendowane** |
| SMS z gotowym tekstem (`sms:` + treść) | 0 zł | telefon Pary Młodej / świadków | 0 min | dobry **fallback**, działa od razu |
| Formspree / Getform | 0 zł do 50 zgłoszeń/mies. | e-mail | 20 min | limit ryzykowny przy 100+ gościach |
| Google Apps Script (własny endpoint) | 0 zł | Arkusz | 1–2 h | nadmiarowe |

**Jak to spiąć (Google Forms, ~15 minut):**

1. Na koncie Google utwórz formularz z polami: *Imię i nazwisko*, *Czy będziesz?* (Tak / Nie),
   *Liczba osób*, *Dieta / alergie* (tekst), *Nocleg w pałacu?* (Tak / Nie), *Wiadomość dla Pary*.
   W ustawieniach: **Odpowiedzi → Połącz z Arkuszem** — masz gotową listę gości do rozsadzenia.
2. W formularzu kliknij `⋮ → Pobierz link z wypełnionymi polami`, zaznacz *Czy będziesz? = Tak*,
   kliknij *Pobierz link* i wklej go do `content.json` jako `rsvp.link_tak`. Powtórz dla „Nie”
   → `rsvp.link_nie`. Strona sama pokaże przyciski **„Będę!”** i **„Niestety nie dam rady”**;
   gość klika, dopisuje tylko nazwisko i liczbę osób.
3. Fallback dla osób bez ochoty na formularz: wpisz `rsvp.telefon` (np. świadkowej) — pojawi się
   przycisk **„Potwierdź SMS-em”** z gotową treścią z `rsvp.sms_tekst` (gość dopisuje nazwisko).
4. Bez żadnego z tych pól sekcja pokazuje tylko tekst prośby — tak jest teraz, do czasu
   założenia formularza.

Adres strony w QR jest niezależny od tego, którą opcję wybierzesz — linki formularza są tylko
w `content.json`.

## Pola do oceny (propozycje planera)

W `content.json` w liście `praktyczne` są już przygotowane puste pozycje — **puste są ukryte**,
wystarczy wpisać tekst. Do decyzji:

| Pole | Po co | Sugestia treści |
|---|---|---|
| **Dojazd i parking** | najczęstsze pytanie gości z daleka | czy parking na terenie pałacu jest bezpłatny; dojazd z Torunia (~15 km), PKP Toruń Główny, lotnisko Bydgoszcz; ewentualny bus zbiorczy |
| **Dress code** | unika niezręczności | np. „elegancko; unikamy bieli i kremu”, ewentualna paleta kolorów |
| **Poprawiny** | czy są, gdzie i o której | data/godzina/miejsce; czy dla wszystkich gości |
| **Zdjęcia** | zbiór zdjęć od gości | link do wspólnego albumu Google Photos + `link_tekst: "Dodaj zdjęcia"`; prośba o telefony w kieszeni podczas ceremonii (unplugged) |
| **Muzyka** | angażuje gości | link do formularza/playlisty „piosenka, przy której zatańczysz” |
| Plan dnia (rozszerzenie) | orientacja dla gości i dostawców | 15:00 ceremonia · ~16:00 gratulacje i sesja · 17:00 obiad · tort · oczepiny ok. 24:00 · zakończenie |
| Noclegi (uzupełnienie) | logistyka | telefon recepcji, hasło rezerwacyjne / pula pokoi, godziny check-in/out, cena, alternatywne hotele w Toruniu |
| FAQ (rozszerzenie) | odciąża telefon świadków | „Czy mogę przyjść z osobą towarzyszącą?”, „O której być w kaplicy?” (sugestia: 20 min przed), „Czy ceremonia jest w środku, czy w plenerze?”, „Do której trwa wesele?” |
| Kontakt | odpowiedzialności | dopisać do świadków rólę, np. „Sprawy organizacyjne w dniu ślubu”; opcjonalnie koordynator z pałacu |

Celowo **nie dodano**: numeru konta (w Polsce koperta), listy prezentów, sekcji „o nas” — to
nie jest informacja użytkowa dla gościa i wydłuża stronę skanowaną na telefonie.

Do uzupełnienia w `content.json`, gdy będzie wiadomo: linki formularza RSVP, prawdziwe numery
świadków, godzina rozpoczęcia wesela i plan dnia, szczegóły noclegów oraz pozycje z tabeli powyżej.

## Jak edytować treść (dla osoby nietechnicznej)
1. Wejdź na github.com → repozytorium → plik `content.json` → ikona ołówka.
2. Popraw tekst **między cudzysłowami**. Nie usuwaj cudzysłowów, przecinków ani nawiasów.
3. Kliknij **Commit changes**. Po minucie odśwież stronę.
4. Sekcję, której nie chcesz pokazywać, zostaw pustą (`""` lub `[]`) — zniknie automatycznie.
5. Data w polu `"data"` w formacie `RRRR-MM-DDTGG:MM:SS` (np. `2027-06-19T15:00:00`).

W razie wątpliwości czy plik jest poprawny, wklej go na https://jsonlint.com.
