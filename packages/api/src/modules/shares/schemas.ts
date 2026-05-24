import { z } from "zod";

export const shareSchema = z.object({
  id: z.string(),
  noteId: z.string(),
  token: z.string(),
  createdAt: z.date(),
  expiresAt: z.date().nullable(),
});

export const expiryPresetSchema = z.enum(["none", "1d", "7d", "30d"]);
export type ExpiryPreset = z.infer<typeof expiryPresetSchema>;

export function expiryPresetToDate(preset: ExpiryPreset): Date | null {
  if (preset === "none") {
    return null;
  }
  const days = preset === "1d" ? 1 : preset === "7d" ? 7 : 30;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}
