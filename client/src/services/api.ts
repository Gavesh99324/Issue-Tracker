import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export type User = {
  id: string;
  email: string;
  name: string;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  severity?: "MINOR" | "MAJOR" | "CRITICAL" | null;
  assignee?: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  createdBy?: User;
};

export type IssueForm = {
  title: string;
  description: string;
  status?: Issue["status"];
  priority?: Issue["priority"];
  severity?: Issue["severity"];
  assignee?: string | null;
  labels?: string[];
};

export type IssueListResponse = {
  items: Issue[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  counts: Record<Issue["status"], number>;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Issues"],
  endpoints: (builder) => ({
    login: builder.mutation<
      { token: string; user: User },
      { email: string; password: string }
    >({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: builder.mutation<
      { token: string; user: User },
      { email: string; password: string; name: string }
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    me: builder.query<{ user: User }, void>({
      query: () => ({ url: "/auth/me" }),
    }),
    getIssues: builder.query<
      IssueListResponse,
      {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: Issue["status"];
        priority?: Issue["priority"];
        severity?: Issue["severity"];
        assignee?: string;
      }
    >({
      query: (params) => ({
        url: "/issues",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((issue) => ({
                type: "Issues" as const,
                id: issue.id,
              })),
              { type: "Issues" as const, id: "LIST" },
            ]
          : [{ type: "Issues", id: "LIST" }],
    }),
    getIssue: builder.query<Issue, string>({
      query: (id) => ({ url: `/issues/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Issues", id }],
    }),
    createIssue: builder.mutation<Issue, IssueForm>({
      query: (body) => ({ url: "/issues", method: "POST", body }),
      invalidatesTags: [{ type: "Issues", id: "LIST" }],
    }),
    updateIssue: builder.mutation<Issue, { id: string; data: IssueForm }>({
      query: ({ id, data }) => ({
        url: `/issues/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Issues", id: arg.id },
        { type: "Issues", id: "LIST" },
      ],
    }),
    updateIssueStatus: builder.mutation<
      Issue,
      { id: string; status: Issue["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/issues/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Issues", id: arg.id },
        { type: "Issues", id: "LIST" },
      ],
    }),
    deleteIssue: builder.mutation<void, string>({
      query: (id) => ({ url: `/issues/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Issues", id: "LIST" }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useGetIssuesQuery,
  useGetIssueQuery,
  useCreateIssueMutation,
  useUpdateIssueMutation,
  useUpdateIssueStatusMutation,
  useDeleteIssueMutation,
} = api;

export const buildExportUrl = (
  params: Record<string, string | number | undefined>,
  format: "csv" | "json" = "csv",
) => {
  const filtered: Record<string, string> = {};
  Object.entries({ ...params, format }).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const stringValue = String(value);
    if (stringValue === "") return;
    filtered[key] = stringValue;
  });
  const search = new URLSearchParams(filtered).toString();
  return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/issues/export?${search}`;
};
