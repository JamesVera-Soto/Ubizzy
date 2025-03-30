import { create } from "zustand"
import type { Task, Event, Habit } from "../types"
import { format } from "date-fns"

interface TaskState {
  tasks: Task[]
  events: Event[]
  habits: Habit[]
  addTask: (task: Omit<Task, "id">) => void
  addEvent: (event: Omit<Event, "id">) => void
  addHabit: (habit: Omit<Habit, "id" | "completedDates">) => void
  completeTask: (taskId: string) => void
  uncompleteTask: (taskId: string) => void
  completeEvent: (eventId: string) => void
  uncompleteEvent: (eventId: string) => void
  completeHabit: (habitId: string, date: Date) => void
  uncompleteHabit: (habitId: string) => void
  deleteTask: (taskId: string) => void
  deleteEvent: (eventId: string) => void
  deleteHabit: (habitId: string) => void
  getTodayItems: () => {
    tasks: Task[]
    events: Event[]
    habits: Habit[]
  }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  events: [],
  habits: [],

  addTask: (task) => {
    const newTask = { ...task, id: crypto.randomUUID() }
    set((state) => ({ tasks: [...state.tasks, newTask] }))
  },

  addEvent: (event) => {
    const newEvent = { ...event, id: crypto.randomUUID(), completed: false }
    set((state) => ({ events: [...state.events, newEvent] }))
  },

  addHabit: (habit) => {
    const newHabit = { ...habit, id: crypto.randomUUID(), completedDates: [] }
    set((state) => ({ habits: [...state.habits, newHabit] }))
  },

  completeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task)),
    }))
  },

  uncompleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, completed: false } : task)),
    }))
  },

  completeEvent: (eventId) => {
    set((state) => ({
      events: state.events.map((event) => (event.id === eventId ? { ...event, completed: true } : event)),
    }))
  },

  uncompleteEvent: (eventId) => {
    set((state) => ({
      events: state.events.map((event) => (event.id === eventId ? { ...event, completed: false } : event)),
    }))
  },

  completeHabit: (habitId, date) => {
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== habitId) return habit

        // Check if already completed today
        const today = format(new Date(), "yyyy-MM-dd")
        const alreadyCompletedToday = habit.completedDates.some((d) => format(new Date(d), "yyyy-MM-dd") === today)

        if (alreadyCompletedToday) return habit

        return { ...habit, completedDates: [...habit.completedDates, date] }
      }),
    }))
  },

  uncompleteHabit: (habitId) => {
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== habitId) return habit

        // Remove today's date from completedDates
        const today = format(new Date(), "yyyy-MM-dd")
        const filteredDates = habit.completedDates.filter((date) => format(new Date(date), "yyyy-MM-dd") !== today)

        return { ...habit, completedDates: filteredDates }
      }),
    }))
  },

  // Nuevas funciones para eliminar elementos
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }))
  },

  deleteEvent: (eventId) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
    }))
  },

  deleteHabit: (habitId) => {
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== habitId),
    }))
  },

  getTodayItems: () => {
    const state = get()
    const today = new Date()
    const todayStr = format(today, "yyyy-MM-dd")

    // Set hours to 0 for date comparison
    const todayStart = new Date(today)
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    return {
      tasks: state.tasks.filter((task) => {
        const taskDate = new Date(task.dueDate)
        return format(taskDate, "yyyy-MM-dd") === todayStr
      }),

      events: state.events.filter((event) => {
        // Check if event spans today (either starts today, ends today, or spans across today)
        const eventStart = new Date(event.startDate)
        const eventEnd = new Date(event.endDate)

        // Event is happening today if:
        // 1. It starts today
        // 2. It ends today
        // 3. It started before today and ends after today (spans across today)
        return (
          format(eventStart, "yyyy-MM-dd") === todayStr ||
          format(eventEnd, "yyyy-MM-dd") === todayStr ||
          (eventStart < todayStart && eventEnd > todayEnd)
        )
      }),

      habits: state.habits.filter((habit) => {
        // Para hábitos, solo verificamos si es relevante para hoy según su frecuencia
        // pero no los filtramos si ya están completados
        const lastCompleted = habit.completedDates
          .filter((date) => format(new Date(date), "yyyy-MM-dd") !== todayStr)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]

        if (!lastCompleted) return true // Si nunca se ha completado, mostrar

        const lastCompletedDate = new Date(lastCompleted)
        const diffDays = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (habit.frequency) {
          case "daily":
            return diffDays >= 1
          case "weekly":
            return diffDays >= 7
          case "monthly":
            return diffDays >= 30
          default:
            return true // Por defecto, mostrar el hábito
        }
      }),
    }
  },
}))

