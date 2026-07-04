import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  isDemo: z.boolean().default(false),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;
