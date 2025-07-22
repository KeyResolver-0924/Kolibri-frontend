"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ShoppingCartProps {
  basePrice: number;
  users: number;
  period: "3" | "12";
  addons: string[];
  onContinue: () => void;
}

export function ShoppingCart({
  basePrice,
  users,
  period,
  addons,
  onContinue,
}: ShoppingCartProps) {
  const totalPrice = basePrice * users + addons.reduce((sum) => sum + 100, 0);

  return (
    <Card className="w-full sticky top-4">
      <CardHeader>
        <CardTitle>Din varukorg</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Program</span>
            <span>Användare</span>
            <span>Månadskostnad</span>
          </div>
          <motion.div
            key={`base-${users}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between"
          >
            <span>Kolibri Bas</span>
            <span>{users}</span>
            <span>{basePrice * users} kr</span>
          </motion.div>
          <AnimatePresence>
            {addons.map((addon, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-between"
              >
                <span>{addon}</span>
                <span>1</span>
                <span>100 kr</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <motion.div
          className="pt-4 border-t"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="flex justify-between text-lg font-semibold">
            <span>Månadskostnad</span>
            <span>{totalPrice} kr</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Priser är exklusive moms</p>
        </motion.div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Avtal</span>
            <span>Period</span>
          </div>
          <motion.div
            className="flex justify-between text-sm"
            key={period}
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
          >
            <span>Abonnemang</span>
            <span>{period} mån</span>
          </motion.div>
        </div>
        <Button onClick={onContinue} className="w-full">
          Gå vidare
        </Button>
      </CardContent>
    </Card>
  );
}
