"use client";

import React from "react";
import styles from "./Ui.module.css";

type Variant = "primary" | "secondary" | "danger" | "ghost";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

// PUBLIC_INTERFACE
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, ...props },
  ref
) {
  /** Themed button with variants and consistent focus styles. */
  const cls = [styles.button, styles[`button_${variant}`], className]
    .filter(Boolean)
    .join(" ");
  return <button ref={ref} className={cls} {...props} />;
});
