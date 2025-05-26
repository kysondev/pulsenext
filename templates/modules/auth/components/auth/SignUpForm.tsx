"use client";
import {
  signInWithGithub,
  signInWithGoogle,
  signUp,
} from "actions/auth.action";
import { Loading } from "components/ui/loading";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";

const SignUpForm = () => {
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <Form
        action={async (formData) => {
          startTransition(async () => {
            await signUp(formData);
          });
        }}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium text-gray-400 mb-1.5"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="johndoe"
            className="w-full px-3 py-2 rounded-sm bg-[#232323] text-white border border-[#333333] focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-gray-400 mb-1.5"
          >
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Ko8o4@example.com"
            className="w-full px-3 py-2 rounded-sm bg-[#232323] text-white border border-[#333333] focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-gray-400 mb-1.5"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-sm bg-[#232323] text-white border border-[#333333] focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex gap-1 text-xs mt-1">
          <span className="text-gray-400">Already have an account?</span>
          <Link
            href="login"
            className="text-blue-400 hover:underline transition-colors"
          >
            Login
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-medium py-2 px-3 text-sm rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors mt-2"
        >
          {isPending ? <Loading /> : "Sign up"}
        </button>
      </Form>
      <div className="mt-8 pt-6 border-t border-[#2a2a2a]">
        <p className="text-xs text-center text-gray-500 mb-4">
          Or continue with
        </p>
        <div className="flex justify-between space-x-3">
          <button
            onClick={async () => {
              await signInWithGoogle();
            }}
            className="flex items-center justify-center w-full bg-[#232323] hover:bg-[#282828] text-white text-sm py-2 rounded-sm border border-[#333333] transition-colors"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={16}
              height={16}
              className="mr-2"
            />
            Google
          </button>
          <button
            onClick={async () => {
              await signInWithGithub();
            }}
            className="flex items-center justify-center w-full bg-[#232323] hover:bg-[#282828] text-white text-sm py-2 rounded-sm border border-[#333333] transition-colors"
          >
            <Image
              src="/github.svg"
              alt="Github"
              width={16}
              height={16}
              className="mr-2"
            />
            GitHub
          </button>
        </div>
      </div>
    </>
  );
};
export default SignUpForm;
