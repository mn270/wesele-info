/**
 * RSVP -> Arkusz Google. Wklej ten kod do Apps Script podpiętego do arkusza
 * (Arkusz -> Rozszerzenia -> Apps Script), potem: Wdróż -> Nowe wdrożenie ->
 * typ "Aplikacja internetowa", "Uruchamiaj jako: ja", "Kto ma dostęp: Każdy".
 * Skopiuj adres /exec do content.json -> rsvp.endpoint.
 *
 * Arkusz eksportujesz do Excela: Plik -> Pobierz -> Microsoft Excel (.xlsx).
 */

var SHEET_NAME = "RSVP";
var KOD = ""; // opcjonalnie: wspólny kod z zaproszenia, np. "TURZNO2027"; puste = brak weryfikacji

var HEADERS = ["Data zgłoszenia", "Imię i nazwisko", "Obecność", "Liczba osób", "Osoby towarzyszące",
  "Dieta / alergie", "Nocleg", "Piosenka", "Wiadomość", "Telefon", "Źródło"];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || "{}");
    var name = String(d.imie || "").trim();
    if (name.length < 3) return respond({ ok: false, error: "Podaj imię i nazwisko." });
    if (KOD && String(d.kod || "").trim().toUpperCase() !== KOD.toUpperCase()) {
      return respond({ ok: false, error: "Nieprawidłowy kod z zaproszenia." });
    }
    var sheet = getSheet();
    var row = [new Date(), name, d.obecnosc === "nie" ? "NIE" : "TAK",
      Number(d.osoby) || 1, String(d.towarzyszace || "").trim(), String(d.dieta || "").trim(),
      d.nocleg ? "TAK" : "NIE", String(d.piosenka || "").trim(), String(d.wiadomosc || "").trim(),
      String(d.telefon || "").trim(), "strona"];
    // Jedno nazwisko = jeden wiersz: kolejne zgłoszenie tej samej osoby nadpisuje poprzednie.
    var existing = findRowByName(sheet, name);
    if (existing > 0) sheet.getRange(existing, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
    return respond({ ok: true });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

function doGet() {
  return respond({ ok: true, info: "RSVP endpoint działa. Użyj POST." });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRowByName(sheet, name) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var names = sheet.getRange(2, 2, last - 1, 1).getValues();
  var key = name.toLowerCase().replace(/\s+/g, " ");
  for (var i = 0; i < names.length; i++) {
    if (String(names[i][0]).toLowerCase().replace(/\s+/g, " ") === key) return i + 2;
  }
  return -1;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
