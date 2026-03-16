import fs from "node:fs/promises";
import path from "node:path";

// Move up one level
export const goUp = (currentDir) => {
  return path.resolve(currentDir, "..");
};

// Change to a new folder
export const changeDir = async (currentDir, targetPath) => {
  const newPath = path.resolve(currentDir, targetPath);
  try {
    const stats = await fs.stat(newPath);
    if (stats.isDirectory()) {
      return newPath;
    }
    console.log("Operation failed");
    return currentDir;
  } catch (error) {
    console.log("Operation failed");
    return currentDir;
  }
};

// List folders and files
export const listDirectory = async (currentDir) => {
  try {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    // Sort: Folders first, then Files
    const sorted = entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    // Print table format
    console.table(
      sorted.map((entry) => ({
        Name: entry.name,
        Type: entry.isDirectory() ? "folder" : "file",
      }))
    );
  } catch (error) {
    console.log("Operation failed");
  }
};
