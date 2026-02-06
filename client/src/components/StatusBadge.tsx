type Props = { status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" };

const tone: Record<Props["status"], { bg: string; fg: string; label: string }> =
  {
    OPEN: { bg: "rgba(63,184,175,0.16)", fg: "#3fb8af", label: "Open" },
    IN_PROGRESS: {
      bg: "rgba(246,183,60,0.18)",
      fg: "#f6b73c",
      label: "In Progress",
    },
    RESOLVED: {
      bg: "rgba(123,216,143,0.18)",
      fg: "#7bd88f",
      label: "Resolved",
    },
    CLOSED: { bg: "rgba(242,95,92,0.16)", fg: "#f25f5c", label: "Closed" },
  };

const StatusBadge = ({ status }: Props) => (
  <span
    className="badge"
    style={{
      background: tone[status].bg,
      color: tone[status].fg,
      border: `1px solid ${tone[status].fg}55`,
    }}
  >
    {tone[status].label}
  </span>
);

export default StatusBadge;
