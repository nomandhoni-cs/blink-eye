import { invoke } from "@tauri-apps/api/core";
import React from "react";
// import { invoke } from "@tauri-apps/api/tauri"; // Import the Tauri API to invoke Rust commands

// Functional component to play the audio
const PlayAudioButton: React.FC = () => {
  // Handle button click to invoke the play_audio function in Rust
  const handlePlayAudio = async () => {
    try {
      // Call the Rust backend method `play_audio`
      await invoke<void>("play_audio");
      console.log("Audio is playing...");
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  return (
    <div>
      <button onClick={handlePlayAudio}>Play Audio</button>
    </div>
  );
};

export default PlayAudioButton;
