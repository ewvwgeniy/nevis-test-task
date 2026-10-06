import { fixture } from "../test/fixture";
import { toChartModel } from "./chart";
import { flattenVisible, getChartFocus, toTree, toggleExpanded } from "./tree";

const root = toTree(fixture.company);
const find = (id: string) => flattenVisible(root, new Set(["company", "b1", "anna"])).find((r) => r.node.id === id)!;

describe("toTree", () => {
  it("normalises branches/employees/channels into uniform levels", () => {
    expect(root.level).toBe("company");
    expect(root.children.map((c) => c.level)).toEqual(["branch", "branch", "branch"]);
    expect(find("anna").node.level).toBe("employee");
    expect(find("c1").node.level).toBe("channel");
  });

  it("handles uneven nesting", () => {
    expect(root.children[1].children).toEqual([]);
    expect(find("james").node.children).toEqual([]);
  });
});

describe("flattenVisible", () => {
  it("shows only the root when collapsed", () => {
    expect(flattenVisible(root, new Set()).map((r) => r.node.name)).toEqual(["Company"]);
  });

  it("reveals children in order with level metadata", () => {
    const rows = flattenVisible(root, new Set(["company", "b1"]));
    expect(rows.map((r) => r.node.name)).toEqual([
      "Company", "Branch 1", "Anna Blackwood", "James Walker", "Maria Gutierrez", "Robert Chen", "Sarah Smith",
      "Branch 2", "Branch 3",
    ]);
    const maria = rows.find((r) => r.node.id === "maria")!;
    expect(maria).toMatchObject({ depth: 3, posInSet: 3, setSize: 5, parentId: "b1", hasChildren: false });
  });

  it("ignores expansion of nodes without children", () => {
    const rows = flattenVisible(root, new Set(["company", "b2"]));
    expect(rows.find((r) => r.node.id === "b2")).toMatchObject({ hasChildren: false, isExpanded: false });
  });
});

describe("getChartFocus", () => {
  it("defaults to the company", () => {
    expect(getChartFocus(root, []).id).toBe("company");
  });

  it("follows the most recently expanded visible row", () => {
    expect(getChartFocus(root, ["company", "b1"]).id).toBe("b1");
    expect(getChartFocus(root, ["company", "b1", "anna"]).id).toBe("anna");
  });

  it("falls back when the focused row is collapsed or hidden", () => {
    expect(getChartFocus(root, ["company", "b1"].slice(0, 1)).id).toBe("company");
    // anna stays in the order, but is hidden once Branch 1 is collapsed.
    expect(getChartFocus(root, ["company", "anna"]).id).toBe("company");
  });
});

describe("toggleExpanded", () => {
  it("adds then removes an id", () => {
    expect(toggleExpanded(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleExpanded(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("toChartModel", () => {
  it("stacks the branches under the company, one datum per month", () => {
    const { series, data } = toChartModel(root, fixture.months);
    expect(series.map((s) => s.name)).toEqual(["Branch 1", "Branch 2", "Branch 3"]);
    expect(data).toHaveLength(12);
    expect(data[0]).toEqual({ month: "Feb 2024", b1: 147, b2: 76, b3: 27 });
    expect(data[11]).toMatchObject({ month: "Jan 2025", b1: 214, b2: 91, b3: 45 });
  });

  it("uses the design's palette for the three channels", () => {
    const anna = root.children[0].children[0];
    const { series, data } = toChartModel(anna, fixture.months);
    expect(series.map((s) => [s.name, s.color])).toEqual([
      ["Existing clients", "#B29DF8"],
      ["New organic", "#F4BEB4"],
      ["New paid", "#A75E6E"],
    ]);
    expect(data[2]).toMatchObject({ c1: 26, c2: 1, c3: 1 });
  });

  it("charts a leaf as a single series of itself", () => {
    const { series, data } = toChartModel(root.children[1], fixture.months);
    expect(series).toHaveLength(1);
    expect(data[0]).toMatchObject({ b2: 76 });
  });

  it("picks four nice y-axis steps above the tallest stack", () => {
    // tallest company stack: 214+91+45 = 350
    expect(toChartModel(root, fixture.months)).toMatchObject({ yMax: 400, yStep: 100 });
    // tallest Anna stack: 34+2+2 = 38
    expect(toChartModel(root.children[0].children[0], fixture.months)).toMatchObject({ yMax: 40, yStep: 10 });
  });
});
