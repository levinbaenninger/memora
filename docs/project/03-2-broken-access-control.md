# 3.2 OWASP: Broken Access Control

## Risiko für Memora

Memora speichert private Notizen, Ordner, Tags und Share Links. Broken Access Control wäre bei uns kritisch, weil ein User sonst Notizen von anderen Usern lesen, bearbeiten, teilen, archivieren oder löschen könnte.

Typische Risiken:

- Zugriff auf fremde Notizen über erratene IDs
- Bearbeiten oder Löschen fremder Ordner und Tags
- Erstellen von Share Links für fremde Notizen
- Public Share View zeigt zu viele Daten
- Archivierte Notizen bleiben über alte Links erreichbar

## Unsere Massnahmen

- Protected API Procedures nutzen `authorized`.
- `authorized` verwendet `authMiddleware`, die serverseitig die Session über Better Auth prüft.
- Private Queries filtern mit `context.user.id`.
- Updates und Deletes enthalten `eq(...userId, userId)` im Database Filter.
- Bevor wir Ordner, Tags oder interne Notizlinks verknüpfen, prüfen wir, ob diese Objekte dem aktuellen User gehören.
- Public Share Links liefern nur `title`, `content`, `ownerName` und `updatedAt`.
- Archivierte Notizen werden in der Public Share View als `NOT_FOUND` behandelt.
- Share Links können widerrufen werden.
- Public Share und Share-Duplicate Requests sind rate-limited.

## Technische Umsetzung

Beispiele:

- Auth Middleware: `packages/api/src/middlewares/auth.ts`
- Protected Procedure Wrapper: `packages/api/src/procedures/authorized.ts`
- Notiz lesen: `packages/api/src/modules/notes/procedures/get-note.ts`
- Notiz aktualisieren: `packages/api/src/modules/notes/procedures/update-note.ts`
- Ordner prüfen: `packages/api/src/modules/folders/procedures/**`
- Share Link erstellen: `packages/api/src/modules/shares/procedures/create-share.ts`
- Share Link widerrufen: `packages/api/src/modules/shares/procedures/revoke-share.ts`
- Public Share lesen: `packages/api/src/modules/shares/procedures/get-public-share.ts`
- Rate Limiting: `packages/api/src/middlewares/rate-limit.ts`

## Einschätzung

Die Access Control ist für die Kernfunktionen sauber umgesetzt. Wichtig ist, dass wir private Daten nicht nur im Frontend ausblenden, sondern serverseitig über Session und `userId` begrenzen.

## Quellen / Nachweise

- `[Quelle OWASP Broken Access Control einfügen]`
- `[Screenshot Login Redirect oder Zugriffsschutz einfügen]`
- `[Optional: manueller Testnachweis für fremde Note-ID einfügen]`
