import { parentPort } from "node:worker_threads";

// Worker logic to process a log chunk
parentPort.on("message", ({ lines }) => {
  const stats = {
    total: 0,
    levels: { INFO: 0, WARN: 0, ERROR: 0 },
    status: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
    paths: {},
    responseTimeSum: 0,
  };

  lines.forEach((line) => {
    if (!line.trim()) return;
    const parts = line.split(" ");
    if (parts.length < 7) return;

    const [timestamp, level, service, status, responseTime, method, path] =
      parts;

    stats.total++;
    stats.levels[level] = (stats.levels[level] || 0) + 1;

    const statusClass = `${status[0]}xx`;
    stats.status[statusClass] = (stats.status[statusClass] || 0) + 1;

    stats.paths[path] = (stats.paths[path] || 0) + 1;
    stats.responseTimeSum += parseInt(responseTime, 10);
  });

  parentPort.postMessage(stats);
});
