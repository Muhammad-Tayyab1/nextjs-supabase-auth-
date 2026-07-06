import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthMessage } from "../auth-message";

describe("AuthMessage", () => {
  it("renders nothing when there is no error or message", () => {
    const { container } = render(<AuthMessage />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the error text in a destructive alert", () => {
    render(<AuthMessage error="Invalid credentials" />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders the success message when there is no error", () => {
    render(<AuthMessage message="Check your email" />);
    expect(screen.getByText("Check your email")).toBeInTheDocument();
  });

  it("prefers the error over the message when both are present", () => {
    render(<AuthMessage error="Something broke" message="All good" />);
    expect(screen.getByText("Something broke")).toBeInTheDocument();
    expect(screen.queryByText("All good")).not.toBeInTheDocument();
  });
});
