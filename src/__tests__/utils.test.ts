import {
  cn,
  formatBytes,
  formatSha256,
  calculateRpD,
  isContractCompatible,
} from "../utils";

console.log("Running BioComposable Utility Unit Tests...\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// 1. formatBytes tests
assert(formatBytes(0) === "0 Bytes", "formatBytes(0) handles 0 bytes");
assert(formatBytes(1024) === "1 KB", "formatBytes(1024) converts to 1 KB");
assert(formatBytes(1572864) === "1.5 MB", "formatBytes(1572864) converts to 1.5 MB");
assert(formatBytes(1073741824) === "1 GB", "formatBytes(1073741824) converts to 1 GB");

// 2. formatSha256 tests
const sampleSha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
assert(formatSha256(sampleSha, 8, 6) === "e3b0c442...52b855", "formatSha256 truncates long SHA-256 digests");
assert(formatSha256("short", 8, 6) === "short", "formatSha256 leaves short strings intact");

// 3. calculateRpD tests
assert(calculateRpD([]) === 0.0, "calculateRpD returns 0.0 for empty factors");
assert(
  calculateRpD([{ impact: 0.05 }, { impact: 0.1 }, { impact: 0.15 }]) === 0.3,
  "calculateRpD sums factor impacts accurately"
);
assert(
  calculateRpD([{ impact: 0.8 }, { impact: 0.5 }]) === 1.0,
  "calculateRpD clamps maximum Reproducibility Debt at 1.0"
);

// 4. isContractCompatible tests
assert(isContractCompatible("v1.0.0", "v1.0.0") === true, "isContractCompatible returns true for identical versions");
assert(isContractCompatible("1.2.0", "1.5.1") === true, "isContractCompatible returns true for same major versions");
assert(isContractCompatible("1.2.0", "2.0.0") === false, "isContractCompatible returns false for different major versions");

// 5. cn class merging test
assert(cn("px-2 py-1", "bg-blue-500", false && "hidden") === "px-2 py-1 bg-blue-500", "cn correctly merges Tailwind utility classes");

console.log(`\nUtility Test Summary: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
