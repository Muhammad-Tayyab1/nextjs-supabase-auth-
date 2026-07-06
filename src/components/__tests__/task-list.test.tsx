import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskList } from "../task-list";

vi.mock("@/app/dashboard/actions", () => ({
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
}));

describe("TaskList", () => {
  it("shows an empty state when there are no tasks", () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByText("No tasks yet.")).toBeInTheDocument();
    expect(screen.getByText("0 of 0 remaining")).toBeInTheDocument();
  });

  it("renders tasks and the remaining count", () => {
    render(
      <TaskList
        tasks={[
          { id: "1", title: "Write the README", is_complete: true },
          { id: "2", title: "Ship the feature", is_complete: false },
        ]}
      />,
    );

    expect(screen.getByText("Write the README")).toBeInTheDocument();
    expect(screen.getByText("Ship the feature")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 remaining")).toBeInTheDocument();
  });

  it("renders the add-task form", () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByPlaceholderText("Add a task...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});
