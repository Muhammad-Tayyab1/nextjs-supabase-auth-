"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PhoneOtpForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function sendCode(formData: FormData) {
    setError(null);
    const value = (formData.get("phone") as string).trim();

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({ phone: value });
      if (error) {
        setError(error.message);
        return;
      }
      setPhone(value);
      setStep("code");
    });
  }

  function verifyCode() {
    setError(null);
    startTransition(async () => {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  if (step === "code") {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="otp">Verification code</Label>
          <p className="text-muted-foreground text-sm">
            Enter the code we sent to {phone}
          </p>
          <InputOTP
            maxLength={6}
            id="otp"
            value={code}
            onChange={setCode}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={isPending || code.length < 6}
          onClick={verifyCode}
        >
          Verify code
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={isPending}
          onClick={() => {
            setStep("phone");
            setCode("");
            setError(null);
          }}
        >
          Use a different number
        </Button>
      </div>
    );
  }

  return (
    <form action={sendCode} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+1 555 555 5555"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        Send code
      </Button>
    </form>
  );
}
