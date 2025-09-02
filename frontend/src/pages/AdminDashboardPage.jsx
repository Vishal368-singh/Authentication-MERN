import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000/api";

function AdminDashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/admin/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch session data."
        );
      }
    };
    fetchSessions();
  }, [navigate]);

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  if (error)
    return <div className="alert alert-danger text-center mt-4">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-3">
        <div className="card-body">
          <h1 className="text-center mb-4 text-primary">
            Admin Dashboard: User Sessions 📊
          </h1>

          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>User</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <tr key={session._id}>
                      <td>
                        <span className="fw-bold text-secondary">
                          {session.username}
                        </span>
                      </td>
                      <td>
                        {new Date(session.loginTime).toLocaleString("en-IN")}
                      </td>
                      <td>
                        {session.logoutTime ? (
                          new Date(session.logoutTime).toLocaleString("en-IN")
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                      <td>
                        <span className="text-info fw-semibold">
                          {formatDuration(session.durationInSeconds)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No session data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
