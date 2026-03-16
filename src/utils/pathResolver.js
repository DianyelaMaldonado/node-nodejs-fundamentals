import path from "node:path";

export const resolvePath = (currentDir, targetPath) => {
  if (!targetPath) return currentDir;
  // path.resolve handles absolute and relative paths
  return path.resolve(currentDir, targetPath);
};
