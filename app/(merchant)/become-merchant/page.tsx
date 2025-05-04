"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMerchant } from "@/contexts/merchant-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

const merchantSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  business_description: z.string().min(10, "Please provide a more detailed description"),
  contact_email: z.string().email("Please enter a valid email"),
  contact_phone: z.string().min(10, "Please enter a valid phone number"),
});

type MerchantFormValues = z.infer<typeof merchantSchema>;

export default function BecomeMerchantPage() {
  const { user } = useAuth();
  const { createMerchant, isMerchant } = useMerchant();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantSchema),
    defaultValues: {
      business_name: "",
      business_description: "",
      contact_email: user?.email || "",
      contact_phone: "",
    },
  });

  const onSubmit = async (values: MerchantFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await createMerchant(values);
      setSuccess(true);
      toast({
        title: "Merchant account created",
        description: "Your merchant account has been created successfully.",
      });

      // Redirect to merchant dashboard after a short delay
      setTimeout(() => {
        router.push("/merchant/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Merchant creation error:", err);
      setError("Failed to create merchant account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If already a merchant, redirect to dashboard
  if (isMerchant) {
    router.push("/merchant/dashboard");
    return null;
  }

  // If not logged in, show message
  if (!user) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Become a Merchant</CardTitle>
            <CardDescription>You need to be logged in to create a merchant account.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/login?redirect=/become-merchant")}>Login to Continue</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Become a Merchant</h1>

        {success ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Application Successful!</h2>
                <p className="text-muted-foreground mb-4">
                  Your merchant account has been created successfully. You will be redirected to your dashboard shortly.
                </p>
                <Button onClick={() => router.push("/merchant/dashboard")}>Go to Merchant Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Merchant Application</CardTitle>
              <CardDescription>
                Fill out the form below to create your merchant account and start selling products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="business_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your business name" {...field} />
                        </FormControl>
                        <FormDescription>This will be displayed to customers on your products.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="business_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your business" className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormDescription>Tell customers about your business, products, and values.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          This email will be used for order notifications and customer inquiries.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormDescription>A phone number where you can be reached for business matters.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Merchant Account
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
