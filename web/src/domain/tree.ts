import type { ApiCompany, FlatRow, NodeLevel, TreeNode } from "./types";

type NodeFields = Pick<TreeNode, "id" | "name" | "values">;

const node = ({ id, name, values }: NodeFields, level: NodeLevel, children: TreeNode[]): TreeNode => ({
  id,
  name,
  values,
  level,
  children,
});

/** Normalises the API's level-specific keys (branches/employees/channels) into one uniform tree. */
export function toTree(company: ApiCompany): TreeNode {
  return node(
    company,
    "company",
    company.branches.map((branch) =>
      node(
        branch,
        "branch",
        (branch.employees ?? []).map((employee) =>
          node(
            employee,
            "employee",
            (employee.channels ?? []).map((channel) => node(channel, "channel", [])),
          ),
        ),
      ),
    ),
  );
}

/** Flattens the tree into the rows that are currently on screen, in display order. */
export function flattenVisible(root: TreeNode, expanded: ReadonlySet<string>): FlatRow[] {
  const rows: FlatRow[] = [];
  const visit = (node: TreeNode, depth: number, parentId: string | null, pos: number, size: number) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = hasChildren && expanded.has(node.id);
    rows.push({ node, depth, parentId, posInSet: pos, setSize: size, hasChildren, isExpanded });
    if (isExpanded) {
      node.children.forEach((child, i) => visit(child, depth + 1, node.id, i + 1, node.children.length));
    }
  };
  visit(root, 1, null, 1, 1);
  return rows;
}

/**
 * The node whose children the chart stacks: the most recently expanded row that is still visible.
 * Collapsing it hands the chart back to the previous expansion, ultimately the company.
 */
export function getChartFocus(root: TreeNode, expandedOrder: readonly string[]): TreeNode {
  const visible = flattenVisible(root, new Set(expandedOrder));
  const visibleExpanded = new Map(visible.filter((r) => r.isExpanded).map((r) => [r.node.id, r.node]));
  for (let i = expandedOrder.length - 1; i >= 0; i--) {
    const node = visibleExpanded.get(expandedOrder[i]);
    if (node) return node;
  }
  return root;
}

export function toggleExpanded(expandedOrder: readonly string[], id: string): string[] {
  return expandedOrder.includes(id) ? expandedOrder.filter((x) => x !== id) : [...expandedOrder, id];
}
