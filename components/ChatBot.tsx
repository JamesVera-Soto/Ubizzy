"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, X, Bot, Sparkles, Plus, CheckCircle2, CalendarIcon, Repeat } from "lucide-react"
import { useTaskStore } from "../stores/taskStore"
import { format, addDays } from "date-fns"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  suggestion?: {
    type: "task" | "event" | "habit"
    title: string
    description?: string
    date?: string
    time?: string
    endDate?: string
    endTime?: string
    frequency?: "daily" | "weekly" | "monthly"
    category?: string
  }
}

interface ChatBotProps {
  onClose: () => void
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm Ubizy Assistant. I can help you manage your tasks, events, and habits. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addTask, addEvent, addHabit } = useTaskStore()

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Process the user's message and generate a response
      const botResponse = await processUserMessage(input)
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error("Error processing message:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: "I'm sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const processUserMessage = async (message: string): Promise<Message> => {
    // Simulate AI processing with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check for task creation intent
    if (message.toLowerCase().includes("create task") || message.toLowerCase().includes("add task")) {
      const taskTitle = extractTitle(message)
      const dueDate = extractDate(message) || format(new Date(), "yyyy-MM-dd")
      const dueTime = extractTime(message) || "12:00"
      const description = extractDescription(message)
      const category = extractCategory(message)

      return {
        id: crypto.randomUUID(),
        content: `I can help you create a task "${taskTitle}". Would you like me to add it?`,
        sender: "bot",
        timestamp: new Date(),
        suggestion: {
          type: "task",
          title: taskTitle,
          description,
          date: dueDate,
          time: dueTime,
          category,
        },
      }
    }

    // Check for event creation intent
    if (
      message.toLowerCase().includes("create event") ||
      message.toLowerCase().includes("add event") ||
      message.toLowerCase().includes("schedule")
    ) {
      const eventTitle = extractTitle(message)
      const startDate = extractDate(message) || format(new Date(), "yyyy-MM-dd")
      const startTime = extractTime(message) || "12:00"
      const endDate = extractEndDate(message) || startDate
      const endTime = extractEndTime(message) || "13:00"
      const description = extractDescription(message)
      const category = extractCategory(message)

      return {
        id: crypto.randomUUID(),
        content: `I can help you create an event "${eventTitle}". Would you like me to add it?`,
        sender: "bot",
        timestamp: new Date(),
        suggestion: {
          type: "event",
          title: eventTitle,
          description,
          date: startDate,
          time: startTime,
          endDate,
          endTime,
          category,
        },
      }
    }

    // Check for habit creation intent
    if (message.toLowerCase().includes("create habit") || message.toLowerCase().includes("add habit")) {
      const habitTitle = extractTitle(message)
      const frequency = extractFrequency(message)
      const description = extractDescription(message)
      const category = extractCategory(message)

      return {
        id: crypto.randomUUID(),
        content: `I can help you create a ${frequency} habit "${habitTitle}". Would you like me to add it?`,
        sender: "bot",
        timestamp: new Date(),
        suggestion: {
          type: "habit",
          title: habitTitle,
          description,
          frequency,
          category,
        },
      }
    }

    // Handle productivity tips
    if (
      message.toLowerCase().includes("productivity") ||
      message.toLowerCase().includes("tips") ||
      message.toLowerCase().includes("advice")
    ) {
      return {
        id: crypto.randomUUID(),
        content: getRandomProductivityTip(),
        sender: "bot",
        timestamp: new Date(),
      }
    }

    // Handle help request
    if (message.toLowerCase().includes("help") || message.toLowerCase().includes("how to")) {
      return {
        id: crypto.randomUUID(),
        content: `Here are some things I can help you with:
        
1. Create tasks, events, or habits by typing "create [type] [title]"
2. Get productivity tips by asking for "productivity tips"
3. Ask me how to use any feature in the app
4. Get suggestions for organizing your schedule

Try asking me to create a task for you!`,
        sender: "bot",
        timestamp: new Date(),
      }
    }

    // Default response
    return {
      id: crypto.randomUUID(),
      content: getDefaultResponse(),
      sender: "bot",
      timestamp: new Date(),
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCreateSuggestion = (suggestion: Message["suggestion"]) => {
    if (!suggestion) return

    try {
      switch (suggestion.type) {
        case "task":
          addTask({
            title: suggestion.title,
            description: suggestion.description || "",
            dueDate: new Date(`${suggestion.date}T${suggestion.time}`),
            completed: false,
            isStatic: false,
            category: suggestion.category,
          })
          break
        case "event":
          addEvent({
            title: suggestion.title,
            description: suggestion.description || "",
            startDate: new Date(`${suggestion.date}T${suggestion.time}`),
            endDate: new Date(`${suggestion.endDate}T${suggestion.endTime}`),
            isStatic: false,
            category: suggestion.category,
          })
          break
        case "habit":
          addHabit({
            title: suggestion.title,
            description: suggestion.description || "",
            frequency: suggestion.frequency || "daily",
            category: suggestion.category,
          })
          break
      }

      // Add confirmation message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: `I've created the ${suggestion.type} "${suggestion.title}" for you.`,
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error creating item:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: "I'm sorry, I couldn't create that item. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }

  // Helper functions for extracting information from messages
  const extractTitle = (message: string): string => {
    // Try to extract title after "create task", "add task", etc.
    const titleMatch = message.match(
      /(?:create|add) (?:task|event|habit|schedule)(?: called| titled| named)? ["']?([^"']+)["']?/i,
    )
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim()
    }

    // If no specific title format, just take the text after the command
    const simpleMatch = message.match(/(?:create|add) (?:task|event|habit|schedule) (.+)/i)
    if (simpleMatch && simpleMatch[1]) {
      // Remove date/time/description parts if present
      let title = simpleMatch[1]
      title = title.replace(
        /(?:on|at|for) (?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|next month|in \d+ days?)/i,
        "",
      )
      title = title.replace(
        /(?:at|from) \d{1,2}(?::\d{2})? ?(?:am|pm)?(?:-|to| until) ?\d{1,2}(?::\d{2})? ?(?:am|pm)?/i,
        "",
      )
      title = title.replace(/with description ["']?[^"']+["']?/i, "")
      return title.trim()
    }

    // Default title if nothing else works
    return "New " + (message.includes("task") ? "Task" : message.includes("event") ? "Event" : "Habit")
  }

  const extractDate = (message: string): string | undefined => {
    const today = new Date()

    // Check for "today"
    if (message.toLowerCase().includes("today")) {
      return format(today, "yyyy-MM-dd")
    }

    // Check for "tomorrow"
    if (message.toLowerCase().includes("tomorrow")) {
      return format(addDays(today, 1), "yyyy-MM-dd")
    }

    // Check for "in X days"
    const inDaysMatch = message.match(/in (\d+) days?/i)
    if (inDaysMatch && inDaysMatch[1]) {
      const daysToAdd = Number.parseInt(inDaysMatch[1])
      return format(addDays(today, daysToAdd), "yyyy-MM-dd")
    }

    // Check for specific date format (MM/DD/YYYY or MM-DD-YYYY)
    const dateMatch = message.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/i)
    if (dateMatch) {
      try {
        const month = Number.parseInt(dateMatch[1]) - 1 // JS months are 0-indexed
        const day = Number.parseInt(dateMatch[2])
        const year = Number.parseInt(dateMatch[3])
        return format(new Date(year, month, day), "yyyy-MM-dd")
      } catch (e) {
        console.error("Error parsing date:", e)
      }
    }

    return undefined
  }

  const extractTime = (message: string): string | undefined => {
    // Check for time format (HH:MM AM/PM or HH AM/PM)
    const timeMatch = message.match(/at (\d{1,2})(?::(\d{2}))? ?(am|pm)?/i)
    if (timeMatch) {
      let hours = Number.parseInt(timeMatch[1])
      const minutes = timeMatch[2] ? Number.parseInt(timeMatch[2]) : 0
      const period = timeMatch[3] ? timeMatch[3].toLowerCase() : undefined

      // Adjust hours for PM
      if (period === "pm" && hours < 12) {
        hours += 12
      }
      // Adjust for 12 AM
      if (period === "am" && hours === 12) {
        hours = 0
      }

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    }

    return undefined
  }

  const extractEndDate = (message: string): string | undefined => {
    // For simplicity, use the same date as start date unless specified
    return extractDate(message)
  }

  const extractEndTime = (message: string): string | undefined => {
    // Check for end time format (until HH:MM AM/PM or to HH AM/PM)
    const endTimeMatch = message.match(/(?:until|to) (\d{1,2})(?::(\d{2}))? ?(am|pm)?/i)
    if (endTimeMatch) {
      let hours = Number.parseInt(endTimeMatch[1])
      const minutes = endTimeMatch[2] ? Number.parseInt(endTimeMatch[2]) : 0
      const period = endTimeMatch[3] ? endTimeMatch[3].toLowerCase() : undefined

      // Adjust hours for PM
      if (period === "pm" && hours < 12) {
        hours += 12
      }
      // Adjust for 12 AM
      if (period === "am" && hours === 12) {
        hours = 0
      }

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    }

    // If no end time specified, default to 1 hour after start time
    const startTime = extractTime(message)
    if (startTime) {
      try {
        const [hours, minutes] = startTime.split(":").map(Number)
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        date.setHours(date.getHours() + 1)
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
      } catch (e) {
        console.error("Error calculating end time:", e)
      }
    }

    return undefined
  }

  const extractDescription = (message: string): string | undefined => {
    // Check for description in quotes
    const descMatch = message.match(/with description ["']([^"']+)["']/i)
    if (descMatch && descMatch[1]) {
      return descMatch[1].trim()
    }

    // Check for description after "described as"
    const descMatch2 = message.match(/described as ["']?([^"']+)["']?/i)
    if (descMatch2 && descMatch2[1]) {
      return descMatch2[1].trim()
    }

    return undefined
  }

  const extractCategory = (message: string): string | undefined => {
    // Check for category in quotes
    const catMatch = message.match(/in category ["']([^"']+)["']/i)
    if (catMatch && catMatch[1]) {
      return catMatch[1].trim()
    }

    // Check for category after "in" or "under"
    const catMatch2 = message.match(/(?:in|under) (?:the )?category ["']?([^"']+)["']?/i)
    if (catMatch2 && catMatch2[1]) {
      return catMatch2[1].trim()
    }

    return undefined
  }

  const extractFrequency = (message: string): "daily" | "weekly" | "monthly" => {
    if (message.toLowerCase().includes("daily")) return "daily"
    if (message.toLowerCase().includes("weekly")) return "weekly"
    if (message.toLowerCase().includes("monthly")) return "monthly"
    return "daily" // Default to daily
  }

  const getRandomProductivityTip = (): string => {
    const tips = [
      "Try the Pomodoro Technique: work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break.",
      "Plan your most important tasks for the morning when your energy levels are typically higher.",
      "Use the 2-minute rule: if a task takes less than 2 minutes, do it immediately instead of scheduling it.",
      "Group similar tasks together to minimize context switching and improve focus.",
      "Schedule buffer time between meetings and tasks to avoid feeling rushed.",
      "Try time-blocking your calendar to dedicate specific hours to specific types of work.",
      "Review your upcoming week every Sunday to prepare mentally for what's ahead.",
      "Set clear boundaries between work and personal time to avoid burnout.",
      "Break large projects into smaller, manageable tasks to make progress more visible.",
      "Consider using the Eisenhower Matrix to prioritize tasks: urgent/important, not urgent/important, urgent/not important, and not urgent/not important.",
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  }

  const getDefaultResponse = (): string => {
    const responses = [
      "I'm here to help you manage your tasks and time better. Try asking me to create a task, event, or habit.",
      "I can help you organize your schedule. Ask me about creating tasks or events, or request productivity tips.",
      "Need help with time management? I can create tasks and events for you, or provide productivity advice.",
      "I'm your productivity assistant. Try asking me to create a task for tomorrow, schedule an event, or start a new habit.",
      "Not sure what to ask? Try 'Give me a productivity tip' or 'Create a task for tomorrow'.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-semibold text-lg">Ubizy Assistant</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Suggestion action buttons */}
                {message.suggestion && (
                  <div className="mt-3 bg-white rounded-md p-2 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      {message.suggestion.type === "task" && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      {message.suggestion.type === "event" && <CalendarIcon className="w-4 h-4 text-blue-600" />}
                      {message.suggestion.type === "habit" && <Repeat className="w-4 h-4 text-green-600" />}
                      <span className="text-sm font-medium text-gray-900">{message.suggestion.title}</span>
                    </div>

                    {message.suggestion.description && (
                      <p className="text-xs text-gray-500 mb-2">{message.suggestion.description}</p>
                    )}

                    {message.suggestion.type === "task" && message.suggestion.date && (
                      <div className="text-xs text-gray-500 mb-2">
                        Due:{" "}
                        {format(
                          new Date(`${message.suggestion.date}T${message.suggestion.time || "00:00"}`),
                          "MMM d, yyyy h:mm a",
                        )}
                      </div>
                    )}

                    {message.suggestion.type === "event" && message.suggestion.date && (
                      <div className="text-xs text-gray-500 mb-2">
                        From:{" "}
                        {format(
                          new Date(`${message.suggestion.date}T${message.suggestion.time || "00:00"}`),
                          "MMM d, yyyy h:mm a",
                        )}
                        <br />
                        To:{" "}
                        {format(
                          new Date(`${message.suggestion.endDate}T${message.suggestion.endTime || "00:00"}`),
                          "MMM d, yyyy h:mm a",
                        )}
                      </div>
                    )}

                    {message.suggestion.type === "habit" && (
                      <div className="text-xs text-gray-500 mb-2">
                        Frequency: {message.suggestion.frequency || "daily"}
                      </div>
                    )}

                    {message.suggestion.category && (
                      <div className="text-xs text-gray-500 mb-2">Category: {message.suggestion.category}</div>
                    )}

                    <button
                      onClick={() => handleCreateSuggestion(message.suggestion)}
                      className="w-full mt-1 bg-purple-600 text-white text-xs py-1 px-2 rounded flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Create {message.suggestion.type}</span>
                    </button>
                  </div>
                )}

                <div className="text-xs mt-1 opacity-70">{format(message.timestamp, "h:mm a")}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-full bg-purple-600 text-white disabled:bg-purple-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Try: "Create a task to review project tomorrow at 10am"</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot

