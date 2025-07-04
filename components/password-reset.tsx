'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function PasswordReset({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically call an API to handle the password reset
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-blue-800">Återställningslänk skickad</h2>
          <p className="text-sm text-gray-600">
            Kolla din e-post för instruktioner om hur du återställer ditt lösenord.
          </p>
        </div>
        <Button 
          onClick={onBack}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Tillbaka till inloggning
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-blue-800">Återställ lösenord</h2>
        <p className="text-sm text-gray-600">
          Ange din e-postadress för att få en återställningslänk.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
            E-postadress
          </label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@email.com"
            required
            className="mt-1 w-full"
          />
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Skicka återställningslänk
        </Button>
      </form>
      <Button 
        variant="outline" 
        onClick={onBack}
        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
      >
        Tillbaka till inloggning
      </Button>
    </div>
  )
}

