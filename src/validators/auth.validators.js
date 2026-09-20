import { z } from "zod";

/**
 * Password strength regex:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * Special characters are optional but counted as bonus
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_MESSAGE =
  "Password must be at least 8 characters with uppercase, lowercase, and number";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});

/**
 * Client-side password strength checker (returns score 0-4)
 * 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong
 */
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const levels = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Weak", color: "#dc2626" },
    { score: 2, label: "Fair", color: "#d97706" },
    { score: 3, label: "Good", color: "#16a34a" },
    { score: 4, label: "Strong", color: "#16a34a" },
  ];

  return levels[score];
}

/**
 * Client-side password validation (returns error string or null)
 */
export function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/\d/.test(password)) return "Password must contain a number";
  return null;
}
