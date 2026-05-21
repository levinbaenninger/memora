export interface FolderTreeRow {
  id: string;
  parentId: string | null;
}

export function getSubtreeFolderIds(
  rootId: string,
  allFolders: FolderTreeRow[]
) {
  const subtreeIds = new Set<string>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;

    for (const child of allFolders) {
      if (
        child.parentId &&
        subtreeIds.has(child.parentId) &&
        !subtreeIds.has(child.id)
      ) {
        subtreeIds.add(child.id);
        changed = true;
      }
    }
  }

  return [...subtreeIds];
}
