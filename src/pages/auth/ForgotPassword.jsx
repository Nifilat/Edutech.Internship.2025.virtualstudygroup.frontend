import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/hooks/useAuth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address
          </Label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-normal hover:bg-orange-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? "Sending..." : "Send reset instructions"}
          </Button>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-orange-normal hover:text-orange-dark transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
