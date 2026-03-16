import fs from "node:fs/promises";
import { Worker } from "node:worker_threads";
import { cpus } from "node:os";
import { resolvePath } from "../utils/pathResolver.js";

export const logStats = async (currentDir, input, output) => {
  try {
    const inputPath = resolvePath(currentDir, input);
    const outputPath = resolvePath(currentDir, output);

    const content = await fs.readFile(inputPath, "utf8");
    const lines = content.split("\n");

    const numWorkers = cpus().length;
    const chunkSize = Math.ceil(lines.length / numWorkers);
    const workerPromises = [];

    const finalStats = {
      total: 0,
      levels: { INFO: 0, WARN: 0, ERROR: 0 },
      status: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
      paths: {},
      responseTimeSum: 0,
    };

    for (let i = 0; i < numWorkers; i++) {
      const chunk = lines.slice(i * chunkSize, (i + 1) * chunkSize);

      const worker = new Worker(
        new URL("../workers/logWorker.js", import.meta.url)
      );

      workerPromises.push(
        new Promise((resolve) => {
          worker.on("message", (partialStats) => {
            finalStats.total += partialStats.total;
            finalStats.responseTimeSum += partialStats.responseTimeSum;

            Object.keys(partialStats.levels).forEach(
              (l) => (finalStats.levels[l] += partialStats.levels[l])
            );
            Object.keys(partialStats.status).forEach(
              (s) => (finalStats.status[s] += partialStats.status[s])
            );
            Object.keys(partialStats.paths).forEach((p) => {
              finalStats.paths[p] =
                (finalStats.paths[p] || 0) + partialStats.paths[p];
            });

            worker.terminate();
            resolve();
          });

          worker.postMessage({ lines: chunk });
        })
      );
    }

    await Promise.all(workerPromises);

    const topPaths = Object.entries(finalStats.paths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    const result = {
      total: finalStats.total,
      levels: finalStats.levels,
      status: finalStats.status,
      topPaths,
      avgResponseTimeMs:
        finalStats.total > 0
          ? parseFloat(
              (finalStats.responseTimeSum / finalStats.total).toFixed(2)
            )
          : 0,
    };

    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log("Log analysis complete!");
  } catch (error) {
    console.log("Operation failed");
  }
};
