interface ChevronIconProps {
  /** Points down when open, right when closed. */
  open: boolean;
}

export function ChevronIcon({ open }: ChevronIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ transform: open ? undefined : "rotate(-90deg)", flex: "none" }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
