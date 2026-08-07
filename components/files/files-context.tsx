"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { FilesActionsState } from "./use-files-actions";
import { useFilesActions } from "./use-files-actions";
import type { FilesBulkState } from "./use-files-bulk";
import { useFilesBulk } from "./use-files-bulk";
import type { FilesListState } from "./use-files-list";
import { useFilesList } from "./use-files-list";

type FilesContextValue = FilesListState & FilesActionsState & FilesBulkState;

const FilesContext = createContext<FilesContextValue | null>(null);

export function FilesProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const list = useFilesList(user);
  const actions = useFilesActions(list);
  const bulk = useFilesBulk(list);

  return (
    <FilesContext.Provider
      value={{
        ...list,
        ...actions,
        ...bulk,
        busy: actions.busy || bulk.busy,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
}

export function useFiles(): FilesContextValue {
  const context = useContext(FilesContext);
  if (!context) {
    throw new Error("useFiles must be used within a FilesProvider");
  }
  return context;
}
