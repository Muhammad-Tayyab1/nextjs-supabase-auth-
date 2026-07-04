import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthMessage({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;

  return (
    <Alert variant={error ? "destructive" : "success"} className="mb-4">
      {error ? (
        <TriangleAlertIcon />
      ) : (
        <CheckCircle2Icon />
      )}
      <AlertDescription>{error || message}</AlertDescription>
    </Alert>
  );
}
