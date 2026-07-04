import { requestEmailChange, updatePassword } from "@/app/auth/actions";
import { IdentityManager } from "@/components/identity-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function AccountSettings({ email }: { email: string | null }) {
  return (
    <div className="space-y-6">
      <form action={requestEmailChange} className="space-y-2">
        <Label htmlFor="new-email">Email address</Label>
        <div className="flex gap-2">
          <Input
            id="new-email"
            name="email"
            type="email"
            required
            defaultValue={email ?? ""}
            placeholder="you@example.com"
          />
          <Button type="submit" variant="outline">
            Update
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          We&apos;ll send a confirmation link to the new address.
        </p>
      </form>

      <Separator />

      <form action={updatePassword} className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <div className="flex gap-2">
          <Input
            id="new-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
          <Button type="submit" variant="outline">
            Update
          </Button>
        </div>
      </form>

      <Separator />

      <div className="space-y-2">
        <Label>Linked sign-in methods</Label>
        <IdentityManager />
      </div>
    </div>
  );
}
