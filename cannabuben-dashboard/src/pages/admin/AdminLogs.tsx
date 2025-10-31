import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface AuditLog {
  _id: string;
  adminId: { email: string };
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ admin: "", action: "" });

  useEffect(() => {
    async function fetchLogs() {
      try {
        const params = new URLSearchParams(filters as any);
        const res = await fetch(`${API_URL}/api/admin/audit?${params}`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load logs");
        setLogs(json.logs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [filters]);

  if (loading) return <p>Loading audit logs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-page">
      <h2>🧾 Admin Audit Logs</h2>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          placeholder="Filter by admin email"
          value={filters.admin}
          onChange={(e) => setFilters({ ...filters, admin: e.target.value })}
          style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          placeholder="Filter by action"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Admin</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Entity ID</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.adminId?.email || "—"}</td>
              <td>{log.action}</td>
              <td>{log.entity}</td>
              <td>{log.entityId || "—"}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!logs.length && <p>No logs yet.</p>}
    </div>
  );
};

export default AdminLogs;
