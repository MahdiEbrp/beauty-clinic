"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth/dal";
import type { FilesActionsState } from "./use-files-actions";
import { useFilesActions } from "./use-files-actions";
import type { FilesListState } from "./use-files-list";
import { useFilesList } from "./use-files-list";

type FilesContextValue = FilesListState & FilesActionsState;

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

  return (
    <FilesContext.Provider value={{ ...list, ...actions }}>
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
