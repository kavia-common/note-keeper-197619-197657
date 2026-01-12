"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createNotesRepository } from "@/lib/notesRepository";
import { Note } from "@/types/note";

type SortMode = "updated_desc" | "updated_asc";

type NotesState = {
  notes: Note[];
  selectedId: string | null;

  searchQuery: string;
  sortMode: SortMode;

  draftTitle: string;
  draftContent: string;
  isDirty: boolean;

  lastSavedAt: number | null;

  sidebarOpen: boolean;

  // PUBLIC_INTERFACE
  setSearchQuery: (q: string) => void;
  // PUBLIC_INTERFACE
  setSortMode: (m: SortMode) => void;

  // PUBLIC_INTERFACE
  selectNote: (id: string | null) => void;
  // PUBLIC_INTERFACE
  createNewNote: () => void;

  // PUBLIC_INTERFACE
  setDraftTitle: (t: string) => void;
  // PUBLIC_INTERFACE
  setDraftContent: (c: string) => void;

  // PUBLIC_INTERFACE
  saveSelectedNote: () => void;
  // PUBLIC_INTERFACE
  deleteSelectedNote: () => void;

  // PUBLIC_INTERFACE
  setSidebarOpen: (open: boolean) => void;
};

const NotesContext = createContext<NotesState | null>(null);

function formatInitialDraft(note: Note | null) {
  return {
    title: note?.title ?? "",
    content: note?.content ?? "",
  };
}

// PUBLIC_INTERFACE
export function NotesProvider({ children }: { children: React.ReactNode }) {
  /** Global notes state provider (client-side only). */
  const repo = useMemo(() => createNotesRepository(), []);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("updated_desc");

  const [draftTitle, setDraftTitleState] = useState("");
  const [draftContent, setDraftContentState] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedNote = useMemo(
    () => (selectedId ? repo.get(selectedId) : null),
    [repo, selectedId]
  );

  const refreshList = () => {
    const list = repo.list({ q: searchQuery, sort: sortMode });
    setNotes(list);
  };

  // Initial load
  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when search/sort changes
  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortMode]);

  // When selection changes, load draft from selected note.
  useEffect(() => {
    const { title, content } = formatInitialDraft(selectedNote);
    setDraftTitleState(title);
    setDraftContentState(content);
    setIsDirty(false);
    // We keep lastSavedAt as-is; editor shows "Unsaved" when dirty.
  }, [selectedId, selectedNote]);

  const selectNote = (id: string | null) => {
    setSelectedId(id);
  };

  const createNewNote = () => {
    const n = repo.create({ title: "Untitled", content: "" });
    setSelectedId(n.id);
    setLastSavedAt(n.updatedAt);
    refreshList();
  };

  const setDraftTitle = (t: string) => {
    setDraftTitleState(t);
    setIsDirty(true);
  };

  const setDraftContent = (c: string) => {
    setDraftContentState(c);
    setIsDirty(true);
  };

  const saveSelectedNote = () => {
    if (!selectedId) return;

    const updated = repo.update(selectedId, {
      title: draftTitle,
      content: draftContent,
    });

    if (!updated) return;
    setLastSavedAt(updated.updatedAt);
    setIsDirty(false);
    refreshList();
  };

  const deleteSelectedNote = () => {
    if (!selectedId) return;
    const ok = repo.remove(selectedId);
    if (!ok) return;

    // Select next best note (top of list).
    const nextList = repo.list({ q: searchQuery, sort: sortMode });
    setNotes(nextList);
    setSelectedId(nextList.length ? nextList[0].id : null);
    setLastSavedAt(null);
    setIsDirty(false);
  };

  const value: NotesState = {
    notes,
    selectedId,

    searchQuery,
    sortMode,

    draftTitle,
    draftContent,
    isDirty,

    lastSavedAt,

    sidebarOpen,

    setSearchQuery,
    setSortMode,

    selectNote,
    createNewNote,

    setDraftTitle,
    setDraftContent,

    saveSelectedNote,
    deleteSelectedNote,

    setSidebarOpen,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

// PUBLIC_INTERFACE
export function useNotesStore() {
  /** Access the notes store. Must be used under <NotesProvider/>. */
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error("useNotesStore must be used within NotesProvider");
  }
  return ctx;
}
