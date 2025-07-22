import { notFound } from "next/navigation";
import SupabaseSignUpPage from "@/components/supabase-signup-page";

const validUserTypes = ["bank", "accounting", "cooperative"] as const;
type ValidUserType = (typeof validUserTypes)[number];

type Props = {
  searchParams?: Promise<{ type?: string }>;
};

function isValidUserType(type: string): type is ValidUserType {
  return validUserTypes.includes(type as ValidUserType);
}

export default async function SignUpPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};

  const type = params?.type || null;

  if (!type || !isValidUserType(type)) {
    notFound();
  }

  return <SupabaseSignUpPage preselectedRole={type} />;
}
