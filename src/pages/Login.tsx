import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, User, Lock, Mail, Eye, EyeOff, Leaf, Stethoscope, UserCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState("doctor");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  // Mock credentials for demo
  const mockCredentials = {
    doctor: { email: "doctor@iksha.com", password: "doctor123" },
    receptionist: { email: "receptionist@iksha.com", password: "recep123" }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication
    if (isSignUp) {
      // Store user role and redirect to dashboard
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userName", formData.name);
      navigate("/dashboard");
    } else {
      // Check credentials
      const credentials = mockCredentials[userRole as keyof typeof mockCredentials];
      if (formData.email === credentials.email && formData.password === credentials.password) {
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userName", userRole === "doctor" ? "Dr. Smith" : "Sarah Johnson");
        navigate("/dashboard");
      } else {
        alert("Invalid credentials. Use:\nDoctor: doctor@iksha.com / doctor123\nReceptionist: receptionist@iksha.com / recep123");
      }
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
        <Card className="wellness-card-gradient border-0 wellness-shadow">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-wellness-sage flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-semibold text-foreground">Iksha</span>
            </div>
            <div>
              <CardTitle className="font-display text-3xl font-bold text-foreground">
                {isSignUp ? "Join Iksha" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-lg">
                {isSignUp
                  ? "Begin your natural wellness journey with us"
                  : "Access your practice management dashboard"
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

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
                <Label>Login as</Label>
                <RadioGroup 
                  value={userRole} 
                  onValueChange={setUserRole}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor" className="flex items-center space-x-2 cursor-pointer">
                      <Stethoscope className="h-4 w-4 text-wellness-sage" />
                      <span>Doctor</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="receptionist" id="receptionist" />
                    <Label htmlFor="receptionist" className="flex items-center space-x-2 cursor-pointer">
                      <UserCheck className="h-4 w-4 text-wellness-sage" />
                      <span>Receptionist</span>
                    </Label>
                  </div>
                </RadioGroup>
                <div className="text-xs text-muted-foreground mt-2">
                  Demo credentials: doctor@iksha.com/doctor123 | receptionist@iksha.com/recep123
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label>Register as</Label>
                  <RadioGroup 
                    value={userRole} 
                    onValueChange={setUserRole}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="doctor" id="signup-doctor" />
                      <Label htmlFor="signup-doctor" className="flex items-center space-x-2 cursor-pointer">
                        <Stethoscope className="h-4 w-4 text-wellness-sage" />
                        <span>Doctor</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="receptionist" id="signup-receptionist" />
                      <Label htmlFor="signup-receptionist" className="flex items-center space-x-2 cursor-pointer">
                        <UserCheck className="h-4 w-4 text-wellness-sage" />
                        <span>Receptionist</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-border text-wellness-sage focus:ring-wellness-sage"
                    />
                    <Label htmlFor="remember" className="text-sm">Remember me</Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-wellness-sage hover:text-wellness-sage-dark wellness-transition"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" variant="wellness" size="lg" className="w-full">
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>

              <Button variant="wellnessOutline" size="lg" className="w-full">
                Continue with Google
              </Button>
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-wellness-sage hover:text-wellness-sage-dark font-medium wellness-transition"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;