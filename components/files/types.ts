export interface EntryMeta {
  name: string;
  isDir: boolean;
  size: number;
  mtimeMs: number;
}

export interface FolderListing {
  path: string;
  entries: EntryMeta[];
}

export interface TrashItem {
  trashPath: string;
  originalPath: string;
}

export type FilesView = "browse" | "trash";

export type ConfirmTarget =
  | { kind: "trash"; entry: EntryMeta }
  | { kind: "trashMany"; entries: EntryMeta[] }
  | { kind: "deleteForever"; item: TrashItem };
