# 5. Teamarbeit & Organisation

## Zusammenarbeit

Unsere Zusammenarbeit ist über Git nachvollziehbar. Commits, Branches und Pull Requests zeigen, wer an welchen Teilen gearbeitet hat.

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

Das Projekt ist als Monorepo organisiert. Dadurch sind Web-App, API, Auth, Database, UI und Env-Konfiguration getrennt, aber im gleichen Repository versioniert. Grössere Architekturentscheidungen halten wir als ADRs unter `docs/adr/` fest. Die Domain-Language und die Beziehungen zwischen den Entitäten sind in `CONTEXT.md` festgehalten.

Wichtige organisatorische Dateien:

- `README.md`
- `CONTEXT.md`
- `docs/adr/**`

## Nachweise

- [Git History](https://github.com/levinbaenninger/memora/commits/main)
- [Pull Requests](https://github.com/levinbaenninger/memora/pulls)
- [Issues](https://github.com/levinbaenninger/memora/issues)
