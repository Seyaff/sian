#!/usr/bin/env tsx
/**
 * Pre-demo checklist — run before recording your portfolio video.
 * Usage: npm run demo-prep
 */
import { execSync } from "child_process";

const checks: { name: string; run: () => void }[] = [
  {
    name: "TypeScript compiles",
    run: () => execSync("npx tsc --noEmit", { stdio: "inherit", cwd: process.cwd() }),
  },
  {
    name: "Agent evals pass",
    run: () => execSync("npm run eval-agent", { stdio: "inherit", cwd: process.cwd() }),
  },
];

console.log("\n=== Demo prep checklist ===\n");
console.log("Before recording, also verify:");
console.log("  • backend/.env has GROQ_API_KEY, MONGO_URI, DEFAULT_RESTAURANT_ID");
console.log("  • npm run dev is running on port 8000");
console.log("  • WhatsApp token valid (or demo via curl only)\n");

let failed = 0;
for (const check of checks) {
  process.stdout.write(`→ ${check.name}... `);
  try {
    check.run();
    console.log("OK");
  } catch {
    console.log("FAILED");
    failed++;
  }
}

console.log(failed === 0 ? "\n✓ Ready to record. See docs/career/DEMO_SCRIPT.md\n" : "\n✗ Fix failures before recording.\n");
process.exit(failed > 0 ? 1 : 0);
