"use server";

import { redirect } from "next/navigation";
import { endSession, getCurrentUser } from "@/lib/session";
import { snoozeIdentityPrompt } from "@/lib/services/identity-service";

export async function signOutAction() {
  await endSession();
  redirect("/sign-in");
}

/** "Not now" on the BVN/NIN prompt. */
export async function snoozeIdentityPromptAction() {
  const user = await getCurrentUser();
  if (user) await snoozeIdentityPrompt(user.id);
}
