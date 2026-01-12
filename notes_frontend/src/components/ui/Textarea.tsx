"use client";

import React from "react";
import styles from "./Ui.module.css";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  id: string;
};

// PUBLIC_INTERFACE
export function Textarea({ label, hint, id, className, ...props }: TextareaProps) {
  /** Labeled textarea for accessibility. */
  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <textarea
        className={[styles.textarea, className].filter(Boolean).join(" ")}
        id={id}
        {...props}
      />
      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  );
}
