# 3.1 OWASP: Software Supply Chain Failures

## Risiko für Memora

Memora nutzt viele externe Dependencies, z. B. TanStack Start, Better Auth, Drizzle, BlockNote, oRPC, React, Sentry und Resend. Wenn eine Dependency verwundbar oder kompromittiert ist, kann das unsere App direkt betreffen.

Besonders kritisch sind:

- Auth- und Session-Packages
- Database- und ORM-Packages
- Build- und CI-Tools
- frisch veröffentlichte Packages, die noch kaum geprüft wurden
- GitHub Actions, weil sie im Repository-Kontext laufen

## Unsere Massnahmen

- Unsere Dependency-Versionen sind exakt angegeben und werden nicht automatisch auf neuere Versionen gehoben.
- `bun.lock` macht die installierten Dependency-Versionen reproduzierbar.
- `packageManager` pinnt Bun auf `1.3.13`.
- `bunfig.toml` setzt `install.exact = true`, damit neue Packages ohne Versionsrange installiert werden.
- `bunfig.toml` setzt `minimumReleaseAge = 259200`. Das sind 3 Tage. Dadurch installiert Bun keine Packages, die gerade erst veröffentlicht wurden.
- CI installiert mit `bun install --frozen-lockfile --prefer-offline`.
- Dependabot prüft wöchentlich Bun Dependencies und GitHub Actions.
- CodeQL analysiert JavaScript/TypeScript und GitHub Actions mit `security-extended`.
- GitHub Actions verwenden eingeschränkte Permissions, z. B. `contents: read`.
- Alle externen GitHub Actions sind auf Commit-SHAs gepinnt. Der Versionskommentar daneben zeigt, welche Release-Version gemeint ist.
- PR-Titel werden mit einer gepinnten Action auf Conventional Commits geprüft.
- Commitlint, Husky und lint-staged unterstützen kontrollierte Änderungen.

## Technische Umsetzung

Nachweisbare Dateien:

- `.github/dependabot.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/validate-pr-title.yml`
- `.github/actions/setup/action.yml`
- `package.json`
- `bunfig.toml`
- `bun.lock`

## Quellen / Nachweise

- `[Quelle OWASP Software Supply Chain Failures einfügen]`
- `[Screenshot oder Link zu Dependabot PRs einfügen]`
- `[Screenshot GitHub Actions / CodeQL Run einfügen]`
