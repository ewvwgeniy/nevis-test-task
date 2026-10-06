import { render, screen, within } from "@testing-library/react";
import { toTree } from "../../domain/tree";
import { fixture } from "../../test/fixture";
import { ClientsChart } from "./ClientsChart";

const root = toTree(fixture.company);

describe("ClientsChart", () => {
  it("maps the company's branches to legend entries and a data table", () => {
    render(<ClientsChart focus={root} months={fixture.months} />);

    const legend = screen.getByRole("list", { name: "Legend" });
    expect(within(legend).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Branch 1", "Branch 2", "Branch 3",
    ]);

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(13); // header + 12 months
    expect(within(rows[0]).getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Month", "Branch 1", "Branch 2", "Branch 3",
    ]);
    expect(within(rows[1]).getAllByRole("cell").map((c) => c.textContent)).toEqual(["147", "76", "27"]);
    expect(within(rows[12]).getByRole("rowheader")).toHaveTextContent("Jan 2025");
  });

  it("restacks by channel when focused on an employee", () => {
    const anna = root.children[0].children[0];
    render(<ClientsChart focus={anna} months={fixture.months} />);
    const legend = screen.getByRole("list", { name: "Legend" });
    expect(within(legend).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Existing clients", "New organic", "New paid",
    ]);
  });

  it("describes the chart for assistive tech", () => {
    render(<ClientsChart focus={root} months={fixture.months} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(/Company clients per month.*Branch 1, Branch 2, Branch 3/);
  });
});
