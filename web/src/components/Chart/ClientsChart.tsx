import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toChartModel } from "../../domain/chart";
import type { TreeNode } from "../../domain/types";
import styles from "./ClientsChart.module.css";

interface ClientsChartProps {
  /** The node whose children are stacked, one segment each. */
  focus: TreeNode;
  months: readonly string[];
}

const AXIS_TICK = { fontSize: 12, fill: "rgba(20, 20, 19, 0.6)" };

export function ClientsChart({ focus, months }: ClientsChartProps) {
  const { series, data, yMax, yStep } = useMemo(() => toChartModel(focus, months), [focus, months]);
  const ticks = useMemo(() => Array.from({ length: yMax / yStep + 1 }, (_, i) => i * yStep), [yMax, yStep]);
  const summary = `Stacked bar chart of ${focus.name} clients per month, split by ${series
    .map((s) => s.name)
    .join(", ")}. Full data is in the table below.`;

  return (
    <section className={styles.card} aria-label={`${focus.name} chart`}>
      <div className={styles.scroller}>
        <div className={styles.plot} role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }} barCategoryGap={24}>
              <CartesianGrid vertical={false} stroke="rgba(20, 20, 19, 0.16)" strokeDasharray="2 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={AXIS_TICK} />
              <YAxis
                width={38}
                ticks={ticks}
                domain={[0, yMax]}
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
              />
              <Tooltip
                cursor={{ fill: "rgba(20, 20, 19, 0.04)" }}
                contentStyle={{ borderRadius: 8, border: "1px solid rgba(20, 20, 19, 0.08)", fontSize: 12 }}
              />
              {series.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  stackId="clients"
                  fill={s.color}
                  isAnimationActive={false}
                  radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ul className={styles.legend} aria-label="Legend">
        {series.map((s) => (
          <li key={s.key} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: s.color }} aria-hidden="true" />
            {s.name}
          </li>
        ))}
      </ul>

      {/* The chart is a picture to assistive tech; this table carries the same numbers. */}
      <div className="sr-only">
      <table>
        <caption>{`${focus.name} clients per month by ${series.map((s) => s.name).join(", ")}`}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            {series.map((s) => (
              <th scope="col" key={s.key}>{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <th scope="row">{d.month}</th>
              {series.map((s) => (
                <td key={s.key}>{d[s.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}
