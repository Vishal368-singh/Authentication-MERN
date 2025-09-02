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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Logout failed on server, proceeding.", error);
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/");
    }
  };

  if (!profile) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg p-4 text-center"
        style={{ width: "28rem" }}
      >
        {/* Profile Icon */}
        <div className="d-flex justify-content-center mb-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile Icon"
            className="rounded-circle border"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        </div>

        {/* Welcome message */}
        <h3 className="fw-bold text-primary mb-2">{profile.user.username}</h3>
        <p className="text-muted mb-4">{profile.message}</p>

        {/* User details */}
        <div className="card bg-light p-3 text-start mb-3">
          <pre className="mb-0">{JSON.stringify(profile.user, null, 2)}</pre>
        </div>

        {/* Logout Button */}
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
