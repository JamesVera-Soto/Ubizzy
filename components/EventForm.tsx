"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTaskStore } from "../stores/taskStore"
import { Plus } from "lucide-react"
import { format } from "date-fns"

interface EventFormProps {
  onClose: () => void
  onCreated?: (isForToday: boolean) => void
}

const EventForm: React.FC<EventFormProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isStatic, setIsStatic] = useState(false)
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [category, setCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  const addEvent = useTaskStore((state) => state.addEvent)

  const { tasks, events, habits } = useTaskStore()

  useEffect(() => {
    const allCategories = new Set(
      [
        ...tasks.map((task) => task.category),
        ...events.map((event) => event.category),
        ...habits.map((habit) => habit.category),
      ].filter(Boolean),
    )

    setCategories(Array.from(allCategories) as string[])
  }, [tasks, events, habits])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Si estamos en modo de nueva categoría, usamos el valor de newCategory
    const finalCategory = showCategoryInput ? newCategory : category

    const startDatetime = new Date(`${startDate}T${startTime || "00:00"}`)
    const endDatetime = new Date(`${endDate}T${endTime || "23:59"}`)

    addEvent({
      title,
      description,
      startDate: startDatetime,
      endDate: endDatetime,
      isStatic,
      category: finalCategory,
    })

    // Verificar si el evento es para hoy
    const today = new Date()
    const isForToday =
      format(startDatetime, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ||
      format(endDatetime, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ||
      (startDatetime < today && endDatetime > today)

    if (onCreated) {
      onCreated(isForToday)
    }

    onClose()
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory)
      if (!categories.includes(newCategory)) {
        setCategories([...categories, newCategory])
      }
      setShowCategoryInput(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="mt-1 relative">
          {showCategoryInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="New category name"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryInput(true)
                  setNewCategory("")
                }}
                className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isStatic"
          checked={isStatic}
          onChange={(e) => setIsStatic(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="isStatic" className="ml-2 block text-sm text-gray-900">
          Static scheduling (fixed time)
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Create Event
        </button>
      </div>
    </form>
  )
}

export default EventForm

