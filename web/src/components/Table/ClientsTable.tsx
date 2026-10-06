import { useMemo } from "react";
import { formatMonth } from "../../domain/chart";
import { flattenVisible } from "../../domain/tree";
import type { FlatRow, TreeNode } from "../../domain/types";
import { Avatar } from "../common/Avatar";
import { TreeGrid, type TreeGridRow } from "./TreeGrid";

interface ClientsTableProps {
  root: TreeNode;
  months: readonly string[];
  expanded: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

type ClientRow = FlatRow & TreeGridRow;

export function ClientsTable({ root, months, expanded, onToggle }: ClientsTableProps) {
  const rows = useMemo<ClientRow[]>(
    () => flattenVisible(root, expanded).map((row) => ({ ...row, id: row.node.id })),
    [root, expanded],
  );
  const columns = useMemo(() => months.map(formatMonth), [months]);

  return (
    <TreeGrid
      label="Clients by month"
      rowHeaderLabel="Name"
      rows={rows}
      columns={columns}
      onToggle={onToggle}
      getValues={(row) => row.node.values}
      renderLabel={(row) => (
        <>
          {row.node.level === "employee" && <Avatar name={row.node.name} />}
          <span>{row.node.name}</span>
        </>
      )}
    />
  );
}
