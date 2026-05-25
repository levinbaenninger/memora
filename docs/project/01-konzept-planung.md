# 1. Konzept & Planung

## App-Idee

Unsere App **Memora** ist ein persönlicher Workspace für Notizen. Die Idee dahinter ist ein vereinfachtes Second-Brain-System: Man sammelt wichtige Informationen, strukturiert sie mit Ordnern und Tags und findet sie später schnell wieder.

Der Fokus liegt bei uns nicht auf möglichst vielen Features, sondern auf einer sauberen Web-App mit nachvollziehbarer Security. Da Notizen private Daten enthalten können, müssen Login, Zugriffskontrolle und sichere Eingaben von Anfang an stimmen.

## Geplante Features

Für das Projekt haben wir diese Kernfunktionen geplant:

- Registrierung, Login und Logout
- Notizen erstellen, bearbeiten, archivieren, wiederherstellen und löschen
- Ordner und Tags zur Organisation
- Suche über Notizen
- Dashboard mit aktuellen Notizen
- Profil- und Security-Einstellungen
- Teilen von einzelnen Notizen über Share Links

## Tech Stack

- Framework: TanStack React Start mit TanStack Router und React 19
- API: oRPC mit typed Procedures
- Database: PostgreSQL/Neon mit Drizzle ORM
- Authentication: Better Auth
- Editor: BlockNote
- UI: Tailwind CSS v4, shadcn/ui, Base UI
- E-Mail: React Email und Resend
- Redis: Upstash Redis für Rate Limiting und Auth Secondary Storage
- Tooling: Bun, Turborepo, Ultracite/Biome, Commitlint, Husky, lint-staged
- Security/CI: GitHub Actions, Dependabot, CodeQL

## Warum dieser Stack?

TanStack Start passt gut, weil wir Routing, Server-Funktionen und React UI in einem Full-Stack-Setup kombinieren können. oRPC gibt uns typed API Calls zwischen Client und Server. Drizzle ist SQL-nah und macht Queries und Migrationen gut nachvollziehbar. Für Auth verwenden wir Better Auth, weil wir Passwörter, Sessions, OAuth und E-Mail-Verifikation nicht selber sicher implementieren wollen.

## Screenshots

- `[Screenshot: Dashboard / Notes Grid einfügen]`
- `[Screenshot: Note Editor einfügen]`
- `[Screenshot: Public Share View einfügen]`
