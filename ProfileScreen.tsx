"use client"
import { useAuthStore } from "../stores/authStore"
import { useTaskStore } from "../stores/taskStore"
import { User, LogOut, BarChart2 } from "lucide-react"

const ProfileScreen = () => {
  const { user, logout } = useAuthStore()
  const { tasks, events, habits } = useTaskStore()

  const categories = new Set(
    [
      ...tasks.map((task) => task.category),
      ...events.map((event) => event.category),
      ...habits.map((habit) => habit.category),
    ].filter(Boolean),
  )

  const getCategoryStats = (category: string) => {
    return {
      tasks: tasks.filter((task) => task.category === category).length,
      events: events.filter((event) => event.category === category).length,
      habits: habits.filter((habit) => habit.category === category).length,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 font-medium">Tasks</div>
                <div className="text-2xl font-bold text-purple-700">{tasks.length}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 font-medium">Events</div>
                <div className="text-2xl font-bold text-blue-700">{events.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 font-medium">Habits</div>
                <div className="text-2xl font-bold text-green-700">{habits.length}</div>
              </div>
            </div>
          </div>

          {/* Categories */}
          {categories.size > 0 && (
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-4">
                {Array.from(categories).map((category, index) => {
                  const stats = getCategoryStats(category!)
                  // Create an array of colors to cycle through
                  const colors = ["purple", "blue", "green", "pink", "orange", "indigo"]
                  const colorIndex = index % colors.length
                  const color = colors[colorIndex]

                  return (
                    <div key={category} className={`bg-${color}-50 p-4 rounded-lg border border-${color}-100`}>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart2 className={`w-5 h-5 text-${color}-500`} />
                        <h4 className="font-medium text-gray-900">{category}</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-purple-600">{stats.tasks}</span> tasks
                        </div>
                        <div>
                          <span className="text-blue-600">{stats.events}</span> events
                        </div>
                        <div>
                          <span className="text-green-600">{stats.habits}</span> habits
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6">
            <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileScreen

