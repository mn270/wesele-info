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
    const m = c.miejsce || {};
    const location = has(m.adres) ? [m.nazwa, m.adres].filter(has).join(", ") : "";
    const description = [m.opis || "", window.location.href].filter(Boolean).join("\n");
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

    const sur = $("surnames");
    if (has(c.para.ona_nazwisko) || has(c.para.on_nazwisko)) {
      sur.append(
        el("span", { text: c.para.ona_nazwisko || "" }),
        has(c.para.ona_nazwisko) && has(c.para.on_nazwisko) ? el("span", { class: "sep", text: "·" }) : "",
        el("span", { text: c.para.on_nazwisko || "" }),
      );
    } else sur.hidden = true;

    if (has(c.zaproszenie)) $("eyebrow").textContent = c.zaproszenie;

    if (has(c.obraz)) {
      const fig = $("figure");
      fig.hidden = false;
      $("image").src = c.obraz;
      $("image").alt = c.obraz_podpis || "";
      if (has(c.obraz_podpis)) $("caption").textContent = c.obraz_podpis; else $("caption").hidden = true;
    }

    if (has(c.motto)) $("motto").textContent = c.motto; else $("motto").hidden = true;

    const start = parseLocal(c.data);
    if (start) {
      const d = $("date");
      d.append(
        `${pad(start.getDate())}.${pad(start.getMonth() + 1)}.${start.getFullYear()}`,
        el("span", { class: "bar", "aria-hidden": "true" }),
        `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      );
      $("weekday").textContent = DATE_FMT.format(start);
      renderCountdown(start);
    }

    const actions = $("hero-actions");
    if (start) {
      const blob = new Blob([buildIcs(c, start)], { type: "text/calendar;charset=utf-8" });
      actions.append(el("a", { class: "btn btn--primary", href: URL.createObjectURL(blob), download: "slub.ics", text: "Dodaj do kalendarza" }));
    }
    if (c.miejsce && has(c.miejsce.adres)) actions.append(el("a", { class: "btn", href: mapsUrl([c.miejsce.nazwa, c.miejsce.adres].filter(has).join(", ")), target: "_blank", rel: "noopener", text: "Jak dojechać" }));
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

  /** Zwraca adres URL tylko jeśli ma bezpieczny schemat (http/https/mailto/tel/sms). */
  function safeHref(u) {
    try {
      const url = new URL(String(u), window.location.href);
      return ["http:", "https:", "mailto:", "tel:", "sms:"].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }

  function renderMain(c) {
    const app = $("app");
    app.textContent = "";

    if (has(c.wstep)) app.append(el("p", { class: "section", text: c.wstep }));

    /* Jedno miejsce — ślub i wesele pod tym samym adresem; mapa jest w nagłówku, więc tu jej nie dublujemy. */
    const m = c.miejsce;
    if (m && (has(m.nazwa) || has(m.adres) || has(m.opis))) {
      app.append(section(m.tytul || "Miejsce", el("div", { class: "card card--single" }, [
        has(m.nazwa) || has(m.adres) ? el("p", { class: "meta" }, [has(m.nazwa) ? el("strong", { text: m.nazwa }) : "", has(m.nazwa) && has(m.adres) ? " · " : "", m.adres || ""]) : "",
        has(m.opis) ? el("p", { text: m.opis }) : "",
      ])));
    }

    if (has(c.plan)) {
      app.append(section("Plan dnia", el("div", { class: "card" }, el("ul", { class: "timeline" },
        c.plan.map((p) => el("li", null, [el("time", { text: p.godzina }), el("span", { text: p.opis })]))))));
    }

    /* RSVP „jednym kliknięciem”: linki do formularza (Google Forms z gotową odpowiedzią),
       a gdy ich nie ma — SMS z gotowym tekstem / telefon / e-mail. */
    const r = c.rsvp;
    if (r && (has(r.link_tak) || has(r.link_nie) || has(r.link) || has(r.telefon) || has(r.email) || has(r.tekst))) {
      const termin = has(r.termin) ? parseLocal(r.termin) : null;
      const smsBody = has(r.sms_tekst) ? "?body=" + encodeURIComponent(r.sms_tekst) : "";
      const btns = [];
      if (has(r.link_tak)) btns.push(el("a", { class: "btn btn--primary", href: safeHref(r.link_tak), target: "_blank", rel: "noopener", text: "Będę!" }));
      if (has(r.link_nie)) btns.push(el("a", { class: "btn", href: safeHref(r.link_nie), target: "_blank", rel: "noopener", text: "Niestety nie dam rady" }));
      if (!btns.length && has(r.link)) btns.push(el("a", { class: "btn btn--primary", href: safeHref(r.link), target: "_blank", rel: "noopener", text: "Potwierdź obecność" }));
      if (has(r.telefon)) {
        btns.push(el("a", { class: btns.length ? "btn" : "btn btn--primary", href: "sms:" + telHref(r.telefon).slice(4) + smsBody, text: "Potwierdź SMS-em" }));
        btns.push(el("a", { class: "btn", href: telHref(r.telefon), text: "Zadzwoń" }));
      }
      if (has(r.email)) btns.push(el("a", { class: "btn", href: "mailto:" + r.email + "?subject=" + encodeURIComponent("Potwierdzenie obecności") + (has(r.sms_tekst) ? "&body=" + encodeURIComponent(r.sms_tekst) : ""), text: "Napisz e-mail" }));
      app.append(section("Potwierdzenie obecności", el("div", { class: "card card--single" }, [
        termin ? el("p", { class: "meta" }, ["Prosimy o odpowiedź do ", el("strong", { text: DATE_FMT.format(termin) })]) : "",
        has(r.tekst) ? el("p", { text: r.tekst }) : "",
        btns.length ? el("div", { class: "actions actions--center" }, btns) : "",
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
          has(n.adres) && !(c.miejsce && n.adres === c.miejsce.adres) ? el("a", { class: "btn", href: mapsUrl(n.adres), target: "_blank", rel: "noopener", text: "Mapa" }) : "",
          has(n.telefon) ? el("a", { class: "btn", href: telHref(n.telefon), text: n.telefon }) : "",
          has(n.link) && safeHref(n.link) ? el("a", { class: "btn", href: safeHref(n.link), target: "_blank", rel: "noopener", text: "Strona" }) : "",
        ]);
        if (acts.childElementCount) card.append(acts);
        return card;
      }))));
    }

    /* Praktyczne informacje — dowolna lista; pozycje z pustym tekstem są pomijane. */
    const prakt = (c.praktyczne || []).filter((p) => has(p.tekst));
    if (prakt.length) {
      app.append(section("Praktyczne informacje", el("div", { class: "grid-2" }, prakt.map((p) => {
        const card = el("div", { class: "card" }, [el("h3", { text: p.tytul }), el("p", { text: p.tekst })]);
        const href = has(p.link) ? safeHref(p.link) : null;
        if (href) card.append(el("div", { class: "actions" }, el("a", { class: "btn", href, target: "_blank", rel: "noopener", text: p.link_tekst || "Więcej" })));
        return card;
      }))));
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
