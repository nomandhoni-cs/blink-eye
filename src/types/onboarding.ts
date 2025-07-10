import type React from "react"
export interface Screen {
  id: number
  title: string
  component: React.ComponentType<any>
  onNext?: () => Promise<void> | void
  onPrevious?: () => Promise<void> | void
}

export interface OnboardingData {
  breakInterval: number
  breakDuration: number
  customInterval: string
  customDuration: string
  reminderText: string
  licenseKey: string
  todos: TodoItem[]
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}
