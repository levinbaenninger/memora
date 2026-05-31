# 3.4 OWASP: Authentication Failures

## Risiko

Wenn Authentication oder Session Management fehlerhaft sind, könnten Angreifer Accounts übernehmen oder ohne Login auf private Notizen und Tasks zugreifen.

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
- Zusätzlich prüft Have I Been Pwned, ob ein Passwort in bekannten Datenleaks vorkommt.
- Password Reset wird per E-Mail verschickt.
- Passwortänderungen lösen eine Benachrichtigungs-E-Mail aus.
- E-Mail-Änderungen müssen bestätigt werden.
- Google OAuth ist über Client ID und Client Secret angebunden.
- Two-Factor Authentication ist mit TOTP und Backup Codes umgesetzt.
- Accounts mit Passwort werden nach dem Login auf `/auth/setup-2fa` weitergeleitet, solange 2FA nicht aktiviert ist.
- Accounts mit Passwort können 2FA zurücksetzen, werden danach aber direkt wieder ins 2FA-Onboarding geleitet.
- Password-less Accounts können 2FA auch wieder deaktivieren.
- Auch OAuth Callback Sessions mit aktivierter 2FA werden in die 2FA Challenge geleitet.
- Auth Rate Limiting läuft über Better Auth Secondary Storage mit Upstash Redis.
- Protected App Routes prüfen die Session und leiten ohne Session auf die Login Route um.

## Technische Umsetzung

Nachweise:

- Auth-Konfiguration: `packages/auth/src/index.ts:37`
- E-Mail/Passwort und E-Mail-Verifikation: `packages/auth/src/index.ts:43`
- Password Policy Hook: `packages/auth/src/index.ts:69`
- HIBP Plugin: `packages/auth/src/index.ts:187`
- 2FA Plugin: `packages/auth/src/index.ts:191`
- Auth Rate Limit: `packages/auth/src/index.ts:147`
- Redis Secondary Storage: `packages/auth/src/redis-secondary-storage.ts:6`
- Server Env Validation: `packages/env/src/server.ts`
- Auth API Route: `apps/web/src/routes/api/auth/$/route.ts`
- Protected App Route und 2FA Gate: `apps/web/src/routes/_app/route.tsx:21`
- 2FA Setup Route: `apps/web/src/routes/auth/setup-2fa.tsx`
- 2FA Challenge Route: `apps/web/src/routes/auth/two-factor.tsx`
- 2FA Settings UI: `apps/web/src/modules/app/ui/components/settings/security/two-factor.tsx`
- Password Policy: `packages/ui/src/lib/password-policy.ts:1`
- Server Middleware: `packages/api/src/middlewares/auth.ts`
- Account/Security UI: `apps/web/src/modules/app/ui/components/settings/security/**`

## Einschätzung

Die wichtigsten Auth-Anforderungen sind umgesetzt. Better Auth ist für unser Projekt sinnvoll, weil wir sicherheitskritische Standardfunktionen nicht selber bauen. Zusätzlich haben wir 2FA, Password Policy, Breach Check und Redis-basiertes Auth Rate Limiting ergänzt. Wichtig ist auch, dass unsere API Sessions serverseitig prüft und nicht einfach dem Frontend vertraut.

## Quellen / Nachweise

- [OWASP Identification and Authentication Failures](https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/)
- [Better Auth](https://better-auth.com/docs)
- [Better Auth Session Management](https://better-auth.com/docs/concepts/session-management)
- [Better Auth Rate Limit](https://better-auth.com/docs/concepts/rate-limit)
- [Better Auth Two-Factor Authentication](https://better-auth.com/docs/plugins/2fa)
- [Have I Been Pwned API](https://haveibeenpwned.com/API/V3)
- [Upstash Rate Limit](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- 2FA Setup / Redirect: [2FA Required](./assets/2fa-required.mov)
- Password Policy im Sign-up: [Password Policy](./assets/password-policy.mov)

## Manuelles Testprotokoll

| Nr. | Test | Schritte | Erwartetes Resultat | Nachweis |
| --- | --- | --- | --- | --- |
| AU-01 | Schwaches Passwort | Sign-up mit einem Passwort versuchen, das unsere Policy nicht erfüllt. | Das Formular bzw. die API lehnt das Passwort ab. | [Password Policy](./assets/password-policy.mov) |
| AU-02 | Geleaktes Passwort | Sign-up mit einem bekannten kompromittierten Passwort versuchen. | HIBP/Better Auth lehnt das Passwort ab. | [HIBP Breach](./assets/hibp-breach.mov) |
| AU-03 | E-Mail-Verifikation | Neuen Account erstellen und versuchen, ohne Verifikation normal weiterzuarbeiten. | Der Account muss zuerst die E-Mail-Verifikation abschliessen. | [Email Verification](./assets/email-verification.mov) |
| AU-04 | 2FA Pflicht für Passwort-Account | Mit Passwort-Account einloggen, bevor 2FA eingerichtet ist. | Die App leitet auf `/auth/setup-2fa` weiter. | [2FA Required](./assets/2fa-required.mov) |
| AU-05 | Falscher 2FA Code | Bei der 2FA Challenge einen falschen TOTP Code eingeben. | Die Challenge bleibt aktiv und zeigt einen Fehler. | [2FA Code Wrong](./assets/2fa-code-wrong.mov) |
| AU-06 | 2FA Reset | Bei einem Passwort-Account 2FA in den Settings resetten. | Die bestehende 2FA-Konfiguration wird zurückgesetzt und der User landet wieder im Onboarding. | [2FA Reset](./assets/2fa-reset.mov) |
| AU-07 | Auth Rate Limit | Mehrere falsche Login- oder 2FA-Versuche in kurzer Zeit ausführen. | Nach dem Limit antwortet die API mit Rate-Limit-Fehler. | [Rate Limit](./assets/rate-limit.mov) |
