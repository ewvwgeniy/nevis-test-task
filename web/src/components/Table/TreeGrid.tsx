import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronIcon } from "../common/ChevronIcon";
import styles from "./TreeGrid.module.css";

/** Minimum a row needs for the grid to drive ARIA and keyboard behaviour. */
export interface TreeGridRow {
  id: string;
  depth: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

interface TreeGridProps<R extends TreeGridRow> {
  rows: readonly R[];
  /** Column headers for the value columns. */
  columns: readonly string[];
  /** Header for the first (row-header) column. Visually hidden by default in the design. */
  rowHeaderLabel: string;
  label: string;
  onToggle: (id: string) => void;
  /** Content of the first cell, next to the chevron. */
  renderLabel: (row: R) => ReactNode;
  getValues: (row: R) => readonly number[];
}

const INDENT_PX = 28;

/**
 * A WAI-ARIA treegrid. Rows are the focus targets (roving tabindex):
 * Up/Down/Home/End move, Right expands (or enters), Left collapses (or leaves), Enter/Space toggle.
 */
export function TreeGrid<R extends TreeGridRow>({
  rows,
  columns,
  rowHeaderLabel,
  label,
  onToggle,
  renderLabel,
  getValues,
}: TreeGridProps<R>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const ids = rows.map((r) => r.id);
  // If the active row disappeared (e.g. its parent collapsed), fall back to the first row.
  const tabbableId = activeId && ids.includes(activeId) ? activeId : ids[0];

  const focusRow = (id: string | undefined) => {
    if (!id) return;
    setActiveId(id);
    rowRefs.current.get(id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, row: R, index: number) => {
    if (event.target !== event.currentTarget) return;
    switch (event.key) {
      case "ArrowDown":
        focusRow(ids[index + 1]);
        break;
      case "ArrowUp":
        focusRow(ids[index - 1]);
        break;
      case "Home":
        focusRow(ids[0]);
        break;
      case "End":
        focusRow(ids[ids.length - 1]);
        break;
      case "ArrowRight":
        if (row.hasChildren && !row.isExpanded) onToggle(row.id);
        else if (row.isExpanded) focusRow(ids[index + 1]);
        break;
      case "ArrowLeft":
        if (row.isExpanded) onToggle(row.id);
        else if (row.parentId) focusRow(row.parentId);
        break;
      case "Enter":
      case " ":
        if (row.hasChildren) onToggle(row.id);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div className={styles.scroller}>
      <div role="treegrid" aria-label={label} className={styles.grid}>
        <div role="row" className={`${styles.row} ${styles.headerRow}`}>
          <div role="columnheader" className={styles.labelCell}>
            <span className="sr-only">{rowHeaderLabel}</span>
          </div>
          {columns.map((column) => (
            <div role="columnheader" key={column} className={styles.valueCell}>
              {column}
            </div>
          ))}
        </div>

        {rows.map((row, index) => (
          <div
            key={row.id}
            ref={(el) => {
              if (el) rowRefs.current.set(row.id, el);
              else rowRefs.current.delete(row.id);
            }}
            role="row"
            aria-level={row.depth}
            aria-posinset={row.posInSet}
            aria-setsize={row.setSize}
            aria-expanded={row.hasChildren ? row.isExpanded : undefined}
            tabIndex={row.id === tabbableId ? 0 : -1}
            className={`${styles.row} ${styles.bodyRow} ${row.hasChildren ? styles.expandable : ""}`}
            onFocus={(e) => e.target === e.currentTarget && setActiveId(row.id)}
            onClick={() => {
              setActiveId(row.id);
              if (row.hasChildren) onToggle(row.id);
            }}
            onKeyDown={(e) => onKeyDown(e, row, index)}
          >
            <div
              role="rowheader"
              className={styles.labelCell}
              style={{ paddingLeft: (row.depth - 1) * INDENT_PX }}
            >
              <span className={styles.chevron}>{row.hasChildren && <ChevronIcon open={row.isExpanded} />}</span>
              {renderLabel(row)}
            </div>
            {getValues(row).map((value, i) => (
              <div role="gridcell" key={columns[i] ?? i} className={styles.valueCell}>
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
