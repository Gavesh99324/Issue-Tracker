import { useNavigate, useParams } from "react-router-dom";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import {
  useDeleteIssueMutation,
  useGetIssueQuery,
  useUpdateIssueStatusMutation,
} from "../services/api";

const IssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: issue, isLoading, isError } = useGetIssueQuery(id || "");
  const [updateStatus] = useUpdateIssueStatusMutation();
  const [deleteIssue] = useDeleteIssueMutation();

  if (isLoading) return <div className="panel card">Loading...</div>;
  if (isError || !issue)
    return <div className="panel card">Issue not found.</div>;

  const handleStatus = async (status: typeof issue.status) => {
    await updateStatus({ id: issue.id, status });
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this issue?")) return;
    await deleteIssue(issue.id);
    navigate("/");
  };

  return (
    <div className="panel card">
      <div className="header">
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{issue.title}</div>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>
            ID: {issue.id}
          </div>
        </div>
        <div className="flex">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </div>
      </div>

      <div style={{ marginTop: 8, color: "var(--muted)" }}>
        Created {new Date(issue.createdAt).toLocaleString()} — Owner{" "}
        {issue.createdBy?.name || "Unknown"}
      </div>

      <p style={{ lineHeight: 1.6 }}>{issue.description}</p>

      <div className="chip-list" style={{ marginTop: 10 }}>
        {issue.labels?.map((label) => (
          <span key={label} className="chip">
            {label}
          </span>
        ))}
      </div>

      <div className="flex" style={{ marginTop: 18 }}>
        {issue.status !== "IN_PROGRESS" && (
          <button
            className="btn btn-ghost"
            onClick={() => handleStatus("IN_PROGRESS")}
          >
            Start
          </button>
        )}
        {issue.status !== "RESOLVED" && (
          <button
            className="btn btn-primary"
            onClick={() => handleStatus("RESOLVED")}
          >
            Resolve
          </button>
        )}
        {issue.status !== "CLOSED" && (
          <button
            className="btn btn-ghost"
            onClick={() => handleStatus("CLOSED")}
          >
            Close
          </button>
        )}
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default IssueDetailPage;
