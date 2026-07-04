#!/usr/bin/env node
/**
 * Importa el dataset de ejercicios de https://github.com/wrkout/exercises.json
 * (licencia Unlicense) fijado a un commit concreto, y genera un snapshot local
 * en packages/domain/data/exercises.json. No se usa en runtime de la app: es un
 * script reproducible que se ejecuta manualmente para actualizar el snapshot.
 *
 * Uso: npm run import:exercises
 */
import { mkdtempSync, rmSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const PINNED_COMMIT = "5994bea047eee4d39a2c0872be3dd8fdd258ba31";
const TARBALL_URL = `https://codeload.github.com/wrkout/exercises.json/tar.gz/${PINNED_COMMIT}`;
const OUTPUT_PATH = join(import.meta.dirname, "..", "packages", "domain", "data", "exercises.json");

function slugify(dirName) {
  return dirName
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function main() {
  const workDir = mkdtempSync(join(tmpdir(), "rpeak-exercises-"));
  const tarballPath = join(workDir, "exercises.tar.gz");

  console.log(`Descargando snapshot fijado (commit ${PINNED_COMMIT})...`);
  const response = await fetch(TARBALL_URL);
  if (!response.ok) {
    throw new Error(`No se pudo descargar el dataset: HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(tarballPath, buffer);

  console.log("Extrayendo...");
  execFileSync("tar", ["-xzf", tarballPath, "-C", workDir]);

  const extractedDir = join(workDir, `exercises.json-${PINNED_COMMIT}`, "exercises");
  const exerciseDirs = readdirSync(extractedDir, { withFileTypes: true }).filter((e) => e.isDirectory());

  const exercises = [];
  for (const dirEntry of exerciseDirs) {
    const jsonPath = join(extractedDir, dirEntry.name, "exercise.json");
    let raw;
    try {
      raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
    } catch {
      continue;
    }
    exercises.push({
      id: slugify(dirEntry.name),
      name: raw.name,
      force: raw.force ?? null,
      level: raw.level,
      mechanic: raw.mechanic ?? null,
      equipment: raw.equipment ?? null,
      primaryMuscles: raw.primaryMuscles ?? [],
      secondaryMuscles: raw.secondaryMuscles ?? [],
      instructions: raw.instructions ?? [],
      category: raw.category,
    });
  }

  exercises.sort((a, b) => a.name.localeCompare(b.name));

  mkdirSync(join(import.meta.dirname, "..", "packages", "domain", "data"), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(exercises, null, 2) + "\n", "utf-8");

  rmSync(workDir, { recursive: true, force: true });

  console.log(`Listo: ${exercises.length} ejercicios escritos en ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
