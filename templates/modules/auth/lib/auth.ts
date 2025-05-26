import argon2 from "argon2";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, twoFactor } from "better-auth/plugins";
import { PrismaClient } from "../generated/prisma-client";
import { resend } from "./resend";
import TwoFactorVerificationEmail from "../components/ui/emails/TwoFactorVerificationEmail";
import EmailVerification from "../components/ui/emails/EmailVerification";
import ResetPassword from "components/ui/emails/ResetPassword";

const prisma = new PrismaClient();
export const auth = betterAuth({
  appName: process.env.APP_NAME,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    cookiePrefix: process.env.APP_NAME,
  },
  plugins: [
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await resend.emails.send({
            from: `${process.env.APP_NAME} <${process.env.TWO_FA_EMAIL}>`,
            to: user.email,
            subject: "Two-Factor Authentication (2FA)",
            react: TwoFactorVerificationEmail({ otp }),
          });
        },
      },

      skipVerificationOnEnable: true,
    }),
    admin(),
  ],
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.APP_NAME} <${process.env.VERIFICATION_EMAIL}>`,
        to: user.email,
        subject: "Verify your email address",
        react: EmailVerification({ url }),
      });
    },
    sendOnSignUp: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        return await argon2.hash(password);
      },
      verify: async (info: any) => {
        return await argon2.verify(info.hash, info.password);
      },
    },
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.APP_NAME} <${process.env.RESET_PASSWORD_EMAIL}>`,
        to: user.email,
        subject: "Reset your password",
        react: ResetPassword({ url }),
      });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
