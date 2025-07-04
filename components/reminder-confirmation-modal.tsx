import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReminderConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  deedData: {
    förening: string
    lägenhetsnummer: string
    incomingDate: string
  }
}

export function ReminderConfirmationModal({ isOpen, onClose, onConfirm, deedData }: ReminderConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bekräfta påminnelse</DialogTitle>
          <DialogDescription>
            Är du säker på att du vill skicka en påminnelse för denna inteckning?
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
            <span className="font-bold">Inkommande datum:</span>
            <span>{deedData.incomingDate}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Avbryt</Button>
          <Button onClick={onConfirm}>Skicka påminnelse</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

