# 3.4 OWASP: Identification & Authentication Failures

## Risiko für Memora

Wenn Authentication oder Session Management fehlerhaft sind, könnten Angreifer Accounts übernehmen oder ohne Login auf private Notizen zugreifen. Da Memora persönliche Inhalte speichert, ist Authentication ein zentraler Teil der Security.

Typische Risiken:

- ungeschützte App Routes
- unsicheres Passwort- und Session Management
- fehlende E-Mail-Verifikation
- unsichere OAuth-Konfiguration
- fehlende Absicherung bei Password Reset oder E-Mail-Änderung
- fehlende Absicherung gegen schwache oder geleakte Passwörter
- fehlende Two-Factor Authentication

## Unsere Massnahmen

- Better Auth übernimmt Passwort-, Session- und OAuth-Verwaltung.
- E-Mail/Passwort-Login ist aktiviert.
- E-Mail-Verifikation ist erforderlich.
- Passwörter müssen mindestens 12 Zeichen lang sein und Grossbuchstaben, Kleinbuchstaben, Zahl und Symbol enthalten.
- Zusätzlich prüft `haveIBeenPwned`, ob ein Passwort in bekannten Datenleaks vorkommt.
- Password Reset wird per E-Mail verschickt.
- Passwortänderungen lösen eine Benachrichtigungs-E-Mail aus.
- E-Mail-Änderungen müssen bestätigt werden.
- Google OAuth ist über Client ID und Client Secret angebunden.
- Better Auth Secret und OAuth Proxy Secret kommen aus validierten Server Environment Variables.
- Two-Factor Authentication ist mit TOTP und Backup Codes umgesetzt.
- Accounts mit Passwort werden nach dem Login auf `/auth/setup-2fa` weitergeleitet, solange 2FA nicht aktiviert ist.
- 2FA kann bei Accounts mit Passwort nicht deaktiviert werden.
- Auch OAuth Callback Sessions mit aktivierter 2FA werden in die 2FA Challenge geleitet.
- Auth Rate Limiting läuft über Better Auth Secondary Storage mit Upstash Redis.
- Protected App Routes prüfen die Session und leiten ohne Session auf die Login Route um.
- API Procedures verlassen sich nicht auf Frontend State, sondern prüfen die Session serverseitig.

## Technische Umsetzung

Nachweise:

- Auth-Konfiguration: `packages/auth/src/index.ts`
- Server Env Validation: `packages/env/src/server.ts`
- Auth API Route: `apps/web/src/routes/api/auth/$/route.ts`
- Protected App Route: `apps/web/src/routes/_app/route.tsx`
- 2FA Setup Route: `apps/web/src/routes/auth/setup-2fa.tsx`
- 2FA Challenge Route: `apps/web/src/routes/auth/two-factor.tsx`
- 2FA Settings UI: `apps/web/src/modules/app/ui/components/settings/security/two-factor.tsx`
- Password Policy: `packages/ui/src/lib/password-policy.ts`
- Redis Secondary Storage: `packages/auth/src/redis-secondary-storage.ts`
- Server Middleware: `packages/api/src/middlewares/auth.ts`
- Account/Security UI: `apps/web/src/modules/app/ui/components/settings/security/**`

## Einschätzung

Die wichtigsten Auth-Anforderungen sind umgesetzt. Better Auth ist für unser Projekt sinnvoll, weil wir sicherheitskritische Standardfunktionen nicht selber bauen. Zusätzlich haben wir 2FA, Password Policy, Breach Check und Redis-basiertes Auth Rate Limiting ergänzt. Wichtig ist auch, dass unsere API Sessions serverseitig prüft und nicht einfach dem Frontend vertraut.

## Quellen / Nachweise

- `[Quelle OWASP Identification & Authentication Failures einfügen]`
- `[Screenshot 2FA Setup einfügen]`
- `[Screenshot Password Policy / Sign-up Formular einfügen]`
