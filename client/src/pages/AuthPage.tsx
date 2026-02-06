import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setCredentials } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useLoginMutation, useRegisterMutation } from "../services/api";

type Props = {
  mode: "login" | "register";
};

const AuthPage = ({ mode }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const [login, { isLoading: loginLoading, error: loginError }] =
    useLoginMutation();
  const [register, { isLoading: registerLoading, error: registerError }] =
    useRegisterMutation();

  const [email, setEmail] = useState("demo@team.io");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Demo User");

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials(res));
      navigate("/");
    } else {
      const res = await register({ email, password, name }).unwrap();
      dispatch(setCredentials(res));
      navigate("/");
    }
  };

  const error =
    (loginError as any)?.data?.message || (registerError as any)?.data?.message;

  return (
    <div className="panel card" style={{ maxWidth: 480, margin: "40px auto" }}>
      <div className="header" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {mode === "login" ? "Welcome back" : "Join the workspace"}
          </div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>
            {mode === "login"
              ? "Continue tracking issues"
              : "Create an account to collaborate"}
          </div>
        </div>
        <span className="chip">Issue Track</span>
      </div>

      <form className="grid" style={{ gap: 14 }} onSubmit={handleSubmit}>
        {mode === "register" && (
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex"
            />
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            minLength={8}
          />
        </div>
        {error && (
          <div style={{ color: "var(--danger)" }}>
            {typeof error === "string" ? error : "Check your details"}
          </div>
        )}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loginLoading || registerLoading}
        >
          {mode === "login" ? "Login" : "Create account"}
        </button>
      </form>

      <div style={{ color: "var(--muted)", marginTop: 16 }}>
        {mode === "login" ? (
          <>
            Need an account? <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            Already have an account? <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
