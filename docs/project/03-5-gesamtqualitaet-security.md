# 3.5 Gesamtqualität Security

## Security-Konzept

Unser Security-Modell ist:

- Ein User besitzt seine privaten Daten: Notizen, Tasks, Ordner, Tags, Recent Visits und Share Links.
- Private Operationen laufen über authenticated API Procedures.
- Jede private Database Query wird mit der aktuellen `userId` eingeschränkt.
- Besucher erhalten nur Zugriff über explizit erzeugte Share Links.
- Share Links sind auf eine einzelne Notiz beschränkt, widerrufbar und optional zeitlich begrenzt.
- Inputs werden vor der Verarbeitung validiert.
- Accounts mit Passwort müssen 2FA aktivieren.
- Schwache und bekannte kompromittierte Passwörter werden abgelehnt.
- Rate Limits laufen zentral über Upstash Redis.
- Dependencies und Code werden automatisiert über GitHub geprüft.

## Zusammenspiel der Massnahmen

Die Massnahmen greifen auf mehreren Ebenen:

- Frontend: protected Routes und Auth Redirects
- API: Session Middleware und Zod Schemas
- Database: User Scoping, Foreign Keys, Indexes und Cascades
- Auth: Password Policy, Have I Been Pwned, 2FA, Backup Codes und Redis Rate Limiting
- Public Sharing: Capability Token, reduzierte Response, Ablaufdatum, Revoke und Rate Limit
- Build/Repository: CI, CodeQL, Dependabot, Lockfile

Dadurch hängt Security nicht nur an einer Stelle. Wenn jemand im Frontend eine ID manipuliert, prüft die API trotzdem Session und Besitz. Wenn ein fremder Note- oder Task-ID-Wert gesendet wird, filtert die Query nach `userId`. Wenn ein Share Link weitergegeben wird, ist der Zugriff nur auf eine einzelne Public Detail View begrenzt.

## Stärken

- Access Control ist serverseitig umgesetzt.
- Authentication nutzt eine etablierte Library.
- 2FA ist umgesetzt und für Passwort-Accounts verpflichtend.
- Rate Limiting verwendet Upstash Redis statt nur lokalen Memory.
- Die Password Policy ist im Code zentral definiert.
- Inputs und Outputs sind pro API Procedure validiert.
- Private und public Datenpfade sind getrennt.
- Dependency-Risiken werden automatisch überwacht.

## Fazit

Das Security-Konzept passt zu unserer App und ist im Code nachvollziehbar umgesetzt. Mit 2FA, Password Policy, Breach Check, Redis Rate Limiting und SHA-gepinnten GitHub Actions decken wir mehrere wichtige Security-Risiken ab.

## Nachweise

- Security Settings: [Security Settings](./assets/security-settings.png)
- GitHub Actions / CodeQL: [CodeQL Runs](https://github.com/levinbaenninger/memora/actions/workflows/codeql.yml)
- Manuelles Testprotokoll Supply Chain: `03-1-software-supply-chain-failures.md`
- Manuelles Testprotokoll Access Control: `03-2-broken-access-control.md`
- Manuelles Testprotokoll Injection: `03-3-injection.md`
- Manuelles Testprotokoll Auth / 2FA: `03-4-authentication-failures.md`

## Referenzen

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Better Auth](https://better-auth.com/docs)
- [Zod](https://zod.dev/)
- [oRPC Procedures](https://orpc.dev/docs/procedure)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [GitHub Code Scanning mit CodeQL](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning-alerts)
