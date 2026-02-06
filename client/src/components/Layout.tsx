import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="panel card" style={{ marginBottom: 18 }}>
        <div className="header">
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>Issue Track</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>
              Ship faster with crisp visibility over work.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{user.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    {user.email}
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <div className="flex">
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="flex" style={{ gap: 8 }}>
          <Link
            to="/"
            className="btn btn-ghost"
            style={{
              background:
                location.pathname === "/" ? "rgba(63,184,175,0.12)" : undefined,
              borderColor:
                location.pathname === "/"
                  ? "rgba(63,184,175,0.6)"
                  : "var(--border)",
            }}
          >
            Issues
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
};

export default Layout;
