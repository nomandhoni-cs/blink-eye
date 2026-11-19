import type React from "react";

export interface Screen {
  id: number;
  title: string;
  component: React.ComponentType<any>;
  onNext?: () => Promise<void> | void;
  /** Block advancing when this returns false (e.g. invalid email). */
  validate?: () => boolean;
}

export interface OnboardingData {
  breakInterval: number;
  breakDuration: number;
  reminderText: string;
  email?: string;
}
