import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { toTree, toggleExpanded } from "../../domain/tree";
import { fixture } from "../../test/fixture";
import { ClientsTable } from "./ClientsTable";

const root = toTree(fixture.company);

function Harness() {
  const [order, setOrder] = useState<string[]>(["company"]);
  return (
    <ClientsTable
      root={root}
      months={fixture.months}
      expanded={new Set(order)}
      onToggle={(id) => setOrder((o) => toggleExpanded(o, id))}
    />
  );
}

const row = (name: string) => screen.getByRole("row", { name: new RegExp(`^${name}`) });
const rowNames = () =>
  // The label is the last child; the avatar (initials) is decorative.
  screen.getAllByRole("rowheader").map((h) => h.lastElementChild!.textContent);

describe("ClientsTable", () => {
  it("starts with the company open and its branches visible", () => {
    render(<Harness />);
    expect(rowNames()).toEqual(["Company", "Branch 1", "Branch 2", "Branch 3"]);
    expect(row("Company")).toHaveAttribute("aria-expanded", "true");
    expect(row("Branch 1")).toHaveAttribute("aria-expanded", "false");
  });

  it("expands and collapses a row with the mouse", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(row("Branch 1"));
    expect(row("Branch 1")).toHaveAttribute("aria-expanded", "true");
    expect(rowNames()).toContain("Anna Blackwood");

    await user.click(row("Branch 1"));
    expect(row("Branch 1")).toHaveAttribute("aria-expanded", "false");
    expect(rowNames()).not.toContain("Anna Blackwood");
  });

  it("exposes the hierarchy to assistive tech", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(row("Branch 1"));
    await user.click(row("Anna Blackwood"));

    expect(screen.getByRole("treegrid", { name: "Clients by month" })).toBeInTheDocument();
    expect(row("Company")).toHaveAttribute("aria-level", "1");
    expect(row("Branch 1")).toHaveAttribute("aria-level", "2");
    expect(row("Anna Blackwood")).toHaveAttribute("aria-level", "3");
    expect(row("New paid")).toHaveAttribute("aria-level", "4");
    expect(row("Maria Gutierrez")).toHaveAttribute("aria-posinset", "3");
    expect(row("Maria Gutierrez")).toHaveAttribute("aria-setsize", "5");
  });

  it("does not mark leaf rows as expandable", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(row("Branch 2")).not.toHaveAttribute("aria-expanded");

    await user.click(row("Branch 2")); // no-op, nothing to reveal
    expect(rowNames()).toEqual(["Company", "Branch 1", "Branch 2", "Branch 3"]);
  });

  it("renders channels only under Anna Blackwood", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(row("Branch 1"));
    await user.click(row("James Walker")); // employee without channels: no-op
    expect(row("James Walker")).not.toHaveAttribute("aria-expanded");

    await user.click(row("Anna Blackwood"));
    expect(rowNames()).toEqual(expect.arrayContaining(["Existing clients", "New organic", "New paid"]));
    const organic = within(row("New organic")).getAllByRole("gridcell").map((c) => c.textContent);
    expect(organic).toEqual(["0", "1", "1", "1", "0", "2", "2", "1", "1", "1", "1", "2"]);
  });

  describe("keyboard", () => {
    it("toggles the focused row with Enter and Space", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      act(() => row("Company").focus());
      await user.keyboard("{ArrowDown}{Enter}");
      expect(row("Branch 1")).toHaveAttribute("aria-expanded", "true");
      await user.keyboard(" ");
      expect(row("Branch 1")).toHaveAttribute("aria-expanded", "false");
    });

    it("expands with ArrowRight, enters the first child, and goes back with ArrowLeft", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      act(() => row("Company").focus());
      await user.keyboard("{ArrowDown}{ArrowRight}");
      expect(row("Branch 1")).toHaveAttribute("aria-expanded", "true");
      expect(row("Branch 1")).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(row("Anna Blackwood")).toHaveFocus();

      await user.keyboard("{ArrowLeft}"); // leaf-like row not expanded: go to parent
      expect(row("Branch 1")).toHaveFocus();

      await user.keyboard("{ArrowLeft}"); // expanded: collapse
      expect(row("Branch 1")).toHaveAttribute("aria-expanded", "false");
      expect(row("Branch 1")).toHaveFocus();
    });

    it("moves with Home/End and keeps a single tab stop", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      act(() => row("Company").focus());
      await user.keyboard("{End}");
      expect(row("Branch 3")).toHaveFocus();
      expect(screen.getAllByRole("row").filter((r) => r.getAttribute("tabindex") === "0")).toHaveLength(1);
      await user.keyboard("{Home}");
      expect(row("Company")).toHaveFocus();
    });

    it("falls back to a valid tab stop when the focused row disappears", async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(row("Branch 1"));
      await user.click(row("Anna Blackwood"));
      await user.click(row("Branch 1")); // collapses, hiding the active row
      const stops = screen.getAllByRole("row").filter((r) => r.getAttribute("tabindex") === "0");
      expect(stops).toHaveLength(1);
    });
  });
});
