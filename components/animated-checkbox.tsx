import { motion } from "framer-motion"
import { Check } from 'lucide-react'

interface AnimatedCheckboxProps {
  checked: boolean
}

export function AnimatedCheckbox({ checked }: AnimatedCheckboxProps) {
  return (
    <motion.div
      initial={false}
      animate={checked ? "checked" : "unchecked"}
      className={`w-6 h-6 rounded-full flex items-center justify-center ${
        checked ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <motion.div
        variants={{
          checked: { scale: 1 },
          unchecked: { scale: 0 },
        }}
        transition={{ duration: 0.2 }}
      >
        <Check className="w-4 h-4 text-white" />
      </motion.div>
    </motion.div>
  )
}

