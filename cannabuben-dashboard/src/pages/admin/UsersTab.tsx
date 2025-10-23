import React from "react";

const UsersTab: React.FC = () => {
  const users = [
    { email: "user1@mail.com", coins: 120, spins: 5 },
    { email: "user2@mail.com", coins: 75, spins: 2 },
  ];

  return (
    <div>
      <h2>Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Coins</th>
            <th>Spins</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.email}</td>
              <td>{u.coins}</td>
              <td>{u.spins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTab;
