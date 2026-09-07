import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getReceipt } from "@/lib/services/transfer-service";
import { TransferReceipt } from "@/components/transfer-receipt";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const receipt = await getReceipt(user.id, id);
  if (!receipt) notFound();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl">Receipt</h1>
      <TransferReceipt receipt={receipt} />
    </div>
  );
}
