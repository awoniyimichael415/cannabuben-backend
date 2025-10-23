import React from "react";

const RewardsTab: React.FC = () => {
  const rewards = [
    { name: "10% Discount", cost: 100 },
    { name: "Free Mystery Box", cost: 250 },
  ];

  return (
    <div>
      <h2>Rewards</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cost (Coins)</th>
          </tr>
        </thead>
        <tbody>
          {rewards.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RewardsTab;
