import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

// Functional component to play the audio
const PlayAudioButton: React.FC = () => {
  // Handle button click to invoke the play_audio function in Rust
  const handlePlayAudio = async () => {
    // Get the application data directory and construct the path to the audio file
    const appDataDirPath = await appDataDir();
    const filePath = await join(appDataDirPath, "./done.mp3");
    console.log(filePath);

    // Convert the file path to a URL that can be used by the HTML audio element
    const audioUrl = convertFileSrc(filePath);

    // Create an audio element and set the source to the audio URL
    const audioElement = new Audio(audioUrl);

    // Play the audio when ready
    audioElement.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  return (
    <div>
      <button onClick={handlePlayAudio}>Play Audio</button>
    </div>
  );
};

export default PlayAudioButton;
