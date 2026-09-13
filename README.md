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

### Etap 4 — strona „o nas” zamiast drugiego zaproszenia (inspiracja: nataliajakubbioraslub.pl)

> Nasza strona za bardzo wygląda jak zaproszenie, a ma być jego dodatkiem — bardziej „o nas”.
> Zainspiruj się https://nataliajakubbioraslub.pl/: pełnoekranowa okładka z tłem (u nas
> akwarela pałacu) i czytelnym napisem, czyj to ślub; okładka jest przypięta, a reszta treści
> nasuwa się na nią przy przewijaniu. Przygotuj placeholder na nasze zdjęcie (jak tam).
> Sprawdź, czego nam brakuje względem tej strony i jak oni zbierają potwierdzenia. Usuń
> dublowanie treści: „co zamiast prezentów” było w FAQ i w praktycznych informacjach. Każdy
> punkt informacji ma się rozwijać. W kontakcie zamień świadków na Agnieszkę i Marcina.
> Pokaż dotąd ukryte pola z przykładowym (pseudo) wypełnieniem — w następnym kroku ocenimy,
> które zostawić, a które usunąć. Adres w QR bez zmian.

Co z tego wynikło (nowy `index.html`, `styles.css`, `app.js`, `content.json`):

- **Okładka** (`.hero`, `position: sticky`) na 100 % wysokości ekranu: akwarela pałacu jako
  tło z miękkim rozjaśnieniem pod napisem, imiona kaligrafią, data z złotą kreską, strzałka
  „↓”. Arkusz z treścią (`.sheet`) ma wyższy `z-index` i cień, więc **nasuwa się na okładkę**
  przy przewijaniu — ten sam efekt co u Natalii i Jakuba, bez JavaScriptu.
- **Nawigacja** przypięta u góry (Start · Harmonogram · Potwierdzenie · Informacje · Kontakt),
  podświetla aktywną sekcję; linki do pustych sekcji znikają same.
- **„Cześć!”** — sekcja o nas: tekst + odliczanie + przycisk kalendarza po lewej, po prawej
  **placeholder na zdjęcie** (`o_nas.zdjecie`; pusty = kreskowana ramka „Tu będzie nasze
  zdjęcie”). Wgraj plik do `img/` (pion, ok. 1200×1500 px) i wpisz ścieżkę.
- **Gdzie?** — jeden akapit + akwarela pałacu w ramce + jeden przycisk mapy.
- **Harmonogram** — pionowa oś czasu; **Przydatne informacje** — każdy punkt rozwijany
  (`<details>`), duplikat o prezentach usunięty (został tylko w FAQ); **Kontakt** — Agnieszka
  i Marcin z awatarami-inicjałami (można podać `zdjecie`).
- **Znacznik review**: każdy tekst zaczynający się od `[DO UZUPEŁNIENIA]` lub
  `[DO POTWIERDZENIA]` dostaje na stronie żółtą etykietę. Wystarczy usunąć prefiks w
  `content.json`, gdy treść jest zatwierdzona. Dzięki temu na etapie testów widzą to wszyscy,
  a nic nie trzeba później „odkrywać”.

**Czego brakowało względem strony referencyjnej i co z tym zrobiono:** nawigacja (dodana),
sekcja „o nas” ze zdjęciem (dodana), harmonogram jako oś czasu (dodany), kontakt z awatarami
(dodany), kolejne FAQ typu „czy będzie parking”, „co jeśli nie mogę przyjść mimo
potwierdzenia” (dodane). U nich RSVP działa przez **6-cyfrowy kod z zaproszenia** wpisywany
na stronie — wymaga backendu (Next.js) i listy gości z kodami. Zalety: zero anonimowych
zgłoszeń, gość widzi tylko swoje pola. Wady: koszt hostingu, druk unikalnych kodów na każdym
zaproszeniu, obsługa „zgubiłem kod”. **Rekomendacja bez zmian:** Google Forms („Będę!” /
„Nie dam rady”) + SMS z gotową treścią jako fallback; jeśli zależy Wam na odcięciu
przypadkowych zgłoszeń, do formularza można dodać proste pole „kod z zaproszenia” (jeden
wspólny, np. `TURZNO2027`) — bez żadnego backendu.

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

> **Zaslepki do podmiany przed wysyłką zaproszeń:** numery Agnieszki i Marcina w `kontakt`
> oraz `rsvp.telefon` (`+48 000 000 001/002`) są celowo niepoprawne (polskie numery nie
> zaczynają się od 0), żeby nikt przypadkiem nie zadzwonił do obcej osoby podczas testów.
> Teksty z prefiksem `[DO UZUPEŁNIENIA]` / `[DO POTWIERDZENIA]` to propozycje planera — na
> stronie mają żółtą etykietę, dopóki prefiks nie zostanie usunięty.

## Potwierdzenie obecności: formularz na stronie, zapis do arkusza (Excel)

### Etap 5 (prompt)

> (1) W sekcji „Gdzie?” akwarela pałacu ma białe tło: usuń je i wtóp obraz w tło strony.
> (2) Pinezka przy nazwie pałacu wygląda sztucznie: nadaj elegancki styl albo usuń i zostaw sam
> napis. (3) „Noclegi” mają białe tło pod treścią: popraw. (4) Nie używaj długich pauz „—” w
> treści; zamień na krótkie lub przeredaguj. (5) Potwierdzenia obecności mają się same zapisywać
> do Excela albo pliku, nie chcę spisywać ręcznie. Na stronie referencyjnej był kod dla
> osoby/pary; u nas wystarczy wymagać imienia i nazwiska. Prosty mechanizm do spisu gości.

Co z tego wynikło: `img/palac.png` ma przezroczyste tło (`tools/make_palace_transparent.py`,
flood-fill od krawędzi, wnętrze budynku nietknięte) i jest wyświetlany bez ramki z
`mix-blend-mode: multiply`; nazwa pałacu to kapitaliki ze złotą kreską z lewej; karty noclegów
nie mają białego tła; długie pauzy usunięte z całej treści; **na stronie jest formularz RSVP**,
a zgłoszenia lądują w Arkuszu Google (eksport do .xlsx jednym kliknięciem).

### Jak działa formularz

Pola: **imię i nazwisko (wymagane, min. dwa słowa)**, Tak / Nie, liczba osób, osoby
towarzyszące, dieta, nocleg, piosenka, wiadomość; opcjonalnie telefon i **kod z zaproszenia**
(`rsvp.kod`, jeden wspólny, np. `TURZNO2027`; pusty = bez kodu). Które pola pokazywać, ustawiasz
w `rsvp.pola`. Jedno nazwisko = jeden wiersz: ponowne zgłoszenie tej samej osoby **nadpisuje**
poprzednie, więc goście mogą sami poprawiać dane, a lista nie ma duplikatów.

| Stan `rsvp.endpoint` | Co robi „Wyślij potwierdzenie” | Gdzie ląduje |
|---|---|---|
| **ustawiony** (adres Apps Script) | POST JSON do arkusza | Arkusz Google, karta `RSVP` |
| pusty (jak teraz) | otwiera SMS (`rsvp.telefon`) lub e-mail (`rsvp.email`) z gotową treścią zgłoszenia | Wasz telefon / skrzynka |

Pod formularzem zawsze są też przyciski „Wolisz inaczej? SMS / Zadzwoń” dla osób, które nie
chcą nic wypełniać. `rsvp.formularz: false` wyłącza formularz i przywraca samą wersję z przyciskami.

### Podłączenie arkusza (ok. 10 minut, 0 zł)

1. Załóż nowy **Arkusz Google** (np. „Goście 2027”) na prywatnym koncie.
2. **Rozszerzenia → Apps Script**, usuń przykładowy kod, wklej zawartość
   `tools/rsvp_apps_script.gs`. Jeśli chcesz kod z zaproszenia, wpisz go w `KOD` (i ten sam w
   `content.json` → `rsvp.kod`). Zapisz.
3. **Wdróż → Nowe wdrożenie → typ: Aplikacja internetowa**; *Uruchamiaj jako: Ja*; *Kto ma
   dostęp: Każdy*. Zatwierdź uprawnienia (jednorazowo). Skopiuj adres kończący się na `/exec`.
4. Wklej go do `content.json` → `rsvp.endpoint`. Commit. Gotowe: pierwsze zgłoszenie samo
   utworzy kartę `RSVP` z nagłówkami.
5. Excel: **Plik → Pobierz → Microsoft Excel (.xlsx)**. Arkusz możesz też udostępnić Agnieszce
   do podglądu na telefonie (aplikacja Arkusze).

Bezpieczeństwo i granice: adres `/exec` jest publiczny, ale przyjmuje tylko POST z danymi
zgłoszenia i nie zwraca zawartości arkusza. Ochroną przed żartami jest opcjonalny wspólny kod
z zaproszenia oraz nadpisywanie po nazwisku (złośliwe wpisy łatwo usunąć). Limity Apps Script
(20 000 wywołań/dzień) są dla wesela bez znaczenia. Adres QR pozostaje niezależny od tego
mechanizmu.

Dlaczego nie kod dla każdej pary jak na stronie referencyjnej: wymaga wygenerowania i
wydrukowania unikalnych kodów na każdym zaproszeniu, a zaproszenia są już zaprojektowane;
wymaga też listy gości przed startem strony. Nazwisko + wspólny kod daje 95 % tej wartości
za 5 % pracy.

## Wcześniejsza analiza: RSVP jednym kliknięciem (Google Forms)

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
3. Fallback dla osób bez ochoty na formularz: `rsvp.telefon` (teraz zaslepka) — pojawia się
   przycisk **„Potwierdź SMS-em”** z gotową treścią z `rsvp.sms_tekst` (gość dopisuje nazwisko)
   oraz **„Zadzwoń”**.
4. Bez żadnego z tych pól sekcja pokazuje tylko tekst prośby.

Adres strony w QR jest niezależny od tego, którą opcję wybierzesz — linki formularza są tylko
w `content.json`.

## Pola do oceny (propozycje planera)

Od etapu 4 propozycje **są widoczne na stronie** z żółtą etykietą (prefiks `[DO UZUPEŁNIENIA]`
lub `[DO POTWIERDZENIA]` w `content.json`). Decyzja dla każdej: **zostaw** (usuń prefiks,
popraw treść), **usuń** (skasuj pozycję z listy) lub **uzupełnij później** (zostaw prefiks).

| Gdzie | Pozycja | Po co | Co trzeba wiedzieć |
|---|---|---|---|
| `plan.pozycje` | 16:00 gratulacje · 17:00 obiad · 21:00 tort · 00:00 oczepiny · 04:00 koniec | orientacja gości; typowy przebieg | godziny od pałacu / DJ-a |
| `informacje` | Czy będzie parking? | najczęstsze pytanie | potwierdzić w pałacu (bezpłatny? ile miejsc?) |
| `informacje` | Jak dojechać? | goście z daleka | czy będzie bus z Torunia; PKP/lotnisko |
| `informacje` | Jak się ubrać? | unika niezręczności | decyzja Pary: dress code / paleta / „bez bieli” |
| `informacje` | Czy będą poprawiny? | logistyka noclegu | data, godzina, dla kogo |
| `informacje` | Gdzie wrzucić zdjęcia? | wspólny album | link Google Photos (`link`, `link_tekst`) |
| `informacje` | Mogę zamówić piosenkę? | angażuje gości | pole w formularzu RSVP lub osobny link |
| `informacje` | O której być na miejscu? | punktualność w kaplicy | sugestia: 30 min przed |
| `o_nas.zdjecie` | placeholder zdjęcia | strona „o nas” | plik do `img/`, pion ok. 1200×1500 px |
| `kontakt.osoby[].zdjecie` | awatary | jak na stronie referencyjnej | kwadratowe zdjęcia ok. 400×400 px (opcjonalnie) |
| `nocleg.pozycje[0]` | telefon recepcji, link, hasło rezerwacji | logistyka | dane z pałacu |

Zatwierdzone już treści (bez prefiksu): dzieci, prezenty/kwiaty, „co jeśli nie mogę przyjść
mimo potwierdzenia”, miejsce, ceremonia 15:00.

Celowo **nie dodano**: numeru konta (w Polsce koperta), listy prezentów — to nie jest
informacja użytkowa dla gościa.

Do uzupełnienia w `content.json`, gdy będzie wiadomo: linki formularza RSVP, prawdziwe numery
telefonów, zdjęcie Pary, decyzje z tabeli powyżej.

## Jak edytować treść (dla osoby nietechnicznej)
1. Wejdź na github.com → repozytorium → plik `content.json` → ikona ołówka.
2. Popraw tekst **między cudzysłowami**. Nie usuwaj cudzysłowów, przecinków ani nawiasów.
3. Kliknij **Commit changes**. Po minucie odśwież stronę.
4. Sekcję, której nie chcesz pokazywać, zostaw pustą (`""` lub `[]`) — zniknie automatycznie.
5. Data w polu `"data"` w formacie `RRRR-MM-DDTGG:MM:SS` (np. `2027-06-19T15:00:00`).

W razie wątpliwości czy plik jest poprawny, wklej go na https://jsonlint.com.
