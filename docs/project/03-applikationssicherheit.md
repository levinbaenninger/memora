# 3. Applikationssicherheit

Für die Security-Dokumentation konzentrieren wir uns auf unsere vier gewählten OWASP-Kategorien:

1. Software Supply Chain Failures
2. Broken Access Control
3. Injection
4. Identification & Authentication Failures

Memora verarbeitet private Notizen. Deshalb sind Vertraulichkeit und Zugriffskontrolle wichtiger als die reine Anzahl an Features. Wenn Authentication, Access Control, Input Validation oder Dependency Management nicht sauber sind, könnten private Notizen gelesen, verändert oder gelöscht werden.

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

- `packages/api/src/procedures/authorized.ts`
- `packages/api/src/middlewares/auth.ts`
- `packages/api/src/modules/notes/**`
- `packages/api/src/modules/folders/**`
- `packages/api/src/modules/tags/**`
- `packages/api/src/modules/shares/**`
- `packages/api/src/modules/notes/content/schema.ts`
- `packages/api/src/middlewares/rate-limit.ts`
- `packages/auth/src/redis-secondary-storage.ts`
- `packages/ui/src/lib/password-policy.ts`
- `.github/dependabot.yml`
- `.github/workflows/codeql.yml`

## Einschätzung

Die wichtigsten Security-Massnahmen sind im Code sichtbar und passen zu unserer App. Besonders wichtig sind die serverseitige Access Control, die Input Validation, Better Auth als Auth-Basis, 2FA, Redis Rate Limiting und die Supply-Chain-Automation.

## Quellen

- `[Quelle OWASP Top 10 / gewählte Kategorien einfügen]`
- `[Quelle Better Auth Dokumentation einfügen]`
- `[Quelle Drizzle / oRPC / TanStack falls gewünscht einfügen]`
