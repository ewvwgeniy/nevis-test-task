import type { TreeNode } from "./types";

/** Palette from the design (existing / organic / paid) extended for wider levels. */
export const SERIES_COLORS = ["#B29DF8", "#F4BEB4", "#A75E6E", "#7FB7A4", "#E3B85C"] as const;

export interface ChartSeries {
  /** Node id — stable across renders, used as the data key. */
  key: string;
  name: string;
  color: string;
}

export type ChartDatum = { month: string; [seriesKey: string]: string | number };

export interface ChartModel {
  series: ChartSeries[];
  data: ChartDatum[];
  /** Upper bound of the y axis: four "nice" steps, e.g. 400 for a 350 peak, 40 for a 38 peak. */
  yMax: number;
  yStep: number;
}

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

export const formatMonth = (iso: string) => monthFormat.format(new Date(iso));

const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
const Y_INTERVALS = 4;

function niceStep(max: number): number {
  const raw = max / Y_INTERVALS;
  return NICE_STEPS.find((step) => step >= raw) ?? Math.ceil(raw / 1000) * 1000;
}

/** Maps the children of `focus` into stacked-chart series and one datum per month. */
export function toChartModel(focus: TreeNode, months: readonly string[]): ChartModel {
  // A leaf has nothing to stack, so it charts as a single series of itself.
  const parts = focus.children.length ? focus.children : [focus];
  const series = parts.map((node, i) => ({
    key: node.id,
    name: node.name,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
  }));
  const data = months.map((iso, monthIndex) => {
    const datum: ChartDatum = { month: formatMonth(iso) };
    for (const node of parts) datum[node.id] = node.values[monthIndex] ?? 0;
    return datum;
  });
  const maxTotal = Math.max(0, ...data.map((d) => series.reduce((sum, s) => sum + Number(d[s.key]), 0)));
  const yStep = niceStep(maxTotal);
  return { series, data, yMax: yStep * Y_INTERVALS, yStep };
}
