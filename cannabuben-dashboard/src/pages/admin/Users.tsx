import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface User {
  _id: string;
  email: string;
  name?: string;
  coins: number;
  banned?: boolean;
  createdAt?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // 🔹 Fetch all users
  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const token = getAdminToken();
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load users");
      setUsers(json.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // 🔹 Update coins or ban/unban
  async function updateUser(id: string, changes: Partial<User>) {
    try {
      setSavingId(id);
      const token = getAdminToken();
      
      
      const endpoint = `${API_URL}/api/admin/users/${id}/coins`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Update failed");

      // ✅ Update UI instantly
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...json.user } : u))
      );

      // ✅ Nice feedback
      if (changes.banned !== undefined) {
        setToast(json.user?.banned ? "🚫 User banned successfully" : "✅ User unbanned successfully");
      } else {
        setToast("💰 Coins updated successfully");
      }

      // Auto hide toast
      setTimeout(() => setToast(null), 2500);
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setSavingId(null);
    }
  }

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-page">
      <h2>👥 Users Management</h2>
      <p style={{ marginBottom: 12, color: "#444" }}>
        View, edit coin balance, or ban/unban users.
      </p>

      <input
        type="text"
        placeholder="Search user by email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 300,
          marginBottom: 16,
          padding: 6,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
            <th>Email</th>
            <th>Name</th>
            <th>Coins</th>
            <th>Banned</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u._id}>
              <td>{u.email}</td>
              <td>{u.name || "—"}</td>
              <td>
                <input
                  type="number"
                  defaultValue={u.coins}
                  min={0}
                  style={{
                    width: "80px",
                    padding: "4px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                  onBlur={(e) =>
                    updateUser(u._id, { coins: Number(e.target.value) })
                  }
                  disabled={savingId === u._id}
                />
              </td>
              <td>
                {u.banned ? (
                  <span style={{ color: "red", fontWeight: 600 }}>Yes</span>
                ) : (
                  <span style={{ color: "green" }}>No</span>
                )}
              </td>
              <td>
                {u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString()
                  : "—"}
              </td>
              <td>
                <button
                  onClick={() => updateUser(u._id, { banned: !u.banned })}
                  disabled={savingId === u._id}
                  style={{
                    background: u.banned ? "#4CAF50" : "#E53935",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: 13,
                    minWidth: 70,
                  }}
                >
                  {savingId === u._id
                    ? "Saving..."
                    : u.banned
                    ? "Unban"
                    : "Ban"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredUsers.length === 0 && (
        <p style={{ textAlign: "center", marginTop: 20 }}>No users found</p>
      )}

      {/* ✅ Floating toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "#2E5632",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            fontWeight: 600,
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
