'use client'

import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion } from 'framer-motion'

interface ProgressStepsProps {
  currentStep: number
  steps: Array<{
    title: string
    number: number
  }>
}

export function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="relative flex justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2",
              currentStep > step.number
                ? "border-emerald-600 bg-emerald-600 text-white"
                : currentStep === step.number
                ? "border-pink-400 bg-pink-400 text-white"
                : "border-gray-300 bg-white"
            )}
          >
            {currentStep > step.number ? (
              <Check className="h-6 w-6" />
            ) : (
              <span>{step.number}</span>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 + 0.1 }}
            className="ml-4"
          >
            <p className="text-sm font-medium">{step.title}</p>
          </motion.div>
          {index < steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.2 + 0.2, duration: 0.5 }}
              className="mx-4 h-[2px] w-20 bg-gray-200 origin-left"
            />
          )}
        </div>
      ))}
    </div>
  )
}

