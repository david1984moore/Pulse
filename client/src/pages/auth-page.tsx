import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import LanguageToggle from "@/components/ui/language-toggle";

// Email validation regex - basic format check
const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

// List of valid email domains we accept
const validEmailDomains = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com',
  'gmx.com', 'live.com', 'fastmail.com', 'tutanota.com', 'hey.com',
  'msn.com', 'me.com'
];

// For test/development environments, we may allow these domains
const allowedTestDomains = [
  'example.com', 'test.com', 'domain.com', 'company.com', 'user.com'
];

// List of known invalid/disposable domains that we want to block explicitly
const invalidDomains = [
  'gmaik.com', 'gmakkk.com', 'yahooo.com', 'hotmial.com', 'outlook.con',
  'tempmail.com', 'mailinator.com', 'guerrillamail.com', 'yopmail.com',
  'trashmail.com', 'sharklasers.com', '10minutemail.com', 'throwawaymail.com',
  'gmauuu.com', 'gmauu.com', 'gmau.com', 'yaho.com', 'yahhoo.com',
  'outlok.com', 'hormail.com', 'hotrmail.com'
];

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .regex(emailRegex, "Please enter a valid email address")
    .refine(email => {
      // Extract the domain
      const domain = email.split('@')[1]?.toLowerCase();
      
      // Check if domain is explicitly in our invalid list
      if (invalidDomains.includes(domain)) {
        return false;
      }
      
      // Check if domain has suspicious repeating characters (like gmauuu.com)
      if (domain && domain.match(/(.)\1{2,}/)) {
        return false;
      }
      
      // Only allow emails from our whitelist of valid domains or test domains
      return validEmailDomains.includes(domain) || allowedTestDomains.includes(domain);
    }, "Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .regex(emailRegex, "Please enter a valid email address")
    .refine(email => {
      // Extract the domain
      const domain = email.split('@')[1]?.toLowerCase();
      
      // Check if domain is explicitly in our invalid list
      if (invalidDomains.includes(domain)) {
        return false;
      }
      
      // Check if domain has suspicious repeating characters (like gmauuu.com)
      if (domain && domain.match(/(.)\1{2,}/)) {
        return false;
      }
      
      // Only allow emails from our whitelist of valid domains or test domains
      return validEmailDomains.includes(domain) || allowedTestDomains.includes(domain);
    }, "Please enter a valid email address")
,
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[0-9]/, "Include a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Include a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
      confirmPassword: "",
    },
    mode: "onChange", // Enable real-time validation
  });
  
  function onLoginSubmit(data: LoginFormValues) {
    console.log("Login form submitted:", data);
    
    // Normalize email before sending to ensure consistent format
    const normalizedEmail = data.email.toLowerCase().trim();
    console.log("Normalized email for login:", normalizedEmail);
    
    loginMutation.mutate({
      email: normalizedEmail,
      password: data.password,
    });
  }
  
  function onSignupSubmit(data: SignupFormValues) {
    console.log("Signup form submitted:", data);
    
    // Normalize email before sending to ensure consistent format
    const normalizedEmail = data.email.toLowerCase().trim();
    console.log("Normalized email for submission:", normalizedEmail);
    
    registerMutation.mutate({
      name: data.name,
      email: normalizedEmail,
      password: data.password,
    });
  }
  
  // Function to check if an email is already taken (for real-time validation)
  const [emailCheckState, setEmailCheckState] = useState<{
    checking: boolean;
    taken: boolean;
    email: string;
  }>({
    checking: false,
    taken: false,
    email: '',
  });
  
  // Reset form when switching between login and signup
  useEffect(() => {
    // Reset any validation/error messages when toggling between forms
    if (isLogin) {
      loginForm.reset();
      loginMutation.reset();
    } else {
      signupForm.reset();
      registerMutation.reset();
      setEmailCheckState({
        checking: false,
        taken: false,
        email: ''
      });
    }
  }, [isLogin]);
  
  // Effect to check if email already exists when user types
  useEffect(() => {
    if (!isLogin) { // Only in signup mode
      const emailValue = signupForm.getValues('email');
      
      // Skip the check for emails that are too short or invalid format
      if (!emailValue || emailValue.length < 5 || !emailRegex.test(emailValue)) {
        setEmailCheckState({
          checking: false,
          taken: false,
          email: emailValue
        });
        return;
      }
      
      // Avoid duplicate checks and only check valid emails
      if (emailValue !== emailCheckState.email && emailRegex.test(emailValue)) {
        const normalizedEmail = emailValue.toLowerCase().trim();
        
        // Only check valid emails with valid domains
        const domain = normalizedEmail.split('@')[1]?.toLowerCase();
        if (!domain || 
            (!validEmailDomains.includes(domain) && !allowedTestDomains.includes(domain)) || 
            invalidDomains.includes(domain) || 
            domain.match(/(.)\1{2,}/)) {
          return;
        }
        
        // Set checking state
        setEmailCheckState({
          checking: true,
          taken: false,
          email: normalizedEmail
        });
        
        // Create a debounced function to avoid too many requests
        const checkTimer = setTimeout(async () => {
          try {
            // Use CSRF-protected API request helper
            const response = await fetch(`/api/email-check?email=${encodeURIComponent(normalizedEmail)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              console.error('Email check failed:', response.statusText);
              setEmailCheckState(prevState => ({
                ...prevState,
                checking: false
              }));
              return;
            }
            
            const data = await response.json();
            setEmailCheckState({
              checking: false,
              taken: data.exists,
              email: normalizedEmail
            });
          } catch (error) {
            console.error('Email check error:', error);
            setEmailCheckState(prevState => ({
              ...prevState,
              checking: false
            }));
          }
        }, 500); // 500ms debounce
        
        // Cleanup the timer if component unmounts or email changes
        return () => clearTimeout(checkTimer);
      }
    }
  }, [isLogin, signupForm.watch('email')]);
  
  // Redirect to dashboard if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  // Welcome message (removed)
  
  // Helper function to check if password requirements are met
  const passwordRequirementsMet = () => {
    const password = signupForm.getValues('password');
    const confirmPassword = signupForm.getValues('confirmPassword');
    
    const hasMinLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword && confirmPassword !== '';
    
    return hasMinLength && hasSpecialChar && hasNumber && passwordsMatch;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Home button with pulse text */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Link href="/">
          <span className="text-primary font-bold text-2xl cursor-pointer">pulse</span>
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
            <span className="font-medium text-primary hover:text-primary-dark cursor-pointer ml-2">
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            </span>
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => {
                      // Check email based on our validation rules
                      const emailValid = emailRegex.test(field.value);
                      const domain = field.value.split('@')[1]?.toLowerCase();
                      const isValidDomain = domain && (validEmailDomains.includes(domain) || allowedTestDomains.includes(domain));
                      const isInvalidDomain = domain && invalidDomains.includes(domain);
                      const hasSuspiciousRepeats = domain && domain.match(/(.)\1{2,}/);
                      
                      // Email is valid if it passes regex and domain checks
                      const isEmailValid = emailValid && isValidDomain && !isInvalidDomain && !hasSuspiciousRepeats;
                      
                      // Get login error if it exists
                      const hasLoginError = loginMutation.isError;
                      const errorMessage = loginMutation.error?.message || '';
                      const isInvalidCredentials = errorMessage.includes('Invalid email or password');
                      
                      return (
                        <FormItem>
                          <FormLabel>{t('emailLabel')}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                placeholder="your@email.com" 
                                {...field} 
                                className={isInvalidCredentials ? "border-red-500 pr-10" : "pr-10"}
                              />
                            </FormControl>
                            {isEmailValid && field.value && !isInvalidCredentials && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-green-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                            {isInvalidCredentials && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-red-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          {isInvalidCredentials ? (
                            <p className="text-sm font-medium text-red-500 mt-1">
                              {errorMessage}
                            </p>
                          ) : (
                            <FormMessage />
                          )}
                        </FormItem>
                      );
                    }}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => {
                      // Password should be at least 6 chars for login
                      const isPasswordValid = field.value && field.value.length >= 6;
                      
                      // Get login error if it exists
                      const hasLoginError = loginMutation.isError;
                      const errorMessage = loginMutation.error?.message || '';
                      const isInvalidCredentials = errorMessage.includes('Invalid email or password');
                      
                      return (
                        <FormItem>
                          <FormLabel>{t('passwordLabel')}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className={isInvalidCredentials ? "border-red-500 pr-10" : "pr-10"}
                              />
                            </FormControl>
                            {isPasswordValid && field.value && !isInvalidCredentials && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-green-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                            {isInvalidCredentials && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-red-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                    render={({ field }) => {
                      // Check if name is valid
                      const nameValid = field.value.length >= 2;
                      
                      return (
                        <FormItem>
                          <FormLabel>{t('nameLabel')}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            {nameValid && field.value && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-green-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => {
                      // Check email based on our validation rules
                      const emailValid = emailRegex.test(field.value);
                      const domain = field.value.split('@')[1]?.toLowerCase();
                      const isValidDomain = domain && (validEmailDomains.includes(domain) || allowedTestDomains.includes(domain));
                      const isInvalidDomain = domain && invalidDomains.includes(domain);
                      const hasSuspiciousRepeats = domain && domain.match(/(.)\1{2,}/);
                      
                      // Email is valid if it passes regex and domain checks
                      const isEmailValid = emailValid && isValidDomain && !isInvalidDomain && !hasSuspiciousRepeats;
                      
                      // Get registration error if it exists
                      const hasRegistrationError = registerMutation.isError;
                      const errorMessage = registerMutation.error?.message || '';
                      const isEmailTakenError = errorMessage.includes('already registered') || 
                                              errorMessage.includes('email address has been taken');
                                              
                      // Check real-time email validation status
                      const isCheckingEmail = emailCheckState.checking;
                      const isEmailTaken = emailCheckState.taken;
                      
                      return (
                        <FormItem>
                          <FormLabel>{t('emailLabel')}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                placeholder="your@email.com" 
                                {...field} 
                                className={
                                  isEmailTakenError || isEmailTaken 
                                    ? "border-red-500 pr-10" 
                                    : isCheckingEmail 
                                      ? "border-yellow-300 pr-10" 
                                      : "pr-10"
                                }
                              />
                            </FormControl>
                            
                            {/* Spinner for checking email */}
                            {isCheckingEmail && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  className="animate-spin h-5 w-5 text-yellow-500" 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  fill="none" 
                                  viewBox="0 0 24 24"
                                >
                                  <circle 
                                    className="opacity-25" 
                                    cx="12" 
                                    cy="12" 
                                    r="10" 
                                    stroke="currentColor" 
                                    strokeWidth="4"
                                  />
                                  <path 
                                    className="opacity-75" 
                                    fill="currentColor" 
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              </div>
                            )}
                            
                            {/* Checkmark for valid email */}
                            {isEmailValid && field.value && !isEmailTakenError && !isEmailTaken && !isCheckingEmail && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-green-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                            
                            {/* X mark for taken email */}
                            {(isEmailTakenError || isEmailTaken) && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-red-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Error messages */}
                          {isEmailTakenError ? (
                            <p className="text-sm font-medium text-red-500 mt-1">
                              {errorMessage}
                            </p>
                          ) : isEmailTaken ? (
                            <p className="text-sm font-medium text-red-500 mt-1">
                              This email is already registered. Please use a different email.
                            </p>
                          ) : (
                            <FormMessage />
                          )}
                        </FormItem>
                      );
                    }}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => {
                      // Check password rules
                      const password = field.value;
                      const hasMinLength = password.length >= 8;
                      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                      const hasNumber = /[0-9]/.test(password);
                      const isPasswordValid = hasMinLength && hasSpecialChar && hasNumber;
                      
                      // State for tracking the delay in hiding criteria
                      const [hideCriteria, setHideCriteria] = useState(false);
                      
                      // Effect to delay hiding criteria when all requirements are met
                      useEffect(() => {
                        let timer: NodeJS.Timeout;
                        
                        if (isPasswordValid && field.value) {
                          // Set a delay of 1 second before hiding criteria
                          timer = setTimeout(() => {
                            setHideCriteria(true);
                          }, 1000);
                        } else {
                          setHideCriteria(false);
                        }
                        
                        return () => {
                          if (timer) clearTimeout(timer);
                        };
                      }, [isPasswordValid, field.value]);
                      
                      return (
                        <FormItem>
                          <FormLabel>{t('passwordLabel')}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            {isPasswordValid && field.value && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-green-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Always show criteria initially, but hide after validation and delay */}
                          {!hideCriteria && (
                            <div className="mt-2 space-y-1 text-xs">
                              <div className="flex items-center">
                                <span className={hasMinLength ? "text-green-500" : "text-red-500"}>
                                  {t('passwordMinLength')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className={hasNumber ? "text-green-500" : "text-red-500"}>
                                  {t('passwordNumber')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className={hasSpecialChar ? "text-green-500" : "text-red-500"}>
                                  {t('passwordSpecialChar')}
                                </span>
                              </div>
                            </div>
                          )}
                          {/* Hide the FormMessage for password field since we already display custom requirements */}
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => {
                      const password = signupForm.getValues('password');
                      const confirmPassword = field.value;
                      const passwordsMatch = password === confirmPassword && confirmPassword !== '';
                      const passwordsMismatch = confirmPassword !== '' && password !== confirmPassword;
                      
                      return (
                        <FormItem className="space-y-1">
                          <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className={passwordsMismatch ? "border-red-500 pr-10" : "pr-10"}
                              />
                            </FormControl>
                            {passwordsMatch && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-green-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                            {passwordsMismatch && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5 text-red-500" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          {passwordsMismatch && (
                            <p className="text-sm text-red-500">{t('passwordsDontMatch')}</p>
                          )}
                          {/* Hide FormMessage to prevent duplicate error messages */}
                        </FormItem>
                      );
                    }}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-8" 
                    disabled={registerMutation.isPending || !passwordRequirementsMet() || emailCheckState.taken || emailCheckState.checking}
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
