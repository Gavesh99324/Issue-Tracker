import { Navigate, Route, Routes } from "react-router-dom";
import { useAppSelector } from "./hooks";
import AuthPage from "./pages/AuthPage";
import IssueDetailPage from "./pages/IssueDetailPage";
import IssuesPage from "./pages/IssuesPage";
import Layout from "./components/Layout";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAppSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <IssuesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issues/:id"
          element={
            <ProtectedRoute>
              <IssueDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
