import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function UnverifiedWarning() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Account Under Review</AlertTitle>
      <AlertDescription>
        Your merchant account is currently pending verification. You will not be able to add or manage products until
        your account is verified by an administrator. This process typically takes 1-2 business days.
      </AlertDescription>
    </Alert>
  );
}
