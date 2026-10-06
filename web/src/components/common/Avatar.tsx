import styles from "./Avatar.module.css";

const TONES = ["#B29DF8", "#F4BEB4", "#A75E6E", "#7FB7A4", "#E3B85C"];

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]!.toUpperCase()).join("");

const toneFor = (name: string) => TONES[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % TONES.length];

interface AvatarProps {
  name: string;
  /** Optional photo; falls back to initials when absent. */
  src?: string;
}

/** Decorative: the person's name is always rendered next to it, so it is hidden from assistive tech. */
export function Avatar({ name, src }: AvatarProps) {
  return (
    <span className={styles.avatar} style={{ background: toneFor(name) }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
}
