import { createNote, deleteNote, updateNote } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export type Note = {
  id: string;
  title: string;
  body: string;
};

export function NotesList({ notes }: { notes: Note[] }) {
  return (
    <div className="space-y-4">
      <form action={createNote} className="space-y-2 rounded-md border p-3">
        <Input name="title" placeholder="Title" maxLength={120} />
        <Textarea name="body" placeholder="Write a note..." rows={2} maxLength={4000} />
        <Button type="submit" size="sm">
          Add note
        </Button>
      </form>

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note, i) => (
            <div key={note.id}>
              {i > 0 && <Separator className="mb-3" />}
              <form action={updateNote} className="space-y-2">
                <input type="hidden" name="id" value={note.id} />
                <Input name="title" defaultValue={note.title} maxLength={120} />
                <Textarea
                  name="body"
                  defaultValue={note.body}
                  rows={3}
                  maxLength={4000}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="outline">
                    Save
                  </Button>
                  <Button
                    type="submit"
                    formAction={deleteNote}
                    size="sm"
                    variant="ghost"
                  >
                    Delete
                  </Button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
