import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000/api";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const endpoint = isLogin ? "login" : "register";
    try {
      const response = await axios.post(`${API_URL}/${endpoint}`, {
        username,
        password,
      });
      if (isLogin) {
        localStorage.setItem("accessToken", response.data.accessToken);
        navigate("/dashboard");
      } else {
        setMessage(response.data.message);
        setIsLogin(true);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "24rem" }}>
        <h2 className="text-center mb-4">
          {isLogin ? "Welcome Back 👋" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="form-control"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="btn btn-link text-decoration-none"
          >
            {isLogin ? "Need to register?" : "Already have an account?"}
          </button>
        </div>

        {message && (
          <div className="alert alert-danger text-center mt-3 p-2">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
