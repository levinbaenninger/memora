export function normalizeTagName(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function slugifyTagName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function hasAlphanumericContent(name: string): boolean {
  return slugifyTagName(name).length > 0;
}
