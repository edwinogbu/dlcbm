// context/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, email }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await AsyncStorage.getItem("@auth_user");
        if (s) setUser(JSON.parse(s));
      } catch (e) {
        console.warn("Auth load error", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const login = async ({ email, password }) => {
    // Simulate validation - in production call API
    const fakeUser = { id: Date.now().toString(), name: "Worker", email };
    await AsyncStorage.setItem("@auth_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    return { ok: true, user: fakeUser };
  };

  const register = async ({ name, email, password }) => {
    // Simulate registration
    const fakeUser = { id: Date.now().toString(), name, email };
    await AsyncStorage.setItem("@auth_user", JSON.stringify(fakeUser));
    setUser(fakeUser);
    return { ok: true, user: fakeUser };
  };

  const logout = async () => {
    await AsyncStorage.removeItem("@auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};