import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeedPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSign: () => void
  deedData: {
    förening: string
    lägenhetsnummer: string
    pantnummer: string
    incomingDate: string
  }
}

export function DeedPreviewModal({ isOpen, onClose, onSign, deedData }: DeedPreviewModalProps) {
  const [isSigningInProgress, setIsSigningInProgress] = useState(false)

  const handleSign = async () => {
    setIsSigningInProgress(true)
    // Simulate BankID signing process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSigningInProgress(false)
    onSign()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Förhandsgranska och signera inteckning</DialogTitle>
          <DialogDescription>
            Granska informationen nedan och signera med BankID
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-bold">Förening:</span>
            <span>{deedData.förening}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-bold">Lägenhetsnummer:</span>
            <span>{deedData.lägenhetsnummer}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-bold">Pantnummer:</span>
            <span>{deedData.pantnummer}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-bold">Inkommande datum:</span>
            <span>{deedData.incomingDate}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Avbryt</Button>
          <Button onClick={handleSign} disabled={isSigningInProgress}>
            {isSigningInProgress ? 'Signerar...' : 'Signera med BankID'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

