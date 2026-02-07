"use client";

import { useParams } from "next/navigation";
import { ServicesTable } from "@/components/root/services/subtypes/services-sub-type-table";

export default function ServiceTypesPage() {
  const params = useParams();
  const id = params?.id as string;

  return <ServicesTable serviceSubTypeId={id} />;
}
