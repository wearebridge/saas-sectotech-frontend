"use client";

import { useParams } from "next/navigation";
import { ScriptsTable } from "@/components/common/scripts/scripts-table";

export default function ScriptsPage() {
  const params = useParams();

  const serviceId = params?.serviceId as string;

  return <ScriptsTable serviceTypeId={serviceId} />;
}
