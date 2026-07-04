"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Factor } from "@supabase/supabase-js";
import { ShieldCheckIcon, ShieldIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export function MfaManager() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refreshFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  }

  useEffect(() => {
    let active = true;
    async function loadFactors() {
      const { data } = await supabase.auth.mfa.listFactors();
      if (active) setFactors(data?.totp ?? []);
    }
    loadFactors();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEnrollment() {
    setError(null);
    startTransition(async () => {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (error) {
        setError(error.message);
        return;
      }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setEnrolling(true);
    });
  }

  function confirmEnrollment() {
    if (!factorId) return;
    setError(null);
    startTransition(async () => {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (error) {
        setError(error.message);
        return;
      }
      setEnrolling(false);
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setCode("");
      await refreshFactors();
      router.refresh();
    });
  }

  function cancelEnrollment() {
    const idToRemove = factorId;
    setEnrolling(false);
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setCode("");
    setError(null);
    if (idToRemove) {
      supabase.auth.mfa.unenroll({ factorId: idToRemove });
    }
  }

  function removeFactor(id: string) {
    setError(null);
    startTransition(async () => {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) {
        setError(error.message);
        return;
      }
      await refreshFactors();
      router.refresh();
    });
  }

  const verifiedFactor = factors.find((f) => f.status === "verified");

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {verifiedFactor ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="text-success size-4" />
            <span className="text-sm">Authenticator app enabled</span>
            <Badge variant="secondary">{verifiedFactor.friendly_name ?? "TOTP"}</Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => removeFactor(verifiedFactor.id)}
          >
            Disable
          </Button>
        </div>
      ) : enrolling && qrCode ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <ShieldIcon className="size-4" />
            Scan this QR code with your authenticator app
          </div>
          {/* Supabase returns a trusted inline SVG data URI for the TOTP QR code */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCode}
            alt="TOTP QR code"
            width={180}
            height={180}
            className="rounded-md border bg-white p-2"
          />
          {secret && (
            <p className="text-muted-foreground text-xs break-all">
              Or enter this code manually: <code>{secret}</code>
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="mfa-enroll-otp">Verification code</Label>
            <InputOTP
              maxLength={6}
              id="mfa-enroll-otp"
              value={code}
              onChange={setCode}
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
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={isPending || code.length < 6}
              onClick={confirmEnrollment}
            >
              Confirm
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={cancelEnrollment}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldIcon className="text-muted-foreground size-4" />
            <span className="text-muted-foreground text-sm">
              Two-factor authentication is not enabled
            </span>
          </div>
          <Button type="button" size="sm" disabled={isPending} onClick={startEnrollment}>
            Enable
          </Button>
        </div>
      )}
    </div>
  );
}
