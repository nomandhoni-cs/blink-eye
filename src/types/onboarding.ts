import type React from "react";

export interface Screen {
  id: number;
  title: string;
  component: React.ComponentType<any>;
  onNext?: () => Promise<void> | void;
}

export interface OnboardingData {
  breakInterval: number;
  breakDuration: number;
  reminderText: string;
  email?: string;
}
