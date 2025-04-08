"use client"

import { User, LogOut, BarChart2, ArrowLeft, Home, CalendarIcon, Bot } from "lucide-react"
import Image from "next/image"
import ChatBot from "@/components/ChatBot"
import { useTaskStore } from "@/stores/taskStore"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
    const router = useRouter();
    const [showChatBot, setShowChatBot] = useState(false)

    return (
        <div>
            <header className="bg-purple-600 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
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
                    <h1 className="text-2xl font-bold text-white">Sign Up</h1>
                </div>
                </div>
            </header>

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                    <form className="space-y-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Email</label>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"></input>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Password</label>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"></input>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"></input>
                        <button
                        type="submit"
                        className="bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                        Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}