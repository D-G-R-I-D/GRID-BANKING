import "server-only";
import { maskAccountNumber } from "@/lib/phone";
import type { ProfileView } from "@/lib/view";

interface ProfileUser {
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
}

export function toProfileView(user: ProfileUser): ProfileView {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    accountNumberMasked: maskAccountNumber(user.accountNumber),
  };
}
