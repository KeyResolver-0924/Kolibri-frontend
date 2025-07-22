"use client";

import {
  BuildingLibraryIcon,
  CalculatorIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const userTypes = [
  {
    id: "bank",
    title: "Bank",
    description: "For banks managing mortgage deeds",
    icon: BuildingLibraryIcon,
  },
  {
    id: "accounting",
    title: "Accounting Firm",
    description: "For accounting firms helping housing cooperatives",
    icon: CalculatorIcon,
  },
  {
    id: "cooperative",
    title: "Housing Cooperative (Admin)",
    description: "Create and manage a housing cooperative",
    icon: BuildingOffice2Icon,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Streamline Your Mortgage Operations
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Efficient digital platform for managing mortgage deeds and housing
              cooperatives
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button variant="default" size="lg">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* User type selection */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Choose Your Role
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Select your role to get started with our platform
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {userTypes.map((type) => (
                <div key={type.id} className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                      <type.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    {type.title}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{type.description}</p>
                    <p className="mt-6">
                      <Link href={`/signup?type=${type.id}`}>
                        <Button>Get started</Button>
                      </Link>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-mortgage-gray text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Kolibri</h3>
            <p className="text-black/70 mb-8">
              Revolutionizing mortgage operations for modern financial
              institutions.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-black/70">
              <a href="#" className="hover:text-black transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
