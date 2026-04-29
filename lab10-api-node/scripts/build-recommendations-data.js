#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {
    input: path.join("..", "out", "recs_k=3", "data.jsonl"),
    output: path.join("data", "recommendations.json")
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--input" && argv[i + 1]) {
      args.input = argv[i + 1];
      i += 1;
    } else if (token === "--output" && argv[i + 1]) {
      args.output = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function readJsonLines(inputPath) {
  const content = fs.readFileSync(inputPath, "utf8");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => JSON.parse(line));
}

function buildNested(rows) {
  const users = new Map();

  for (const row of rows) {
    const userId = Number(row.userId);
    const cluster = Number(row.cluster);

    if (!users.has(userId)) {
      users.set(userId, {
        user_id: userId,
        cluster,
        recommendations: []
      });
    }

    users.get(userId).recommendations.push({
      movie_id: Number(row.movieId),
      movie_title: String(row.title),
      score: Number(row.avg_rating)
    });
  }

  const result = [...users.values()].sort((a, b) => a.user_id - b.user_id);
  return result;
}

function ensureParentDir(filePath) {
  const parent = path.dirname(filePath);
  fs.mkdirSync(parent, { recursive: true });
}

function main() {
  const { input, output } = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(process.cwd(), input);
  const outputPath = path.resolve(process.cwd(), output);

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const rows = readJsonLines(inputPath);
  const transformed = buildNested(rows);

  ensureParentDir(outputPath);
  fs.writeFileSync(outputPath, `${JSON.stringify(transformed, null, 2)}\n`, "utf8");

  console.log(`Built ${transformed.length} users into: ${outputPath}`);
}

main();
