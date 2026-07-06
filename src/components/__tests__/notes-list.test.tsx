import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotesList } from "../notes-list";

vi.mock("@/app/dashboard/actions", () => ({
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

describe("NotesList", () => {
  it("shows an empty state when there are no notes", () => {
    render(<NotesList notes={[]} />);
    expect(screen.getByText("No notes yet.")).toBeInTheDocument();
  });

  it("renders each note pre-filled in an editable form", () => {
    render(
      <NotesList
        notes={[{ id: "1", title: "Idea", body: "Add a kanban board next." }]}
      />,
    );

    expect(screen.getByDisplayValue("Idea")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Add a kanban board next.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders the new-note form", () => {
    render(<NotesList notes={[]} />);
    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a note...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add note" })).toBeInTheDocument();
  });
});
