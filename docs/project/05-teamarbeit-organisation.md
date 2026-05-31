# 5. Teamarbeit & Organisation

## Zusammenarbeit

Unsere Zusammenarbeit ist über Git nachvollziehbar. Wir haben grössere Arbeiten über Branches und Pull Requests umgesetzt. Dadurch konnten wir Änderungen getrennt entwickeln, prüfen und erst danach in `main` übernehmen.

Wir haben die Arbeit grob nach Themen aufgeteilt. Levin hat zuerst die Projektbasis, Notes, Auth/Security und Sharing aufgebaut. Tobias hat später vor allem den Task-Bereich übernommen. Beim Task-Frontend, beim Dashboard, bei Shortcuts und bei der Dokumentation gab es Überschneidungen, bei denen wir gegenseitig ergänzt und angepasst haben.

Unser Vorgehen war iterativ:

1. Grundfunktionen planen und umsetzen.
2. Feature in einem Branch entwickeln.
3. Pull Request erstellen und Checks laufen lassen.
4. Review-Findings, Fehler und UI-Probleme korrigieren.
5. Feature mergen und die Dokumentation nachführen.

Für Security-Themen haben wir zusätzlich bewusst nach OWASP-Kategorien gearbeitet. Dadurch konnten wir prüfen, ob die Massnahmen nicht nur im Code vorhanden sind, sondern auch dokumentiert und mit manuellen Testprotokollen nachweisbar sind.

## Beiträge

### Tobias

- Ich habe vor allem am Task-Bereich gearbeitet.
- Dazu gehören Task Schema, Task Tags, CRUD Procedures, Router Integration und die Task API.
- Ich habe Task-Management-Funktionen wie Create, Update, Delete, Complete, Fälligkeitsdatum, Tag-Integration und Task Search umgesetzt.
- Ich habe an der Dokumentation mitgearbeitet.

### Levin

- Ich habe das Grundsetup des Projekts gemacht, inklusive Monorepo, Vercel Migrations, App Shell, Routing, Sidebar und Auth Guards.
- Ich habe den Notes-Bereich umgesetzt: Notes, Folders, Tags, Archivierung, Restore, Search, Database Migrations und das Frontend mit Dashboard, Editor und Notes Grid.
- Ich habe das Command Menu gebaut, inklusive Suche, Recent Visits, Create Actions, Context Actions, Move-to-Folder, Add-Tag und Keyboard Shortcuts.
- Ich habe beim Task-Frontend mitgeholfen, inklusive Tasks View, Task Dialog, Dashboard-Integration, Command-Menu-Integration und Shortcuts.
- Ich habe Sharing umgesetzt, inklusive Share Links, Public Share View, Owner UI, Revoke/Duplicate Flow und Security-Hardening.
- Ich habe den Security-Bereich umgesetzt: Better Auth, Check-Email Screen, Passwort-Policy, HIBP Breach Check, Rate Limiting, 2FA Setup/Challenge/Reset, Backup Codes, OAuth-2FA-Handling und gepinnte GitHub Actions.
- Zusätzlich habe ich Sentry, Dependency Cleanup, Mobile-/Accessibility-Fixes, Review-Fixes und Dokumentation/ADRs übernommen.
- Ich habe an der Dokumentation mitgearbeitet.

## Organisation

Für die Organisation haben wir GitHub als zentrale Stelle genutzt. Commits zeigen die einzelnen Arbeitsschritte, Pull Requests bündeln grössere Änderungen und GitHub Actions prüfen Linting, Typechecking und Build. Dadurch war jederzeit sichtbar, welche Änderung zu welchem Feature gehört.

Wichtige organisatorische Hilfsmittel:

- Branches und Pull Requests für grössere Features
- GitHub Actions für automatische Checks
- Commit-History zur Nachvollziehbarkeit der Beiträge
- Teams für Kommunikation und Koordination
- `docs/adr/**` für grössere Architekturentscheidungen
- `CONTEXT.md` für Domain-Language und wichtige Zusammenhänge
- `docs/project/**` für die Abgabedokumentation

## Nachweise

- [Git History](https://github.com/levinbaenninger/memora/commits/main)
- [Pull Requests](https://github.com/levinbaenninger/memora/pulls)
- [Issues](https://github.com/levinbaenninger/memora/issues)
