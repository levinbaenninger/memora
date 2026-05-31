# 3.2 OWASP: Broken Access Control

## Risiko

Memora speichert private Notizen, Tasks, Ordner, Tags und Share Links. Broken Access Control wäre bei uns kritisch, weil ein User sonst Daten von anderen Usern lesen, bearbeiten, teilen, archivieren oder löschen könnte.

Typische Risiken:

- Zugriff auf fremde Notizen über erratene IDs
- Zugriff auf fremde Tasks über erratene IDs
- Bearbeiten oder Löschen fremder Ordner und Tags
- Erstellen von Share Links für fremde Notizen
- Public Share View zeigt zu viele Daten
- Archivierte Notizen bleiben über alte Links erreichbar

## Unsere Massnahmen

- Nanoid IDs haben eine hohe Entropie und sind daher schwer erratbar.
- Protected API Procedures nutzen `authorized`.
- `authorized` verwendet `authMiddleware`, die serverseitig die Session über Better Auth prüft.
- Private `get`, `list`, `update` und `delete` Procedures filtern serverseitig mit `context.user.id`.
- Bei verknüpften Daten prüfen wir den Besitz entweder direkt im Database Filter oder vorher über eine Ownership Query.
- Bevor wir Ordner, Tags oder interne Notizlinks verknüpfen, prüfen wir, ob diese Objekte dem aktuellen User gehören.
- Public Share Links liefern nur `title`, `content`, `ownerName` und `updatedAt`.
- Archivierte Notizen werden in der Public Share View als `NOT_FOUND` behandelt.
- Share Links können widerrufen werden.
- Public Share und Share-Duplicate Requests sind rate-limited.

## Technische Umsetzung

Beispiele:

- Auth Middleware: `packages/api/src/middlewares/auth.ts:5`
- Protected Procedure Wrapper: `packages/api/src/procedures/authorized.ts:5`
- Notiz lesen mit `userId` Filter: `packages/api/src/modules/notes/procedures/get-note.ts:37`
- Notiz aktualisieren mit Ownership Check: `packages/api/src/modules/notes/procedures/update-note.ts:41`
- Task lesen mit `userId` Filter: `packages/api/src/modules/tasks/procedures/get-task.ts:31`
- Task aktualisieren mit Ownership Check: `packages/api/src/modules/tasks/procedures/update-task.ts:28`
- Task löschen mit `userId` Filter: `packages/api/src/modules/tasks/procedures/delete-task.ts:22`
- Recent Visits Ownership Check: `packages/api/src/modules/recent-visits/procedures/record-visit.ts:16`
- Ordner prüfen: `packages/api/src/modules/folders/procedures/**`
- Share Link erstellen: `packages/api/src/modules/shares/procedures/create-share.ts`
- Share Link widerrufen: `packages/api/src/modules/shares/procedures/revoke-share.ts`
- Public Share lesen mit reduzierter Response: `packages/api/src/modules/shares/procedures/get-public-share.ts:19`
- Rate Limiting: `packages/api/src/middlewares/rate-limit.ts:46`

## Einschätzung

Die Access Control ist für die Kernfunktionen sauber umgesetzt. Wichtig ist, dass wir private Daten nicht nur im Frontend ausblenden, sondern serverseitig über Session und `userId` begrenzen.

## Quellen / Nachweise

- [OWASP Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/)
- [Better Auth Session Management](https://better-auth.com/docs/concepts/session-management)
- [TanStack Router Authenticated Routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes)
- [oRPC Procedures](https://orpc.dev/docs/procedure)
- [Drizzle Querying](https://orm.drizzle.team/docs/data-querying)

## Manuelles Testprotokoll

| Nr. | Test | Schritte | Erwartetes Resultat | Nachweis |
| --- | --- | --- | --- | --- |
| AC-01 | Protected Route ohne Login | Ausloggen und eine private Route wie `/notes` oder `/tasks` direkt öffnen. | Wir werden auf die Login-Seite weitergeleitet. | [Redirect](./assets/redirect-signed-out.mov) |
| AC-02 | Fremde Note-ID | Mit User A eine Notiz erstellen. Mit User B die URL/API mit der Note-ID von User A öffnen. | Die API liefert `NOT_FOUND` oder die UI zeigt keinen Zugriff. | [Unauthorized Note](./assets/unauthorized-note.mov) |
| AC-03 | Fremde Task-ID | Mit User A einen Task erstellen. Mit User B versuchen, diesen Task über eine manipulierte API-Anfrage zu lesen, zu bearbeiten oder zu löschen. | Die Task Procedure findet den Task wegen `userId` Filter nicht. | [Unauthorized Task](./assets/unauthorized-task.mov) |
| AC-04 | Fremde Folder-/Tag-ID | Mit User B versuchen, eine fremde Folder- oder Tag-ID bei Note/Task Operationen zu verwenden. | Die API lehnt den Zugriff ab oder behandelt das Objekt als nicht gefunden. | [Unauthorized Folder/Tag](./assets/unauthorized-folder-tag.mov) |
| AC-05 | Archivierte Notiz im Public Share | Share Link für eine Notiz erstellen, danach die Notiz archivieren und den Share Link öffnen. | Die Public Share View liefert `NOT_FOUND` und zeigt den Inhalt nicht mehr. | [Sharing](./assets/sharing-note.mov) |
