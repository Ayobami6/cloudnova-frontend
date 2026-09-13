import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid work email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid work email address"),
  company: z.string().min(2, "Company or organization name is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special symbol"),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service and SLA",
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must contain digits only"),
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email("Please enter a valid registered email address"),
});

export type ForgotPasswordRequestInput = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordWithOtpSchema = z
  .object({
    email: z.string().email(),
    otp: z
      .string()
      .length(6, "Reset code must be exactly 6 digits")
      .regex(/^\d{6}$/, "Code must contain digits only"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[0-9]/, "Must include at least one number")
      .regex(/[^A-Za-z0-9]/, "Must include at least one special symbol"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordWithOtpInput = z.infer<typeof ResetPasswordWithOtpSchema>;
