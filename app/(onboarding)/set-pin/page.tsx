import { SetPinForm } from "./set-pin-form";

export default function SetPinPage() {
  return (
    <div>
      <h1 className="text-2xl">Create your PIN</h1>
      <p className="mt-2 text-sm text-ink-soft">
        You&rsquo;ll use it to approve transfers and loans. Your password is
        only for signing in.
      </p>
      <SetPinForm />
    </div>
  );
}
