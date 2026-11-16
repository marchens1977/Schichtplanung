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
  Insel 1, „Büro Leitung“ (zwei Wörter) unter Insel 1 (Funktion `renderRoomHTML`).
- Datumsfelder (Formular + Tagesplan) haben ‹ › zum Springen um einen **Werktag**
  (Wochenenden werden übersprungen); Tagesplan zusätzlich „Heute“.
- Schicht-Beginn 11:00–17:00 Uhr in 30-Minuten-Schritten, Pause 0–90 Minuten.
- Benutzer `admin` ist reserviert; beim allerersten Start wird das Admin-Konto angelegt
  (Passwort min. 8 Zeichen). Nur der Admin sieht Mitarbeiterverwaltung, Einstellungen, CSV-Export.

## Entscheidungen

- App-Name überall **„Schichtplanung“** (nicht „Schichten“), auch als `short_name`.
- Kein Play Store: PWA reicht für das kleine Team.

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

## Offene Ideen / nächste Schritte

- **Stufe 2 – Sicherheit:** Passwörter liegen im Klartext in Firestore, und jeder mit
  Kenntnissen kann Daten lesen/ändern. Lösung: Firebase Authentication + Firestore-
  Sicherheitsregeln. Erst angehen, wenn der Nutzer das möchte.
