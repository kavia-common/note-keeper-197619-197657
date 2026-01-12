"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNotesStore } from "@/store/NotesStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import styles from "./NoteEditor.module.css";

function formatTime(ts: number) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "2-digit",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

/**
 * Lightweight markdown rendering:
 * - Escapes HTML (prevents injection).
 * - Supports headings (#, ##, ###), bold (**text**), italics (*text*), inline code (`code`)
 * - Converts newlines to <br/>
 *
 * This avoids adding extra dependencies.
 */
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mdInline(s: string) {
  let out = escapeHtml(s);
  out = out.replaceAll(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replaceAll(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

function renderMarkdownToHtml(md: string) {
  const lines = md.split("\n");
  const html = lines
    .map((line) => {
      const trimmed = line.trimEnd();
      if (trimmed.startsWith("### ")) return `<h3>${mdInline(trimmed.slice(4))}</h3>`;
      if (trimmed.startsWith("## ")) return `<h2>${mdInline(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith("# ")) return `<h1>${mdInline(trimmed.slice(2))}</h1>`;
      if (trimmed.length === 0) return `<div class="mdSpacer"></div>`;
      return `<p>${mdInline(trimmed)}</p>`;
    })
    .join("");
  return html;
}

export default function NoteEditor() {
  const {
    selectedId,
    notes,
    draftTitle,
    draftContent,
    setDraftTitle,
    setDraftContent,
    isDirty,
    saveSelectedNote,
    deleteSelectedNote,
    lastSavedAt,
    createNewNote,
  } = useNotesStore();

  const [preview, setPreview] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const empty = notes.length === 0 && !selectedId;
  const hasSelection = !!selectedId;

  const lastSavedLabel = useMemo(() => {
    if (!hasSelection) return "No note selected";
    if (isDirty) return "Unsaved changes";
    if (!lastSavedAt) return "Not saved yet";
    return `Saved ${formatTime(lastSavedAt)}`;
  }, [hasSelection, isDirty, lastSavedAt]);

  const previewHtml = useMemo(() => renderMarkdownToHtml(draftContent), [draftContent]);

  // Keyboard shortcuts: Cmd/Ctrl+S to save; Cmd/Ctrl+N to create new.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (!mod) return;

      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveSelectedNote();
      }

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNewNote();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [createNewNote, saveSelectedNote]);

  if (empty) {
    return (
      <section className={styles.empty} aria-label="Empty state">
        <div className={styles.emptyCard}>
          <div className={styles.emptyTitle}>Welcome to Ocean Notes</div>
          <div className={styles.emptyDesc}>
            Create your first note to get started. Everything is stored locally in your browser.
          </div>

          <div className={styles.emptyActions}>
            <Button variant="primary" onClick={createNewNote}>
              Create a note
            </Button>
            <div className={styles.shortcuts}>
              Shortcuts: <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>N</kbd> new,{" "}
              <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>S</kbd> save
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.editor} aria-label="Note editor">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <div className={styles.hTitle}>Editor</div>
            <Badge tone={isDirty ? "danger" : "success"}>{lastSavedLabel}</Badge>
          </div>
          <div className={styles.hSubtle}>
            Markdown supported (basic). Toggle preview to see formatting.
          </div>
        </div>

        <div className={styles.headerRight}>
          <Button
            variant="ghost"
            onClick={() => setPreview((p) => !p)}
            aria-pressed={preview}
            aria-label={preview ? "Switch to edit mode" : "Switch to preview mode"}
          >
            {preview ? "Edit" : "Preview"}
          </Button>

          <Button
            variant="secondary"
            onClick={saveSelectedNote}
            disabled={!hasSelection}
            aria-label="Save note"
            title="Save (Ctrl/Cmd+S)"
          >
            Save
          </Button>

          <Button
            variant="danger"
            onClick={() => setConfirmOpen(true)}
            disabled={!hasSelection}
            aria-label="Delete note"
          >
            Delete
          </Button>
        </div>
      </header>

      <div className={styles.body}>
        <Input
          id="note-title"
          label="Title"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Note title…"
          autoComplete="off"
        />

        {!preview ? (
          <Textarea
            id="note-content"
            label="Content"
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="Write your note in Markdown…"
          />
        ) : (
          <div className={styles.previewWrap} aria-label="Markdown preview">
            <div
              className={styles.preview}
              // Rendering is sanitized by escaping HTML before inserting.
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this note?"
        description="This will permanently remove the note from your device."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          deleteSelectedNote();
        }}
      />
    </section>
  );
}
