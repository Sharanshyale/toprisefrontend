"use client";

import { useParams } from "next/navigation";
import PaymentDetailsById from "@/components/user-dashboard/payment&Details/PaymentDetailsById";

export default function PaymentDetailsPage() {
  const params = useParams();
  const paymentId = params.id as string;

  return <PaymentDetailsById paymentId={paymentId} />;
}
