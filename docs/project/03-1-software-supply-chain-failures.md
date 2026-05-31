# 3.1 OWASP: Software Supply Chain Failures

## Risiko

Memora nutzt viele externe Dependencies, z. B. TanStack Start, Better Auth, Drizzle, BlockNote, oRPC, React, Sentry und Resend. Wenn eine Dependency verwundbar oder kompromittiert ist, kann das unsere App direkt betreffen.

## Unsere Massnahmen

- Unsere Dependency-Versionen sind exakt angegeben und werden nicht automatisch auf neuere Versionen gehoben.
- `bunfig.toml` setzt `install.exact = true`, damit neue Packages ohne Versionsrange installiert werden.
- `bunfig.toml` setzt `minimumReleaseAge = 259200`. Das sind 3 Tage. Dadurch installiert Bun keine Packages, die gerade erst veröffentlicht wurden.
- Bun ignoriert automatisch `preinstall`, `install` und `postinstall` Skripts.
- CI installiert mit `bun install --frozen-lockfile --prefer-offline`.
- Dependabot prüft wöchentlich Bun Dependencies und GitHub Actions.
- CodeQL analysiert JavaScript/TypeScript und GitHub Actions mit `security-extended`.
- GitHub Actions verwenden eingeschränkte Permissions, z. B. `contents: read`.
- Alle externen GitHub Actions sind auf Commit-SHAs gepinnt. Der Versionskommentar daneben zeigt, welche Release-Version gemeint ist.

## Technische Umsetzung

Nachweisbare Dateien:

- `bunfig.toml:1` bis `bunfig.toml:3`
- `.github/dependabot.yml:1` bis `.github/dependabot.yml:34`
- `.github/workflows/ci.yml:8` bis `.github/workflows/ci.yml:10`
- `.github/workflows/ci.yml:27` bis `.github/workflows/ci.yml:83`
- `.github/workflows/codeql.yml:12` bis `.github/workflows/codeql.yml:48`
- `.github/actions/setup/action.yml:15` bis `.github/actions/setup/action.yml:35`
- `package.json`

## Einschätzung

Die Software Supply Chain ist für die Kernfunktionen sauber umgesetzt. Wichtig ist, dass wir exakt auf bestimmte Dependency-Versionen setzen und nicht auf Versionsranges. Dadurch ist die Supply Chain reproduzierbar und weniger anfällig für neue Schwachstellen in neuen Versionen.

## Quellen / Nachweise

- [OWASP Software Supply Chain Failures](https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/)
- [Dependabot PRs](https://github.com/levinbaenninger/memora/pulls?q=sort%3Aupdated-desc+is%3Apr+author%3Aapp%2Fdependabot+)
- [Dependabot Runs](https://github.com/levinbaenninger/memora/actions/workflows/dependabot/dependabot-updates)
- [CodeQL Runs](https://github.com/levinbaenninger/memora/actions/workflows/codeql.yml)
- [CI Runs](https://github.com/levinbaenninger/memora/actions/workflows/ci.yml)
- [Bun Install mit `--frozen-lockfile`](https://bun.com/docs/pm/cli/install#production-mode)
- [Bunfig Exact Option](https://bun.com/docs/runtime/bunfig#install-exact)
- [Bunfig Minimum Release Age Option](https://bun.com/docs/runtime/bunfig#install-minimumreleaseage)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/how-tos/security-for-github-actions/security-guides/security-hardening-for-github-actions)

## Manuelles Testprotokoll

| Nr. | Test | Schritte | Erwartetes Resultat | Nachweis |
| --- | --- | --- | --- | --- |
| SC-01 | Reproduzierbarer Install | CI Run öffnen und prüfen, ob der Setup Step `bun install --frozen-lockfile --prefer-offline` ausführt. | Dependencies werden aus dem Lockfile installiert; der Run ist erfolgreich. | [CI Run](https://github.com/levinbaenninger/memora/actions/runs/26721312785/job/78748803531?pr=46#step:3:82) |
| SC-02 | Gepinnte GitHub Actions | `.github/workflows/ci.yml`, `.github/workflows/codeql.yml` und `.github/actions/setup/action.yml` prüfen. | Externe Actions verwenden Commit-SHAs und haben daneben einen Versionskommentar. | [CI Run](https://github.com/levinbaenninger/memora/actions/runs/26721312785/job/78748803531?pr=46#step:3:82) |
| SC-03 | Dependency Monitoring | Dependabot und CodeQL Runs in GitHub Actions öffnen. | Dependabot prüft Dependencies/GitHub Actions; CodeQL läuft für JavaScript/TypeScript und Actions. | - [Dependabot Runs](https://github.com/levinbaenninger/memora/actions/workflows/dependabot/dependabot-updates)<br>- [CodeQL Runs](https://github.com/levinbaenninger/memora/actions/workflows/codeql.yml) |
| SC-04 | Bun Supply-Chain Settings | `bunfig.toml` prüfen. | `install.exact = true` und `minimumReleaseAge = 259200` sind gesetzt. | [bunfig.toml](https://github.com/levinbaenninger/memora/blob/main/bunfig.toml) |
