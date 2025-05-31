"use client";
import { forgotPassword, signUp } from "actions/auth.action";
import { Loading } from "components/ui/loading";
import Form from "next/form";
import { useTransition } from "react";

const ForgotPasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <Form
        action={async (formData) => {
          startTransition(async () => {
            await forgotPassword(formData);
          });
        }}
        className="space-y-5"
      >
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
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-medium py-2 px-3 text-sm rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors mt-2"
        >
          {isPending ? <Loading /> : "Send Reset Link"}
        </button>
      </Form>
    </>
  );
};
export default ForgotPasswordForm;
