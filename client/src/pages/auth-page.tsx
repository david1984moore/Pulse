import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, useRoute, Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Home } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import LanguageToggle from "@/components/ui/language-toggle";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { t } = useLanguage();
  const [, params] = useLocation();
  const [isLoginRoute] = useRoute("/login");
  const [isSignupRoute] = useRoute("/signup");
  
  const isLogin = isLoginRoute || (!isSignupRoute);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  
  function onLoginSubmit(data: LoginFormValues) {
    console.log("Login form submitted:", data);
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  }
  
  function onSignupSubmit(data: SignupFormValues) {
    console.log("Signup form submitted:", data);
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  }
  
  // Redirect to dashboard if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  // Welcome message
  const welcomeContent = isLogin ? (
    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
      <p className="font-medium">{t('welcome')} {t('to')} Pulse Finance!</p>
      <p>{t('loginDescription')}</p>
      <p className="mt-1">{t('dontHaveAccount')}</p>
    </div>
  ) : null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Home button and language toggle */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-full" aria-label="Go to home page">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      {/* Language toggle in top right */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? t('login') : t('signup')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('or')} 
          <Link href={isLogin ? "/signup" : "/login"}>
            <span className="font-medium text-primary hover:text-primary-dark cursor-pointer">
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            </span>
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {welcomeContent}
        <Card className="mt-4">
          <CardContent className="pt-6">
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('emailLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('passwordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="rememberMe"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label
                            htmlFor="rememberMe"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {t('rememberMe')}
                          </label>
                        </div>
                      )}
                    />
                    
                    <div className="text-sm">
                      <a href="#" className="font-medium text-primary hover:text-primary-dark">
                        {t('forgotPassword')}
                      </a>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('signingIn')}
                      </>
                    ) : (
                      t('login')
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('nameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('emailLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('passwordLabel')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('creatingAccount')}
                      </>
                    ) : (
                      t('signup')
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
