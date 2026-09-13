/* Strona informacyjna wesela — renderuje treść z content.json.
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
  const parseLocal = (s) => { const d = new Date(s); return isNaN(d) ? null : d; };
  const pad = (n) => String(n).padStart(2, "0");

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

  /* ---------- Hero ---------- */
  function renderHero(c) {
    const names = $("names");
    names.textContent = "";
    names.append(c.para.ona, el("span", { class: "amp", text: "&" }), c.para.on);
    document.title = `${c.para.ona} & ${c.para.on} — informacje weselne`;

    const h = c.hero || {};
    if (has(h.tlo)) $("hero-bg").style.backgroundImage = `url("${encodeURI(h.tlo)}")`;
    if (has(h.podtytul)) $("hero-sub").textContent = h.podtytul; else $("hero-sub").hidden = true;

    const start = parseLocal(c.data);
    if (start) {
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

  function photo(src, caption, landscape) {
    const fig = el("figure", { class: "photo" + (landscape ? " photo--landscape" : "") });
    if (has(src)) fig.append(el("img", { src, alt: caption || "", loading: "lazy", decoding: "async" }));
    else fig.append(el("div", { class: "photo__empty", text: "Tu będzie nasze zdjęcie" }));
    if (has(caption)) fig.append(el("figcaption", null, TODO.test(caption) ? [el("span", { class: "todo", text: "do uzupełnienia" }), caption.replace(TODO, "")] : caption));
    return fig;
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
        const blob = new Blob([buildIcs(c, start)], { type: "text/calendar;charset=utf-8" });
        acts.append(el("a", { class: "btn", href: URL.createObjectURL(blob), download: "slub.ics", text: "Dodaj do kalendarza" }));
      }
      if (acts.childElementCount) text.append(acts);
      app.append(section("o-nas", "", el("div", { class: "split" }, [text, photo(o.zdjecie, o.zdjecie_podpis)])));
    }

    /* Gdzie — jeden akapit, jedna mapa */
    const m = c.miejsce || {};
    if (has(m.nazwa) || has(m.adres) || has(m.opis)) {
      const text = el("div", { class: "split__text" }, [
        has(m.nazwa) ? el("p", { class: "meta" }, el("strong", { text: "📍 " + m.nazwa })) : "",
        has(m.adres) ? el("p", { class: "meta", text: m.adres }) : "",
        has(m.opis) ? para(m.opis) : "",
        has(m.adres) ? el("div", { class: "actions" }, linkBtn(mapsUrl([m.nazwa, m.adres].filter(has).join(", ")), "Pokaż na mapie")) : "",
      ]);
      const body = has(m.zdjecie) ? el("div", { class: "split split--flip" }, [text, photo(m.zdjecie, m.nazwa, true)]) : text;
      app.append(section("miejsce", m.tytul || "Gdzie?", body));
    }

    /* Harmonogram */
    const plan = c.plan || {};
    if (has(plan.pozycje)) {
      app.append(section("plan", plan.tytul || "Harmonogram", el("ul", { class: "timeline" },
        plan.pozycje.map((p) => el("li", null, [el("time", { text: p.godzina }), para(p.opis)])))));
    } else $("nav").querySelector('[data-section="plan"]').hidden = true;

    /* RSVP — jednym kliknięciem */
    const r = c.rsvp || {};
    if (has(r.link_tak) || has(r.link_nie) || has(r.telefon) || has(r.email) || has(r.tekst) || has(r.wstep)) {
      const termin = has(r.termin) ? parseLocal(r.termin) : null;
      const body = has(r.sms_tekst) ? encodeURIComponent(r.sms_tekst) : "";
      const btns = [];
      if (has(r.link_tak)) btns.push(linkBtn(r.link_tak, "Będę!", true));
      if (has(r.link_nie)) btns.push(linkBtn(r.link_nie, "Niestety nie dam rady"));
      if (has(r.telefon)) {
        btns.push(linkBtn("sms:" + telHref(r.telefon).slice(4) + (body ? "?body=" + body : ""), "Potwierdź SMS-em", !btns.length));
        btns.push(linkBtn(telHref(r.telefon), "Zadzwoń"));
      }
      if (has(r.email)) btns.push(linkBtn("mailto:" + r.email + "?subject=" + encodeURIComponent("Potwierdzenie obecności") + (body ? "&body=" + body : ""), "Napisz e-mail"));
      app.append(section("rsvp", r.tytul || "Potwierdzenie obecności", el("div", { class: "rsvp" }, [
        has(r.wstep) ? para(r.wstep) : "",
        termin ? el("p", { class: "meta" }, ["Potwierdźcie swoją obecność do ", el("strong", { text: DATE_FMT.format(termin) }), "."]) : "",
        has(r.tekst) ? para(r.tekst) : "",
        btns.length ? el("div", { class: "actions actions--center" }, btns) : "",
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

    /* Przydatne informacje — każdy punkt rozwijany */
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

    /* Kontakt — Para Młoda */
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
      console.error(err);
      $("app").replaceChildren(el("p", { class: "error", text: "Nie udało się wczytać treści. Sprawdź poprawność pliku content.json (np. na jsonlint.com)." }));
      $("names").textContent = "Informacje weselne";
    });
})();
