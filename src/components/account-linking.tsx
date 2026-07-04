import { linkEmailPassword, linkOAuthIdentity } from "@/app/auth/actions";
import { GithubIcon, GoogleIcon } from "@/components/provider-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function AccountLinking() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        You&apos;re browsing as a guest. Create a permanent account to keep
        your profile and data.
      </p>

      <form action={linkEmailPassword} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="link-email">Email</Label>
          <Input
            id="link-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link-password">Password</Label>
          <Input
            id="link-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </div>
        <Button type="submit" size="sm" className="w-full">
          Create account
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">or continue with</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <form action={linkOAuthIdentity}>
          <input type="hidden" name="provider" value="google" />
          <Button type="submit" variant="outline" size="sm" className="w-full">
            <GoogleIcon className="size-4" />
            Google
          </Button>
        </form>
        <form action={linkOAuthIdentity}>
          <input type="hidden" name="provider" value="github" />
          <Button type="submit" variant="outline" size="sm" className="w-full">
            <GithubIcon className="size-4" />
            GitHub
          </Button>
        </form>
      </div>
    </div>
  );
}
