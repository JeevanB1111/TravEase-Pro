import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
    remember: z.boolean().default(false),
});

export default function TravelerLogin() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Listen for Google Auth success message from popup
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
                toast({
                    title: "Google Login",
                    description: "Successfully authenticated with Google.",
                });
                setLocation("/traveler/dashboard");
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [setLocation, toast]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        // Mimic API call
        setTimeout(() => {
            console.log(values);
            toast({
                title: "Welcome back!",
                description: "Successfully logged in to your account.",
            });
            setIsLoading(false);
            setLocation("/traveler/dashboard");
        }, 1000);
    }

    const handleGoogleLogin = () => {
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
            '/mock-google-auth',
            'Google Sign In',
            `width=${width},height=${height},left=${left},top=${top}`
        );
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        toast({
            title: "Reset Link Sent",
            description: "Check your email for instructions to reset your password.",
        });
    };

    const handleSignUp = (e: React.MouseEvent) => {
        e.preventDefault();
        toast({
            title: "Registration",
            description: "Redirecting to the sign-up page...",
        });
        // Logic to redirect to signup would go here
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 relative overflow-hidden p-4">

            <Card className="w-full max-w-md shadow-none border-none bg-transparent">
                <CardHeader className="space-y-2 flex flex-col items-start px-0">
                    <CardTitle className="text-3xl font-bold text-foreground">Traveler Login</CardTitle>
                    <CardDescription className="text-base">
                        Please enter your details to access your trips.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-foreground">Email address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your email" className="h-11" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-foreground">Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" className="h-11" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between">
                                <FormField
                                    control={form.control}
                                    name="remember"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm font-normal text-muted-foreground">
                                                    Remember for 30 days
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <a href="#" onClick={handleForgotPassword} className="text-sm font-medium text-primary hover:underline cursor-pointer">
                                    Forgot password
                                </a>
                            </div>

                            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </Form>

                    <Button
                        variant="outline"
                        className="w-full h-11 relative"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Sign in with Google
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <a href="#" onClick={handleSignUp} className="font-semibold text-primary hover:underline cursor-pointer">
                            Sign up
                        </a>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t-0 p-0 pt-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
