import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000/api";

function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        localStorage.removeItem("accessToken");
        navigate("/");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(
        `${API_URL}/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Logout failed on server, proceeding.", error);
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/");
    }
  };

  if (!profile) return <div className="text-center mt-5">Loading...</div>;

  // decode token for role
  const token = localStorage.getItem("accessToken");
  let userRole = "user";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userRole = payload.role;
    } catch (e) {
      console.error("Error decoding token", e);
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg border-0 p-4" style={{ width: "28rem" }}>
        {/* Profile Avatar */}
        <div className="text-center mb-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile Icon"
            className="rounded-circle border border-3"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        </div>

        {/* Welcome message */}
        <h3 className="fw-bold text-center text-primary mb-1">
          {profile.user.username}
        </h3>
        <p className="text-center text-muted">{profile.message}</p>

        {/* User details */}
        <ul className="list-group list-group-flush mb-3">
          <li className="list-group-item">
            <strong>Email:</strong> {profile.user.email}
          </li>
          <li className="list-group-item">
            <strong>Role:</strong>{" "}
            <span
              className={`badge ${
                userRole === "admin" ? "bg-danger" : "bg-secondary"
              }`}
            >
              {userRole}
            </span>
          </li>
          <li className="list-group-item">
            <strong>Joined:</strong>{" "}
            {new Date(profile.user.createdAt).toLocaleDateString()}
          </li>
        </ul>

        {/* Admin dashboard link (only for admins) */}
        {userRole === "admin" && (
          <a
            href="/admin/dashboard"
            className="btn btn-outline-primary w-100 mb-2"
          >
            🛠 Go to Admin Dashboard
          </a>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-danger w-100 fw-semibold"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
