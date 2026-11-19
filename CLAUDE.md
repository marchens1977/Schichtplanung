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

## Hilfsprogramme und Tests (Regel des Nutzers, gilt dauerhaft)

1. Automatische Prüfungen (Tests) und Hilfsprogramme, die über eine einzelne Aufgabe hinaus
   nützlich sind, werden im Projekt gespeichert (Ordner `werkzeuge/` oder `test/`), nicht nur
   im Arbeitsbereich der Sitzung (der geht beim Archivieren verloren).
2. Hier im Tagebuch steht, wie man sie startet und was sie prüfen.
3. Nach jeder Code-Änderung die vorhandenen Prüfungen laufen lassen; bei neuen Funktionen
   passende Prüfpunkte ergänzen.
4. Gibt es noch keine automatische Prüfung, bei der nächsten Code-Änderung eine einfache anlegen.
5. Was Claude nicht selbst testen kann (z. B. echte Anmeldungen, das echte Handy, den
   Raspberry Pi), hier als Test für den Nutzer vermerken.

**Vorhandene Prüfungen und Hilfsprogramme (Stand 19.11.2026):**
- `test/app.test.js` – Browser-Test (Chromium in Handy-Größe). Firebase wird durch
  `test/firestore-attrappe.js` ersetzt (keine echten Daten!), das Tailwind-CDN durch lokal erzeugtes CSS.
  Prüft: Anmeldeseite, Admin-Erststart, Mitarbeiter anlegen, Platzwahl einschalten, Login als
  Mitarbeiter, Werktag-Pfeil, Platz wählen, Schicht speichern, Platzsperre, Tagesplan, L-Form des
  Raumplans und die Mets-Farben. Bildschirmfotos landen in `test/bilder/` (nicht im Repository).
  Start: `cd test && npm install && npm test` (Playwright muss vorhanden sein; in Claude-Sitzungen vorinstalliert).
- `werkzeuge/icons_erzeugen.py` – zeichnet die App-Symbole in `icons/` neu (Blau/Orange).
  Start: `python3 werkzeuge/icons_erzeugen.py` (braucht Pillow).

**Tests für den Nutzer (kann Claude nicht selbst prüfen):**
- Anmelden mit echtem Konto am Handy, Schicht eintragen/ändern/löschen.
- App am Handy installieren (Chrome → ⋮ → „App installieren“) und öffnen.
- [ ] Neue Farben (Blau/Orange) am Handy sichtbar? Ggf. Seite 2× neu laden.
- [ ] Neues App-Symbol (blau mit orangem Kalender): alte App deinstallieren und neu installieren.
- [ ] Kopfleiste des Handys (Statusleiste) in der installierten App dunkelblau?

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
- `icons/`: App-Symbole (Kalender in Mets-Blau/Orange), 192/512/maskable/Apple.
  Erzeugt mit `werkzeuge/icons_erzeugen.py`.
- **Design/Farben:** im Stil der New York Mets (Wunsch des Nutzers): Blau `#002D72`, Orange
  `#FF5910`. Als Tailwind-Farben `mets-…` im `tailwind.config` oben in `index.html` definiert.
  Kopfzeile blau mit orangem Streifen, Haupt-Knöpfe blau, aktiver Reiter und gewählter Platz
  orange (mit blauer Schrift, besser lesbar als Weiß auf Orange), belegter Platz blau,
  Homeoffice-Text dunkles Orange. Nur Farben, **kein** Mets-Logo (Markenrecht).

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
- **Keine APK (geprüft 19.11.2026):** Die App ist eine installierbare Web-App (PWA), keine APK.
  Eine APK (z. B. per PWABuilder als „Trusted Web Activity“) brächte kaum Vorteile, aber Aufwand:
  Signierschlüssel verwalten, Installation aus „unbekannten Quellen“ bei jedem Kollegen,
  oder Play-Store-Konto (25 $ einmalig) + Prüfung. Nur neu überdenken, wenn z. B.
  Push-Benachrichtigungen oder ein Store-Eintrag wirklich gebraucht werden.
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
- **16.11.2026:** Plan Stufe 2, Kosten und Datenschutz-Stand notiert – PR #13.
- **16.11.2026:** Betriebsvarianten A/B/C (lokal auf Pi, Pi-WLAN, Cloud) notiert – PR #14.
- **18.11.2026:** Idee „Datenbank auf dem privaten Pi zu Hause“ geprüft und vorerst zurückgestellt – PR #15.
- **18.11.2026:** Regel „Hilfsprogramme und Tests gehören ins Projekt“ aufgenommen – PR #16.
- **19.11.2026:** Design in Mets-Farben (Blau/Orange), neue App-Symbole, erster automatischer
  Browser-Test (`test/`), Symbol-Werkzeug (`werkzeuge/`). APK-Frage geprüft: bleibt PWA.

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
- **Betriebsvarianten – Entscheidung offen (Nutzer denkt nach, Stand 16.11.2026):**
  Erst entscheiden, dann nur EINE Variante bauen (nicht Firebase-Stufe-2 UND lokal).
  Empfehlung: alle drei Varianten dem Datenschutzbeauftragten/der IT vorlegen.
  - **C) Cloud (Firebase, Stufe 2 wie oben):** Eintragen von überall inkl. Homeoffice/Handy.
    Nachteil: US-Anbieter, Auftragsverarbeitungsvertrag, Organisation als Betreiber nötig.
  - **B) Nur lokal auf einem Raspberry Pi 400 im Büro (ohne Netz):** kleiner lokaler Server
    + SQLite-Datei auf dem Pi, alle Programmteile (Tailwind usw.) lokal, Chromium im
    Kiosk-Modus, Passwörter gehasht. Aufwand: Umbau ca. 1–2 h (Claude), Einrichtung Pi
    ca. 30–60 min (Nutzer, Befehle kopieren). Vorteile: Datenschutz deutlich einfacher,
    keine Kosten/Abhängigkeiten. Nachteile/To-dos:
    - Eintragen nur an diesem Gerät (Homeoffice vorher im Büro eintragen).
    - **Pi 400 hat keine batteriegepufferte Uhr** → ohne Internet falsche Zeit nach
      Stromausfall (14-Uhr-Regel, „Heute“). Lösung: USB-Uhrmodul oder Uhr manuell stellen.
    - Automatische tägliche Sicherung auf USB-Stick (SD-Karten können ausfallen).
    - Updates nur per USB-Stick oder kurz ins Internet.
    - Automatische Abmeldung nach ca. 2 Minuten ohne Eingabe (ein Gerät für alle).
  - **A) Wie B, aber der Pi spannt ein eigenes WLAN auf** (z. B. „Schichtplanung“, mit
    Passwort, ohne Internet): Eintragen im Büro auch per Handy. Nachteil: Handy meldet
    „kein Internet“; IT muss eigenes WLAN erlauben.
  - **Zurückgestellt (18.11.2026): Datenbank auf dem privaten Pi des Nutzers zu Hause**
    (Projekt `marchens1977/Raspberry-Pi-Server`, Pi `192.168.178.84`, nur Heimnetz + WireGuard-VPN der FritzBox).
    Technisch gut machbar (wie Kicktipp-Assistent), aber Kollegen kämen nur per VPN ins **ganze Heimnetz**
    (nicht empfohlen) oder über Öffnung ins Internet (im Server-Projekt ausgeschlossen); zudem dienstliche
    Daten auf privatem Gerät (Arbeitgeber/Datenschutz müsste zustimmen). Sinnvoll nur, wenn die App allein
    vom Nutzer genutzt wird. Entscheidung des Nutzers: **erstmal alles so lassen** (Firebase wie bisher).
  - **Verworfen: Pi im Gast-WLAN** (mit Zustimmungsseite/NeverSSL). Gründe: Geräte sehen
    sich dort meist nicht (Client-Isolation), jeder Besucher im selben Netz, meist
    unverschlüsselt (Passwörter mitlesbar), Zustimmung läuft ab, vermutlich unzulässig.
  - Angebot an den Nutzer: Kurzbeschreibung für den Datenschutz um einen Vergleich A/B/C
    ergänzen („Ja, ergänze den Vergleich“).
- **Hinweis Pi:** Auf dem Pi-Schreibtisch lag eine alte lokale Kopie `Schichtplanung.html`
  (ohne Gestaltung). Immer die Online-Adresse benutzen; Kopie kann gelöscht werden.
- **Datenschutz:** Kurzbeschreibung für den Datenschutzbeauftragten liegt als Claude-Doc vor
  (Titel „Schichtplanung – Kurzbeschreibung für den Datenschutz“). Gespräch steht noch aus.
