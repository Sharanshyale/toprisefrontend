"use client";

import { useParams } from "next/navigation";
import ReturnDetails from "@/components/user-dashboard/return-claims/ReturnDetails";

export default function ReturnDetailsPage() {
  const params = useParams();
  const returnId = params.id as string;

  return <ReturnDetails returnId={returnId} />;
}
