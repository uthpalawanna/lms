import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { API_URL as BASE_URL } from "./api/config";

const API_URL = `${BASE_URL}/api`;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


export default function GoogleSignInButton({ onLoginSuccess, onError }) {
  const navigate = useNavigate();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set — Google sign-in button will not render.");
      return;
    }

    const handleCredentialResponse = async (response) => {
      try {
        const { data } = await axios.post(`${API_URL}/auth/google`, {
          credential: response.credential,
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess?.({ token: data.token, user: data.user });
        navigate(data.user?.role === "admin" ? "/admin" : "/dashboard");
      } catch (err) {
        onError?.(err.response?.data?.message || "Google sign-in failed. Please try again.");
      }
    };

    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }
  }, [navigate, onLoginSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={buttonRef} style={{ display: "flex", justifyContent: "center", margin: "12px 0" }} />;
}