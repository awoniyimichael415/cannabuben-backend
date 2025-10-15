import React from "react";
import "./Achievements.css";

const achievements = [
  { id: 1, title: "10 Spins Completed", tier: "gold" },
  { id: 2, title: "First Collect Reward", tier: "silver" },
  { id: 3, title: "Reached Level 5", tier: "bronze" },
];

const Achievements: React.FC = () => {
  return (
    <div className="achievements-page">
      <h1>Your Achievements</h1>
      <p>Collect badges for your milestones in the CannaBuben game.</p>

      <div className="badges-grid">
        {achievements.map((ach) => (
          <div key={ach.id} className={`badge ${ach.tier}`}>
            <div className="medal"></div>
            <span>{ach.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
