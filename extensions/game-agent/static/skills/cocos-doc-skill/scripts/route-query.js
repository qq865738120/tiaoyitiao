const fs = require("fs");
const path = require("path");

const skillRoot = path.resolve(__dirname, "..");
const versionRoot = path.join(skillRoot, "versions", "3.8");
const routingRoot = path.join(versionRoot, "routing");

function parseArgs(argv) {
  const args = { query: "", limit: 10, json: false };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--query" || arg === "-q") {
      args.query = argv[++i] || "";
    } else if (arg === "--limit" || arg === "-n") {
      args.limit = Math.max(1, Number(argv[++i] || "10"));
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      positional.push(arg);
    }
  }
  if (!args.query && positional.length > 0) args.query = positional.join(" ");
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(routingRoot, file), "utf8"));
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}._]+/gu, " ").trim();
}

function compact(value) {
  return normalize(value).replace(/\s+/g, "");
}

function addDoc(results, doc, source, score, reason, related = []) {
  if (!doc) return;
  const existing = results.get(doc) || { doc, score: 0, sources: [], reasons: [], related: new Set() };
  existing.score += score;
  existing.sources.push(source);
  existing.reasons.push(reason);
  for (const item of related) existing.related.add(item);
  results.set(doc, existing);
}

function scoreKey(query, key) {
  const q = compact(query);
  const k = compact(key);
  if (!q || !k) return 0;
  if (q === k) return 40;
  if (q.includes(k)) return Math.min(36, 12 + k.length);
  if (k.includes(q)) return Math.min(28, 8 + q.length);
  return 0;
}

function scoreTokens(query, key) {
  const qTokens = normalize(query).split(/\s+/).filter(Boolean);
  const haystack = normalize(key);
  return qTokens.reduce((sum, token) => sum + (haystack.includes(token) ? 2 : 0), 0);
}

function scoreCandidate(query, key) {
  const phraseScore = scoreKey(query, key);
  if (phraseScore > 0) return phraseScore;
  const tokenScore = scoreTokens(query, key);
  return tokenScore >= 4 ? tokenScore : 0;
}

function scoreSymbolCandidate(query, key) {
  if (/^[A-Z][A-Za-z0-9.]{1,}$/.test(key) && !query.includes(key)) {
    return 0;
  }
  return scoreCandidate(query, key);
}

function route(query) {
  const results = new Map();
  const apiMap = readJson("api-symbol-map.json");
  const componentMap = readJson("component-map.json");
  const errorMap = readJson("error-map.json");
  const keywordMap = readJson("keyword-map.json");

  for (const [symbol, entry] of Object.entries(apiMap)) {
    const score = scoreSymbolCandidate(query, symbol);
    if (score > 0) addDoc(results, entry.doc, "api-symbol-map", score + 20, symbol, entry.related || []);
  }

  for (const [name, entry] of Object.entries(componentMap)) {
    const score = scoreSymbolCandidate(query, name);
    if (score > 0) {
      addDoc(results, entry.doc, "component-map", score + 16, name, [entry.api, ...(entry.recipes || [])].filter(Boolean));
      addDoc(results, entry.api, "component-map-api", Math.max(4, score), `${name}:api`, entry.recipes || []);
      for (const recipe of entry.recipes || []) addDoc(results, recipe, "component-map-recipe", Math.max(3, score - 4), `${name}:recipe`);
    }
  }

  for (const [id, entry] of Object.entries(errorMap)) {
    const aliases = [id, ...(entry.aliases || [])];
    let best = { score: 0, alias: "" };
    for (const alias of aliases) {
      const score = scoreCandidate(query, alias);
      if (score > best.score) best = { score, alias };
    }
    if (best.score > 0) addDoc(results, entry.doc, "error-map", best.score + 18, best.alias);
  }

  for (const [keyword, docs] of Object.entries(keywordMap)) {
    const score = scoreCandidate(query, keyword);
    if (score > 0) {
      for (const doc of docs) addDoc(results, doc, "keyword-map", score + 12, keyword);
    }
  }

  return [...results.values()]
    .map((item) => ({
      doc: item.doc,
      exists: fs.existsSync(path.join(versionRoot, item.doc)),
      score: item.score,
      sources: [...new Set(item.sources)],
      reasons: [...new Set(item.reasons)].slice(0, 8),
      related: [...item.related].filter(Boolean).slice(0, 10),
    }))
    .sort((a, b) => b.score - a.score || a.doc.localeCompare(b.doc));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.query) {
    console.log("Usage: node scripts/route-query.js --query <text> [--limit 10] [--json]");
    process.exit(args.help ? 0 : 1);
  }
  const results = route(args.query).slice(0, args.limit);
  if (args.json) {
    console.log(JSON.stringify({ query: args.query, results }, null, 2));
    return;
  }
  console.log(`Query: ${args.query}`);
  for (const item of results) {
    const exists = item.exists ? "ok" : "missing";
    console.log(`- ${item.doc} | ${exists} | score=${item.score} | ${item.sources.join("+")} | ${item.reasons.join(", ")}`);
    if (item.related.length > 0) console.log(`  related: ${item.related.join(", ")}`);
  }
}

main();
