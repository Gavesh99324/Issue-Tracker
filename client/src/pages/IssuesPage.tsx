import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import IssueForm from "../components/IssueForm";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import { useAppSelector } from "../hooks";
import {
  buildExportUrl,
  useCreateIssueMutation,
  useDeleteIssueMutation,
  useGetIssuesQuery,
  useUpdateIssueMutation,
  useUpdateIssueStatusMutation,
} from "../services/api";
import type { Issue, IssueForm as IssueFormType } from "../services/api";
import { useDebounce } from "../utils/useDebounce";

const statusOrder: Issue["status"][] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const IssuesPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Issue["status"] | "">("");
  const [priority, setPriority] = useState<Issue["priority"] | "">("");
  const [severity, setSeverity] = useState<Issue["severity"] | "">("");
  const [assignee, setAssignee] = useState<string>("");
  const [editing, setEditing] = useState<Issue | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      status: (status || undefined) as Issue["status"] | undefined,
      priority: (priority || undefined) as Issue["priority"] | undefined,
      severity: (severity || undefined) as Issue["severity"] | undefined,
      assignee: assignee || undefined,
    }),
    [page, pageSize, debouncedSearch, status, priority, severity, assignee],
  );

  const { data, isLoading, refetch } = useGetIssuesQuery(queryArgs);
  const [createIssue, { isLoading: creating }] = useCreateIssueMutation();
  const [updateIssue, { isLoading: updating }] = useUpdateIssueMutation();
  const [updateStatus] = useUpdateIssueStatusMutation();
  const [deleteIssue] = useDeleteIssueMutation();

  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority, severity, assignee]);

  const onCreate = async (values: IssueFormType) => {
    await createIssue(values).unwrap();
    setShowCreate(false);
  };

  const onUpdate = async (values: IssueFormType) => {
    if (!editing) return;
    await updateIssue({ id: editing.id, data: values }).unwrap();
    setEditing(null);
  };

  const confirmStatus = async (issue: Issue, statusValue: Issue["status"]) => {
    if (!window.confirm(`Mark issue as ${statusValue.replace("_", " ")}?`))
      return;
    await updateStatus({ id: issue.id, status: statusValue });
  };

  const confirmDelete = async (id: string) => {
    if (!window.confirm("Delete this issue? This cannot be undone.")) return;
    await deleteIssue(id);
  };

  const filtersApplied =
    status || priority || severity || assignee || debouncedSearch;

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="panel card">
        <div className="header">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Issues</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>
              Prioritize, filter, and keep momentum.
            </div>
          </div>
          <div className="flex">
            <button className="btn btn-ghost" onClick={() => refetch()}>
              Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreate(true)}
            >
              New issue
            </button>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div>
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Search by title or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Any</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="label">Severity</label>
            <select
              className="select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">Any</option>
              <option value="MINOR">Minor</option>
              <option value="MAJOR">Major</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="label">Assignee</label>
            <input
              className="input"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Filter by assignee"
            />
          </div>
        </div>

        <div
          className="flex"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <div className="chip-list">
            {statusOrder.map((st) => (
              <span
                key={st}
                className="chip"
                style={{ border: "1px solid var(--border)" }}
              >
                {st.replace("_", " ")}: {data?.counts?.[st] ?? 0}
              </span>
            ))}
          </div>
          <div className="flex">
            <a
              className="btn btn-ghost"
              href={buildExportUrl(queryArgs as any, "json")}
            >
              Export JSON
            </a>
            <a
              className="btn btn-ghost"
              href={buildExportUrl(queryArgs as any, "csv")}
            >
              Export CSV
            </a>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {isLoading ? (
            <div style={{ color: "var(--muted)" }}>Loading issues...</div>
          ) : data && data.items.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Owner</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{issue.title}</div>
                      <div
                        style={{
                          color: "var(--muted)",
                          fontSize: 13,
                          marginTop: 4,
                        }}
                      >
                        {issue.description.slice(0, 80)}
                        {issue.description.length > 80 ? "…" : ""}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={issue.status} />
                    </td>
                    <td>
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td style={{ color: "var(--muted)" }}>
                      {issue.assignee || "—"}
                    </td>
                    <td style={{ color: "var(--muted)" }}>
                      {issue.createdBy?.name || "—"}
                    </td>
                    <td
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Link
                        className="btn btn-ghost"
                        to={`/issues/${issue.id}`}
                      >
                        View
                      </Link>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setEditing(issue)}
                      >
                        Edit
                      </button>
                      {issue.status !== "RESOLVED" && (
                        <button
                          className="btn btn-primary"
                          onClick={() => confirmStatus(issue, "RESOLVED")}
                        >
                          Resolve
                        </button>
                      )}
                      {issue.status !== "CLOSED" && (
                        <button
                          className="btn btn-ghost"
                          onClick={() => confirmStatus(issue, "CLOSED")}
                        >
                          Close
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={() => confirmDelete(issue.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: "var(--muted)", padding: 16 }}>
              No issues yet.
            </div>
          )}
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div
            className="flex"
            style={{ justifyContent: "flex-end", marginTop: 12 }}
          >
            <button
              className="btn btn-ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </button>
            <div className="chip">
              Page {page} / {data.pagination.totalPages}
            </div>
            <button
              className="btn btn-ghost"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}

        {filtersApplied && (
          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
            Filters active.{" "}
            <button
              className="btn btn-ghost"
              onClick={() => {
                setStatus("");
                setPriority("");
                setSeverity("");
                setAssignee("");
                setSearch("");
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <IssueForm
          onSubmit={onCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel={creating ? "Saving..." : "Create"}
        />
      )}

      {editing && (
        <IssueForm
          initial={editing}
          onSubmit={onUpdate}
          onCancel={() => setEditing(null)}
          submitLabel={updating ? "Saving..." : "Save changes"}
        />
      )}

      <div
        className="panel card"
        style={{ color: "var(--muted)", fontSize: 13 }}
      >
        Signed in as <strong>{user?.email}</strong>.
      </div>
    </div>
  );
};

export default IssuesPage;
