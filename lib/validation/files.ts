import { z } from "zod";

export const pathSchema = z.string().trim().max(2048).default("");
export const nameSchema = z.string().trim().min(1).max(255);
export const trashPathSchema = z.string().trim().min(1).max(2048);

export const listQuerySchema = z
  .object({ path: pathSchema, includeTrash: z.coerce.boolean().default(false) })
  .strict();

export const renameSchema = z
  .object({ path: pathSchema, name: nameSchema })
  .strict();

export const contentSchema = z
  .object({ path: pathSchema, content: z.string().max(8 * 1024 * 1024).default("") })
  .strict();

export const createFileSchema = z
  .object({ path: pathSchema, content: z.string().max(8 * 1024 * 1024).optional() })
  .strict();

export const createFolderSchema = z
  .object({ path: pathSchema })
  .strict()
  .refine((data) => data.path !== "", {
    message: "A folder path is required.",
  });

export const trashSchema = z.object({ path: pathSchema }).strict().refine((data) => data.path !== "", {
  message: "An entry path is required.",
});

export const restoreSchema = z
  .object({ trashPath: trashPathSchema })
  .strict();

export const copySchema = z
  .object({ path: pathSchema, target: pathSchema })
  .strict();

export type ListQuery = z.infer<typeof listQuerySchema>;
export type RenameInput = z.infer<typeof renameSchema>;
export type ContentInput = z.infer<typeof contentSchema>;
export type CreateFileInput = z.infer<typeof createFileSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type TrashInput = z.infer<typeof trashSchema>;
export type RestoreInput = z.infer<typeof restoreSchema>;
export type CopyInput = z.infer<typeof copySchema>;
