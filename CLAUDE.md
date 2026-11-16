# Projekt-Tagebuch: Schichtplanung

Diese Datei liest Claude zu Beginn jeder Sitzung. Sie hält fest, worum es geht,
was entschieden wurde und was als Nächstes ansteht. Nach jeder größeren Änderung
aktualisieren.

## Zusammenarbeit mit dem Nutzer

- Der Nutzer ist **Programmier-Laie**. Immer einfaches Deutsch, Fachbegriffe kurz
  erklären, kleine nummerierte Schritte.
- Klar trennen: **Was Claude übernimmt** und **was der Nutzer selbst tun muss**.
- Der Nutzer möchte, dass Claude **alles übernimmt, was möglich ist**: Änderungen
  committen, Pull Request anlegen und in `main` mergen (ausdrücklich erlaubt).
- Hardware des Nutzers: nur ein **Samsung-Smartphone** (Chrome) und ein
  **Raspberry Pi 400**. Anleitungen also für das Handy schreiben.
- **Modell-Erinnerung:** Wenn du nicht auf Opus läufst (z. B. auf Fable) und eine
  Aufgabe abgeschlossen ist, erinnere den Nutzer am Ende der Antwort:
  „Tipp: Du kannst jetzt mit `/model claude-opus-5-5` zurückstellen.“

## Worum es geht

Web-App für ein kleines Team zur Planung von Schichten (Montag bis Freitag),
inklusive Homeoffice und optionaler Platzwahl im Büro.

- Online unter: https://marchens1977.github.io/Schichtplanung/ (GitHub Pages, Branch `main`, Ordner root)
- Als App installierbar (PWA) über Chrome → ⋮ → „App installieren“.

## Aufbau

- `index.html`: die gesamte App (Oberfläche + Logik in einer Datei).
  - Tailwind CSS über CDN, Firebase **Firestore** (Version 10.8.0) über CDN.
  - Firestore-Sammlungen: `users` (ID = Name klein), `shifts` (ID = `datum_name`),
    `desks` (Platzsperren, ID = `datum_P1`…), `settings/main` (`desks: true/false`).
  - **Eigene Anmeldung** (Benutzername/Passwort in `users`), **nicht** Firebase Auth.
    Angemeldeter Name liegt in `localStorage` (`sp_user`).
- `manifest.json`: App-Name, Farben, Symbole (PWA). Wird als `manifest.json?v=2`
  eingebunden; bei Änderungen am Manifest die Versionsnummer erhöhen.
- `sw.js`: Service Worker. Eigene Dateien: erst Netz, sonst Kopie. Firebase/Tailwind
  werden **nicht** zwischengespeichert. Bei Änderungen `CACHE`-Version erhöhen.
- `icons/`: App-Symbole (blauer Kalender), 192/512/maskable/Apple.

## Regeln der App (fachlich)

- Schichten nur **Montag bis Freitag**.
- Mitarbeiter dürfen Schichten nur bis **14:00 Uhr am Vortag** anlegen/ändern/löschen;
  der Admin darf immer.
- Pro Mitarbeiter **eine Schicht pro Tag**.
- **16 Büroplätze** (P1–P16, 4 Inseln à 4 Plätze). Homeoffice zählt nicht.
- **Raumplan in L-Form** (wie im echten Büro): oben Insel 2, 3, 4 nebeneinander, darunter
  links Insel 1. Gilt auch auf dem Handy im Hochformat (immer 3 Spalten, kompakte Plätze).
  Orientierungshinweise (nur Text): „Overhead“ über Insel 2, „Eingang“ rechts neben
  Insel 1, „Coaching-Raum“ rechts neben dem Eingang (unter Insel 4), „Büro Leitung“ (zwei Wörter) unter Insel 1 (Funktion `renderRoomHTML`).
  Hinweise in normaler Groß-/Kleinschreibung, nicht in Großbuchstaben.
- Datumsfelder (Formular + Tagesplan) haben ‹ › zum Springen um einen **Werktag**
  (Wochenenden werden übersprungen); Tagesplan zusätzlich „Heute“.
- Knopf „Schicht eintragen“ / „Änderung speichern“ steht **über** dem Raumplan, nicht darunter.
- Schicht-Beginn 11:00–17:00 Uhr in 30-Minuten-Schritten, Pause 0–90 Minuten.
- Benutzer `admin` ist reserviert; beim allerersten Start wird das Admin-Konto angelegt
  (Passwort min. 8 Zeichen). Nur der Admin sieht Mitarbeiterverwaltung, Einstellungen, CSV-Export.

## Entscheidungen

- App-Name überall **„Schichtplanung“** (nicht „Schichten“), auch als `short_name`.
- Kein Play Store: PWA reicht für das kleine Team.
- **Passwörter vergibt nur der Admin.** Mitarbeiter können ihr Passwort nicht selbst
  festlegen oder ändern – bewusst so, damit niemand ein anderswo genutztes Passwort
  eingibt (Passwörter liegen derzeit im Klartext). So beibehalten, bis Stufe 2 umgesetzt ist.
  Admin-Funktionen prüfen zusätzlich `isAdmin()`.

## Verlauf

- **15.11.2026:** PWA eingebaut (Manifest, Service Worker, Symbole) – PR #1.
- **15.11.2026:** Kurzname auf „Schichtplanung“ geändert, Manifest-Version erzwungen – PR #2, #3.
- **16.11.2026:** Code-Prüfung, 9 Schwachstellen behoben (Transaktion beim Ändern,
  Prüfreihenfolge im Formular, Absturzschutz Sortierung, Benutzernamen-Regel,
  Admin-Erststart, leere Passwörter u. a.) – PR #4.
- **16.11.2026:** Dieses Tagebuch angelegt – PR #5.
- **16.11.2026:** Raumplan zeigt die L-Form jetzt auch auf dem Handy – PR #6.
- **16.11.2026:** Vor-/Zurück-Pfeile an den Datumsfeldern, „Heute“ im Tagesplan – PR #7.
- **16.11.2026:** Raumplan-Hinweise Overhead / Eingang / Büroleitung – PR #8.
- **16.11.2026:** Hinweis in „Büro Leitung“ (zwei Wörter) geändert – PR #9.
- **16.11.2026:** Hinweis „Coaching-Raum“ ergänzt, normale Schreibweise statt Großbuchstaben – PR #10.
- **16.11.2026:** Speichern-Knopf über den Raumplan verschoben – PR #11.
- **16.11.2026:** Admin-Funktionen zusätzlich mit `isAdmin()` abgesichert – PR #12.

## Offene Ideen / nächste Schritte

- **Stufe 2 – Sicherheit (vom Nutzer gewünscht, Termin offen):** Passwörter liegen im
  Klartext in Firestore, und jeder mit Kenntnissen kann Daten lesen/ändern. Beschlossener Plan
  (Variante a), **ohne Blaze-Tarif / ohne Kreditkarte**:
  - Firebase Authentication (E-Mail/Passwort mit künstlichen Adressen aus dem Benutzernamen,
    keine echten E-Mails speichern) + Firestore-Sicherheitsregeln je Rolle.
  - Admin legt Mitarbeiter an; App erzeugt **zufälliges Start-Kennwort**, zeigt es einmal an.
    Neues Konto über zweite App-Instanz anlegen, damit der Admin angemeldet bleibt.
  - Beim ersten Login **Pflicht zum Passwortwechsel** (Mindestlänge ca. 10 Zeichen).
    Danach ändert der Mitarbeiter sein Passwort selbst; Admin sieht keine Passwörter mehr.
    (Damit entfällt die alte Regel „nur Admin vergibt Passwörter“.)
  - Passwort vergessen: Admin löscht das Konto in der Firebase-Konsole und legt es neu an.
  - Alle Konten werden neu angelegt; Stufe 2 möglichst **vor** Verteilung an Testkollegen.
  - Der Nutzer erledigt seinen Teil in der Firebase-Konsole am **Raspberry Pi 400** (Chromium),
    nicht am Handy. Anleitung Schritt für Schritt, zum Kopieren.
  - Region der Firestore-Datenbank prüfen (Ziel: EU / Frankfurt).
- **Kosten/Freimengen:** Alles läuft kostenlos (GitHub Pages, Firebase Spark). Die App lädt
  derzeit *alle* Schichten → Lesevorgänge wachsen mit der Zeit. Mit Stufe 2 umsetzen:
  nur Schichten ab heute (bzw. Admin: Zeitraum) laden und alte Schichten nach einer Frist
  automatisch löschen (Löschkonzept für den Datenschutz).
- **Datenschutz:** Kurzbeschreibung für den Datenschutzbeauftragten liegt als Claude-Doc vor
  (Titel „Schichtplanung – Kurzbeschreibung für den Datenschutz“). Gespräch steht noch aus.
