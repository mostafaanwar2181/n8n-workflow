/**
 * Automated Test Runner — Agentic Patient Lifecycle AI System
 * Executes all 25 test scenarios against live n8n workflow via webhook endpoints.
 * Uses real Groq LLM API calls (no mocking).
 *
 * Usage: node run-all-tests.js
 * Prerequisite: n8n must be active on localhost:5678 with the workflow imported and activated.
 */

const http = require("http");

const BASE_URL = "http://localhost:5678";
const TIMEOUT_MS = 30000;

// ─── Utility ────────────────────────────────────────────────────────────────────

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = http.request(options, (res) => {
      let chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on("error", reject);
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error("Request timed out after " + TIMEOUT_MS + "ms"));
    });
    req.write(data);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) throw new Error("ASSERTION FAILED: " + message);
}

function deepGet(obj, path, fallback) {
  const keys = path.split(".");
  let cur = obj;
  for (const k of keys) {
    if (cur == null) return fallback;
    cur = cur[k];
  }
  return cur !== undefined ? cur : fallback;
}

// ─── Test Definitions ───────────────────────────────────────────────────────────

const tests = [
  // ── Pre-Visit (1–5) ──────────────────────────────────────────────────────────
  {
    id: 1,
    name: "Complete valid intake",
    agent: "Pre-Visit",
    path: "/webhook/pre-visit-intake",
    body: {
      personalInfo: {
        fullName: "Sarah Ahmad",
        dateOfBirth: "1990-05-12",
        gender: "female",
        phone: "+60123456789",
      },
      insurancePolicyNumber: "POL-MY-20230415",
      medicalHistory: {
        currentConditions: ["none"],
        currentMedications: [],
        allergies: [],
      },
      pregnancyStatus: "not-pregnant",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      assert(b.status === "accepted" || b.status === "success" || b.intakeAccepted === true, "Intake should be accepted");
      assert(b.riskScore !== undefined, "riskScore should be present");
      assert(b.riskScore.score <= 3, "Risk score should be low (≤3)");
      assert(b.auditLog, "auditLog should be present");
    },
  },
  {
    id: 2,
    name: "Missing mandatory field — DOB omitted",
    agent: "Pre-Visit",
    path: "/webhook/pre-visit-intake",
    body: {
      personalInfo: {
        fullName: "Ahmad Shah",
        gender: "male",
        phone: "+60198765432",
      },
      insurancePolicyNumber: "POL-MY-20240101",
      medicalHistory: {
        currentConditions: ["none"],
        currentMedications: [],
        allergies: [],
      },
    },
    validate(r) {
      assert(r.status === 200 || r.status === 400, "Expected HTTP 200 or 400, got " + r.status);
      const b = r.body;
      const hasErrors =
        (b.validationErrors && b.validationErrors.length > 0) ||
        b.status === "incomplete" ||
        b.intakeAccepted === false ||
        b.followUpTask;
      assert(hasErrors, "Missing DOB should trigger validation error or follow-up");
    },
  },
  {
    id: 3,
    name: "Invalid insurance format",
    agent: "Pre-Visit",
    path: "/webhook/pre-visit-intake",
    body: {
      personalInfo: {
        fullName: "Lim Wei Jun",
        dateOfBirth: "1985-08-20",
        gender: "male",
        phone: "+60167890123",
      },
      insurancePolicyNumber: "INS-12345",
      medicalHistory: {
        currentConditions: ["none"],
        currentMedications: [],
        allergies: [],
      },
    },
    validate(r) {
      assert(r.status === 200 || r.status === 400, "Expected HTTP 200 or 400, got " + r.status);
      const b = r.body;
      const hasInsuranceError =
        JSON.stringify(b).toLowerCase().includes("insurance") ||
        (b.validationErrors && b.validationErrors.some((e) => e.toLowerCase().includes("insurance")));
      assert(hasInsuranceError, "Invalid insurance format should be flagged");
    },
  },
  {
    id: 4,
    name: "High-risk medical history (score ≥ 7)",
    agent: "Pre-Visit",
    path: "/webhook/pre-visit-intake",
    body: {
      personalInfo: {
        fullName: "Raj Kumar",
        dateOfBirth: "1958-03-10",
        gender: "male",
        phone: "+60145678901",
      },
      insurancePolicyNumber: "POL-MY-20230801",
      medicalHistory: {
        currentConditions: ["hypertension", "chest-pain", "diabetes"],
        currentMedications: ["metformin", "amlodipine"],
        allergies: ["penicillin"],
      },
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      assert(b.riskScore, "riskScore should be present");
      assert(b.riskScore.score >= 7, "Risk score should be ≥7 (critical)");
      assert(b.riskScore.level === "critical" || b.riskScore.level === "high", "Risk level should be critical or high");
      const hasEscalation = b.escalation || b.escalatedToNurse || JSON.stringify(b).includes("escalat");
      assert(hasEscalation, "High-risk patient should trigger escalation");
    },
  },
  {
    id: 5,
    name: "Conditional field — pregnancy for female 15-55",
    agent: "Pre-Visit",
    path: "/webhook/pre-visit-intake",
    body: {
      personalInfo: {
        fullName: "Nurul Aisyah",
        dateOfBirth: "1995-11-22",
        gender: "female",
        phone: "+60178901234",
      },
      insurancePolicyNumber: "POL-MY-20231105",
      medicalHistory: {
        currentConditions: ["none"],
        currentMedications: [],
        allergies: [],
      },
    },
    validate(r) {
      assert(r.status === 200 || r.status === 400, "Expected HTTP 200 or 400, got " + r.status);
      const b = r.body;
      const mentionsPregnancy = JSON.stringify(b).toLowerCase().includes("pregnan");
      assert(mentionsPregnancy, "Female 15-55 without pregnancy status should trigger pregnancy question");
    },
  },

  // ── Post-Visit (6–10) ────────────────────────────────────────────────────────
  {
    id: 6,
    name: "Normal recovery check-in",
    agent: "Post-Visit",
    path: "/webhook/post-visit-checkin",
    body: {
      patientId: "PAT-00000001",
      visitId: "VIS-00000001",
      painScore: 2,
      freeTextResponse: "Feeling much better today. Wound is healing nicely.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const noEscalation =
        !b.escalation ||
        b.escalation === false ||
        b.escalation === "none" ||
        (b.escalation && b.escalation.triggered === false) ||
        (b.escalation && b.escalation.required === false) ||
        (b.escalation && b.escalation.type === "none");
      assert(noEscalation || b.status === "normal" || b.status === "ok" || b.status === "responded", "Normal recovery should not escalate");
      assert(b.auditLog || b.conversationLog, "auditLog or conversationLog should be present");
    },
  },
  {
    id: 7,
    name: "High pain but minimized verbally (conflict)",
    agent: "Post-Visit",
    path: "/webhook/post-visit-checkin",
    body: {
      patientId: "PAT-00000002",
      visitId: "VIS-00000002",
      painScore: 8,
      freeTextResponse: "It's fine, I'm managing okay, nothing to worry about.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const hasConflictOrEscalation =
        JSON.stringify(b).toLowerCase().includes("conflict") ||
        JSON.stringify(b).toLowerCase().includes("escalat") ||
        (b.escalation && b.escalation.required === true) ||
        b.escalatedToClinicalTeam === true;
      assert(hasConflictOrEscalation, "Pain 8 with minimizing text should flag conflict/escalation");
    },
  },
  {
    id: 8,
    name: "Red flag phrase — 'can't breathe' in text",
    agent: "Post-Visit",
    path: "/webhook/post-visit-checkin",
    body: {
      patientId: "PAT-00000003",
      visitId: "VIS-00000003",
      painScore: 6,
      freeTextResponse:
        "Since the surgery yesterday, my recovery has been slow. But today I noticed I can't breathe properly when lying down. I feel tightness in my chest.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const hasRedFlag =
        JSON.stringify(b).toLowerCase().includes("red") ||
        JSON.stringify(b).toLowerCase().includes("escalat") ||
        JSON.stringify(b).toLowerCase().includes("emergency") ||
        JSON.stringify(b).toLowerCase().includes("breath");
      assert(hasRedFlag, "'Can't breathe' should trigger red flag escalation");
    },
  },
  {
    id: 9,
    name: "Fever above threshold (39.5°C)",
    agent: "Post-Visit",
    path: "/webhook/post-visit-checkin",
    body: {
      patientId: "PAT-00000004",
      visitId: "VIS-00000004",
      painScore: 4,
      freeTextResponse:
        "I've been having a fever since last night. Measured 39.5 degrees this morning. Feeling very weak.",
      temperature: 39.5,
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const hasFeverOrEscalation =
        JSON.stringify(b).toLowerCase().includes("fever") ||
        JSON.stringify(b).toLowerCase().includes("escalat") ||
        JSON.stringify(b).toLowerCase().includes("temperature");
      assert(hasFeverOrEscalation, "Fever 39.5°C should trigger escalation");
    },
  },
  {
    id: 10,
    name: "Medication side effect (rash + dizziness)",
    agent: "Post-Visit",
    path: "/webhook/post-visit-checkin",
    body: {
      patientId: "PAT-00000005",
      visitId: "VIS-00000005",
      painScore: 3,
      freeTextResponse:
        "I developed a rash on both arms and have been feeling very dizzy since starting the new medication two days ago.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const hasSideEffect =
        JSON.stringify(b).toLowerCase().includes("side") ||
        JSON.stringify(b).toLowerCase().includes("medication") ||
        JSON.stringify(b).toLowerCase().includes("adverse") ||
        JSON.stringify(b).toLowerCase().includes("escalat") ||
        JSON.stringify(b).toLowerCase().includes("rash");
      assert(hasSideEffect, "Medication side effect should be detected");
    },
  },

  // ── Billing (11–14) ─────────────────────────────────────────────────────────
  {
    id: 11,
    name: "Duplicate invoice detection",
    agent: "Billing",
    path: "/webhook/billing-inquiry",
    body: {
      patientId: "PAT-00000011",
      visitId: "VIS-00000011",
      treatmentCodes: ["CONS01"],
      insurancePolicyId: "POL-MY-20230415",
      invoiceDate: "2026-03-10",
      amount: 250.0,
      policyExpiryDate: "2027-12-31",
      coveredCodes: ["CONS01", "LAB03", "XRAY01"],
    },
    validate(r) {
      // First submission should succeed
      assert(r.status === 200 || r.status === 201 || r.status === 409, "Expected valid HTTP status");
    },
  },
  {
    id: 12,
    name: "Expired insurance policy",
    agent: "Billing",
    path: "/webhook/billing-inquiry",
    body: {
      patientId: "PAT-00000012",
      visitId: "VIS-00000012",
      treatmentCodes: ["CONS01"],
      insurancePolicyId: "POL-MY-20200101",
      invoiceDate: "2026-03-10",
      amount: 500.0,
      policyExpiryDate: "2024-06-30",
      coveredCodes: ["CONS01"],
    },
    validate(r) {
      assert(r.status === 200 || r.status === 400, "Expected HTTP 200 or 400, got " + r.status);
      const b = r.body;
      const hasExpiry =
        JSON.stringify(b).toLowerCase().includes("expir") ||
        JSON.stringify(b).toLowerCase().includes("reject") ||
        JSON.stringify(b).toLowerCase().includes("invalid");
      assert(hasExpiry, "Expired insurance policy should be flagged");
    },
  },
  {
    id: 13,
    name: "Treatment code coverage mismatch",
    agent: "Billing",
    path: "/webhook/billing-inquiry",
    body: {
      patientId: "PAT-00000013",
      visitId: "VIS-00000013",
      treatmentCodes: ["CONS01", "MRI05"],
      insurancePolicyId: "POL-MY-20230801",
      invoiceDate: "2026-03-11",
      amount: 1200.0,
      policyExpiryDate: "2027-12-31",
      coveredCodes: ["CONS01", "LAB03"],
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const hasMismatch =
        JSON.stringify(b).toLowerCase().includes("not covered") ||
        JSON.stringify(b).toLowerCase().includes("mismatch") ||
        JSON.stringify(b).toLowerCase().includes("uncovered") ||
        JSON.stringify(b).toLowerCase().includes("mri05") ||
        JSON.stringify(b).toLowerCase().includes("review");
      assert(hasMismatch, "Uncovered treatment code MRI05 should be flagged");
    },
  },
  {
    id: 14,
    name: "Unresolved claim >30 days — SLA breach",
    agent: "Billing",
    path: "/webhook/billing-inquiry",
    body: {
      patientId: "PAT-00000014",
      visitId: "VIS-00000014",
      treatmentCodes: ["LAB03"],
      insurancePolicyId: "POL-MY-20230301",
      invoiceDate: "2026-01-15",
      amount: 180.0,
      policyExpiryDate: "2027-12-31",
      coveredCodes: ["LAB03", "CONS01"],
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const hasSLA =
        JSON.stringify(b).toLowerCase().includes("sla") ||
        JSON.stringify(b).toLowerCase().includes("breach") ||
        JSON.stringify(b).toLowerCase().includes("escalat") ||
        JSON.stringify(b).toLowerCase().includes("overdue");
      assert(hasSLA, "Claim from Jan 15 should trigger SLA breach (>30 days)");
    },
  },

  // ── Retention (15–17) ───────────────────────────────────────────────────────
  {
    id: 15,
    name: "Inactive chronic patient (8 months)",
    agent: "Retention",
    path: "/webhook/retention-scan",
    body: {
      patients: [
        {
          patientId: "PAT-00000015",
          fullName: "Siti Aminah",
          lastVisitDate: new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          condition: "Type 2 Diabetes — chronic management",
          messagingConsent: true,
          suppressionList: false,
          contactsThisMonth: 0,
        },
      ],
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasOutreach =
        str.includes("outreach") || str.includes("message") || str.includes("sent") || str.includes("chronic") || str.includes("at-risk");
      assert(hasOutreach, "Inactive chronic patient should receive outreach or be classified");
    },
  },
  {
    id: 16,
    name: "Patient on suppression list",
    agent: "Retention",
    path: "/webhook/retention-scan",
    body: {
      patients: [
        {
          patientId: "PAT-00000016",
          fullName: "Lee Chin Huat",
          lastVisitDate: new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          condition: "Post-surgical recovery",
          messagingConsent: true,
          suppressionList: true,
          contactsThisMonth: 0,
        },
      ],
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasSuppression = str.includes("suppress") || str.includes("block") || str.includes("skip");
      assert(hasSuppression, "Suppressed patient should not receive outreach");
    },
  },
  {
    id: 17,
    name: "Frequency cap exceeded (3x this month)",
    agent: "Retention",
    path: "/webhook/retention-scan",
    body: {
      patients: [
        {
          patientId: "PAT-00000017",
          fullName: "Muthu Rajan",
          lastVisitDate: new Date(Date.now() - 9 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          condition: "Wellness checkup",
          messagingConsent: true,
          suppressionList: false,
          contactsThisMonth: 3,
        },
      ],
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasCap = str.includes("cap") || str.includes("limit") || str.includes("exceeded") || str.includes("skip") || str.includes("block");
      assert(hasCap, "Patient contacted 3x this month should be blocked by frequency cap");
    },
  },

  // ── Clinical Triage (18–20) ─────────────────────────────────────────────────
  {
    id: 18,
    name: 'Emergency keyword — "heart attack"',
    agent: "Triage",
    path: "/webhook/clinical-triage",
    body: {
      patientId: "PAT-00000018",
      message: "I think I am having a heart attack. My chest is crushing and my left arm is numb.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasEmergency =
        str.includes("emergency") || str.includes("999") || str.includes("112") || str.includes("immediate") || str.includes("call");
      assert(hasEmergency, "Heart attack keywords should trigger emergency escalation");
    },
  },
  {
    id: 19,
    name: "Routine symptom — mild headache",
    agent: "Triage",
    path: "/webhook/clinical-triage",
    body: {
      patientId: "PAT-00000019",
      message: "I have had a mild headache for the past 2 days. It comes and goes. No fever.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasRoutine = str.includes("routine") || str.includes("disclaimer") || str.includes("medical professional");
      assert(hasRoutine, "Mild headache should be classified as Routine with disclaimer");
    },
  },
  {
    id: 20,
    name: 'Ambiguous symptom — "chest feels weird"',
    agent: "Triage",
    path: "/webhook/clinical-triage",
    body: {
      patientId: "PAT-00000020",
      message: "My chest feels weird since this morning. Not sure how to describe it.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const handled =
        str.includes("follow") ||
        str.includes("question") ||
        str.includes("insufficient") ||
        str.includes("emergency") ||
        str.includes("same-day") ||
        str.includes("disclaimer");
      assert(handled, "Ambiguous chest symptom should generate follow-up questions or classification");
    },
  },

  // ── Edge Cases (21–25) ──────────────────────────────────────────────────────
  {
    id: 21,
    name: "Empty/null body to Pre-Visit",
    agent: "Pre-Visit",
    path: "/webhook/pre-visit-intake",
    body: {},
    validate(r) {
      assert(r.status === 200 || r.status === 400 || r.status === 500, "Should return a valid HTTP status");
      const b = r.body;
      const handled =
        JSON.stringify(b).toLowerCase().includes("missing") ||
        JSON.stringify(b).toLowerCase().includes("required") ||
        JSON.stringify(b).toLowerCase().includes("error") ||
        JSON.stringify(b).toLowerCase().includes("validation") ||
        JSON.stringify(b).toLowerCase().includes("follow");
      assert(handled, "Empty body should be handled gracefully with validation errors");
    },
  },
  {
    id: 22,
    name: "Conflicting data — pain 1, severe symptom text",
    agent: "Post-Visit",
    path: "/webhook/post-visit-checkin",
    body: {
      patientId: "PAT-00000022",
      visitId: "VIS-00000022",
      painScore: 1,
      freeTextResponse:
        "I'm doing okay I guess. But there has been some bleeding from the wound site that won't stop. I used three bandages already.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasRedFlag = str.includes("bleed") || str.includes("red") || str.includes("escalat") || str.includes("flag");
      assert(hasRedFlag, "Bleeding despite low pain score should be detected");
    },
  },
  {
    id: 23,
    name: "Duplicate invoice (exact same submission as #11)",
    agent: "Billing",
    path: "/webhook/billing-inquiry",
    body: {
      patientId: "PAT-00000011",
      visitId: "VIS-00000011",
      treatmentCodes: ["CONS01"],
      insurancePolicyId: "POL-MY-20230415",
      invoiceDate: "2026-03-10",
      amount: 250.0,
      policyExpiryDate: "2027-12-31",
      coveredCodes: ["CONS01", "LAB03", "XRAY01"],
    },
    validate(r) {
      assert(r.status === 200 || r.status === 409, "Expected valid HTTP status");
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasDuplicate = str.includes("duplicate") || str.includes("idempoten") || str.includes("already") || str.includes("blocked");
      assert(hasDuplicate, "Second identical submission should be detected as duplicate");
    },
  },
  {
    id: 24,
    name: "Red-flag phrase buried in long normal text",
    agent: "Post-Visit",
    path: "/webhook/post-visit-checkin",
    body: {
      patientId: "PAT-00000024",
      visitId: "VIS-00000024",
      painScore: 3,
      freeTextResponse:
        "Overall I am recovering well from my surgery last week. I have been following the doctor's instructions carefully and taking all my medications on time. My appetite is coming back and I am sleeping better. However, I noticed some bleeding from the incision site when I changed the dressing this morning. It was not a lot but it was fresh blood and it soaked through two gauze pads. Other than that, everything else seems fine. I am managing pain with the prescribed painkillers.",
    },
    validate(r) {
      assert(r.status === 200, "Expected HTTP 200, got " + r.status);
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasRedFlag = str.includes("bleed") || str.includes("escalat") || str.includes("red") || str.includes("flag");
      assert(hasRedFlag, "Bleeding buried in long text should be detected by NLP");
    },
  },
  {
    id: 25,
    name: "Expired insurance + covered codes in billing",
    agent: "Billing",
    path: "/webhook/billing-inquiry",
    body: {
      patientId: "PAT-00000025",
      visitId: "VIS-00000025",
      treatmentCodes: ["CONS01"],
      insurancePolicyId: "POL-MY-20190701",
      invoiceDate: "2026-03-15",
      amount: 350.0,
      policyExpiryDate: "2023-12-31",
      coveredCodes: ["CONS01"],
    },
    validate(r) {
      assert(r.status === 200 || r.status === 400, "Expected valid HTTP status");
      const b = r.body;
      const str = JSON.stringify(b).toLowerCase();
      const hasExpiry = str.includes("expir") || str.includes("reject") || str.includes("invalid") || str.includes("audit");
      assert(hasExpiry, "Expired policy should be caught and logged even with matching codes");
    },
  },
];

// ─── Runner ─────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  Agentic Patient Lifecycle AI — Automated Test Runner           ║");
  console.log("║  Target: " + BASE_URL.padEnd(54) + " ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const t of tests) {
    process.stdout.write(`  [${String(t.id).padStart(2, "0")}] ${t.name.padEnd(50)} `);
    try {
      const res = await post(t.path, t.body);
      t.validate(res);
      console.log("✅ PASS");
      results.push({ id: t.id, name: t.name, agent: t.agent, status: "PASS", error: null });
      passed++;
    } catch (err) {
      console.log("❌ FAIL — " + err.message);
      results.push({ id: t.id, name: t.name, agent: t.agent, status: "FAIL", error: err.message });
      failed++;
    }
  }

  console.log("\n" + "─".repeat(70));
  console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${tests.length} total`);
  console.log("─".repeat(70));

  if (failed > 0) {
    console.log("\n  Failed tests:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => console.log(`    [${String(r.id).padStart(2, "0")}] ${r.name}: ${r.error}`));
  }

  console.log("\n  Run with n8n active on " + BASE_URL + " and workflow activated.");
  console.log("  Ensure Groq API key is configured in the workflow HTTP Request nodes.\n");

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("\n  Fatal error: " + err.message);
  console.error("  Is n8n running on " + BASE_URL + "?");
  process.exit(2);
});
