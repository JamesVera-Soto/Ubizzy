"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

type Question = {
  prompt: string;
  type: "multiple" | "text";
  options?: string[];
};

const questions: Question[] = [
  {
    prompt: "How did you hear about UBIZY?",
    type: "multiple",
    options: ["Friend", "Social Media", "Advertisement", "Other"],
  },
  {
    prompt: "What is your main goal with using UBIZY?",
    type: "text",
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(questions.map(() => null));
  const [otherInput, setOtherInput] = useState("");

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (option: string) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = option;
      return newAnswers;
    });
  };

  const handleNext = () => {
    // If the question type is "multiple" and the user selects "Other", use the other input
    if (currentQuestion.type === "multiple" && answers[currentIndex] === "Other") {
      setAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentIndex] = otherInput;
        return newAnswers;
      });
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setOtherInput("");
    } else {
      // At the end of the questionnaire, navigate to the homepage
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Questionnaire</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <p className="mb-4">{currentQuestion.prompt}</p>
        {currentQuestion.type === "multiple" && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className={`w-full px-4 py-2 border rounded ${
                  answers[currentIndex] === option
                    ? "bg-green-100 border-green-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                {option}
              </button>
            ))}
            {answers[currentIndex] === "Other" && (
              <input
                type="text"
                value={otherInput}
                onChange={(e) => setOtherInput(e.target.value)}
                placeholder="Please specify"
                className="mt-2 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            )}
          </div>
        )}
        {currentQuestion.type === "text" && (
          <textarea
            value={answers[currentIndex] || ""}
            onChange={(e) =>
              setAnswers((prev) => {
                const newAnswers = [...prev];
                newAnswers[currentIndex] = e.target.value;
                return newAnswers;
              })
            }
            rows={4}
            className="mt-2 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        )}
        <div className="mt-6 flex justify-end">
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Check className="w-5 h-5" /> Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}