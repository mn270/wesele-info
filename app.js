/* Strona informacyjna wesela — renderuje treść z content.json.
   Nie trzeba tu nic zmieniać; całą treść edytujesz w content.json. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

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

  const mapsUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  const telHref = (t) => "tel:" + String(t).replace(/[^\d+]/g, "");

  const DATE_FMT = new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  /** Parsuje "RRRR-MM-DDTGG:MM:SS" jako czas lokalny. */
  function parseLocal(s) {
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  const pad = (n) => String(n).padStart(2, "0");
  const icsStamp = (d) => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  const icsEscape = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  function buildIcs(c, start) {
    const end = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const title = `Ślub ${c.para.ona} i ${c.para.on}`;
    const location = c.slub && c.slub.adres ? `${c.slub.miejsce || ""}, ${c.slub.adres}` : "";
    const description = [
      c.slub && c.slub.miejsce ? `Ceremonia: ${c.slub.godzina || ""} ${c.slub.miejsce}` : "",
      c.wesele && c.wesele.miejsce ? `Wesele: ${c.wesele.godzina || ""} ${c.wesele.miejsce}, ${c.wesele.adres || ""}` : "",
      window.location.href,
    ].filter(Boolean).join("\n");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//wesele-info//PL", "BEGIN:VEVENT",
      "UID:" + icsStamp(start) + "@wesele-info",
      "DTSTAMP:" + icsStamp(new Date()) ,
      "DTSTART:" + icsStamp(start),
      "DTEND:" + icsStamp(end),
      "SUMMARY:" + icsEscape(title),
      location ? "LOCATION:" + icsEscape(location) : "",
      "DESCRIPTION:" + icsEscape(description),
      "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
  }

  /* ---------- Nagłówek ---------- */
  function renderHero(c) {
    const names = $("names");
    names.textContent = "";
    names.append(c.para.ona, el("span", { class: "amp", text: "&" }), c.para.on);
    document.title = `${c.para.ona} & ${c.para.on} — informacje weselne`;

    const start = parseLocal(c.data);
    if (start) $("date").textContent = DATE_FMT.format(start);
    if (has(c.motto)) $("motto").textContent = c.motto; else $("motto").hidden = true;

    if (start) renderCountdown(start);

    const actions = $("hero-actions");
    if (start) {
      const blob = new Blob([buildIcs(c, start)], { type: "text/calendar;charset=utf-8" });
      actions.append(el("a", { class: "btn btn--primary", href: URL.createObjectURL(blob), download: "slub.ics", text: "Dodaj do kalendarza" }));
    }
    if (c.slub && has(c.slub.adres)) actions.append(el("a", { class: "btn", href: mapsUrl(c.slub.adres), target: "_blank", rel: "noopener", text: "Mapa: ceremonia" }));
    if (c.wesele && has(c.wesele.adres)) actions.append(el("a", { class: "btn", href: mapsUrl(c.wesele.adres), target: "_blank", rel: "noopener", text: "Mapa: wesele" }));
  }

  function renderCountdown(start) {
    const box = $("countdown");
    box.hidden = false;
    const tick = () => {
      const diff = start - Date.now();
      box.textContent = "";
      if (diff <= 0) {
        box.className = "countdown countdown--done";
        box.textContent = diff > -36 * 3600 * 1000 ? "To już dziś!" : "Dziękujemy, że byliście z nami!";
        return false;
      }
      const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24, m = Math.floor(diff / 60000) % 60;
      [[d, "dni"], [h, "godz."], [m, "min"]].forEach(([n, l]) =>
        box.append(el("div", { class: "countdown__item" }, [el("span", { class: "countdown__num", text: n }), el("span", { class: "countdown__label", text: l })])));
      return true;
    };
    if (tick()) setInterval(tick, 30000);
  }

  /* ---------- Sekcje ---------- */
  function section(title, body) {
    return el("section", { class: "section" }, [el("h2", { class: "section__title", text: title }), body]);
  }

  function placeCard(p, fallbackTitle) {
    const card = el("div", { class: "card" }, [
      el("h3", { text: p.tytul || fallbackTitle }),
      has(p.godzina) || has(p.miejsce) ? el("p", { class: "meta" }, [has(p.godzina) ? el("strong", { text: p.godzina }) : "", has(p.godzina) && has(p.miejsce) ? " · " : "", p.miejsce || ""]) : "",
      has(p.adres) ? el("p", { class: "meta", text: p.adres }) : "",
      has(p.opis) ? el("p", { text: p.opis }) : "",
    ]);
    if (has(p.adres)) card.append(el("div", { class: "actions" }, el("a", { class: "btn", href: mapsUrl(p.adres), target: "_blank", rel: "noopener", text: "Pokaż na mapie" })));
    return card;
  }

  function renderMain(c) {
    const app = $("app");
    app.textContent = "";

    if (has(c.wstep)) app.append(el("p", { class: "section", text: c.wstep }));

    const places = [];
    if (c.slub && (has(c.slub.miejsce) || has(c.slub.adres))) places.push(placeCard(c.slub, "Ceremonia"));
    if (c.wesele && (has(c.wesele.miejsce) || has(c.wesele.adres))) places.push(placeCard(c.wesele, "Wesele"));
    if (places.length) app.append(section("Gdzie i kiedy", el("div", { class: "grid-2" }, places)));

    if (has(c.plan)) {
      app.append(section("Plan dnia", el("div", { class: "card" }, el("ul", { class: "timeline" },
        c.plan.map((p) => el("li", null, [el("time", { text: p.godzina }), el("span", { text: p.opis })]))))));
    }

    if (c.rsvp && (has(c.rsvp.telefon) || has(c.rsvp.email) || has(c.rsvp.link) || has(c.rsvp.tekst))) {
      const r = c.rsvp;
      const termin = has(r.termin) ? parseLocal(r.termin) : null;
      const actions = el("div", { class: "actions" }, [
        has(r.link) ? el("a", { class: "btn btn--primary", href: r.link, target: "_blank", rel: "noopener", text: "Wypełnij formularz" }) : "",
        has(r.telefon) ? el("a", { class: "btn", href: telHref(r.telefon), text: "Zadzwoń: " + r.telefon }) : "",
        has(r.telefon) ? el("a", { class: "btn", href: "sms:" + telHref(r.telefon).slice(4), text: "Napisz SMS" }) : "",
        has(r.email) ? el("a", { class: "btn", href: "mailto:" + r.email, text: r.email }) : "",
      ]);
      app.append(section("Potwierdzenie obecności", el("div", { class: "card" }, [
        termin ? el("p", { class: "meta" }, ["Prosimy o odpowiedź do ", el("strong", { text: DATE_FMT.format(termin) })]) : "",
        has(r.tekst) ? el("p", { text: r.tekst }) : "",
        actions,
      ])));
    }

    if (has(c.nocleg)) {
      app.append(section("Noclegi", el("div", { class: "grid-2" }, c.nocleg.map((n) => {
        const card = el("div", { class: "card" }, [
          el("h3", { text: n.nazwa }),
          has(n.adres) ? el("p", { class: "meta", text: n.adres }) : "",
          has(n.uwagi) ? el("p", { text: n.uwagi }) : "",
        ]);
        const acts = el("div", { class: "actions" }, [
          has(n.adres) ? el("a", { class: "btn", href: mapsUrl(n.adres), target: "_blank", rel: "noopener", text: "Mapa" }) : "",
          has(n.telefon) ? el("a", { class: "btn", href: telHref(n.telefon), text: n.telefon }) : "",
          has(n.link) ? el("a", { class: "btn", href: n.link, target: "_blank", rel: "noopener", text: "Strona" }) : "",
        ]);
        if (acts.childElementCount) card.append(acts);
        return card;
      }))));
    }

    const simple = [["Transport", c.transport], ["Dress code", c.dresscode], ["Prezenty", c.prezenty]].filter(([, v]) => has(v));
    if (simple.length) {
      app.append(section("Praktyczne informacje", el("div", { class: "grid-2" },
        simple.map(([t, v]) => el("div", { class: "card" }, [el("h3", { text: t }), el("p", { text: v })])))));
    }

    if (has(c.faq)) {
      app.append(section("Pytania i odpowiedzi", el("div", { class: "card" },
        c.faq.map((f) => el("details", null, [el("summary", { text: f.pytanie }), el("p", { text: f.odpowiedz })])))));
    }

    if (has(c.kontakt)) {
      app.append(section("Kontakt", el("div", { class: "card" }, el("div", { class: "contacts" },
        c.kontakt.map((k) => el("div", { class: "contact" }, [
          el("span", { class: "role", text: k.rola }),
          el("strong", { text: k.imie }),
          has(k.telefon) ? el("a", { href: telHref(k.telefon), text: k.telefon }) : "",
        ]))))));
    }

    $("footer").textContent = has(c.stopka) ? c.stopka : "";
  }

  /* ---------- Start ---------- */
  fetch("content.json?v=" + Date.now(), { cache: "no-store" })
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then((c) => { renderHero(c); renderMain(c); })
    .catch((err) => {
      console.error(err);
      $("app").replaceChildren(el("p", { class: "error", text: "Nie udało się wczytać treści. Sprawdź poprawność pliku content.json (np. na jsonlint.com)." }));
      $("names").textContent = "Informacje weselne";
    });
})();
