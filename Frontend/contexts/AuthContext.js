import { createContext, useContext, useState } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Fake login for demo
  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Demo users
        if (email === "admin@example.com" && password === "admin123") {
          const adminUser = { email, role: "admin", name: "Admin" };
          setUser(adminUser);
          resolve(adminUser);
        } else if (email === "learner@example.com" && password === "learner123") {
          const learnerUser = { email, role: "learner", name: "Learner" };
          setUser(learnerUser);
          resolve(learnerUser);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
