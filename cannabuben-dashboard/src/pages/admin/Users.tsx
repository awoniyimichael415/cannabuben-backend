import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface User {
  _id: string;
  email: string;
  coins: number;
  name?: string;
  avatar?: string;
  createdAt?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const token = getAdminToken();
        const res = await fetch(`${API_URL}/api/admin/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load");
        setUsers(json.users || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="admin-page">
      <h2>👥 Users</h2>
      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Coins</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.name || "—"}</td>
                <td>{u.coins}</td>
                <td>{new Date(u.createdAt || "").toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
