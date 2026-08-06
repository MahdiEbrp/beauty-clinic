"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { Extension } from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFiles } from "./files-context";
import { extOf, joinRel } from "./helpers";
import type { EntryMeta } from "./types";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-64 items-center justify-center text-dash-caption text-content-tertiary">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
    </div>
  ),
});

const MARKDOWN_EXTS = new Set(["md", "markdown"]);
const HTML_EXTS = new Set(["html", "htm"]);
const CSS_EXTS = new Set(["css"]);
const JSON_EXTS = new Set(["json"]);

function langFor(ext: string): Extension[] | undefined {
  if (MARKDOWN_EXTS.has(ext)) return [markdown()];
  if (HTML_EXTS.has(ext)) return [html()];
  if (CSS_EXTS.has(ext)) return [css()];
  if (JSON_EXTS.has(ext)) return [json()];
  return [javascript({ jsx: ext === "jsx" || ext === "tsx", typescript: ext === "ts" || ext === "tsx" })];
}

type Status = "loading" | "ready" | "error";

function EditorDialogContent({ target }: { target: EntryMeta }) {
  const t = useTranslations();
  const { busy, path, saveContent, setEditorTarget } = useFiles();
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<Status>("loading");

  // Fetch on mount. Because the component is keyed by the target, this runs once
  // per opened file; all state updates happen in async continuations.
  useEffect(() => {
    const rel = joinRel(path, target.name);
    const controller = new AbortController();
    fetch(`/api/v1/files/content?path=${encodeURIComponent(rel)}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("load_failed");
        const payload = (await response.json()) as { data?: { content?: string } };
        setContent(payload.data?.content ?? "");
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [path, target]);

  const ext = extOf(target.name);
  const language = langFor(ext);
  const title = t("files.editorDialog.title", { name: target.name });

  return (
    <DialogContent closeLabel={t("files.dialog.cancel")} className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="truncate text-accent">{title}</DialogTitle>
        <DialogDescription className="truncate" dir="ltr">
          {target.name}
        </DialogDescription>
      </DialogHeader>

      {status === "error" && (
        <p
          role="alert"
          className="rounded-control border border-error/40 bg-error/10 p-4 text-dash-body-sm text-error"
        >
          {t("files.editorDialog.loadError")}
        </p>
      )}

      {status === "ready" && language && (
        <div className="overflow-hidden rounded-control border border-border-primary">
          <CodeMirror
            value={content}
            onChange={setContent}
            height="min(60dvh, 28rem)"
            extensions={language}
            basicSetup={{ foldGutter: true, highlightActiveLine: true }}
            aria-label={title}
          />
        </div>
      )}

      <DialogFooter>
        <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
          {t("files.dialog.cancel")}
        </DialogClose>
        <button
          type="button"
          disabled={status !== "ready" || busy}
          onClick={() => void saveContent(content).then(() => setEditorTarget(null))}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {busy ? t("files.editorDialog.saving") : t("files.editorDialog.save")}
        </button>
      </DialogFooter>
    </DialogContent>
  );
}

export function EditorDialog() {
  const { editorTarget, setEditorTarget } = useFiles();

  return (
    <Dialog
      open={editorTarget !== null}
      onOpenChange={(open) => {
        if (!open) setEditorTarget(null);
      }}
    >
      {editorTarget && (
        <EditorDialogContent key={editorTarget.name} target={editorTarget} />
      )}
    </Dialog>
  );
}