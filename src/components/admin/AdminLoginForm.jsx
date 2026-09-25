"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setServerError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "var(--surface-soft, #f5f5f5)" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Image
              src="/icon.png"
              alt="HADAIRE FOOTWEAR"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              HADAIRE FOOTWEAR Admin Portal
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Staff access only</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              error={errors.email}
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
