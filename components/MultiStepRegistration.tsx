"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, HelpCircle, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type RegistrationType = "förening" | "förvaltare";

const STEPS = [
  { number: 1, title: "Företagsuppgifter" },
  { number: 2, title: "Välj paket" },
  { number: 3, title: "Granska & beställ" },
];

export function MultiStepRegistration({ type }: { type: RegistrationType }) {
  const [step, setStep] = useState(1);
  const [orgInfo, setOrgInfo] = useState("");
  const [users, setUsers] = useState(1);
  const [period, setPeriod] = useState<"3" | "12">("12");
  const [selectedPackage, setSelectedPackage] = useState("basic");

  const packages = {
    basic: {
      name: "Bas",
      price: 299,
      features: [
        "Grundläggande inteckningshantering",
        "Upp till 5 användare",
        "E-postsupport",
      ],
    },
    pro: {
      name: "Pro",
      price: 499,
      features: [
        "Allt i Bas",
        "Obegränsat antal användare",
        "Prioriterad support",
        "Avancerad rapportering",
      ],
    },
    enterprise: {
      name: "Enterprise",
      price: 999,
      features: [
        "Allt i Pro",
        "Dedikerad kontoansvarig",
        "Anpassade integrationer",
        "24/7 support",
      ],
    },
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Företagsuppgifter</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgInfo">
                  Organisationsnummer eller företagsnamn
                </Label>
                <Input
                  id="orgInfo"
                  value={orgInfo}
                  onChange={(e) => setOrgInfo(e.target.value)}
                  placeholder="Sök eller fyll i manuellt"
                />
              </div>
              <p className="text-sm text-gray-500">
                Kan du inte hitta ditt företag?{" "}
                <Link href="#" className="text-emerald-600 hover:underline">
                  Klicka här för hjälp
                </Link>
              </p>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Välj paket</h2>
            <Tabs
              defaultValue="basic"
              onValueChange={(value) => setSelectedPackage(value)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Bas</TabsTrigger>
                <TabsTrigger value="pro">Pro</TabsTrigger>
                <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
              </TabsList>
              {Object.entries(packages).map(([key, pack]) => (
                <TabsContent key={key} value={key}>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
                      <p className="text-2xl font-bold mb-4">
                        {pack.price} kr/mån
                      </p>
                      <ul className="space-y-2">
                        {pack.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Avtalsperiod</Label>
                <RadioGroup
                  value={period}
                  onValueChange={(value) => setPeriod(value as "3" | "12")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="3months" />
                    <Label htmlFor="3months">3 månader</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12" id="12months" />
                    <Label htmlFor="12months">
                      12 månader (2 månader gratis)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Granska & beställ</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Valt paket:</span>
                  <span>
                    {packages[selectedPackage as keyof typeof packages].name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Pris per månad:</span>
                  <span>
                    {packages[selectedPackage as keyof typeof packages].price}{" "}
                    kr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Avtalsperiod:</span>
                  <span>{period} månader</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Totalt:</span>
                  <span>
                    {packages[selectedPackage as keyof typeof packages].price *
                      (period === "3" ? 3 : 10)}{" "}
                    kr
                  </span>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-gray-500">
              Genom att klicka på "Slutför beställning" godkänner du våra{" "}
              <Link href="#" className="text-emerald-600 hover:underline">
                villkor
              </Link>{" "}
              och{" "}
              <Link href="#" className="text-emerald-600 hover:underline">
                integritetspolicy
              </Link>
              .
            </p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-800 text-white p-4">
        <div className="container mx-auto">
          <Link href="/" className="text-2xl font-bold">
            Kolibri
          </Link>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            {step > 1 && (
              <Button
                variant="ghost"
                className="text-emerald-600"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tillbaka
              </Button>
            )}
            <div className="flex space-x-2">
              {STEPS.map((s) => (
                <div
                  key={s.number}
                  className={cn(
                    "w-3 h-3 rounded-full",
                    step >= s.number ? "bg-emerald-500" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
          <Card className="w-full">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </CardContent>
          </Card>
          <div className="mt-6 flex justify-end">
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Nästa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => console.log("Order submitted")}>
                Slutför beställning
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MultiStepRegistration;
