# Offene Punkte für die Abgabe

Diese Datei behalten wir bewusst separat. Alles, was noch fehlt oder vor der Abgabe ergänzt werden soll, steht hier statt verteilt in den einzelnen Bewertungsdokumenten.

## Funktional

- Die Task-Funktion ist noch nicht implementiert. Aktuell gibt es nur eine Platzhalterroute unter `apps/web/src/routes/_app/tasks/route.tsx`.
- Für Tasks fehlen Database Table, API Procedures und UI.

Hinweis für Abgabe:

- `[Entscheiden: Task-Funktion implementieren oder in der Abgabe als nicht umgesetzt markieren]`

## Security

- Automatisierte Tests sind laut Kriterienliste nicht explizit Pflicht, wären aber ein guter zusätzlicher Nachweis.
- Sinnvolle Testfälle wären: fremde Note-/Folder-/Tag-IDs, gefährliche Link-Protokolle, Share-Link-Revoke und Auth-Flows.

Platzhalter:

- `[Optional: manuellen Testnachweis Access Control einfügen]`
- `[Optional: manuellen Testnachweis Injection / Link Validation einfügen]`
- `[Optional: manuellen Testnachweis Auth / 2FA einfügen]`

## Dokumentation

- Screenshots fehlen noch.
- Quellenliste fehlt noch.
- Teambeiträge sind noch nicht konkret auf Tobias und Levin aufgeteilt.
- Eine kurze Abgabe-Checkliste fehlt noch.

Platzhalter:

- `[Screenshot Dashboard / Notes Grid einfügen]`
- `[Screenshot Note Editor einfügen]`
- `[Screenshot Share Link / Public Share View einfügen]`
- `[Screenshot 2FA Setup / Security Settings einfügen]`
- `[Quelle OWASP Top 10 einfügen]`
- `[Quelle Better Auth einfügen]`
- `[Quelle verwendete Frameworks / Libraries falls nötig einfügen]`
- `[Teambeiträge Tobias / Levin einfügen]`

## Priorität vor Abgabe

1. Teambeiträge und Commits dokumentieren.
2. Screenshots der wichtigsten Flows einfügen: Login, Notizliste, Editor, Share Link, Public Share View.
3. Manuelle Testnachweise oder einzelne Security-Testfälle für Access Control, Injection und Auth ergänzen.
4. Task-Funktion entweder implementieren oder klar als nicht umgesetzt markieren.
