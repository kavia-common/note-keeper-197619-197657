"use client";

import React, { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useNotesStore } from "@/store/NotesStore";
import { Button } from "@/components/ui/Button";
import styles from "./NotesSidebar.module.css";

function formatTime(ts: number) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function snippet(text: string) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}

export default function NotesSidebar() {
  const {
    notes,
    selectedId,
    searchQuery,
    sortMode,
    setSearchQuery,
    setSortMode,
    selectNote,
    createNewNote,
    sidebarOpen,
    setSidebarOpen,
  } = useNotesStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 200);

  React.useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  const sortLabel = useMemo(() => {
    if (sortMode === "updated_desc") return "Newest";
    return "Oldest";
  }, [sortMode]);

  return (
    <aside className={[styles.sidebar, sidebarOpen ? styles.open : styles.closed].join(" ")}>
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true" />
          <div>
            <div className={styles.brandTitle}>Ocean Notes</div>
            <div className={styles.brandSubtle}>
              <span className="subtleText">Local-first</span>
            </div>
          </div>
        </div>

        <button
          className={styles.collapseBtn}
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-pressed={sidebarOpen}
        >
          {sidebarOpen ? "⟨" : "⟩"}
        </button>
      </div>

      <div className={styles.controls}>
        <label className={styles.srOnly} htmlFor="search-notes">
          Search notes
        </label>
        <input
          id="search-notes"
          className={styles.search}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search notes…"
        />

        <div className={styles.filtersRow}>
          <div className={styles.sort}>
            <span className={styles.sortLabel}>Sort:</span>
            <button
              className={styles.sortBtn}
              type="button"
              onClick={() =>
                setSortMode(sortMode === "updated_desc" ? "updated_asc" : "updated_desc")
              }
              aria-label={`Toggle sort (currently ${sortLabel})`}
            >
              {sortLabel}
            </button>
          </div>

          <Button variant="primary" onClick={createNewNote} aria-label="Create new note">
            + New
          </Button>
        </div>
      </div>

      <nav className={styles.list} aria-label="Notes list">
        {notes.length === 0 ? (
          <div className={styles.emptyList}>
            <div className={styles.emptyTitle}>No notes yet</div>
            <div className={styles.emptyDesc}>
              Create your first note with <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>N</kbd>.
            </div>
          </div>
        ) : null}

        {notes.map((n) => {
          const active = n.id === selectedId;
          return (
            <button
              key={n.id}
              type="button"
              className={[styles.item, active ? styles.itemActive : ""].join(" ")}
              onClick={() => selectNote(n.id)}
              aria-current={active ? "page" : undefined}
            >
              <div className={styles.itemTop}>
                <div className={styles.itemTitle}>{n.title || "Untitled"}</div>
                <div className={styles.itemTime}>{formatTime(n.updatedAt)}</div>
              </div>
              <div className={styles.itemSnippet}>{snippet(n.content)}</div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
