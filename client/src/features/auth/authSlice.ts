import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../services/api";

export type AuthState = {
  token: string | null;
  user: User | null;
};

const persisted = (() => {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
})();

const initialState: AuthState = persisted || {
  token: null,
  user: null,
};

const persist = (state: AuthState) => {
  try {
    localStorage.setItem("auth", JSON.stringify(state));
  } catch {
    /* ignore */
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      persist(state);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      persist(state);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
