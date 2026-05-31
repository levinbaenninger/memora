# 3. Applikationssicherheit

Für die Security-Dokumentation konzentrieren wir uns auf unsere vier gewählten OWASP-Kategorien:

1. Software Supply Chain Failures
2. Broken Access Control
3. Injection
4. Identification & Authentication Failures

Memora verarbeitet private Notizen und Tasks. Deshalb sind Vertraulichkeit und Zugriffskontrolle wichtiger als die reine Anzahl an Features. Wenn Authentication, Access Control, Input Validation oder Dependency Management nicht sauber sind, könnten private Inhalte gelesen, verändert oder gelöscht werden.

## Security-Prinzipien in unserer App

- Private App-Funktionen laufen über protected oRPC Procedures.
- Jede protected Procedure holt den User aus der Server Session.
- Database Queries scopen private Daten mit `userId`.
- User Input wird mit Zod validiert.
- Database Access läuft über Drizzle statt über selbst zusammengebaute SQL-Strings.
- Share Links sind Capability URLs mit zufälligem Token, Ablaufdatum und Revoke-Funktion.
- Public Share Endpoints geben nur die Daten zurück, die ein Besucher wirklich sehen darf.
- Auth und Public-Share-Endpunkte sind rate-limited. Dafür nutzen wir Upstash Redis.
- Accounts mit Passwort müssen Two-Factor Authentication einrichten.
- Passwörter müssen unsere Password Policy erfüllen und werden zusätzlich gegen bekannte Breaches geprüft.
- CI, Dependabot und CodeQL prüfen Code- und Dependency-Risiken.

## Wichtigste Code-Stellen

- `packages/api/src/procedures/authorized.ts:5`
- `packages/api/src/middlewares/auth.ts:5`
- `packages/api/src/modules/notes/procedures/get-note.ts:37`
- `packages/api/src/modules/tasks/procedures/get-task.ts:31`
- `packages/api/src/modules/task-tags/**`
- `packages/api/src/modules/folders/**`
- `packages/api/src/modules/tags/**`
- `packages/api/src/modules/shares/**`
- `packages/api/src/modules/notes/content/schema.ts:47`
- `packages/api/src/middlewares/rate-limit.ts:46`
- `packages/auth/src/redis-secondary-storage.ts:6`
- `packages/ui/src/lib/password-policy.ts:1`
- `.github/dependabot.yml:1`
- `.github/workflows/codeql.yml:39`

## Einschätzung

Die wichtigsten Security-Massnahmen sind im Code sichtbar und passen zu unserer App. Besonders wichtig sind die serverseitige Access Control, die Input Validation, Better Auth als Auth-Basis, 2FA, Redis Rate Limiting und die Supply-Chain-Automation.

## Quellen

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Better Auth Dokumentation](https://better-auth.com/docs)
- [Zod Dokumentation](https://zod.dev/)
- [oRPC Dokumentation](https://orpc.dev/docs/procedure)
- [Drizzle ORM Dokumentation](https://orm.drizzle.team/docs/overview)
- [TanStack Router Authenticated Routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes)
- [Upstash Rate Limit](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- [Have I Been Pwned API](https://haveibeenpwned.com/API/V3)

## Manuelle Nachweise

Die ausführlichen manuellen Testprotokolle stehen direkt in den einzelnen OWASP-Kapiteln:

- Software Supply Chain Failures: `03-1-software-supply-chain-failures.md`
- Broken Access Control: `03-2-broken-access-control.md`
- Injection: `03-3-injection.md`
- Identification & Authentication Failures: `03-4-authentication-failures.md`
