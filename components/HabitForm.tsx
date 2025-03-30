"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTaskStore } from "../stores/taskStore"
import { Plus } from "lucide-react"

interface HabitFormProps {
  onClose: () => void
  onCreated?: () => void
}

const HabitForm: React.FC<HabitFormProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
  const [category, setCategory] = useState("")
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  const addHabit = useTaskStore((state) => state.addHabit)
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

    addHabit({
      title,
      description,
      frequency,
      category: finalCategory,
    })

    // Los hábitos siempre son relevantes para hoy, así que no necesitamos verificar
    if (onCreated) {
      onCreated()
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

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
          Frequency
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
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
          Create Habit
        </button>
      </div>
    </form>
  )
}

export default HabitForm

