"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "./Button";
import styles from "./Ui.module.css";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// PUBLIC_INTERFACE
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  /** Minimal accessible confirm dialog (focus trap-lite via initial focus + Escape). */
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => confirmRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="presentation" onMouseDown={onCancel}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? "confirm-desc" : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle} id="confirm-title">
          {title}
        </h2>
        {description ? (
          <p className={styles.modalDesc} id="confirm-desc">
            {description}
          </p>
        ) : null}
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            ref={confirmRef}
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
