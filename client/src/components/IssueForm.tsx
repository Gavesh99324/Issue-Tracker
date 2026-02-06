import { useState } from "react";
import type { Issue, IssueForm as IssueFormType } from "../services/api";

const defaultValues: IssueFormType = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "OPEN",
  severity: undefined,
  assignee: "",
  labels: [],
};

type Props = {
  initial?: Issue;
  onSubmit: (values: IssueFormType) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
};

const IssueForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: Props) => {
  const [values, setValues] = useState<IssueFormType>(initial || defaultValues);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    key: keyof IssueFormType,
    value:
      | string
      | IssueFormType["priority"]
      | IssueFormType["status"]
      | IssueFormType["severity"],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleLabelsChange = (value: string) => {
    const labels = value
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    setValues((prev) => ({ ...prev, labels }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim() || !values.description.trim()) {
      setError("Title and description are required");
      return;
    }
    setError(null);
    await onSubmit(values);
  };

  return (
    <form className="panel card" onSubmit={handleSubmit}>
      <div className="header" style={{ marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {initial ? "Edit issue" : "Create issue"}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            Craft a clear, actionable item.
          </div>
        </div>
        <div className="flex">
          {onCancel && (
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {submitLabel}
          </button>
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            value={values.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Database migration blockers"
          />
        </div>
        <div>
          <label className="label">Assignee</label>
          <input
            className="input"
            value={values.assignee ?? ""}
            onChange={(e) => handleChange("assignee", e.target.value)}
            placeholder="alex@team.io"
          />
        </div>
      </div>

      <label className="label">Description</label>
      <textarea
        className="textarea"
        rows={4}
        value={values.description}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="What is happening? What is the expected outcome?"
      />

      <div className="form-grid" style={{ marginTop: 12 }}>
        <div>
          <label className="label">Status</label>
          <select
            className="select"
            value={values.status || "OPEN"}
            onChange={(e) =>
              handleChange("status", e.target.value as Issue["status"])
            }
          >
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
            value={values.priority || "MEDIUM"}
            onChange={(e) =>
              handleChange("priority", e.target.value as Issue["priority"])
            }
          >
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
            value={values.severity || ""}
            onChange={(e) =>
              handleChange(
                "severity",
                (e.target.value || undefined) as Issue["severity"],
              )
            }
          >
            <option value="">Not set</option>
            <option value="MINOR">Minor</option>
            <option value="MAJOR">Major</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="label">Labels (comma separated)</label>
        <input
          className="input"
          value={values.labels?.join(", ") || ""}
          onChange={(e) => handleLabelsChange(e.target.value)}
          placeholder="backend, api, ux"
        />
      </div>

      {error && (
        <div style={{ color: "var(--danger)", marginTop: 10 }}>{error}</div>
      )}
    </form>
  );
};

export default IssueForm;
