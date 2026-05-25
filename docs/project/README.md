# M183 WebApp Projekt

Diese Dokumentation beschreibt unser M183-Projekt **Memora** und orientiert sich an der Kriterienliste aus `M183 Bewertung WepApp Projekt.pdf`.

Memora ist eine Second-Brain-Web-App für persönliche Notizen. Wir können Notizen erstellen, bearbeiten, archivieren, favorisieren, pinnen, mit Ordnern und Tags organisieren, über eine Suche wiederfinden und einzelne Notizen per Share Link lesend freigeben.

## Bewertungsabschnitte

Die technische Umsetzung und die allgemeine Dokumentationsqualität werden direkt am Repository und an der laufenden App bewertet. In diesen Markdown-Dateien dokumentieren wir deshalb vor allem Konzept, Security-Entscheide und Zusammenarbeit.

- [1. Konzept & Planung](./01-konzept-planung.md)
- [3. Applikationssicherheit](./03-applikationssicherheit.md)
- [3.1 Software Supply Chain Failures](./03-1-software-supply-chain-failures.md)
- [3.2 Broken Access Control](./03-2-broken-access-control.md)
- [3.3 Injection](./03-3-injection.md)
- [3.4 Identification & Authentication Failures](./03-4-identification-authentication-failures.md)
- [3.5 Gesamtqualität Security](./03-5-gesamtqualitaet-security.md)
- [5. Teamarbeit & Organisation](./05-teamarbeit-organisation.md)
- [Offene Punkte](./99-offene-punkte.md)

## Gewählte OWASP-Kategorien

Wir haben uns für diese vier OWASP-Risikobereiche entschieden:

1. Software Supply Chain Failures
2. Broken Access Control
3. Injection
4. Identification & Authentication Failures

## Wichtige Code-Nachweise

- Auth-Konfiguration: `packages/auth/src/index.ts`
- Auth-Middleware für API Procedures: `packages/api/src/middlewares/auth.ts`
- Protected API Procedures: `packages/api/src/procedures/authorized.ts`
- Input- und Output-Validation mit Zod/oRPC: `packages/api/src/modules/**`
- Database Schema: `packages/db/src/schema/**`
- Share-Link-Security: `packages/api/src/modules/shares/**`, `packages/db/src/schema/notes/shares.ts`
- Content Validation für Notizen: `packages/api/src/modules/notes/content/schema.ts`
- Redis Rate Limiting und Auth Secondary Storage: `packages/api/src/middlewares/rate-limit.ts`, `packages/redis/src/index.ts`, `packages/auth/src/redis-secondary-storage.ts`
- Two-Factor Authentication: `packages/auth/src/index.ts`, `apps/web/src/routes/auth/setup-2fa.tsx`, `apps/web/src/modules/app/ui/components/settings/security/two-factor.tsx`
- Password Policy: `packages/ui/src/lib/password-policy.ts`
- CI, CodeQL und Dependabot: `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, `.github/dependabot.yml`
- Supply-Chain-Konfiguration: `bunfig.toml`, `bun.lock`, `package.json`

## Platzhalter für Abgabe

- **Screenshot App-Übersicht:** `[Screenshot Dashboard oder Notes Grid einfügen]`
- **Screenshot Security Settings:** `[Screenshot 2FA / Passwort ändern einfügen]`
- **Deployment-Link:** `[Link zur laufenden App einfügen]`
