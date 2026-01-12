"use client";

import React from "react";
import styles from "./Ui.module.css";

type Tone = "neutral" | "primary" | "success" | "danger";

type BadgeProps = {
  tone?: Tone;
  children: React.ReactNode;
};

// PUBLIC_INTERFACE
export function Badge({ tone = "neutral", children }: BadgeProps) {
  /** Small badge/pill used for statuses. */
  return <span className={[styles.badge, styles[`badge_${tone}`]].join(" ")}>{children}</span>;
}
