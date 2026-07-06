import { createTask, deleteTask, toggleTask } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Task = {
  id: string;
  title: string;
  is_complete: boolean;
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  const pending = tasks.filter((t) => !t.is_complete).length;

  return (
    <div className="space-y-4">
      <form action={createTask} className="flex gap-2">
        <Input name="title" placeholder="Add a task..." required maxLength={200} />
        <Button type="submit">Add</Button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tasks yet.</p>
      ) : (
        <ul className="space-y-1">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2">
              <form action={toggleTask} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="id" value={task.id} />
                <input type="hidden" name="isComplete" value={String(task.is_complete)} />
                <button
                  type="submit"
                  aria-label={task.is_complete ? "Mark as incomplete" : "Mark as complete"}
                  className="border-input flex size-4 shrink-0 items-center justify-center rounded-sm border data-[complete=true]:bg-primary"
                  data-complete={task.is_complete}
                />
                <span
                  className={
                    task.is_complete
                      ? "text-muted-foreground text-sm line-through"
                      : "text-sm"
                  }
                >
                  {task.title}
                </span>
              </form>
              <form action={deleteTask}>
                <input type="hidden" name="id" value={task.id} />
                <Button type="submit" variant="ghost" size="sm">
                  Delete
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <p className="text-muted-foreground text-xs">
        {pending} of {tasks.length} remaining
      </p>
    </div>
  );
}
