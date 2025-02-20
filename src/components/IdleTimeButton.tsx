import { invoke } from "@tauri-apps/api/core";
import React, { useState } from "react";

const IdleTimeButton: React.FC = () => {
  const [idleTime, setIdleTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchIdleTime = async () => {
    try {
      setError(null); // Clear previous errors
      const time: number = await invoke("simulate_idle_behavior");
      setIdleTime(`${time} seconds`);
    } catch (err) {
      setError("Failed to get idle time.");
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-xl font-semibold mb-2">Idle Time Checker</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={fetchIdleTime}
      >
        Fetch Idle Time
      </button>
      {idleTime && (
        <p className="mt-4 text-green-600">System idle time: {idleTime}</p>
      )}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default IdleTimeButton;
