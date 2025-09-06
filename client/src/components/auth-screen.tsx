import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Waves } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthScreenProps {
  onLogin: (user: { id: string; username: string; email: string }) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock authentication - in real app would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: "mock-user-id",
        username: formData.username || formData.email.split("@")[0],
        email: formData.email,
      };

      onLogin(mockUser);
      
      toast({
        title: "Welcome to OceanSync!",
        description: "You have successfully signed in.",
      });
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen ocean-gradient wave-pattern flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Waves className="text-primary text-2xl" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">OceanSync</h1>
            <p className="text-muted-foreground text-sm">Citizen Ocean Hazard Reporting</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="your_username"
                  required={isSignUp}
                  data-testid="input-username"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                data-testid="input-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
            
            <div className="text-center">
              <span className="text-muted-foreground text-sm">
                {isSignUp ? "Already have an account? " : "New to OceanSync? "}
              </span>
              <button 
                type="button"
                className="text-primary text-sm font-medium"
                onClick={() => setIsSignUp(!isSignUp)}
                data-testid="button-toggle-auth"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
