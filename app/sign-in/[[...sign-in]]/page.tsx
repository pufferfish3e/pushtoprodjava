import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <SignIn
          path="/sign-in"
          routing="path"
          fallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </main>
  );
}
