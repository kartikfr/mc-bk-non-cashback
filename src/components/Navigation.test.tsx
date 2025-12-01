import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navigation from "./Navigation";

describe("Navigation mobile menu", () => {
  const setup = () => {
    render(<Navigation />);
    const trigger = screen.getByLabelText(/open navigation menu/i);
    return { trigger };
  };

  it("opens dialog with role dialog and aria-modal when hamburger is clicked", () => {
    const { trigger } = setup();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: /main navigation/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("backdrop click closes the menu", () => {
    const { trigger } = setup();
    fireEvent.click(trigger);

    const backdrop = document.querySelector(".menu-backdrop") as HTMLElement;
    expect(backdrop).toBeTruthy();

    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog", { name: /main navigation/i })).toBeNull();
  });

  it("Escape key closes the menu and returns focus to trigger", () => {
    const { trigger } = setup();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: /main navigation/i });
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: /main navigation/i })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("disables body scroll while open and restores it on close", () => {
    const { trigger } = setup();

    fireEvent.click(trigger);
    expect(document.body.classList.contains("menu-scroll-lock")).toBe(true);

    const backdrop = document.querySelector(".menu-backdrop") as HTMLElement;
    fireEvent.click(backdrop);

    expect(document.body.classList.contains("menu-scroll-lock")).toBe(false);
  });
});


