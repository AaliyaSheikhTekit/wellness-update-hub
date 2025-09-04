import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Leaf, Key } from "lucide-react";
import {
  signIn,
  confirmSignIn,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  signOut
} from "aws-amplify/auth";
import IkshaLogo from "../assets/iksha_logo.png"; // Ensure you have the logo image in the specified path

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPassword: "",
    resetCode: "",
    resetNewPassword: "",
  });
  const [nextStep, setNextStep] = useState<any>(null);
  const [forgotStep, setForgotStep] = useState<"request" | "confirm" | null>(
    null
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- Sign In ---
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const { isSignedIn, nextStep } = await signIn({
          username: formData.email,
          password: formData.password,
        });

        if (isSignedIn) {
          const user = await getCurrentUser();
          const session = await fetchAuthSession();

          // console.log("SignIn Success:", user);
          // console.log("Session:", session);

          // Extract attributes from ID token payload
          const payload = session.tokens?.idToken?.payload || {};

          // console.log("SignIn Success:", payload);
          const preferredUsername =
            payload["preferred_username"] || payload.username || "User";
          const email = payload["email"] || formData.email;
          // console.log("payload.username Success:", payload.username);
          // Save in localStorage
          localStorage.setItem("userName", String(preferredUsername));
          localStorage.setItem("userEmail", String(email));

          navigate("/dashboard");
        } else {
          console.log("Next step required:", nextStep);
          setNextStep(nextStep);
        }
      } catch (error: any) {
        console.error("Auth Error:", error);
        alert(error.message || "Authentication failed.");
      }
    };
useEffect(() => {
    const clearSession = async () => {
      try {
        await signOut(); // clears Cognito session (cookies + tokens)
        localStorage.clear(); // optional: wipe your saved user data
        sessionStorage.clear();
      } catch (error) {
        console.error("Error clearing session:", error);
      }
    };

    clearSession();
  }, []);
  // --- Confirm New Password Required ---
  const handleConfirmNewPassword = async () => {
    try {
      await confirmSignIn({
        challengeResponse: formData.newPassword,
      });

      const user = await getCurrentUser();
      console.log("Password changed & logged in:", user);

      localStorage.setItem("userName", user.username || "User");
      localStorage.setItem("userEmail", formData.email);

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Confirm Password Error:", error);
      alert(error.message || "Failed to set new password.");
    }
  };

  // --- Forgot Password Request ---
  const handleForgotPassword = async () => {
    try {
      await resetPassword({ username: formData.email });
      alert("Password reset code sent to your email.");
      setForgotStep("confirm");
    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      alert(error.message || "Failed to start reset password.");
    }
  };

  // --- Confirm Forgot Password ---
  const handleConfirmForgotPassword = async () => {
    try {
      await confirmResetPassword({
        username: formData.email,
        confirmationCode: formData.resetCode,
        newPassword: formData.resetNewPassword,
      });

      alert("Password has been reset successfully. Please sign in.");
      setForgotStep(null);
    } catch (error: any) {
      console.error("Confirm Reset Error:", error);
      alert(error.message || "Failed to confirm reset password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-beige-light via-wellness-sage-light/20 to-background flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center space-x-2 text-foreground hover:text-wellness-sage wellness-transition"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        <Card className="bg-white border-0 wellness-shadow">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
                <img
  src={IkshaLogo}
  alt="Iksha Naturopathy Logo"
  className="h-16 w-auto object-contain" // larger height
/>
            </div>
            <div>
              <CardTitle className="font-display text-3xl font-bold text-foreground">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-lg">
                Access your practice management dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Sign In Form */}
            {!nextStep && !forgotStep && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground wellness-transition"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="wellness"
                  size="lg"
                  className="w-full bg-foreground hover:bg-foreground/85"
                >
                  Sign In
                </Button>

                <button
                  type="button"
                  onClick={() => setForgotStep("request")}
                  className="text-sm text-wellness-sage underline mt-2"
                >
                  Forgot Password?
                </button>
              </form>
            )}

            {/* New Password Required */}
            {nextStep?.signInStep ===
              "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED" && (
              <div className="space-y-4">
                <Label htmlFor="newPassword">Set New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
                <Button
                  onClick={handleConfirmNewPassword}
                  variant="wellness"
                  size="lg"
                  className="w-full"
                >
                  Confirm New Password
                </Button>
              </div>
            )}

            {/* Forgot Password Request */}
            {forgotStep === "request" && (
              <div className="space-y-4">
                <Label htmlFor="email">Enter your email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  onClick={handleForgotPassword}
                  variant="wellness"
                  size="lg"
                  className="w-full"
                >
                  Send Reset Code
                </Button>
              </div>
            )}

            {/* Forgot Password Confirm */}
            {forgotStep === "confirm" && (
              <div className="space-y-4">
                <Label htmlFor="resetCode">Verification Code</Label>
                <Input
                  id="resetCode"
                  name="resetCode"
                  type="text"
                  placeholder="Enter code from email"
                  value={formData.resetCode}
                  onChange={handleInputChange}
                  required
                />

                <Label htmlFor="resetNewPassword">New Password</Label>
                <Input
                  id="resetNewPassword"
                  name="resetNewPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.resetNewPassword}
                  onChange={handleInputChange}
                  required
                />

                <Button
                  onClick={handleConfirmForgotPassword}
                  variant="wellness"

                  size="lg"
                  className="w-full bg-foreground"
                >
                  Confirm Reset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
//receptionist@eanaturopathyindia.com
//Iksha@Recp90
//Iksha@doctor90
//doctor@eanaturopathyindia.com

