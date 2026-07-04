import { updateProfile } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({
  displayName,
  bio,
}: {
  displayName: string | null;
  bio: string | null;
}) {
  return (
    <form action={updateProfile} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName ?? ""}
          placeholder="Ada Lovelace"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio ?? ""}
          placeholder="Tell us a little about yourself"
          rows={3}
        />
      </div>
      <Button type="submit" size="sm">
        Save profile
      </Button>
    </form>
  );
}
