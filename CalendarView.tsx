"use client"

import React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTaskStore } from "./stores/taskStore"

const CalendarView = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const { tasks, events, habits } = useTaskStore()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getItemsForDate = (date: Date) => {
    const dayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      return format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    })

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return format(eventDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    })

    const dayHabits = habits.filter((habit) => {
      // Simple check if habit should be done on this date based on frequency
      const lastCompleted = habit.completedDates[habit.completedDates.length - 1]
      if (!lastCompleted) return true

      const lastCompletedDate = new Date(lastCompleted)
      const diffDays = Math.floor((date.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (habit.frequency) {
        case "daily":
          return diffDays >= 1
        case "weekly":
          return diffDays >= 7
        case "monthly":
          return diffDays >= 30
        default:
          return false
      }
    })

    return { tasks: dayTasks, events: dayEvents, habits: dayHabits }
  }

  const previousMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <div className="flex items-center gap-4">
              <button onClick={previousMonth} className="p-2 rounded-full hover:bg-purple-500 text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium text-white">{format(currentDate, "MMMM yyyy")}</span>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-purple-500 text-white">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-7 gap-px border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="px-4 py-2 text-sm font-medium text-gray-900 text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => {
              const items = getItemsForDate(day)
              const totalItems = items.tasks.length + items.events.length + items.habits.length

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] p-2 ${!isSameMonth(day, currentDate) ? "bg-gray-50" : "bg-white"}`}
                >
                  <div
                    className={`text-sm font-medium ${
                      isToday(day)
                        ? "bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                        : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  {totalItems > 0 && (
                    <div className="mt-2 space-y-1">
                      {items.tasks.length > 0 && (
                        <div className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                          {items.tasks.length} tasks
                        </div>
                      )}
                      {items.events.length > 0 && (
                        <div className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {items.events.length} events
                        </div>
                      )}
                      {items.habits.length > 0 && (
                        <div className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                          {items.habits.length} habits
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

export default CalendarView

