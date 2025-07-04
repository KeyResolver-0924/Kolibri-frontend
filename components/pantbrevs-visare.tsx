"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Deed } from './arkiv';

interface Props {
  pantbrev: Deed
  vidStängning: () => void
}

export function PantbrevsVisare({ pantbrev, vidStängning }: Props) {
  return (
    <Dialog open={true} onOpenChange={vidStängning}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{pantbrev.association} - Lägenhet {pantbrev.apartment}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Detaljer:</h3>
              <dl className="grid grid-cols-2 gap-2">
                <dt className="font-medium">Förening:</dt>
                <dd>{pantbrev.association}</dd>
                <dt className="font-medium">Lägenhet:</dt>
                <dd>{pantbrev.apartment}</dd>
                <dt className="font-medium">Bank:</dt>
                <dd>{pantbrev.bank}</dd>
                <dt className="font-medium">Datum:</dt>
                <dd>{pantbrev.date}</dd>
                <dt className="font-medium">Bankhandläggare:</dt>
                <dd>{pantbrev.bankEmployee}</dd>
                <dt className="font-medium">Status:</dt>
                <dd>{pantbrev.status}</dd>
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Pantbrevets innehåll:</h3>
              <div className="border p-4 bg-gray-50 rounded-md">
                <p>Här skulle det faktiska innehållet i pantbrevet visas. I en produktionsmiljö skulle du integrera ett PDF-visningsbibliotek som react-pdf eller pdf.js för att rendera det faktiska PDF-innehållet.</p>
                {Array(20).fill(0).map((_, i) => (
                  <p key={i} className="mt-4">Detta är en exempeltext för att visa scrollningsfunktionen. Rad {i + 1}</p>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

