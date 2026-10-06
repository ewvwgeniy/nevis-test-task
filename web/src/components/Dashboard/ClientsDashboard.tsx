import { useMemo, useState } from "react";
import { getChartFocus, toTree, toggleExpanded } from "../../domain/tree";
import type { ClientsResponse } from "../../domain/types";
import { ClientsChart } from "../Chart/ClientsChart";
import { ClientsTable } from "../Table/ClientsTable";

interface ClientsDashboardProps {
  data: ClientsResponse;
}

/** Owns the expansion state shared by the table (which rows show) and the chart (what it stacks). */
export function ClientsDashboard({ data }: ClientsDashboardProps) {
  const root = useMemo(() => toTree(data.company), [data.company]);
  // Ordered, so the chart can follow whichever row was expanded last.
  const [expandedOrder, setExpandedOrder] = useState<string[]>(() => [root.id]);
  const expanded = useMemo(() => new Set(expandedOrder), [expandedOrder]);
  const focus = useMemo(() => getChartFocus(root, expandedOrder), [root, expandedOrder]);

  return (
    <>
      <ClientsChart focus={focus} months={data.months} />
      <ClientsTable
        root={root}
        months={data.months}
        expanded={expanded}
        onToggle={(id) => setExpandedOrder((order) => toggleExpanded(order, id))}
      />
    </>
  );
}
