"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeedAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adjustments: string) => void;
  deedData: {
    förening: string;
    lägenhetsnummer: string;
    pantnummer: string;
    incomingDate: string;
    currentDraft: string;
    feedback: string;
  };
}

export function DeedAdjustmentModal({
  isOpen,
  onClose,
  onSave,
  deedData,
}: DeedAdjustmentModalProps) {
  const [adjustments, setAdjustments] = useState(deedData.currentDraft);

  const handleSave = () => {
    onSave(adjustments);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Justera inteckning</DialogTitle>
          <DialogDescription>
            Granska feedback och gör nödvändiga justeringar i inteckningen
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
          <div>
            <h3 className="mb-2 font-bold">Feedback:</h3>
            <ScrollArea className="h-[100px] w-full rounded-md border p-4">
              {deedData.feedback}
            </ScrollArea>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Nuvarande utkast:</h3>
            <Textarea
              value={adjustments}
              onChange={(e) => setAdjustments(e.target.value)}
              className="h-[200px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleSave}>Spara ändringar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
