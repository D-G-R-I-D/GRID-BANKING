import Link from "next/link";
import { ChangePinForm } from "./change-pin-form";

export default function ChangePinPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/settings" className="text-xs text-accent hover:underline">
          ← Profile
        </Link>
        <h1 className="mt-2 text-xl">Change PIN</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your PIN approves transfers and loans. You can switch between 4 and 6
          digits.
        </p>
      </div>
      <ChangePinForm />
    </div>
  );
}
