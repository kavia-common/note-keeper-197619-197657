"use client";

import React, { useEffect } from "react";
import { NotesProvider, useNotesStore } from "@/store/NotesStore";
import NotesSidebar from "@/components/NotesSidebar";
import NoteEditor from "@/components/NoteEditor";
import styles from "./NotesApp.module.css";

function MobileTopBar() {
  const { sidebarOpen, setSidebarOpen, createNewNote } = useNotesStore();

  return (
    <div className={styles.mobileTopBar}>
      <button
        type="button"
        className={styles.mobileIconBtn}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close notes sidebar" : "Open notes sidebar"}
        aria-pressed={sidebarOpen}
      >
        ☰
      </button>

      <div className={styles.mobileTitle}>Ocean Notes</div>

      <button
        type="button"
        className={styles.mobileIconBtn}
        onClick={createNewNote}
        aria-label="Create new note"
        title="New (Ctrl/Cmd+N)"
      >
        +
      </button>
    </div>
  );
}

function AppShell() {
  // Default: open on desktop, collapsed on smaller screens.
  const { setSidebarOpen } = useNotesStore();

  useEffect(() => {
    const setByWidth = () => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    setByWidth();
    window.addEventListener("resize", setByWidth);
    return () => window.removeEventListener("resize", setByWidth);
  }, [setSidebarOpen]);

  return (
    <main className={[styles.shell, "appShellBg"].join(" ")}>
      <MobileTopBar />
      <div className={styles.row}>
        <NotesSidebar />
        <NoteEditor />
      </div>
    </main>
  );
}

export default function NotesApp() {
  return (
    <NotesProvider>
      <AppShell />
    </NotesProvider>
  );
}
