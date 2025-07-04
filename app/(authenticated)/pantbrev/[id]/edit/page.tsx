import { Metadata } from "next";
import SkapaPantbrev from "@/components/skapa-pantbrev";

export const metadata: Metadata = {
  title: "Edit Deed",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditDeedPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="container mx-auto px-4 py-8">
      <SkapaPantbrev deedId={id} />
    </main>
  );
}
