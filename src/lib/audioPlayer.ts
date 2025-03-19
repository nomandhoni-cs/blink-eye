import { convertFileSrc } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
export const handlePlayAudio = async (file_name: string) => {
  try {
    const resourceDirDataPath = await path.resourceDir();
    const filePath = await path.join(resourceDirDataPath, file_name);
    let reminderEndSound = new Audio(convertFileSrc(filePath));
    reminderEndSound.play();
  } catch (error) {
    console.error("Error playing audio:", error);
  }
};
