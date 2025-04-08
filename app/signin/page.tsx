"use client";

import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const handleSignIn = () => {
    // For demo, simply redirect to homepage
    router.push("/home");
  };

  const handleCreateAccount = () => {
    // Redirect to the create account page
    router.push("/signup");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Welcome to UBIZY</h1>
      <div className="space-x-4">
        <button 
          onClick={handleSignIn} 
          className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Sign In
        </button>
        <button 
          onClick={handleCreateAccount} 
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create an Account
        </button>
      </div>
    </div>
  );
}