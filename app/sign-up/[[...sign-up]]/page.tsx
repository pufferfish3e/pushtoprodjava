import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <SignUp
          path="/sign-up"
          routing="path"
          fallbackRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </main>
  );
}
