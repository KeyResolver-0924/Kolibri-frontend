
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useForm,
  useFieldArray,
  // Control,
  // UseFieldArrayReturn,
} from "react-hook-form";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/contexts/user-context";
import { Checkbox } from "@/components/ui/checkbox";

// Interface definitions
interface Borrower {
  name: string;
  person_number: string;
  email: string;
  ownership_percentage: number;
}

interface HousingCooperativeSigner {
  administrator_name: string;
  administrator_person_number: string;
  administrator_email: string;
}

interface CreditNumbers {
  credit_number: number | null;
}

interface FormData {
  credit_number: string;
  credit_numbers: CreditNumbers[];
  add_more_credit_numbers: boolean;
  housing_cooperative_id: number;
  // Housing Cooperative Details
  organization_number?: string;
  cooperative_name?: string;
  cooperative_address?: string;
  cooperative_postal_code?: string;
  cooperative_city?: string;
  administrator_company?: string;
  administrator_name?: string;
  administrator_person_number?: string;
  administrator_email?: string;
  // Accounting Firm Fields
  is_accounting_firm: boolean;
  accounting_firm_name?: string;
  accounting_firm_email?: string;
  // Apartment Details
  apartment_address: string;
  apartment_postal_code: string;
  apartment_city: string;
  apartment_number: string;
  borrowers: Borrower[];
  housing_cooperative_signers: HousingCooperativeSigner[];
  has_existing_mortgages?: boolean;
  existing_mortgage_bank?: string;
  existing_mortgage_date?: string;
  notes?: string;
}

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
  accounting_firm_name?: string;
  accounting_firm_email?: string;
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

interface SkapaPantbrevProps {
  deedId?: string;
}

// Component implementation
function BoardMemberSelectionDialog({
  isOpen,
  onClose,
  onSelect,
  signingRule,
  currentSigners,
  onRemove,
}: BoardMemberSelectionDialogProps) {
  // Example board members for testing
  const testBoardMembers: BoardMember[] = [
    {
      firstName: "Anna",
      lastName: "Andersson",
      personNumber: "197505121234",
      email: "anna.andersson@example.com",
    },
    {
      firstName: "Erik",
      lastName: "Eriksson",
      personNumber: "196403154321",
      email: "erik.eriksson@example.com",
    },
    {
      firstName: "Maria",
      lastName: "Svensson",
      personNumber: "198112087890",
      email: "maria.svensson@example.com",
    },
    {
      firstName: "Lars",
      lastName: "Lindberg",
      personNumber: "195908235678",
      email: "lars.lindberg@example.com",
    },
  ];

  const isSelected = (member: BoardMember) => {
    return currentSigners.some(
      (signer) => signer.administrator_person_number === member.personNumber
    );
  };

  const handleToggle = (member: BoardMember) => {
    if (isSelected(member)) {
      // Remove the member from signers
      const signerToRemove = currentSigners.find(
        (signer) => signer.administrator_person_number === member.personNumber
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
            {signingRule === "one"
              ? "En styrelsemedlem krävs för att signera pantbrevet"
              : "Två styrelsemedlemmar krävs för att signera pantbrevet"}
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
                    <p className="font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.personNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 border-2 rounded-full",
                      selected ? "bg-primary border-primary" : "border-gray-300"
                    )}
                  />
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
  const [selectedCooperative, setSelectedCooperative] =
    useState<HousingCooperative | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [organizationNumber, setOrganizationNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResultsAlert, setShowNoResultsAlert] = useState(false);
  const [cooperativeSearchResults, setCooperativeSearchResults] = useState<
    HousingCooperative[]
  >([]);
  const [isBoardMemberDialogOpen, setIsBoardMemberDialogOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const { user, token } = useUser();

  const form = useForm<FormData>({
    defaultValues: {
      credit_number: "",
      credit_numbers: [],
      add_more_credit_numbers: false,
      housing_cooperative_id: 0,
      is_accounting_firm: false,
      borrowers: [
        {
          name: "",
          person_number: "",
          email: "",
          ownership_percentage: 100,
        },
      ],
      housing_cooperative_signers: [],
      has_existing_mortgages: false,
      existing_mortgage_bank: "",
      existing_mortgage_date: "",
      notes: "",
    },
  });

  // Field arrays with proper typing
  console.log(selectedCooperative);
  const creditNumbersArray = useFieldArray({
    control: form.control,
    name: "credit_numbers",
  });

  const borrowersArray = useFieldArray({
    control: form.control,
    name: "borrowers",
  });

  const signersArray = useFieldArray({
    control: form.control,
    name: "housing_cooperative_signers",
  });

  const addMore = form.watch("add_more_credit_numbers");
  // const isAccountingFirm = form.watch("is_accounting_firm");

  // Helper functions for adding fields
  const handleAddCreditNumber = () => {
    creditNumbersArray.append({
      credit_number: null,
    });
  };

  const handleAddBorrower = () => {
    borrowersArray.append({
      name: "",
      person_number: "",
      email: "",
      ownership_percentage: 0,
    });
  };

  const handleAddSigner = () => {
    signersArray.append({
      administrator_name: "",
      administrator_person_number: "",
      administrator_email: "",
    });
  };

  const searchHousingCooperative = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setCooperativeSearchResults([]);
        return;
      }

      try {
        console.log("Searching for:", query);
        const response = await fetch(
          `${
            process.env['NEXT_PUBLIC_BACKEND_URL']
          }/api/housing-cooperatives?page=1&page_size=10&search=${encodeURIComponent(
            query
          )}`,
          {
            headers: {
              Authorization: `Bearer ${
                (
                  await supabase.auth.getSession()
                ).data.session?.access_token
              }`,
            },
          }
        );

        if (!response.ok)
          throw new Error("Failed to search housing cooperatives");

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
    },
    [supabase, toast]
  );

  const searchByOrganizationNumber = async () => {
    if (!organizationNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter an organization number",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setShowNoResultsAlert(false);

    try {
      // Search in housing_cooperatives table
      const { data: cooperativeData, error } = await supabase
        .from("housing_cooperatives")
        .select("*")
        .eq("organisation_number", organizationNumber.trim())
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No results found
          setShowNoResultsAlert(true);
          setCooperativeSearchResults([]);
        } else {
          throw error;
        }
      } else if (cooperativeData) {
        // Found existing cooperative
        setSelectedCooperative(cooperativeData);
        setCooperativeSearchResults([cooperativeData]);
        setShowNoResultsAlert(false);
        
        // Pre-fill the form with existing data
        form.setValue("housing_cooperative_id", cooperativeData.id);
        form.setValue("organization_number", cooperativeData.organisation_number);
        form.setValue("cooperative_name", cooperativeData.name);
        form.setValue("cooperative_address", cooperativeData.address);
        form.setValue("cooperative_city", cooperativeData.city);
        form.setValue("cooperative_postal_code", cooperativeData.postal_code);
        form.setValue("administrator_name", cooperativeData.administrator_name || "");
        form.setValue("administrator_email", cooperativeData.administrator_email || "");
        form.setValue("administrator_person_number", cooperativeData.administrator_person_number || "");
        form.setValue("accounting_firm_name", cooperativeData.accounting_firm_name || "");
        form.setValue("accounting_firm_email", cooperativeData.accounting_firm_email || "");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to search housing cooperatives",
        variant: "destructive",
      });
      setCooperativeSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

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
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new ApiError(401, "Unauthorized: No session found");
        }

        const response = await fetch(
          `${process.env['NEXT_PUBLIC_BACKEND_URL']}/api/mortgage-deeds/${deedId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new ApiError(
            response.status,
            `Failed to fetch deed: ${response.statusText}`
          );
        }

        const deed = await response.json();

        // Pre-fill the form with deed data
        form.reset({
          credit_number: deed.credit_numbers[0] || "",
          credit_numbers: deed.credit_numbers.slice(1),
          add_more_credit_numbers: deed.credit_numbers.length > 1,
          housing_cooperative_id: deed.housing_cooperative.id,
          organization_number: deed.housing_cooperative.organisation_number,
          cooperative_name: deed.housing_cooperative.name,
          cooperative_address: deed.housing_cooperative.address,
          cooperative_postal_code: deed.housing_cooperative.postal_code,
          cooperative_city: deed.housing_cooperative.city,
          administrator_company: deed.housing_cooperative.administrator_company,
          administrator_name: deed.housing_cooperative.administrator_name,
          administrator_person_number:
            deed.housing_cooperative.administrator_person_number,
          administrator_email: deed.housing_cooperative.administrator_email,
          apartment_address: deed.apartment_address,
          apartment_postal_code: deed.apartment_postal_code,
          apartment_city: deed.apartment_city,
          apartment_number: deed.apartment_number,
          borrowers: deed.borrowers.map((borrower: Borrower) => ({
            ...borrower,
            ownership_percentage:
              typeof borrower.ownership_percentage === "string"
                ? parseFloat(
                    (borrower.ownership_percentage as string).replace(",", ".")
                  )
                : borrower.ownership_percentage,
          })),
          housing_cooperative_signers: deed.housing_cooperative_signers,
          has_existing_mortgages: deed.has_existing_mortgages,
          existing_mortgage_bank: deed.existing_mortgage_bank,
          existing_mortgage_date: deed.existing_mortgage_date,
          notes: deed.notes,
        });

        setSelectedCooperative(deed.housing_cooperative);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          toast({
            title: "Error", 
            description: (err as ApiError).message,
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
      if (!token) {
        throw new ApiError(401, "No authentication token found");
      }

      // Save housing cooperative data to Supabase if organization number is provided
      let housing_cooperative_id = data.housing_cooperative_id;
      
      if (data.organization_number && data.cooperative_name && data.cooperative_address && data.cooperative_postal_code && data.cooperative_city) {
        try {
          // Check if cooperative already exists
          const { data: existingCooperative, error: checkError } = await supabase
            .from("housing_cooperatives")
            .select("id")
            .eq("organisation_number", data.organization_number)
            .single();

          if (checkError && checkError.code !== "PGRST116") {
            throw checkError;
          }

          // Prepare housing cooperative data based on signer type
          let housingCooperativeData: any = {
            organisation_number: data.organization_number,
            name: data.cooperative_name,
            address: data.cooperative_address,
            city: data.cooperative_city,
            postal_code: data.cooperative_postal_code,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          };

          // If is_accounting_firm is false, save administrator info to housing_cooperatives
          if (!data.is_accounting_firm && data.housing_cooperative_signers && data.housing_cooperative_signers.length > 0) {
            // Use the first signer's information for the housing cooperative
            const firstSigner = data.housing_cooperative_signers[0];
            if (firstSigner) {
              housingCooperativeData = {
                ...housingCooperativeData,
                administrator_name: firstSigner.administrator_name || "",
                administrator_email: firstSigner.administrator_email || "",
                administrator_person_number: firstSigner.administrator_person_number || "",
                accounting_firm_name: "",
                accounting_firm_email: "",
              };
            }
          } else if (data.is_accounting_firm) {
            // If is_accounting_firm is true, save accounting firm info to housing_cooperatives
            housingCooperativeData = {
              ...housingCooperativeData,
              administrator_name: "",
              administrator_email: "",
              administrator_person_number: "",
              accounting_firm_name: data.accounting_firm_name || "",
              accounting_firm_email: data.accounting_firm_email || "",
            };
          }

          if (!existingCooperative) {
            // Insert new cooperative
            const { data: newCooperative, error: insertError } = await supabase
              .from("housing_cooperatives")
              .insert(housingCooperativeData)
              .select()
              .single();

            if (insertError) {
              console.error("Error saving cooperative:", insertError);
              toast({
                title: "Warning",
                description: "Failed to save housing cooperative data, but mortgage deed will still be created",
                variant: "destructive",
              });
            } else {
              housing_cooperative_id = newCooperative.id;
            }
          } else {
            // Update existing cooperative with new data
            const { error: updateError } = await supabase
              .from("housing_cooperatives")
              .update(housingCooperativeData)
              .eq("id", existingCooperative.id);

            if (updateError) {
              console.error("Error updating cooperative:", updateError);
              toast({
                title: "Warning",
                description: "Failed to update housing cooperative data, but mortgage deed will still be created",
                variant: "destructive",
              });
            } else {
              housing_cooperative_id = existingCooperative.id;
            }
          }
        } catch (error) {
          console.error("Error handling cooperative data:", error);
          toast({
            title: "Warning",
            description: "Failed to save housing cooperative data, but mortgage deed will still be created",
            variant: "destructive",
          });
        }
      }

      // Prepare credit numbers array
      const creditNumbers = data.credit_numbers.map(
        (item) => item.credit_number
      );
      
      // Prepare submit data based on form type
      const submitData = {
        ...data,
        credit_numbers: creditNumbers,
        housing_cooperative_id: housing_cooperative_id,
      };
      
      const url = deedId
        ? `${process.env['NEXT_PUBLIC_BACKEND_URL']}/api/mortgage-deeds/${deedId}`
        : `${process.env['NEXT_PUBLIC_BACKEND_URL']}/api/mortgage-deeds/create`;

      const method = deedId ? "PUT" : "POST";
      console.log(submitData);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new ApiError(response.status, "Failed to create mortgage deed");
      }

      toast({
        title: "Success",
        description: deedId
          ? "Mortgage deed updated successfully"
          : "Mortgage deed created successfully",
      });

      // Redirect to the deed view page
      const responseData = await response.json();
      router.push(`/pantbrev/${responseData.id}`);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message 
              : "Failed to create mortgage deed",
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
          {/* Bank Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg font-medium">
                Bank Name: {user?.bank_name}
              </div>

              {/* Credit Numbers Section */}
              <div className="space-y-4">
                {/* Main Credit Number */}
                <FormField
                  control={form.control}
                  name="credit_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Credit Number</FormLabel>
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

                {/* Additional Credit Numbers */}
                <div className="space-y-4">
                  {creditNumbersArray.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`credit_numbers.${index}.credit_number`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                placeholder={`Additional credit number ${
                                  index + 1
                                }`}
                                maxLength={50}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => creditNumbersArray.remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCreditNumber}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credit Number
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Housing Cooperative Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Housing Cooperative Search */}
              <div className="space-y-4">
                {/* Organization Number Search */}
                <div className="space-y-4">
                  <FormLabel>Search Housing Cooperative by Organization Number</FormLabel>
                  <div className="flex gap-2 max-w-md">
                    <Input
                      type="text"
                      placeholder="Enter organization number"
                      value={organizationNumber}
                      onChange={(e) => setOrganizationNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={searchByOrganizationNumber}
                      disabled={isSearching}
                      className="px-4"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  
                  {/* No Results Alert */}
                  {showNoResultsAlert && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-800 text-sm">
                        No housing cooperative found with the provided organization number. 
                        Please enter the details manually below.
                      </p>
                    </div>
                  )}

                  {/* Search Results */}
                  {cooperativeSearchResults.length > 0 && (
                    <div className="bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                      {cooperativeSearchResults.map((coop) => (
                        <div
                          key={coop.id}
                          className="p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedCooperative(coop);
                            setCooperativeSearchResults([]);
                            setOrganizationNumber("");
                            setShowNoResultsAlert(false);
                            form.setValue("housing_cooperative_id", coop.id);
                            form.setValue(
                              "organization_number",
                              coop.organisation_number
                            );
                            form.setValue("cooperative_name", coop.name);
                            form.setValue("cooperative_address", coop.address);
                            form.setValue("cooperative_city", coop.city);
                            form.setValue(
                              "cooperative_postal_code",
                              coop.postal_code
                            );
                            form.setValue(
                              "administrator_name",
                              coop.administrator_name || ""
                            );
                            form.setValue(
                              "administrator_email",
                              coop.administrator_email || ""
                            );
                            form.setValue(
                              "administrator_person_number",
                              coop.administrator_person_number || ""
                            );
                            form.setValue(
                              "accounting_firm_name",
                              coop.accounting_firm_name || ""
                            );
                            form.setValue(
                              "accounting_firm_email",
                              coop.accounting_firm_email || ""
                            );
                          }}
                        >
                          <div className="font-medium">{coop.name}</div>
                          <div className="text-sm text-gray-600">
                            {coop.organisation_number}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual Input Section */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Housing Cooperative Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="organization_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="XXXXXX-XXXX" />
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
                            <Input
                              {...field}
                              placeholder="Enter cooperative name"
                            />
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
                            <Input
                              {...field}
                              placeholder="Enter cooperative address"
                            />
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
                            <Input {...field} placeholder="XXX XX" />
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
                            <Input {...field} placeholder="Enter city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apartment Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Apartment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="apartment_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Borrower Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Borrower Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {borrowersArray.fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">
                      Borrower {index + 1}
                    </h3>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => borrowersArray.remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`borrowers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Person Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="YYYYMMDDXXXX" />
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
                            <Input {...field} type="email" />
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
                          <FormLabel>Ownership Share In
                          The Cooperative</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0.01"
                              max="100"
                              className="max-w-md"
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
                onClick={handleAddBorrower}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Borrower
              </Button>
            </CardContent>
          </Card>

          {/* Housing Cooperative Signers Card */}
          <Card>
            <CardHeader>
              <CardTitle>Housing Cooperative Signers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Signer Type Selection */}
              <div className="space-y-4">
                <h4 className="font-medium">Signer Type</h4>
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="is_accounting_firm"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="radio"
                            checked={!field.value}
                            onChange={() => field.onChange(false)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-medium">
                          Signer
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_accounting_firm"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="radio"
                            checked={field.value}
                            onChange={() => field.onChange(true)}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-medium">
                          Accounting Firm
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Signer Fields - Show when is_accounting_firm is false */}
              {!form.watch("is_accounting_firm") && (
                <div className="space-y-4">
                  {signersArray.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-4 p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">
                          Signer {index + 1}
                        </h3>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => signersArray.remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`housing_cooperative_signers.${index}.administrator_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Administrator Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Administrator Person Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="YYYYMMDDXXXX" />
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
                              <FormLabel>Administrator Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
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
                    onClick={handleAddSigner}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Signer
                  </Button>
                </div>
              )}

              {/* Accounting Firm Fields - Show when is_accounting_firm is true */}
              {form.watch("is_accounting_firm") && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">
                      Accounting Firm Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accounting_firm_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accounting Firm Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="max-w-md"
                                placeholder="Enter firm name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accounting_firm_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accounting Firm Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="max-w-md"
                                placeholder="Enter firm email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Optional details and existing mortgages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="has_existing_mortgages"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        id="has_existing_mortgages"
                      />
                    </FormControl>
                    <FormLabel htmlFor="has_existing_mortgages" className="font-medium">
                      This property has existing mortgage deeds
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch("has_existing_mortgages") && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="existing_mortgage_bank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Existing Mortgage Bank</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nordea Bank" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="existing_mortgage_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Existing Mortgage Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional information or special considerations..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          {/* Board Member Selection Dialog */}
          <BoardMemberSelectionDialog
            isOpen={isBoardMemberDialogOpen}
            onClose={() => setIsBoardMemberDialogOpen(false)}
            onSelect={(boardMember) => {
              signersArray.append({
                administrator_name: boardMember.firstName,
                administrator_person_number: boardMember.personNumber,
                administrator_email: boardMember.email,
              });
              setIsBoardMemberDialogOpen(false);
            }}
            signingRule="two"
            currentSigners={signersArray.fields.map(
              (field) => field as unknown as HousingCooperativeSigner
            )}
            onRemove={(index) => signersArray.remove(index)}
          />
          <Button type="submit" className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Save mortgage deed
              </>
            ) : (
              "Save mortgage deed"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
