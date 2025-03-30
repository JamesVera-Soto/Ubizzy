export interface User {
  id: string
  name: string
  email: string
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  completed: boolean
  isStatic: boolean
  category?: string
}

export interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  isStatic: boolean
  category?: string
  completed: boolean
}

export interface Habit {
  id: string
  title: string
  description?: string
  frequency: "daily" | "weekly" | "monthly"
  completedDates: Date[]
  category?: string
}

