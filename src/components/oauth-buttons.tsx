import { signInWithOAuth } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { GithubIcon, GoogleIcon } from "@/components/provider-icons";

export function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <form action={signInWithOAuth}>
        <input type="hidden" name="provider" value="google" />
        <Button type="submit" variant="outline" className="w-full">
          <GoogleIcon className="size-4" />
          Google
        </Button>
      </form>
      <form action={signInWithOAuth}>
        <input type="hidden" name="provider" value="github" />
        <Button type="submit" variant="outline" className="w-full">
          <GithubIcon className="size-4" />
          GitHub
        </Button>
      </form>
    </div>
  );
}
