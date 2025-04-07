"use client"

import type React from "react"
import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  User,
  CheckCircle2,
  CalendarIcon as CalIcon,
  Repeat,
  Bot,
} from "lucide-react"
import { useTaskStore } from "../../stores/taskStore"
import Image from "next/image"
import ChatBot from "@/components/ChatBot"
import { useRouter } from "next/navigation";

interface CalendarViewProps {
    onBack: () => void
}

const CalendarView: React.FC<CalendarViewProps> = ({ onBack }) => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const { tasks, events, habits } = useTaskStore()
  const [showChatBot, setShowChatBot] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const weekStart = startOfWeek(monthStart)
  const weekEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getItemsForDate = (date: Date) => {
    const dayStr = format(date, "yyyy-MM-dd")
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      return format(taskDate, "yyyy-MM-dd") === dayStr
    })

    const dayEvents = events.filter((event) => {
      // Check if event spans this day (either starts on this day, ends on this day, or spans across this day)
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)

      return (
        format(eventStart, "yyyy-MM-dd") === dayStr ||
        format(eventEnd, "yyyy-MM-dd") === dayStr ||
        (eventStart <= dayStart && eventEnd >= dayEnd)
      )
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
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  const renderDayItems = (date: Date) => {
    const items = getItemsForDate(date)
    const totalItems = items.tasks.length + items.events.length + items.habits.length

    if (totalItems === 0) return null

    // Sort tasks by due date
    const sortedTasks = [...items.tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    // Sort events by start time
    const sortedEvents = [...items.events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )

    return (
      <div className="mt-1 space-y-1">
        {sortedTasks.map((task) => (
          <div key={task.id} className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded truncate">
            <CheckCircle2 className="w-3 h-3 inline mr-1" />
            {task.title}
          </div>
        ))}

        {sortedEvents.map((event) => (
          <div key={event.id} className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded truncate">
            <CalIcon className="w-3 h-3 inline mr-1" />
            {event.title}
          </div>
        ))}

        {items.habits.map((habit) => (
          <div key={habit.id} className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded truncate">
            <Repeat className="w-3 h-3 inline mr-1" />
            {habit.title}
          </div>
        ))}
      </div>
    )
  }

  const renderDayDetails = () => {
    if (!selectedDay) return null

    const items = getItemsForDate(selectedDay)
    const totalItems = items.tasks.length + items.events.length + items.habits.length

    if (totalItems === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500">No items for {format(selectedDay, "MMMM d, yyyy")}</p>
        </div>
      )
    }

    // Sort tasks by due date
    const sortedTasks = [...items.tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    // Sort events by start time
    const sortedEvents = [...items.events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )

    return (
      <div className="p-4 bg-white rounded-lg shadow mt-4">
        <h3 className="font-medium text-lg mb-3">{format(selectedDay, "MMMM d, yyyy")}</h3>

        {sortedTasks.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Tasks
            </h4>
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <div key={task.id} className="p-2 bg-purple-50 rounded text-sm">
                  <div className="font-medium">{task.title}</div>
                  {task.description && <div className="text-xs text-gray-600 mt-1">{task.description}</div>}
                  <div className="text-xs text-purple-700 mt-1">{format(new Date(task.dueDate), "h:mm a")}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedEvents.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
              <CalIcon className="w-4 h-4 mr-1" /> Events
            </h4>
            <div className="space-y-2">
              {sortedEvents.map((event) => {
                const startDate = new Date(event.startDate)
                const endDate = new Date(event.endDate)
                const isMultiDay = format(startDate, "yyyy-MM-dd") !== format(endDate, "yyyy-MM-dd")

                return (
                  <div key={event.id} className="p-2 bg-blue-50 rounded text-sm">
                    <div className="font-medium">{event.title}</div>
                    {event.description && <div className="text-xs text-gray-600 mt-1">{event.description}</div>}
                    <div className="text-xs text-blue-700 mt-1">
                      {isMultiDay ? (
                        <>
                          {format(startDate, "MMM d, h:mm a")} - {format(endDate, "MMM d, h:mm a")}
                        </>
                      ) : (
                        <>
                          {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {items.habits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
              <Repeat className="w-4 h-4 mr-1" /> Habits
            </h4>
            <div className="space-y-2">
              {items.habits.map((habit) => (
                <div key={habit.id} className="p-2 bg-green-50 rounded text-sm">
                  <div className="font-medium">{habit.title}</div>
                  {habit.description && <div className="text-xs text-gray-600 mt-1">{habit.description}</div>}
                  <div className="text-xs text-green-700 mt-1">
                    {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => {router.back()}} className="p-2 rounded-full hover:bg-purple-500 text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5">
                <Image
                  src="/logo.webp"
                  alt="Ubizy Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">Calendar</h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowChatBot(true)} className="p-2 rounded-full hover:bg-purple-500 text-white">
                <Bot className="w-5 h-5" />
              </button>
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

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-20">
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
              const isSelected = selectedDay && format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
              
              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] p-2 cursor-pointer transition-colors ${
                    !isSameMonth(day, currentDate)
                      ? "bg-gray-50"
                      : isSelected
                        ? "bg-purple-50"
                        : "bg-white hover:bg-purple-50"
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div
                    className={`text-sm font-medium ${
                      isToday(day)
                        ? "bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                        : isSelected
                          ? "text-purple-700"
                          : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  {renderDayItems(day)}
                </div>
              )
            })}
          </div>
        </div>

        {renderDayDetails()}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-around">
          <button className="p-2 flex flex-col items-center text-purple-600">
            <CalIcon className="w-6 h-6" />
            <span className="text-xs">Calendar</span>
          </button>
          <button onClick={() => router.push('/home')} className="p-2 flex flex-col items-center text-gray-500 hover:text-purple-600">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => router.push('/profile')} className="p-2 flex flex-col items-center text-gray-500 hover:text-purple-600">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
      {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}
    </div>
  )
}

export default CalendarView

