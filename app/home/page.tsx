"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format, compareAsc, differenceInDays } from "date-fns"
import {
  Plus,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Repeat,
  User,
  Home,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  Clock3,
  Trash2,
  Bot,
} from "lucide-react"
import { useSwipeable } from "react-swipeable"
import { useTaskStore } from "@/stores/taskStore"
import type { Task, Event, Habit } from "../../types"
import CalendarView from "../calendar/page"
import TaskForm from "@/components/TaskForm"
import EventForm from "@/components/EventForm"
import HabitForm from "@/components/HabitForm"
import ProfileScreen from "../profile/page"
import Image from "next/image"
// Import the ChatBot component at the top of the file
import ChatBot from "@/components/ChatBot"
import { useRouter } from "next/navigation"

type FormType = "task" | "event" | "habit" | null
type ViewType = "home" | "calendar" | "profile"

const HomeScreen = () => {
  const router = useRouter();
  const {
    getTodayItems,
    completeTask,
    uncompleteTask,
    completeEvent,
    uncompleteEvent,
    completeHabit,
    uncompleteHabit,
    deleteTask,
    deleteEvent,
    deleteHabit,
    tasks: allTasks,
    events: allEvents,
    habits: allHabits,
  } = useTaskStore()
  const [showNewItemMenu, setShowNewItemMenu] = useState(false)
  const [activeForm, setActiveForm] = useState<FormType>(null)
  const [currentView, setCurrentView] = useState<ViewType>("home")
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null)
  const { tasks: todayTasks, events: todayEvents, habits: todayHabits } = getTodayItems()
  const [activeTab, setActiveTab] = useState<"all" | "tasks" | "events" | "habits">("all")
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteConfirmType, setDeleteConfirmType] = useState<"task" | "event" | "habit" | null>(null)
  // Add a state for showing the chatbot in the HomeScreen component
  const [showChatBot, setShowChatBot] = useState(false)

  // Para depuración
  useEffect(() => {
    console.log("Today's items:", { tasks: todayTasks, events: todayEvents, habits: todayHabits })
    console.log("All items:", { tasks: allTasks, events: allEvents, habits: allHabits })
  }, [todayTasks, todayEvents, todayHabits, allTasks, allEvents, allHabits])

  // Sort tasks by due date
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      // First sort by completion status
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1

      // Then sort by due date for non-completed tasks
      if (!a.completed && !b.completed) {
        return compareAsc(new Date(a.dueDate), new Date(b.dueDate))
      }

      return 0
    })
  }

  // Sort events by start time
  const sortEvents = (events: Event[]) => {
    return [...events].sort((a, b) => {
      // First sort by completion status
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1

      // Then sort by start time for non-completed events
      if (!a.completed && !b.completed) {
        return compareAsc(new Date(a.startDate), new Date(b.startDate))
      }

      return 0
    })
  }

  // Sort habits - completed ones at the end
  const sortHabits = (habits: Habit[]) => {
    return [...habits].sort((a, b) => {
      const today = format(new Date(), "yyyy-MM-dd")

      const aCompleted = a.completedDates.some((date) => format(new Date(date), "yyyy-MM-dd") === today)
      const bCompleted = b.completedDates.some((date) => format(new Date(date), "yyyy-MM-dd") === today)

      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1
      return 0
    })
  }

  // Get urgency level for a date
  const getUrgencyLevel = (date: Date): "urgent" | "soon" | "later" => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const daysUntil = differenceInDays(date, today)

    if (daysUntil <= 1) return "urgent"
    if (daysUntil <= 7) return "soon"
    return "later"
  }

  // Filter items based on active tab
  const getFilteredItems = () => {
    if (activeTab === "all") {
      // For "All" tab, show all items, not just today's
      return {
        tasks: sortTasks(allTasks),
        events: sortEvents(allEvents),
        habits: sortHabits(allHabits),
      }
    }
    if (activeTab === "tasks") return { tasks: sortTasks(todayTasks), events: [], habits: [] }
    if (activeTab === "events") return { tasks: [], events: sortEvents(todayEvents), habits: [] }
    if (activeTab === "habits") return { tasks: [], events: [], habits: sortHabits(todayHabits) }

    // Default fallback
    return {
      tasks: sortTasks(todayTasks),
      events: sortEvents(todayEvents),
      habits: sortHabits(todayHabits),
    }
  }

  const filteredItems = getFilteredItems()

  // Handle task completion with animation
  const handleTaskComplete = (taskId: string, isCompleted: boolean) => {
    setAnimatingItemId(taskId)

    // Wait for animation to start
    setTimeout(() => {
      if (isCompleted) {
        uncompleteTask(taskId)
      } else {
        completeTask(taskId)
      }

      // Clear animating ID after animation completes
      setTimeout(() => {
        setAnimatingItemId(null)
      }, 500)
    }, 10)
  }

  // Handle event completion with animation
  const handleEventComplete = (eventId: string, isCompleted: boolean) => {
    setAnimatingItemId(eventId)

    // Wait for animation to start
    setTimeout(() => {
      if (isCompleted) {
        uncompleteEvent(eventId)
      } else {
        completeEvent(eventId)
      }

      // Clear animating ID after animation completes
      setTimeout(() => {
        setAnimatingItemId(null)
      }, 500)
    }, 10)
  }

  // Handle habit completion with animation
  const handleHabitComplete = (habitId: string, isCompleted: boolean) => {
    setAnimatingItemId(habitId)

    // Wait for animation to start
    setTimeout(() => {
      if (isCompleted) {
        uncompleteHabit(habitId)
      } else {
        completeHabit(habitId, new Date())
      }

      // Clear animating ID after animation completes
      setTimeout(() => {
        setAnimatingItemId(null)
      }, 500)
    }, 10)
  }

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Handle item creation - redirect to "All" if not for today
  const handleItemCreated = (isForToday: boolean) => {
    if (!isForToday) {
      setActiveTab("all")
    }
  }

  // Handle delete confirmation
  const confirmDelete = (id: string, type: "task" | "event" | "habit") => {
    setDeleteConfirmId(id)
    setDeleteConfirmType(type)
  }

  // Handle delete action
  const handleDelete = () => {
    if (!deleteConfirmId || !deleteConfirmType) return

    switch (deleteConfirmType) {
      case "task":
        deleteTask(deleteConfirmId)
        break
      case "event":
        deleteEvent(deleteConfirmId)
        break
      case "habit":
        deleteHabit(deleteConfirmId)
        break
    }

    // Clear confirmation state
    setDeleteConfirmId(null)
    setDeleteConfirmType(null)
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmId(null)
    setDeleteConfirmType(null)
  }

  // Render the appropriate view
  const renderView = () => {
        return (
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-purple-600 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5">
                      <Image
                        src="/logo.webp"
                        alt="Ubizy Logo"
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        {activeTab === "all" ? "All Items" : "Today's Work"}
                      </h1>
                      <p className="text-sm text-purple-100">{format(new Date(), "EEEE, MMMM d")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push("/calendar")}
                      className="p-2 rounded-full hover:bg-purple-500 text-white"
                    >
                      <CalendarIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => router.push("/profile")}
                      className="p-2 rounded-full hover:bg-purple-500 text-white"
                    >
                      <User className="w-6 h-6" />
                    </button>
                    {/* Add the new ChatBot button here */}
                    <button
                      onClick={() => setShowChatBot(true)}
                      className="p-2 rounded-full hover:bg-purple-500 text-white"
                    >
                      <Bot className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setShowNewItemMenu(!showNewItemMenu)}
                      className="p-2 rounded-full bg-white text-purple-600 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-4 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`py-3 px-4 text-sm font-medium border-b-2 ${
                      activeTab === "all"
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-1 ${
                      activeTab === "tasks"
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-1 ${
                      activeTab === "events"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4" /> Events
                  </button>
                  <button
                    onClick={() => setActiveTab("habits")}
                    className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-1 ${
                      activeTab === "habits"
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Repeat className="w-4 h-4" /> Habits
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-20">
              <div className="space-y-6">
                {/* Upcoming Legend - Only show in upcoming view */}
                {activeTab === "all" && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium mb-2">Urgency Legend:</h3>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs">Today/Tomorrow</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-xs">This Week</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs">Later</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirmId && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Delete</h3>
                    <p className="text-gray-600 mb-4">
                      Are you sure you want to delete this {deleteConfirmType}? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelDelete}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        className="bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {filteredItems.tasks.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" /> Tasks
                    </h2>
                    <div className="space-y-2">
                      {filteredItems.tasks.map((task) => {
                        // Determine if task is in the future
                        const taskDate = new Date(task.dueDate)
                        const isFutureTask = !isToday(taskDate) && taskDate > new Date()

                        // For upcoming view, determine urgency for future tasks
                        const urgency = activeTab === "all" && isFutureTask ? getUrgencyLevel(taskDate) : null

                        return (
                          <div
                            key={task.id}
                            className={`transition-all duration-500 ease-in-out ${
                              animatingItemId === task.id ? "scale-95 opacity-70" : ""
                            }`}
                          >
                            <TaskItem
                              task={task}
                              onComplete={() => handleTaskComplete(task.id, task.completed)}
                              onDelete={() => confirmDelete(task.id, "task")}
                              urgency={urgency}
                              showDate={activeTab === "all"}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* Events */}
                {filteredItems.events.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-600" /> Events
                    </h2>
                    <div className="space-y-2">
                      {filteredItems.events.map((event) => {
                        // Determine if event is in the future
                        const eventDate = new Date(event.startDate)
                        const isFutureEvent = !isToday(eventDate) && eventDate > new Date()

                        // For upcoming view, determine urgency for future events
                        const urgency = activeTab === "all" && isFutureEvent ? getUrgencyLevel(eventDate) : null

                        return (
                          <div
                            key={event.id}
                            className={`transition-all duration-500 ease-in-out ${
                              animatingItemId === event.id ? "scale-95 opacity-70" : ""
                            }`}
                          >
                            <EventItem
                              event={event}
                              onComplete={() => handleEventComplete(event.id, event.completed)}
                              onDelete={() => confirmDelete(event.id, "event")}
                              urgency={urgency}
                              showDate={activeTab === "all"}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* Habits */}
                {filteredItems.habits.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-green-600" /> Habits
                    </h2>
                    <div className="space-y-2">
                      {filteredItems.habits.map((habit) => {
                        const today = format(new Date(), "yyyy-MM-dd")
                        const isCompletedToday = habit.completedDates.some(
                          (date) => format(new Date(date), "yyyy-MM-dd") === today,
                        )

                        return (
                          <div
                            key={habit.id}
                            className={`transition-all duration-500 ease-in-out ${
                              animatingItemId === habit.id ? "scale-95 opacity-70" : ""
                            }`}
                          >
                            <HabitItem
                              habit={habit}
                              isCompletedToday={isCompletedToday}
                              onComplete={() => handleHabitComplete(habit.id, isCompletedToday)}
                              onDelete={() => confirmDelete(habit.id, "habit")}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {filteredItems.tasks.length === 0 &&
                  filteredItems.events.length === 0 &&
                  filteredItems.habits.length === 0 && (
                    <div className="text-center py-12">
                      <Image
                        src="/logo.webp"
                        alt="Ubizy Logo"
                        width={80}
                        height={80}
                        className="mx-auto mb-4 opacity-50"
                      />
                      <p className="text-gray-500">{activeTab === "all" ? "No items found" : "No items for today"}</p>
                      <p className="text-sm text-gray-400">Click the + button to add something new</p>
                    </div>
                  )}
              </div>
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4">
              <div className="max-w-7xl mx-auto flex justify-around">
                <button
                  onClick={() => router.push("/calendar")}
                  className="p-2 flex flex-col items-center text-gray-500 hover:text-purple-600"
                >
                  <CalendarIcon className="w-6 h-6" />
                  <span className="text-xs">Calendar</span>
                </button>
                <button
                  onClick={() => router.push("/home")}
                  className="p-2 flex flex-col items-center text-purple-600"
                >
                  <Home className="w-6 h-6" />
                  <span className="text-xs">Home</span>
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className="p-2 flex flex-col items-center text-gray-500 hover:text-purple-600"
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs">Profile</span>
                </button>
              </div>
            </div>
          </div>
        )
  }

  // New Item Menu
  const renderNewItemMenu = () => {
    if (!showNewItemMenu) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <div className="flex items-center justify-center mb-4">
            <Image src="/logo.webp" alt="Ubizy Logo" width={50} height={50} className="mr-2" />
            <h2 className="text-xl font-semibold">Create New</h2>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                setActiveForm("task")
                setShowNewItemMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              Task
            </button>
            <button
              onClick={() => {
                setActiveForm("habit")
                setShowNewItemMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <Repeat className="w-5 h-5 text-green-600" />
              Habit
            </button>
            <button
              onClick={() => {
                setActiveForm("event")
                setShowNewItemMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Event
            </button>
            <button
              onClick={() => {
                /* TODO: Open import form */
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <Clock className="w-5 h-5 text-orange-600" />
              Import Schedule
            </button>
          </div>
          <button
            onClick={() => setShowNewItemMenu(false)}
            className="mt-4 w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Forms
  const renderForms = () => {
    if (!activeForm) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
          <div className="flex items-center mb-4">
            <Image src="/logo.webp" alt="Ubizy Logo" width={40} height={40} className="mr-2" />
            <h2 className="text-xl font-semibold">
              Create New {activeForm.charAt(0).toUpperCase() + activeForm.slice(1)}
            </h2>
          </div>
          {activeForm === "task" && <TaskForm onClose={() => setActiveForm(null)} onCreated={handleItemCreated} />}
          {activeForm === "event" && <EventForm onClose={() => setActiveForm(null)} onCreated={handleItemCreated} />}
          {activeForm === "habit" && <HabitForm onClose={() => setActiveForm(null)} onCreated={() => {}} />}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`transition-transform duration-300 ease-in-out ${
        slideDirection === "left" ? "-translate-x-full" : slideDirection === "right" ? "translate-x-full" : ""
      }`}
    >
      {renderView()}
      {renderNewItemMenu()}
      {renderForms()}
      {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}
    </div>
  )
}

interface TaskItemProps {
  task: Task
  onComplete: () => void
  onDelete: () => void
  urgency?: "urgent" | "soon" | "later" | null
  showDate?: boolean
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, urgency, showDate = false }) => {
  // Determine border color based on urgency
  let borderColor = "border-purple-500"
  let urgencyIcon = null

  if (task.completed) {
    borderColor = "border-gray-300"
  } else if (urgency) {
    switch (urgency) {
      case "urgent":
        borderColor = "border-red-500"
        urgencyIcon = <AlertTriangle className="w-4 h-4 text-red-500" />
        break
      case "soon":
        borderColor = "border-orange-500"
        urgencyIcon = <Clock3 className="w-4 h-4 text-orange-500" />
        break
      case "later":
        borderColor = "border-green-500"
        break
    }
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 border-l-4 ${
        task.completed ? "border-gray-300 bg-gray-50" : borderColor
      }`}
    >
      <button
        onClick={onComplete}
        className={`rounded-full p-1 ${
          task.completed ? "text-green-600 bg-green-100" : "text-gray-400 hover:text-purple-600"
        }`}
      >
        {task.completed ? <Check className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
            {task.title}
          </h3>
          {urgencyIcon}
        </div>
        {task.description && (
          <p className={`text-sm ${task.completed ? "text-gray-400" : "text-gray-500"}`}>{task.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-1">
          {task.category && (
            <span
              className={`inline-block text-xs ${
                task.completed ? "bg-gray-100 text-gray-500" : "bg-purple-100 text-purple-800"
              } px-2 py-0.5 rounded-full`}
            >
              {task.category}
            </span>
          )}
          {showDate && (
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-400">{format(new Date(task.dueDate), "HH:mm")}</span>
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface EventItemProps {
  event: Event
  onComplete: () => void
  onDelete: () => void
  urgency?: "urgent" | "soon" | "later" | null
  showDate?: boolean
}

const EventItem: React.FC<EventItemProps> = ({ event, onComplete, onDelete, urgency, showDate = false }) => {
  // Determine border color based on urgency
  let borderColor = "border-blue-500"
  let urgencyIcon = null

  if (event.completed) {
    borderColor = "border-gray-300"
  } else if (urgency) {
    switch (urgency) {
      case "urgent":
        borderColor = "border-red-500"
        urgencyIcon = <AlertTriangle className="w-4 h-4 text-red-500" />
        break
      case "soon":
        borderColor = "border-orange-500"
        urgencyIcon = <Clock3 className="w-4 h-4 text-orange-500" />
        break
      case "later":
        borderColor = "border-green-500"
        break
    }
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
        event.completed ? "border-gray-300 bg-gray-50" : borderColor
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onComplete}
          className={`rounded-full p-1 ${
            event.completed ? "text-green-600 bg-green-100" : "text-gray-400 hover:text-blue-600"
          }`}
        >
          {event.completed ? <Check className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5 text-blue-600" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${event.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
              {event.title}
            </h3>
            {urgencyIcon}
          </div>
          {event.description && (
            <p className={`text-sm ${event.completed ? "text-gray-400" : "text-gray-500"}`}>{event.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-1">
            {event.category && (
              <span
                className={`inline-block text-xs ${
                  event.completed ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-800"
                } px-2 py-0.5 rounded-full`}
              >
                {event.category}
              </span>
            )}
            {showDate && (
              <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {format(new Date(event.startDate), "MMM d")}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-gray-400">
            {format(new Date(event.startDate), "yyyy-MM-dd") === format(new Date(event.endDate), "yyyy-MM-dd") ? (
              // Mismo día
              <>
                <div>{format(new Date(event.startDate), "HH:mm")}</div>
                <div>{format(new Date(event.endDate), "HH:mm")}</div>
              </>
            ) : (
              // Evento de varios días
              <>
                <div>{format(new Date(event.startDate), "MMM d, HH:mm")}</div>
                <div>{format(new Date(event.endDate), "MMM d, HH:mm")}</div>
              </>
            )}
          </div>
          <button
            onClick={onDelete}
            className="p-1 mt-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface HabitItemProps {
  habit: Habit
  isCompletedToday: boolean
  onComplete: () => void
  onDelete: () => void
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, isCompletedToday, onComplete, onDelete }) => (
  <div
    className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
      isCompletedToday ? "border-gray-300 bg-gray-50" : "border-green-500"
    }`}
  >
    <div className="flex items-center gap-4">
      <button
        onClick={onComplete}
        className={`rounded-full p-1 ${
          isCompletedToday ? "text-green-600 bg-green-100" : "text-gray-400 hover:text-green-600"
        }`}
      >
        {isCompletedToday ? <Check className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
      </button>
      <div className="flex-1">
        <h3 className={`font-medium ${isCompletedToday ? "text-gray-400 line-through" : "text-gray-900"}`}>
          {habit.title}
        </h3>
        {habit.description && (
          <p className={`text-sm ${isCompletedToday ? "text-gray-400" : "text-gray-500"}`}>{habit.description}</p>
        )}
        {habit.category && (
          <span
            className={`inline-block mt-1 text-xs ${
              isCompletedToday ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-800"
            } px-2 py-0.5 rounded-full`}
          >
            {habit.category}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 capitalize">{habit.frequency}</span>
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
)

export default HomeScreen

