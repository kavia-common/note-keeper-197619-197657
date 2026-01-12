"use client";

import React from "react";
import styles from "./Ui.module.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  id: string;
};

// PUBLIC_INTERFACE
export function Input({ label, hint, id, className, ...props }: InputProps) {
  /** Labeled input for accessibility. */
  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input className={[styles.input, className].filter(Boolean).join(" ")} id={id} {...props} />
      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  );
}
