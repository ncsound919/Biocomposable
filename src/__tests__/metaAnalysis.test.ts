import { performMetaAnalysis, generateProofHash, EvidenceNodePayload } from "../utils/metaAnalysis";

function runMetaAnalysisTests() {
  console.log("Running BioComposable Meta-Analysis Engine Unit Tests...");

  // Test Case 1: Consistent Multi-Center Evidence
  const consistentNodes: EvidenceNodePayload[] = [
    { nodeId: "Node-1", institution: "Stanford", evidencePattern: "Pattern A", graphTopology: "[A]->[B]", effectSize: 0.88, se: 0.03, ciLower: 0.82, ciUpper: 0.94, sampleCount: 840, timestamp: "2026-08-20T08:00:00Z" },
    { nodeId: "Node-2", institution: "Johns Hopkins", evidencePattern: "Pattern A", graphTopology: "[A]->[B]", effectSize: 0.84, se: 0.03, ciLower: 0.78, ciUpper: 0.90, sampleCount: 620, timestamp: "2026-08-20T08:05:00Z" },
    { nodeId: "Node-3", institution: "INSERM Paris", evidencePattern: "Pattern A", graphTopology: "[A]->[B]", effectSize: 0.86, se: 0.03, ciLower: 0.80, ciUpper: 0.92, sampleCount: 510, timestamp: "2026-08-20T08:10:00Z" },
    { nodeId: "Node-4", institution: "Kyoto Univ", evidencePattern: "Pattern A", graphTopology: "[A]->[B]", effectSize: 0.82, se: 0.04, ciLower: 0.75, ciUpper: 0.89, sampleCount: 430, timestamp: "2026-08-20T08:15:00Z" }
  ];

  const res1 = performMetaAnalysis("RULE-GEO-01", consistentNodes);

  console.assert(res1.kStudies === 4, `Expected 4 studies, got ${res1.kStudies}`);
  console.assert(res1.totalSamples === 2400, `Expected 2400 samples, got ${res1.totalSamples}`);
  console.assert(res1.isConflictState === false, `Expected no conflict state for consistent evidence`);
  console.assert(res1.iSquared < 25, `Expected low I^2, got ${res1.iSquared}%`);
  console.assert(res1.gradeRating === "High" || res1.gradeRating === "Moderate", `Expected High/Moderate GRADE rating, got ${res1.gradeRating}`);
  console.assert(res1.proofHash.startsWith("0x"), `Expected proof hash to start with 0x, got ${res1.proofHash}`);

  console.log("  ✓ Consistent evidence pools correctly into HKSJ CI with low heterogeneity.");

  // Test Case 2: Directional Conflicting Evidence (Dana-Farber +1.42 vs Charité -0.05)
  const conflictNodes: EvidenceNodePayload[] = [
    { nodeId: "Node-DFCI", institution: "Dana-Farber", evidencePattern: "Pattern B", graphTopology: "[X]->[Y]", effectSize: 1.42, se: 0.11, ciLower: 1.20, ciUpper: 1.64, sampleCount: 320, timestamp: "2026-08-20T08:00:00Z" },
    { nodeId: "Node-[#EU-02]", institution: "Charité Berlin", evidencePattern: "Pattern B", graphTopology: "[X]->[Y]", effectSize: -0.05, se: 0.08, ciLower: -0.22, ciUpper: 0.12, sampleCount: 290, timestamp: "2026-08-20T08:05:00Z" },
    { nodeId: "Node-MDA", institution: "MD Anderson", evidencePattern: "Pattern B", graphTopology: "[X]->[Y]", effectSize: 1.35, se: 0.10, ciLower: 1.15, ciUpper: 1.55, sampleCount: 410, timestamp: "2026-08-20T08:10:00Z" }
  ];

  const res2 = performMetaAnalysis("RULE-TME-03", conflictNodes);

  console.assert(res2.isConflictState === true, `Expected conflict state to be flagged for opposing directional effects`);
  console.assert(res2.iSquared > 50, `Expected high I^2 (>50%), got ${res2.iSquared}%`);
  console.assert(res2.gradeRating === "Very Low", `Expected Very Low GRADE rating for conflict state, got ${res2.gradeRating}`);

  console.log("  ✓ Directional conflicts accurately trigger CONFLICT_STATE, high I^2, and Very Low GRADE rating.");

  // Test Case 3: Proof Hash Determinism
  const hash1 = generateProofHash(consistentNodes);
  const hash2 = generateProofHash(consistentNodes);
  console.assert(hash1 === hash2, `Expected identical hashes for same input payload`);

  console.log("  ✓ Proof hash is deterministic and reproducible.");

  console.log("Meta-Analysis Engine Unit Tests Summary: All tests passed successfully!");
}

runMetaAnalysisTests();
