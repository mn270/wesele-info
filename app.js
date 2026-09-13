/* Strona informacyjna wesela: renderuje treść z content.json.
   Nie trzeba tu nic zmieniać; całą treść edytujesz w content.json. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const TODO = /^\s*\[DO (UZUPEŁNIENIA|POTWIERDZENIA)\]\s*/i;

  /** Tworzy element DOM. children: string | Node | (string|Node)[] */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else node.setAttribute(k, v);
      }
    }
    if (children !== undefined) {
      for (const c of [].concat(children)) {
        if (c === null || c === undefined || c === "") continue;
        node.append(typeof c === "string" ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  const has = (v) => Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && String(v).trim() !== "");

  /** Akapit; prefiks „[DO UZUPEŁNIENIA]” zamienia na żółty znacznik (etap review). */
  function para(text, cls) {
    const m = String(text).match(TODO);
    if (!m) return el("p", { class: cls, text });
    return el("p", { class: cls }, [el("span", { class: "todo", text: m[1].toLowerCase() === "uzupełnienia" ? "do uzupełnienia" : "do potwierdzenia" }), String(text).slice(m[0].length)]);
  }

  const mapsUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  const telHref = (t) => "tel:" + String(t).replace(/[^\d+]/g, "");

  /** Zwraca URL tylko z bezpiecznym schematem (http/https/mailto/tel/sms). */
  function safeHref(u) {
    try {
      const url = new URL(String(u), window.location.href);
      return ["http:", "https:", "mailto:", "tel:", "sms:"].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  const linkBtn = (href, text, primary) => {
    const h = safeHref(href);
    return h ? el("a", { class: primary ? "btn btn--primary" : "btn", href: h, target: /^https?:/.test(h) ? "_blank" : null, rel: "noopener", text }) : "";
  };

  const DATE_FMT = new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const DAY_FMT = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  const parseLocal = (s) => { const d = new Date(s); return isNaN(d) ? null : d; };
  const pad = (n) => String(n).padStart(2, "0");
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* tryb prywatny */ } },
  };

  /* ---------- Kalendarz (.ics) ---------- */
  const icsStamp = (d) => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  const icsEscape = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  function buildIcs(c, start) {
    const end = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const m = c.miejsce || {};
    const location = [m.nazwa, m.adres].filter(has).join(", ");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wesele-info//PL", "BEGIN:VEVENT",
      "UID:" + icsStamp(start) + "@wesele-info",
      "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(start),
      "DTEND:" + icsStamp(end),
      "SUMMARY:" + icsEscape(`Ślub ${c.para.ona} i ${c.para.on}`),
      location ? "LOCATION:" + icsEscape(location) : "",
      "DESCRIPTION:" + icsEscape([m.opis || "", window.location.href].filter(Boolean).join("\n")),
      "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
  }
  /** Link do Google Kalendarza (na iOS blob+download bywa zawodny). */
  function gcalUrl(c, start) {
    const end = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const m = c.miejsce || {};
    const p = new URLSearchParams({
      action: "TEMPLATE", text: `Ślub ${c.para.ona} i ${c.para.on}`,
      dates: icsStamp(start) + "/" + icsStamp(end),
      location: [m.nazwa, m.adres].filter(has).join(", "), details: window.location.href,
    });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }

  /* ---------- Hero ---------- */
  function renderHero(c) {
    const names = $("names");
    names.textContent = "";
    names.append(c.para.ona, el("span", { class: "amp", text: "&" }), c.para.on);
    document.title = `${c.para.ona} & ${c.para.on} - informacje weselne`;

    const h = c.hero || {};
    if (has(h.tlo)) $("hero-bg").style.backgroundImage = `url("${encodeURI(h.tlo)}")`;
    if (has(h.podtytul)) $("hero-sub").textContent = h.podtytul; else $("hero-sub").hidden = true;

    const start = parseLocal(c.data);
    if (start) {
      $("date").textContent = "";
      $("date").append(
        `${pad(start.getDate())}.${pad(start.getMonth() + 1)}.${start.getFullYear()}`,
        el("span", { class: "bar", "aria-hidden": "true" }),
        `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      );
      $("weekday").textContent = DATE_FMT.format(start);
    }
    return start;
  }

  function countdown(start) {
    const box = el("div", { class: "countdown" });
    const tick = () => {
      const diff = start - Date.now();
      box.textContent = "";
      if (diff <= 0) {
        box.className = "countdown countdown--done";
        box.textContent = diff > -36 * 3600 * 1000 ? "To już dziś!" : "Dziękujemy, że byliście z nami!";
        return false;
      }
      const d = Math.floor(diff / 86400000), hh = Math.floor(diff / 3600000) % 24, mm = Math.floor(diff / 60000) % 60;
      [[d, "dni"], [hh, "godz."], [mm, "min"]].forEach(([n, l]) =>
        box.append(el("div", { class: "countdown__item" }, [el("span", { class: "countdown__num", text: n }), el("span", { class: "countdown__label", text: l })])));
      return true;
    };
    if (tick()) setInterval(tick, 30000);
    return box;
  }

  /* ---------- Sekcje ---------- */
  const section = (id, title, body) => el("section", { class: "section", id }, [has(title) ? el("h2", { class: "section__title", text: title }) : "", body]);

  function photo(src, caption, alt, landscape) {
    const fig = el("figure", { class: "photo" + (landscape ? " photo--landscape" : "") });
    if (has(src)) fig.append(el("img", { src, alt: alt || "", loading: "lazy", decoding: "async" }));
    else fig.append(el("div", { class: "photo__empty", text: "Tu będzie nasze zdjęcie" }));
    /* Notatka [DO UZUPEŁNIENIA] jest wskazówką dla autorów: pokazuj ją tylko póki nie ma zdjęcia. */
    if (has(caption) && (!has(src) || !TODO.test(caption))) {
      fig.append(el("figcaption", null, TODO.test(caption) ? [el("span", { class: "todo", text: "do uzupełnienia" }), caption.replace(TODO, "")] : caption));
    }
    return fig;
  }

  /** Akwarela bez ramki, wtopiona w tło strony (multiply). */
  const artwork = (src, alt) => el("figure", { class: "artwork" }, el("img", { src, alt: alt || "", loading: "lazy", decoding: "async" }));

  /* ---------- Formularz RSVP -> Arkusz Google (Apps Script) ---------- */
  function rsvpForm(r) {
    const f = r.pola || {};
    let uid = 0;
    const field = (name, label, input, hint) => {
      const id = "rsvp-" + name + "-" + (++uid);
      input.id = id;
      const wrap = el("div", { class: "field" }, [el("label", { class: "field__label", for: id, text: label })]);
      if (has(hint)) { const h = el("p", { class: "field__hint", id: id + "-hint", text: hint }); input.setAttribute("aria-describedby", h.id); wrap.append(h); }
      wrap.append(input, el("p", { class: "field__error", id: id + "-err", role: "alert" }));
      return wrap;
    };
    const inp = (name, attrs) => el("input", Object.assign({ name, class: "input" }, attrs));
    const setError = (input, msg) => {
      const err = input.closest(".field")?.querySelector(".field__error");
      if (err) err.textContent = msg || "";
      if (msg) { input.setAttribute("aria-invalid", "true"); input.focus(); input.scrollIntoView({ block: "center", behavior: "smooth" }); }
      else input.removeAttribute("aria-invalid");
    };

    const form = el("form", { class: "rsvp-form", novalidate: "" });
    const choice = el("fieldset", { class: "field field--choice" }, [
      el("legend", { class: "field__label", text: "Czy będziecie? *" }),
      el("label", { class: "choice" }, [el("input", { type: "radio", name: "obecnosc", value: "tak", required: "" }), el("span", { text: "Tak, będziemy" })]),
      el("label", { class: "choice" }, [el("input", { type: "radio", name: "obecnosc", value: "nie" }), el("span", { text: "Niestety nie damy rady" })]),
      el("p", { class: "field__error", role: "alert" }),
    ]);
    form.append(
      field("imie", "Imię i nazwisko (jak na zaproszeniu) *", inp("imie", { type: "text", required: "", autocomplete: "name", minlength: "3", placeholder: "np. Anna Kowalska" })),
      choice,
    );
    /* Pola tylko dla osób, które będą */
    const onlyIfYes = el("div", { class: "rsvp-form__yes", hidden: "" });
    if (f.osoby !== false) onlyIfYes.append(field("osoby", "Liczba osób łącznie", inp("osoby", { type: "number", min: "1", max: "10", value: "1", inputmode: "numeric" })));
    if (f.towarzyszace !== false) onlyIfYes.append(field("towarzyszace", "Imiona i nazwiska osób towarzyszących", inp("towarzyszace", { type: "text", placeholder: "np. Jan Kowalski" })));
    if (f.dieta !== false) onlyIfYes.append(field("dieta", "Dieta, alergie", inp("dieta", { type: "text", placeholder: "np. wegetariańska, bez glutenu" })));
    if (f.nocleg !== false) onlyIfYes.append(el("label", { class: "choice choice--single" }, [el("input", { type: "checkbox", name: "nocleg", value: "1" }), el("span", { text: r.nocleg_etykieta || "Wstępnie chcemy skorzystać z noclegu w pałacu" })]));
    if (f.piosenka !== false) onlyIfYes.append(field("piosenka", "Piosenka, przy której na pewno zatańczycie", inp("piosenka", { type: "text" })));
    form.append(onlyIfYes);
    if (f.telefon) form.append(field("telefon", "Telefon kontaktowy", inp("telefon", { type: "tel", autocomplete: "tel" })));
    if (f.wiadomosc !== false) form.append(field("wiadomosc", "Wiadomość dla nas", el("textarea", { name: "wiadomosc", class: "input", rows: "3" }),
      r.wiadomosc_podpowiedz || "(np. imię i nazwisko osoby towarzyszącej, jeśli nie ma jej na zaproszeniu, albo cokolwiek, o czym powinniśmy wiedzieć)"));
    if (has(r.kod)) form.append(field("kod", "Kod z zaproszenia *", inp("kod", { type: "text", required: "", autocomplete: "off", autocapitalize: "characters" })));

    form.addEventListener("change", (ev) => {
      if (ev.target.name === "obecnosc") { onlyIfYes.hidden = ev.target.value !== "tak"; choice.querySelector(".field__error").textContent = ""; }
    });

    const status = el("p", { class: "rsvp-form__status", role: "status", "aria-live": "polite" });
    const submit = el("button", { type: "submit", class: "btn btn--primary", text: "Wyślij potwierdzenie" });
    form.append(el("div", { class: "actions actions--center" }, submit), status);

    const storeKey = "rsvp:" + (r.endpoint || "");
    const done = store.get(storeKey);
    if (done) { status.textContent = `Zgłoszenie dla „${done}” zostało już wysłane. Możecie je poprawić, wysyłając ponownie.`; }

    /** Treść zgłoszenia jako tekst (fallback SMS / e-mail, gdy nie ma arkusza). */
    const asText = (d) => [
      `Potwierdzenie obecności: ${d.obecnosc === "nie" ? "NIE" : "TAK"}`,
      `Imię i nazwisko: ${d.imie}`,
      d.obecnosc !== "nie" && d.osoby ? `Liczba osób: ${d.osoby}` : "",
      d.towarzyszace ? `Osoby towarzyszące: ${d.towarzyszace}` : "",
      d.dieta ? `Dieta: ${d.dieta}` : "",
      d.nocleg ? "Nocleg: TAK" : "",
      d.piosenka ? `Piosenka: ${d.piosenka}` : "",
      d.telefon ? `Telefon: ${d.telefon}` : "",
      d.wiadomosc ? `Wiadomość: ${d.wiadomosc}` : "",
    ].filter(Boolean).join("\n");

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      data.imie = String(data.imie || "").trim().replace(/\s+/g, " ");
      setError(form.imie, "");
      if (data.imie.split(" ").length < 2) { setError(form.imie, "Podajcie imię i nazwisko."); return; }
      if (!data.obecnosc) { choice.querySelector(".field__error").textContent = "Zaznaczcie, czy będziecie."; choice.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
      if (has(r.kod) && String(data.kod || "").trim().toUpperCase() !== String(r.kod).toUpperCase()) { setError(form.kod, "Kod z zaproszenia się nie zgadza."); return; }
      if (data.obecnosc === "nie") { delete data.osoby; delete data.dieta; delete data.nocleg; delete data.piosenka; delete data.towarzyszace; }

      if (!has(r.endpoint)) {
        /* Brak arkusza: pokaż gotową treść do skopiowania i przyciski SMS / e-mail. */
        const txt = asText(data);
        const enc = encodeURIComponent(txt);
        const box = el("div", { class: "rsvp-form__manual" }, [
          el("p", { text: "Formularz nie jest jeszcze połączony z listą gości. Wyślijcie nam tę treść wiadomością:" }),
          el("textarea", { class: "input", readonly: "", rows: String(Math.min(8, txt.split("\n").length + 1)), text: txt }),
          el("div", { class: "actions actions--center" }, [
            has(r.telefon) ? linkBtn("sms:" + telHref(r.telefon).slice(4) + "?body=" + enc, "Wyślij SMS", true) : "",
            has(r.email) ? linkBtn("mailto:" + r.email + "?subject=" + encodeURIComponent("Potwierdzenie obecności") + "&body=" + enc, "Wyślij e-mail", !has(r.telefon)) : "",
            el("button", { type: "button", class: "btn", text: "Skopiuj treść" }),
          ]),
        ]);
        box.querySelector("button").addEventListener("click", async (e) => {
          try { await navigator.clipboard.writeText(txt); e.target.textContent = "Skopiowano"; } catch { box.querySelector("textarea").select(); }
        });
        form.replaceChildren(box);
        return;
      }

      submit.disabled = true; status.textContent = "Wysyłamy…";
      try {
        /* Apps Script nie zwraca nagłówków CORS dla POST, dlatego tryb no-cors:
           odpowiedzi nie odczytamy, ale zapis w arkuszu się wykona. Walidacja jest po naszej stronie. */
        await fetch(r.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
        store.set(storeKey, data.imie);
        const thanks = data.obecnosc === "nie" ? (r.podziekowanie_nie || "Dziękujemy za wiadomość. Szkoda, że się nie zobaczymy, ale rozumiemy.") : (r.podziekowanie || "Dziękujemy, zapisaliśmy Wasze zgłoszenie.");
        form.replaceChildren(el("p", { class: "rsvp-form__thanks", text: thanks }));
      } catch (err) {
        console.error(err);
        status.textContent = "Nie udało się wysłać. Spróbujcie ponownie albo napiszcie do nas SMS.";
        submit.disabled = false;
      }
    });
    return form;
  }

  /** Formularz w rozwijanym panelu: domyślnie zwinięty; otwiera się też po wejściu z #rsvp. */
  function rsvpPanel(r) {
    const panel = el("details", { class: "rsvp-panel" }, [
      el("summary", { class: "rsvp-panel__toggle" }, [
        el("span", { class: "btn btn--primary rsvp-panel__open", text: r.przycisk || "Potwierdź obecność" }),
        el("span", { class: "btn rsvp-panel__close", text: "Zwiń formularz" }),
      ]),
      rsvpForm(r),
    ]);
    panel.addEventListener("toggle", () => { if (panel.open) panel.querySelector("input[name=imie]")?.focus({ preventScroll: true }); });
    const openFromHash = () => { if (location.hash === "#rsvp") panel.open = true; };
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
    return panel;
  }

  function renderMain(c, start) {
    const app = $("app");
    app.textContent = "";

    /* O nas + odliczanie + zdjęcie */
    const o = c.o_nas || {};
    if (has(o.tekst) || has(o.zdjecie) || start) {
      const text = el("div", { class: "split__text" }, [
        has(o.tytul) ? el("h2", { class: "section__title", text: o.tytul }) : "",
        has(o.tekst) ? para(o.tekst) : "",
        start ? el("p", { class: "countdown__caption", text: "To już za" }) : "",
        start ? countdown(start) : "",
      ]);
      const acts = el("div", { class: "actions actions--center" });
      if (start) {
        acts.append(linkBtn(gcalUrl(c, start), "Kalendarz Google"));
        const blob = new Blob([buildIcs(c, start)], { type: "text/calendar;charset=utf-8" });
        acts.append(el("a", { class: "btn", href: URL.createObjectURL(blob), download: "slub.ics", text: "Plik .ics (Apple, Outlook)" }));
      }
      if (acts.childElementCount) text.append(acts);
      app.append(section("o-nas", "", el("div", { class: "split" }, [text, photo(o.zdjecie, o.zdjecie_podpis, `${c.para.ona} i ${c.para.on}`)])));
    }

    /* Gdzie: jeden akapit, jedna mapa, akwarela bez ramki */
    const m = c.miejsce || {};
    if (has(m.nazwa) || has(m.adres) || has(m.opis)) {
      const text = el("div", { class: "split__text" }, [
        has(m.nazwa) ? el("h3", { class: "place__name", text: m.nazwa }) : "",
        has(m.adres) ? el("p", { class: "meta place__addr", text: m.adres }) : "",
        has(m.opis) ? para(m.opis) : "",
        has(m.adres) ? el("div", { class: "actions" }, linkBtn(mapsUrl([m.nazwa, m.adres].filter(has).join(", ")), "Pokaż na mapie")) : "",
      ]);
      const body = has(m.zdjecie) ? el("div", { class: "split split--flip" }, [text, artwork(m.zdjecie, m.nazwa)]) : text;
      app.append(section("miejsce", m.tytul || "Gdzie?", body));
    }

    /* Harmonogram */
    const plan = c.plan || {};
    if (has(plan.pozycje)) {
      app.append(section("plan", plan.tytul || "Harmonogram", el("ul", { class: "timeline" },
        plan.pozycje.map((p) => el("li", null, [el("time", { text: p.godzina }), para(p.opis)])))));
    } else $("nav").querySelector('[data-section="plan"]').hidden = true;

    /* RSVP: formularz (zapis do arkusza, a bez endpointu SMS/e-mail z gotową treścią) */
    const r = c.rsvp || {};
    if (has(r.endpoint) || has(r.link_tak) || has(r.link_nie) || has(r.telefon) || has(r.email) || has(r.tekst) || has(r.wstep)) {
      const termin = has(r.termin) ? parseLocal(r.termin) : null;
      const body = has(r.sms_tekst) ? encodeURIComponent(r.sms_tekst) : "";
      const showForm = r.formularz !== false;
      const btns = [];
      if (!showForm) {
        if (has(r.link_tak)) btns.push(linkBtn(r.link_tak, "Będę!", true));
        if (has(r.link_nie)) btns.push(linkBtn(r.link_nie, "Niestety nie dam rady"));
      }
      if (has(r.telefon)) {
        btns.push(linkBtn("sms:" + telHref(r.telefon).slice(4) + (body ? "?body=" + body : ""), "Potwierdź SMS-em", !btns.length && !showForm));
        btns.push(linkBtn(telHref(r.telefon), "Zadzwoń"));
      }
      if (has(r.email)) btns.push(linkBtn("mailto:" + r.email + "?subject=" + encodeURIComponent("Potwierdzenie obecności") + (body ? "&body=" + body : ""), "Napisz e-mail"));
      app.append(section("rsvp", r.tytul || "Potwierdzenie obecności", el("div", { class: "rsvp" }, [
        has(r.wstep) ? para(r.wstep) : "",
        termin ? el("p", { class: "meta" }, ["Potwierdźcie swoją obecność do ", el("strong", { text: DAY_FMT.format(termin) }), "."]) : "",
        has(r.tekst) ? para(r.tekst) : "",
        showForm ? rsvpPanel(r) : "",
        btns.length ? el("div", { class: "rsvp__alt" }, [
          showForm ? el("p", { class: "meta", text: "Wolicie inaczej? Napiszcie lub zadzwońcie:" }) : "",
          el("div", { class: "actions actions--center" }, btns),
        ]) : "",
      ])));
    } else $("nav").querySelector('[data-section="rsvp"]').hidden = true;

    /* Noclegi */
    const n = c.nocleg || {};
    if (has(n.pozycje)) {
      app.append(section("nocleg", n.tytul || "Noclegi", el("div", null, [
        has(n.wstep) ? para(n.wstep, "section__lead") : "",
        el("div", { class: "cards" }, n.pozycje.map((x) => {
          const card = el("div", { class: "card" }, [
            el("h3", { text: x.nazwa }),
            has(x.adres) ? el("p", { class: "meta", text: x.adres }) : "",
            has(x.uwagi) ? para(x.uwagi) : "",
          ]);
          const acts = el("div", { class: "actions" }, [
            has(x.adres) && x.adres !== m.adres ? linkBtn(mapsUrl(x.adres), "Mapa") : "",
            has(x.telefon) ? linkBtn(telHref(x.telefon), x.telefon) : "",
            has(x.link) ? linkBtn(x.link, "Strona") : "",
          ]);
          if (acts.childElementCount) card.append(acts);
          return card;
        })),
      ])));
    }

    /* Przydatne informacje: każdy punkt rozwijany */
    const inf = c.informacje || {};
    const items = (inf.pozycje || []).filter((q) => has(q.pytanie) && has(q.odpowiedz));
    if (items.length) {
      app.append(section("informacje", inf.tytul || "Przydatne informacje", el("div", { class: "faq" },
        items.map((q) => el("details", null, [
          el("summary", null, [el("span", null, TODO.test(q.odpowiedz) ? [el("span", { class: "todo", text: "review" }), q.pytanie] : q.pytanie)]),
          para(q.odpowiedz),
          has(q.link) ? el("div", { class: "actions" }, linkBtn(q.link, q.link_tekst || "Więcej")) : "",
        ])))));
    } else $("nav").querySelector('[data-section="informacje"]').hidden = true;

    /* Kontakt: Para Młoda */
    const k = c.kontakt || {};
    if (has(k.osoby)) {
      app.append(section("kontakt", k.tytul || "Kontakt", el("div", null, [
        has(k.wstep) ? para(k.wstep, "section__lead") : "",
        el("div", { class: "contacts" }, k.osoby.map((p) => el("div", { class: "contact" }, [
          el("div", { class: "contact__avatar" }, has(p.zdjecie) ? el("img", { src: p.zdjecie, alt: p.imie, loading: "lazy" }) : el("span", { text: p.imie.charAt(0) })),
          el("h3", { text: p.imie }),
          has(p.rola) ? el("span", { class: "role", text: p.rola }) : "",
          has(p.telefon) ? el("div", { class: "actions" }, [linkBtn(telHref(p.telefon), p.telefon), linkBtn("sms:" + telHref(p.telefon).slice(4), "SMS")]) : "",
        ]))),
      ])));
    } else $("nav").querySelector('[data-section="kontakt"]').hidden = true;

    $("footer").textContent = has(c.stopka) ? c.stopka : "";
    $("loading")?.remove();
  }

  /* ---------- Nawigacja: cień po przewinięciu, podświetlenie aktywnej sekcji ---------- */
  function initNav() {
    const nav = $("nav");
    const links = [...nav.querySelectorAll("[data-section]")];
    const onScroll = () => nav.classList.toggle("nav--scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("nav__link--active", l.dataset.section === e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((l) => { const s = $(l.dataset.section); if (s) io.observe(s); });
  }

  /* ---------- Start ---------- */
  fetch("content.json?v=" + Date.now(), { cache: "no-store" })
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then((c) => { const start = renderHero(c); renderMain(c, start); initNav(); })
    .catch((err) => {
      console.error("Nie udało się wczytać lub wyrenderować content.json (sprawdź składnię, np. na jsonlint.com):", err);
      $("app").replaceChildren(el("p", { class: "error", text: "Nie udało się wczytać strony. Odświeżcie ją za chwilę." }));
      $("names").textContent = "Informacje weselne";
    });
})();
