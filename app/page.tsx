"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time to show splash screen
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-600 flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-white rounded-full p-2 mb-4 animate-pulse">
          <Image src="/logo.webp" alt="Ubizy Logo" width={120} height={120} className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Ubizy</h1>
        <p className="text-purple-200">Your AI-powered assistant</p>
      </div>
    )
  }
  router.push('signin');
}

