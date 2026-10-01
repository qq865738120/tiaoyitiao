const fs = require("fs");
const path = require("path");

const skillRoot = path.resolve(__dirname, "..");
const versionRoot = path.join(skillRoot, "versions", "3.8");

function parseArgs(argv) {
  const args = { query: "", category: "", limit: 8, json: false };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--query" || arg === "-q") {
      args.query = argv[++i] || "";
    } else if (arg === "--category" || arg === "-c") {
      args.category = argv[++i] || "";
    } else if (arg === "--limit" || arg === "-n") {
      args.limit = Math.max(1, Number(argv[++i] || "8"));
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      positional.push(arg);
    }
  }
  if (!args.query && positional.length > 0) {
    args.query = positional.join(" ");
  }
  return args;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean);
  }
  return trimmed.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return { frontmatter: {}, body: content };
  const closeIndex = content.indexOf("\n---", 3);
  if (closeIndex < 0) return { frontmatter: {}, body: content };
  const yaml = content.slice(3, closeIndex).trim();
  const body = content.slice(closeIndex + 4).trim();
  const root = {};
  const stack = [{ indent: -1, value: root, arrayKey: "" }];
  for (const rawLine of yaml.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const indent = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();
    if (line.startsWith("- ")) {
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
      const parentFrame = stack[stack.length - 1];
      const target = parentFrame.value[parentFrame.arrayKey];
      if (Array.isArray(target)) target.push(parseScalar(line.slice(2)));
      continue;
    }
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].value;
    if (!rawValue) {
      parent[key] = [];
      stack.push({ indent, value: parent, arrayKey: key });
    } else {
      parent[key] = parseScalar(rawValue);
    }
  }
  return { frontmatter: root, body };
}

function collectMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(abs));
    } else if (entry.name.endsWith(".md") && entry.name !== "index.md") {
      files.push(abs);
    }
  }
  return files;
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function tokens(value) {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function asArray(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

function scoreDoc(doc, queryTokens, queryText) {
  const title = normalize(doc.title);
  const keywords = normalize(doc.keywords.join(" "));
  const relatedApi = normalize(doc.relatedApi.join(" "));
  const pathText = normalize(doc.path);
  const body = normalize(doc.body.slice(0, 6000));
  let score = 0;
  const reasons = [];
  for (const token of queryTokens) {
    if (title.includes(token)) {
      score += 12;
      reasons.push(`title:${token}`);
    }
    if (keywords.includes(token)) {
      score += 8;
      reasons.push(`keyword:${token}`);
    }
    if (relatedApi.includes(token)) score += 6;
    if (pathText.includes(token)) score += 4;
    if (body.includes(token)) score += 1;
  }
  if (queryText && keywords.includes(queryText)) {
    score += 20;
    reasons.push("keyword-phrase");
  }
  if (queryText && title.includes(queryText)) {
    score += 24;
    reasons.push("title-phrase");
  }
  return { score, reasons: [...new Set(reasons)].slice(0, 6) };
}

function loadDocs() {
  return collectMarkdownFiles(versionRoot).map((abs) => {
    const content = fs.readFileSync(abs, "utf8");
    const { frontmatter, body } = parseFrontmatter(content);
    return {
      path: path.relative(versionRoot, abs).replace(/\\/g, "/"),
      title: frontmatter.title || "",
      category: frontmatter.category || "",
      status: frontmatter.status || "",
      keywords: asArray(frontmatter.keywords),
      relatedApi: asArray(frontmatter.related_api),
      body,
    };
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.query) {
    console.log("Usage: node scripts/search-docs.js --query <text> [--category recipes] [--limit 8] [--json]");
    process.exit(args.help ? 0 : 1);
  }
  const queryText = normalize(args.query);
  const queryTokens = tokens(args.query);
  const results = loadDocs()
    .filter((doc) => !args.category || doc.category === args.category)
    .map((doc) => ({ ...doc, ...scoreDoc(doc, queryTokens, queryText) }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, args.limit)
    .map(({ body, keywords, relatedApi, ...doc }) => doc);
  if (args.json) {
    console.log(JSON.stringify({ query: args.query, results }, null, 2));
    return;
  }
  console.log(`Query: ${args.query}`);
  for (const item of results) {
    console.log(`- ${item.path} | ${item.title} | ${item.category} | ${item.status} | score=${item.score} | ${item.reasons.join(", ")}`);
  }
}

main();
