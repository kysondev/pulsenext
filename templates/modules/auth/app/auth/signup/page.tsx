import SignUpForm from "components/auth/SignUpForm";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171717] px-4">
      <div className="w-full max-w-sm bg-[#1c1c1c] p-8 rounded-md border border-[#2a2a2a]">
        <h2 className="text-xl font-medium text-white mb-8">
          Create an account
        </h2>
        <SignUpForm />
      </div>
    </div>
  );
}
