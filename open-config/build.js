#!/usr/bin/env node
/**
 * build.js — Genera opencode.json a partir de los módulos en config/
 * Uso: node config/build.js
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, "..");          // raíz del proyecto
const cfg   = __dir;                      // directorio config/

/** Lee todos los .json de un directorio y los indexa por nombre de archivo (sin extensión) */
function loadDir(dir) {
  return readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .reduce((acc, f) => {
      const key = f.replace(".json", "");
      try {
        acc[key] = JSON.parse(readFileSync(join(dir, f), "utf8"));
      } catch (e) {
        console.error(`✗ Error parseando ${dir}/${f}:`, e.message);
        process.exit(1);
      }
      return acc;
    }, {});
}

// ── Base ──────────────────────────────────────────────────────────────────────
const base = JSON.parse(readFileSync(join(cfg, "base.json"), "utf8"));

// ── Secciones modulares ───────────────────────────────────────────────────────
const agent    = loadDir(join(cfg, "agents"));
const provider = loadDir(join(cfg, "providers"));
const mcp      = loadDir(join(cfg, "mcp"));

// ── Merge final ───────────────────────────────────────────────────────────────
const config = { ...base, agent, provider, mcp };

const outPath = join(root, "opencode.json");
writeFileSync(outPath, JSON.stringify(config, null, 2) + "\n");

console.log("✓ opencode.json generado correctamente");
console.log(`  agentes  : ${Object.keys(agent).join(", ")}`);
console.log(`  providers: ${Object.keys(provider).join(", ")}`);
console.log(`  mcp      : ${Object.keys(mcp).join(", ")}`);