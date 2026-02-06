type Props = { priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" };

const palette: Record<
  Props["priority"],
  { bg: string; fg: string; label: string }
> = {
  LOW: { bg: "rgba(63,184,175,0.14)", fg: "#3fb8af", label: "Low" },
  MEDIUM: { bg: "rgba(246,183,60,0.14)", fg: "#f6b73c", label: "Medium" },
  HIGH: { bg: "rgba(242,95,92,0.14)", fg: "#f25f5c", label: "High" },
  CRITICAL: { bg: "rgba(255,94,132,0.18)", fg: "#ff5e84", label: "Critical" },
};

const PriorityBadge = ({ priority }: Props) => (
  <span
    className="badge"
    style={{
      background: palette[priority].bg,
      color: palette[priority].fg,
      border: `1px solid ${palette[priority].fg}66`,
    }}
  >
    {palette[priority].label}
  </span>
);

export default PriorityBadge;
