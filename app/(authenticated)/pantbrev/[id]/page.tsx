import { DeedViewer } from "@/components/deed-viewer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'View Deed',
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DeedPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <main className="container mx-auto px-4 py-8">
      <DeedViewer id={id} />
    </main>
  );
} 