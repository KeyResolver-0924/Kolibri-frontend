"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { Borrower } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
interface HousingCooperative {
  id: number;
  name: string;
  organisation_number: string;
  address: string;
  city: string;
  postal_code: string;
  administrator_company: string;
  administrator_name: string;
  administrator_person_number: string;
  administrator_email: string;
}

interface HousingCooperativeSigner {
  administrator_name: string;
  administrator_person_number: string;
  administrator_email: string;
}

interface BoardMember {
  firstName: string;
  lastName: string;
  personNumber: string;
  email: string;
}

interface BoardMemberSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (boardMember: BoardMember) => void;
  signingRule: "one" | "two";
  currentSigners: HousingCooperativeSigner[];
  onRemove: (index: number) => void;
}

interface MortgageDeedCreate {
  credit_number: string;
  created_date: Date;
  housing_cooperative_id: number;
  apartment_address: string;
  apartment_postal_code: string;
  apartment_city: string;
  apartment_number: string;
  borrowers: Array<{
    name: string;
    person_number: string;
    email: string;
    ownership_percentage: number;
  }>;
  housing_cooperative_signers: HousingCooperativeSigner[];
}

interface SkapaPantbrevProps {
  deedId?: string;
}

// Validation Schema
const borrowerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  person_number: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits"),
  email: z.string().email("Invalid email address").max(100),
  ownership_percentage: z.number()
    .min(0.01, "Must be greater than 0")
    .max(100, "Must be less than or equal to 100"),
});

const housingCooperativeSignerSchema = z.object({
  administrator_name: z.string().min(1, "Name is required").max(100),
  administrator_person_number: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits"),
  administrator_email: z.string().email("Invalid email address").max(100),
});

const formSchema = z.object({
  credit_number: z.string().min(1, "Credit number is required").max(50),
  created_date: z.date(),
  housing_cooperative_id: z.number({
    required_error: "Please select a housing cooperative",
  }),
  // Housing Cooperative Details
  organization_number: z.string().optional(),
  cooperative_name: z.string().optional(),
  cooperative_address: z.string().optional(),
  cooperative_postal_code: z.string().optional(),
  cooperative_city: z.string().optional(),
  administrator_company: z.string().optional(),
  administrator_name: z.string().optional(),
  administrator_person_number: z.string().optional(),
  administrator_email: z.string().optional(),
  // Apartment Details
  apartment_address: z.string().min(1, "Apartment address is required").max(100),
  apartment_postal_code: z.string().min(1, "Postal code is required").max(10),
  apartment_city: z.string().min(1, "City is required").max(50),
  apartment_number: z.string().min(1, "Apartment number is required").max(20),
  borrowers: z.array(borrowerSchema)
    .min(1, "At least one borrower is required")
    .refine(
      (borrowers) => {
        const total = borrowers.reduce((sum, b) => sum + b.ownership_percentage, 0);
        return Math.abs(total - 100) < 0.01; // Allow for floating point imprecision
      },
      { message: "Total ownership percentage must equal 100%" }
    ),
  housing_cooperative_signers: z.array(housingCooperativeSignerSchema)
    .min(1, "At least one cooperative signer is required")
    .refine(
      (signers) => {
        const personNumbers = signers.map(s => s.administrator_person_number);
        return new Set(personNumbers).size === personNumbers.length;
      },
      { message: "Duplicate person numbers are not allowed" }
    ),
});

type FormData = z.infer<typeof formSchema>;

function BoardMemberSelectionDialog({ 
  isOpen, 
  onClose, 
  onSelect, 
  signingRule, 
  currentSigners,
  onRemove 
}: BoardMemberSelectionDialogProps) {
  // Example board members for testing
  const testBoardMembers: BoardMember[] = [
    { firstName: "Anna", lastName: "Andersson", personNumber: "197505121234", email: "anna.andersson@example.com" },
    { firstName: "Erik", lastName: "Eriksson", personNumber: "196403154321", email: "erik.eriksson@example.com" },
    { firstName: "Maria", lastName: "Svensson", personNumber: "198112087890", email: "maria.svensson@example.com" },
    { firstName: "Lars", lastName: "Lindberg", personNumber: "195908235678", email: "lars.lindberg@example.com" },
  ];

  const isSelected = (member: BoardMember) => {
    return currentSigners.some(signer => signer.administrator_person_number === member.personNumber);
  };

  const handleToggle = (member: BoardMember) => {
    if (isSelected(member)) {
      // Remove the member from signers
      const signerToRemove = currentSigners.find(
        signer => signer.administrator_person_number === member.personNumber
      );
      if (signerToRemove) {
        const index = currentSigners.indexOf(signerToRemove);
        onRemove(index);
      }
    } else {
      // Add the member as a signer
      onSelect(member);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-left space-y-4">
          <div className="flex items-center space-x-4">
            <img 
              src="/images/bolagsverket.webp" 
              alt="Bolagsverket" 
              className="h-16 w-auto"
            />
            <DialogTitle>Välj styrelsemedlem</DialogTitle>
          </div>
          <DialogDescription>
            {signingRule === "one" ? 
              "En styrelsemedlem krävs för att signera pantbrevet" : 
              "Två styrelsemedlemmar krävs för att signera pantbrevet"}
          </DialogDescription>
          <div className="text-sm text-muted-foreground">
            Styrelsemedlemmar hämtade från Bolagsverket
          </div>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {testBoardMembers.map((member) => {
              const selected = isSelected(member);
              return (
                <div
                  key={member.personNumber}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer",
                    selected && "border-primary bg-accent"
                  )}
                  onClick={() => handleToggle(member)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{member.firstName} {member.lastName}</p>
                    <p className="text-sm text-muted-foreground">{member.personNumber}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className={cn(
                    "w-4 h-4 border-2 rounded-full",
                    selected ? "bg-primary border-primary" : "border-gray-300"
                  )} />
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SkapaPantbrev({ deedId }: SkapaPantbrevProps) {
  const [selectedCooperative, setSelectedCooperative] = useState<HousingCooperative | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cooperativeSearchResults, setCooperativeSearchResults] = useState<HousingCooperative[]>([]);
  const [isBoardMemberDialogOpen, setIsBoardMemberDialogOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credit_number: "",
      created_date: new Date(),
      housing_cooperative_id: 0,
      // Housing Cooperative Details
      organization_number: "",
      cooperative_name: "",
      cooperative_address: "",
      cooperative_postal_code: "",
      cooperative_city: "",
      administrator_company: "",
      administrator_name: "",
      administrator_person_number: "",
      administrator_email: "",
      // Apartment Details
      apartment_address: "",
      apartment_postal_code: "",
      apartment_city: "",
      apartment_number: "",
      borrowers: [
        {
          name: "",
          person_number: "",
          email: "",
          ownership_percentage: 100,
        },
      ],
      housing_cooperative_signers: [
        {
          administrator_name: "",
          administrator_person_number: "",
          administrator_email: "",
        },
      ],
    },
  });

  const { fields: borrowerFields, append: appendBorrower, remove: removeBorrower } = useFieldArray({
    control: form.control,
    name: "borrowers",
  });

  const { 
    fields: signerFields, 
    append: appendSigner, 
    remove: removeSigner 
  } = useFieldArray({
    control: form.control,
    name: "housing_cooperative_signers",
  });

  const searchHousingCooperative = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setCooperativeSearchResults([]);
      return;
    }

    try {
      console.log("Searching for:", query);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/housing-cooperatives?page=1&page_size=10&search=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error("Failed to search housing cooperatives");
      
      const data = await response.json();
      console.log("Search results:", data);
      setCooperativeSearchResults(data || []); // Remove .items since the API returns the array directly
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to search housing cooperatives",
        variant: "destructive",
      });
      setCooperativeSearchResults([]);
    }
  }, [supabase, toast]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchHousingCooperative(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchHousingCooperative]);

  useEffect(() => {
    const fetchDeed = async () => {
      if (!deedId) return;

      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new ApiError(401, 'Unauthorized: No session found');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mortgage-deeds/${deedId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new ApiError(response.status, `Failed to fetch deed: ${response.statusText}`);
        }

        const deed = await response.json();
        
        // Pre-fill the form with deed data
        form.reset({
          credit_number: deed.credit_number,
          created_date: new Date(deed.created_at),
          housing_cooperative_id: deed.housing_cooperative.id,
          organization_number: deed.housing_cooperative.organisation_number,
          cooperative_name: deed.housing_cooperative.name,
          cooperative_address: deed.housing_cooperative.address,
          cooperative_postal_code: deed.housing_cooperative.postal_code,
          cooperative_city: deed.housing_cooperative.city,
          administrator_company: deed.housing_cooperative.administrator_company,
          administrator_name: deed.housing_cooperative.administrator_name,
          administrator_person_number: deed.housing_cooperative.administrator_person_number,
          administrator_email: deed.housing_cooperative.administrator_email,
          apartment_address: deed.apartment_address,
          apartment_postal_code: deed.apartment_postal_code,
          apartment_city: deed.apartment_city,
          apartment_number: deed.apartment_number,
          borrowers: deed.borrowers.map((borrower: Borrower) => ({
            ...borrower,
            ownership_percentage: typeof borrower.ownership_percentage === 'string' 
              ? parseFloat((borrower.ownership_percentage as string).replace(',', '.'))
              : borrower.ownership_percentage
          })),
          housing_cooperative_signers: deed.housing_cooperative_signers,
        });

        setSelectedCooperative(deed.housing_cooperative);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Ett oväntat fel uppstod",
            variant: "destructive",
          });
        }
        console.error("Error fetching deed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeed();
  }, [deedId, form, supabase.auth, toast]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new ApiError(401, "No authentication token found");
      }

      const url = deedId 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mortgage-deeds/${deedId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mortgage-deeds`;

      const method = deedId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new ApiError(response.status, "Failed to create mortgage deed");
      }

      toast({
        title: "Success",
        description: deedId ? "Mortgage deed updated successfully" : "Mortgage deed created successfully",
      });

      // Redirect to the deed view page
      const responseData = await response.json();
      router.push(`/pantbrev/${responseData.id}`);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to create mortgage deed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Mortgage Deed Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Deed Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="credit_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter credit number" 
                        maxLength={50}
                        className="max-w-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="created_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Created Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "max-w-md text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Housing Cooperative Card */}
          <Card>
            <CardHeader>
              <CardTitle>Housing Cooperative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                {/* Search field */}
                <div className="relative">
                  <FormLabel>Search Housing Cooperative</FormLabel>
                  <Input
                    type="text"
                    placeholder="Search by name or organization number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                  {cooperativeSearchResults.length > 0 && (
                    <div className="absolute z-50 w-full max-w-md mt-1 bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                      {cooperativeSearchResults.map((coop) => (
                        <div
                          key={coop.id}
                          className="p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => {
                            console.log("Selected cooperative:", coop);
                            setSelectedCooperative(coop);
                            setCooperativeSearchResults([]);
                            setSearchQuery("");
                            form.setValue("housing_cooperative_id", coop.id);
                            form.setValue("organization_number", coop.organisation_number);
                            form.setValue("cooperative_name", coop.name);
                            form.setValue("cooperative_address", coop.address);
                            form.setValue("cooperative_city", coop.city);
                            form.setValue("cooperative_postal_code", coop.postal_code);
                            form.setValue("administrator_company", coop.administrator_company);
                            form.setValue("administrator_name", coop.administrator_name);
                            form.setValue("administrator_person_number", coop.administrator_person_number);
                            form.setValue("administrator_email", coop.administrator_email);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{coop.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{coop.organisation_number}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cooperative Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="organization_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Number</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cooperative_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cooperative_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cooperative_postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cooperative_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Administrator Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="administrator_company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="administrator_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="administrator_person_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Person Number</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="administrator_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Housing Cooperative Signers */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Cooperative Signers</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBoardMemberDialogOpen(true)}
                    disabled={form.watch("housing_cooperative_id") === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Fetch Board Members
                  </Button>
                </div>
                {signerFields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Signer {index + 1}</h4>
                      {signerFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSigner(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`housing_cooperative_signers.${index}.administrator_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter full name" maxLength={100} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`housing_cooperative_signers.${index}.administrator_person_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Person Number (12 digits)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="YYYYMMDDXXXX" maxLength={12} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`housing_cooperative_signers.${index}.administrator_email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="Enter email address" maxLength={100} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <BoardMemberSelectionDialog
                isOpen={isBoardMemberDialogOpen}
                onClose={() => setIsBoardMemberDialogOpen(false)}
                onSelect={(boardMember) => {
                  // Find first empty signer or append new one
                  const emptySignerIndex = form.getValues("housing_cooperative_signers").findIndex(
                    signer => !signer.administrator_person_number
                  );

                  if (emptySignerIndex !== -1) {
                    // Update existing empty signer
                    form.setValue(`housing_cooperative_signers.${emptySignerIndex}`, {
                      administrator_name: `${boardMember.firstName} ${boardMember.lastName}`,
                      administrator_person_number: boardMember.personNumber,
                      administrator_email: boardMember.email,
                    });
                  } else {
                    // Append new signer
                    appendSigner({
                      administrator_name: `${boardMember.firstName} ${boardMember.lastName}`,
                      administrator_person_number: boardMember.personNumber,
                      administrator_email: boardMember.email,
                    });
                  }
                }}
                signingRule="two" // This would come from the cooperative's data in the future
                currentSigners={form.watch("housing_cooperative_signers")}
                onRemove={removeSigner}
              />
            </CardContent>
          </Card>

          {/* Apartment Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Apartment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="apartment_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartment Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter apartment address" maxLength={100} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apartment_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartment Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter apartment number" maxLength={20} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apartment_postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter postal code" maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apartment_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter city" maxLength={50} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Borrowers Card */}
          <Card>
            <CardHeader>
              <CardTitle>Borrowers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {borrowerFields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Borrower {index + 1}</h4>
                      {borrowerFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBorrower(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`borrowers.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter name" maxLength={100} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`borrowers.${index}.person_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Person Number (12 digits)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="YYYYMMDDXXXX" maxLength={12} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`borrowers.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="Enter email" maxLength={100} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`borrowers.${index}.ownership_percentage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ownership Percentage</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => appendBorrower({
                    name: "",
                    person_number: "",
                    email: "",
                    ownership_percentage: 0,
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Borrower
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "min-w-[120px]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
