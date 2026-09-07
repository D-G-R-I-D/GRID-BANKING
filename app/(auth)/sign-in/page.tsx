import { SignInForm } from "./sign-in-form";

const NOTICES: Record<string, string> = {
  timeout:
    "You were signed out after a period of inactivity. Please sign in again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return <SignInForm notice={reason ? NOTICES[reason] : undefined} />;
}
