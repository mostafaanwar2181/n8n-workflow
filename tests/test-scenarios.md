# Test Scenarios — Agentic Patient Lifecycle AI System

> **25 test scenarios covering all 5 agent pillars + edge cases**
> Each scenario includes: Input, Expected Output, Escalation Status, Risk Level, and Audit Log Result.

---

## Pre-Visit Agent (5 Scenarios)

### Test 1 — Complete Valid Intake
| Field | Value |
|---|---|
| **Category** | Pre-Visit |
| **Scenario** | Complete valid intake — all mandatory fields filled, valid insurance |
| **Input** | `{ personalInfo: { fullName: "Sarah Ahmad", dateOfBirth: "1990-05-12", gender: "female", phone: "+60123456789" }, insurancePolicyNumber: "POL-MY-20230415", medicalHistory: { currentConditions: ["none"], currentMedications: [], allergies: [] }, pregnancyStatus: "not-pregnant" }` |
| **Expected Output** | Intake accepted. Risk score 0 (low). Confirmation message sent. No missing fields. Insurance format valid. |
| **Escalation** | None |
| **Risk Level** | Low |
| **Audit Log** | `INTAKE_RECEIVED`, `INTAKE_VALIDATED` |

### Test 2 — Missing Mandatory Field (DOB Omitted)
| Field | Value |
|---|---|
| **Category** | Pre-Visit |
| **Scenario** | Missing mandatory field — Date of Birth omitted |
| **Input** | `{ personalInfo: { fullName: "Ali bin Rahman", gender: "male", phone: "+60198765432" }, insurancePolicyNumber: "POL-MY-20240101", medicalHistory: { currentConditions: ["none"], currentMedications: [], allergies: [] } }` |
| **Expected Output** | Validation failed. Missing field: dateOfBirth. Completion status: incomplete. Follow-up task scheduled in 24 hours via SMS with 2 retries. |
| **Escalation** | None |
| **Risk Level** | Medium |
| **Audit Log** | `INTAKE_RECEIVED`, `INTAKE_VALIDATION_FAILED`, `FOLLOW_UP_TASK_CREATED` |

### Test 3 — Invalid Insurance Format
| Field | Value |
|---|---|
| **Category** | Pre-Visit |
| **Scenario** | Invalid insurance policy number format |
| **Input** | `{ personalInfo: { fullName: "Lim Wei Ling", dateOfBirth: "1985-08-20", gender: "female", phone: "+60112223344" }, insurancePolicyNumber: "INVALID-12345", medicalHistory: { currentConditions: ["none"], currentMedications: [], allergies: [] }, pregnancyStatus: "not-pregnant" }` |
| **Expected Output** | Validation error. Insurance format invalid. Expected: POL-XX-XXXXXXXX. Patient notified to correct. |
| **Escalation** | None |
| **Risk Level** | Medium |
| **Audit Log** | `INTAKE_RECEIVED`, `INTAKE_VALIDATION_FAILED` |

### Test 4 — High-Risk Medical History
| Field | Value |
|---|---|
| **Category** | Pre-Visit |
| **Scenario** | High-risk medical history — hypertension + chest pain |
| **Input** | `{ personalInfo: { fullName: "Raj Kumar", dateOfBirth: "1960-03-15", gender: "male", phone: "+60133445566" }, insurancePolicyNumber: "POL-MY-20220901", medicalHistory: { currentConditions: ["hypertension", "chest-pain"], currentMedications: [{ name: "Amlodipine", dosage: "5mg", frequency: "daily" }], allergies: ["Penicillin"] } }` |
| **Expected Output** | Risk score ≥7 (hypertension=3 + chest-pain=4 = 7). Risk level: high. Escalated to nurse queue. Escalation ticket created with 1-hour SLA. |
| **Escalation** | Nurse Queue |
| **Risk Level** | High |
| **Audit Log** | `INTAKE_RECEIVED`, `INTAKE_VALIDATED`, `ESCALATION_CREATED`, `ESCALATION_TICKET_CREATED` |

### Test 5 — Conditional Field (Pregnancy Question)
| Field | Value |
|---|---|
| **Category** | Pre-Visit |
| **Scenario** | Female patient aged 32, pregnancy question skipped |
| **Input** | `{ personalInfo: { fullName: "Nurul Aisyah", dateOfBirth: "1994-01-22", gender: "female", phone: "+60145567788" }, insurancePolicyNumber: "POL-MY-20230801", medicalHistory: { currentConditions: ["none"], currentMedications: [], allergies: [] } }` |
| **Expected Output** | Pregnancy status required for female patients aged 15-55. Missing field: pregnancyStatus. Agent prompts for pregnancy question before proceeding. Follow-up task created. |
| **Escalation** | None |
| **Risk Level** | Medium |
| **Audit Log** | `INTAKE_RECEIVED`, `INTAKE_VALIDATION_FAILED`, `FOLLOW_UP_TASK_CREATED` |

---

## Post-Visit Agent (5 Scenarios)

### Test 6 — Normal Recovery Check-In
| Field | Value |
|---|---|
| **Category** | Post-Visit |
| **Scenario** | Normal recovery — low pain, no symptoms |
| **Input** | `{ patientId: "PAT-00000001", visitId: "VIS-00000001", painScore: 2, freeTextResponse: "Feeling much better today. Wound is healing nicely. No issues at all." }` |
| **Expected Output** | Check-in logged. No red flags detected. Pain score low. Next 48-hour proactive check-in scheduled via SMS. Conversation log created. |
| **Escalation** | None |
| **Risk Level** | Low |
| **Audit Log** | `POST_VISIT_CHECK_IN_RECEIVED`, `PROACTIVE_CHECKIN_SCHEDULED` |

### Test 7 — High Pain Score but Minimized Verbally
| Field | Value |
|---|---|
| **Category** | Post-Visit |
| **Scenario** | Patient scores 8/10 pain but says "it's fine, don't worry about me" |
| **Input** | `{ patientId: "PAT-00000002", visitId: "VIS-00000002", painScore: 8, freeTextResponse: "It's fine, don't worry about me. I can manage the pain somehow." }` |
| **Expected Output** | Pain score 8/10 flagged. Conflict detected: high pain + minimizing text. System escalates DESPITE patient dismissal. Assigned to clinical team. 1-hour SLA. |
| **Escalation** | Clinical Team |
| **Risk Level** | High |
| **Audit Log** | `POST_VISIT_CHECK_IN_RECEIVED`, `PAIN_SCORE_CONFLICT_DETECTED`, `ESCALATION_CREATED` |

### Test 8 — Red Flag Phrase in Long Text
| Field | Value |
|---|---|
| **Category** | Post-Visit |
| **Scenario** | Long normal message containing "can't breathe properly" buried in text |
| **Input** | `{ patientId: "PAT-00000003", visitId: "VIS-00000003", painScore: 3, freeTextResponse: "I went for a walk this morning and felt okay for the most part. Had some breakfast and took my medication as prescribed. However, I noticed that when I climb stairs I can't breathe properly and need to stop. Otherwise everything seems normal. The wound site looks clean." }` |
| **Expected Output** | NLP detects "can't breathe properly" — shortness-of-breath red flag. Immediate emergency escalation. 5-minute SLA. Emergency services notified. |
| **Escalation** | Emergency Services |
| **Risk Level** | Critical |
| **Audit Log** | `POST_VISIT_CHECK_IN_RECEIVED`, `RED_FLAG_DETECTED`, `ESCALATION_CREATED` |

### Test 9 — Fever Above Threshold
| Field | Value |
|---|---|
| **Category** | Post-Visit |
| **Scenario** | Patient reports 39.5°C fever Day 1 post-op |
| **Input** | `{ patientId: "PAT-00000004", visitId: "VIS-00000004", painScore: 5, freeTextResponse: "I have a high fever since last night. Temperature was 39.5 degrees. Feeling weak and shaky. This started about 12 hours after my procedure.", temperatureReported: 39.5 }` |
| **Expected Output** | Fever 39.5°C above 38.5°C threshold. Red flag: high-fever. Escalated to physician within 1-hour SLA window. |
| **Escalation** | Physician |
| **Risk Level** | High |
| **Audit Log** | `POST_VISIT_CHECK_IN_RECEIVED`, `RED_FLAG_DETECTED`, `ESCALATION_CREATED` |

### Test 10 — Medication Side Effect Reported
| Field | Value |
|---|---|
| **Category** | Post-Visit |
| **Scenario** | Patient reports rash and dizziness after new prescription |
| **Input** | `{ patientId: "PAT-00000005", visitId: "VIS-00000005", painScore: 4, freeTextResponse: "Since starting the new medication yesterday, I have developed a rash on my arms and chest. I also feel very dizzy when I stand up. The dizziness is new and started right after taking the pills." }` |
| **Expected Output** | NLP detects medication side effect (rash + dizziness). Alert logged. Escalated to prescribing doctor. 1-hour SLA. |
| **Escalation** | Prescribing Doctor |
| **Risk Level** | High |
| **Audit Log** | `POST_VISIT_CHECK_IN_RECEIVED`, `RED_FLAG_DETECTED`, `ESCALATION_CREATED` |

---

## Billing & Insurance Agent (4 Scenarios)

### Test 11 — Duplicate Invoice Detection
| Field | Value |
|---|---|
| **Category** | Billing |
| **Scenario** | Same invoice submitted twice |
| **Input** | Submit twice: `{ patientId: "PAT-00000011", visitId: "VIS-00000011", treatmentCodes: ["CONS01"], amount: 250.00, invoiceDate: "2026-03-10", insurancePolicyId: "POL-MY-20230415", policyExpiryDate: "2027-12-31", coveredCodes: ["CONS01", "LAB03"] }` |
| **Expected Output** | First submission: Invoice created successfully. Second submission: BLOCKED — duplicate detected. Same idempotency key. Audit log entry created for duplicate block. |
| **Escalation** | None |
| **Risk Level** | Medium |
| **Audit Log** | First: `INVOICE_CREATED`. Second: `DUPLICATE_INVOICE_BLOCKED` |

### Test 12 — Expired Insurance Policy
| Field | Value |
|---|---|
| **Category** | Billing |
| **Scenario** | Insurance policy expired 2 months ago |
| **Input** | `{ patientId: "PAT-00000012", visitId: "VIS-00000012", treatmentCodes: ["CONS01"], amount: 500.00, invoiceDate: "2026-03-10", insurancePolicyId: "POL-MY-20210101", policyExpiryDate: "2026-01-15", coveredCodes: ["CONS01"] }` |
| **Expected Output** | Claim rejected. Insurance policy POL-MY-20210101 expired on 2026-01-15. Patient notified. Billing team alerted. |
| **Escalation** | Billing Team |
| **Risk Level** | High |
| **Audit Log** | `INVOICE_CREATED`, `INSURANCE_EXPIRED_DETECTED` |

### Test 13 — Treatment Code Mismatch
| Field | Value |
|---|---|
| **Category** | Billing |
| **Scenario** | Treatment code not covered by insurance plan |
| **Input** | `{ patientId: "PAT-00000013", visitId: "VIS-00000013", treatmentCodes: ["MRI01", "CONS01"], amount: 1200.00, invoiceDate: "2026-03-10", insurancePolicyId: "POL-MY-20230415", policyExpiryDate: "2027-12-31", coveredCodes: ["CONS01", "LAB03", "XRAY01"] }` |
| **Expected Output** | Mismatch detected: MRI01 not in covered codes. Claim held pending review. Billing team notified. |
| **Escalation** | Billing Team |
| **Risk Level** | High |
| **Audit Log** | `INVOICE_CREATED`, `TREATMENT_CODE_MISMATCH` |

### Test 14 — Unresolved Claim >30 Days
| Field | Value |
|---|---|
| **Category** | Billing |
| **Scenario** | Claim open for 35 days — SLA breach |
| **Input** | `{ patientId: "PAT-00000014", visitId: "VIS-00000014", treatmentCodes: ["LAB03"], amount: 180.00, invoiceDate: "2026-02-09", insurancePolicyId: "POL-MY-20230415", policyExpiryDate: "2027-12-31", coveredCodes: ["LAB03", "CONS01"] }` |
| **Expected Output** | 35 days outstanding (SLA threshold: 30 days). Auto-escalation to billing manager. SLA breach logged. |
| **Escalation** | Billing Manager |
| **Risk Level** | High |
| **Audit Log** | `INVOICE_CREATED`, `SLA_BREACH_DETECTED` |

---

## Retention Agent (3 Scenarios)

### Test 15 — Inactive Chronic Patient (8 Months)
| Field | Value |
|---|---|
| **Category** | Retention |
| **Scenario** | Chronic patient with no visit in 8 months |
| **Input** | `{ patientId: "PAT-00000015", name: "Ahmad bin Hassan", lastVisitDate: "2025-07-15", condition: "diabetes, hypertension", messagingConsent: true, unresolvedClinicalIssue: false, unresolvedBillingIssue: false, contactFrequencyCount: 0 }` |
| **Expected Output** | 8 months inactive. Auto-classified: at-risk (chronic + 6+ months). Re-engagement message sent via SMS per at-risk segment template. |
| **Escalation** | None |
| **Risk Level** | Low |
| **Audit Log** | `RETENTION_OUTREACH_SENT` |

### Test 16 — Patient on Suppression List
| Field | Value |
|---|---|
| **Category** | Retention |
| **Scenario** | Patient flagged with unresolved clinical issue |
| **Input** | `{ patientId: "PAT-00000016", name: "Siti Nurhaliza", lastVisitDate: "2025-06-01", condition: "post-op recovery", messagingConsent: true, unresolvedClinicalIssue: true, unresolvedBillingIssue: false, contactFrequencyCount: 0 }` |
| **Expected Output** | Messaging SUPPRESSED. Reason: unresolved clinical issue. No outreach sent until clinical issue is resolved. |
| **Escalation** | None |
| **Risk Level** | Medium |
| **Audit Log** | `RETENTION_SUPPRESSED` |

### Test 17 — Frequency Cap Exceeded
| Field | Value |
|---|---|
| **Category** | Retention |
| **Scenario** | Patient already contacted 3 times this month |
| **Input** | `{ patientId: "PAT-00000017", name: "Lee Chong Wei", lastVisitDate: "2025-08-01", condition: "wellness checkup", messagingConsent: true, unresolvedClinicalIssue: false, unresolvedBillingIssue: false, contactFrequencyCount: 3 }` |
| **Expected Output** | Outreach BLOCKED. Reason: frequency cap exceeded (3 contacts this month, max 2). Next outreach scheduled for next cycle. |
| **Escalation** | None |
| **Risk Level** | Low |
| **Audit Log** | `RETENTION_SUPPRESSED` |

---

## Clinical Triage Agent (3 Scenarios)

### Test 18 — Emergency Keyword Detected
| Field | Value |
|---|---|
| **Category** | Clinical Triage |
| **Scenario** | Patient says "I think I'm having a heart attack" |
| **Input** | `{ patientId: "PAT-00000018", message: "I think I'm having a heart attack. My chest is very tight and my left arm is numb." }` |
| **Expected Output** | EMERGENCY. Keywords matched: "heart attack". Immediate escalation to emergency services. Call 999 prompt. 5-minute SLA. LLM BYPASSED entirely. Disclaimer included. |
| **Escalation** | Emergency Services |
| **Risk Level** | Critical |
| **Audit Log** | `TRIAGE_EMERGENCY` |

### Test 19 — Routine Symptom Inquiry
| Field | Value |
|---|---|
| **Category** | Clinical Triage |
| **Scenario** | Mild headache for 2 days, no red flags |
| **Input** | `{ patientId: "PAT-00000019", message: "I have had a mild headache for the past 2 days. It comes and goes. No fever, no nausea. Just a dull ache behind my eyes." }` |
| **Expected Output** | Classified as ROUTINE by LLM. Guidance: book next available appointment. No emergency escalation. Disclaimer included in response. |
| **Escalation** | None |
| **Risk Level** | Low |
| **Audit Log** | `TRIAGE_CLASSIFIED` |

### Test 20 — Ambiguous Symptom, Missing Info
| Field | Value |
|---|---|
| **Category** | Clinical Triage |
| **Scenario** | Patient says "chest feels weird" — ambiguous, needs clarification |
| **Input** | `{ patientId: "PAT-00000020", message: "My chest feels weird." }` |
| **Expected Output** | Classified as INSUFFICIENT by LLM. Agent generates structured follow-up questions (e.g., "Can you describe the sensation?", "When did it start?", "Any shortness of breath?"). Does NOT classify urgency until more info provided. Disclaimer included. |
| **Escalation** | Pending (awaiting follow-up) |
| **Risk Level** | Medium |
| **Audit Log** | `TRIAGE_FOLLOWUP_QUESTIONS` |

---

## Edge Cases (5 Scenarios)

### Test 21 — Empty/Null Body to Pre-Visit
| Field | Value |
|---|---|
| **Category** | Edge Case (Pre-Visit) |
| **Scenario** | Completely empty/null request body |
| **Input** | `{}` |
| **Expected Output** | Handled gracefully. All mandatory fields identified as missing. Structured error messages returned for each required field. No crash. |
| **Escalation** | None |
| **Risk Level** | Medium |
| **Audit Log** | `INTAKE_RECEIVED`, `INTAKE_VALIDATION_FAILED`, `FOLLOW_UP_TASK_CREATED` |

### Test 22 — Conflicting Data (Low Pain Score + Severe Symptoms)
| Field | Value |
|---|---|
| **Category** | Edge Case (Post-Visit) |
| **Scenario** | Patient reports pain score 1 but describes severe symptoms |
| **Input** | `{ patientId: "PAT-00000022", visitId: "VIS-00000022", painScore: 1, freeTextResponse: "The pain is so bad I can barely move. There's blood on the bandage and I feel like I might pass out. But I don't want to bother anyone." }` |
| **Expected Output** | NLP detects red flags despite low pain score: bleeding + worsening pain. Red flags override the low pain score. Escalation triggered to clinical team. |
| **Escalation** | Clinical Team |
| **Risk Level** | High |
| **Audit Log** | `POST_VISIT_CHECK_IN_RECEIVED`, `RED_FLAG_DETECTED`, `ESCALATION_CREATED` |

### Test 23 — Duplicate Invoice (Exact Same Submission)
| Field | Value |
|---|---|
| **Category** | Edge Case (Billing) |
| **Scenario** | Exact same invoice submitted twice rapidly |
| **Input** | Same as Test 11 — submitted twice in succession |
| **Expected Output** | Second submission blocked by idempotency check. Composite key match (patientId + visitId + codes + date). Audit log entry for duplicate block. |
| **Escalation** | None |
| **Risk Level** | Medium |
| **Audit Log** | `DUPLICATE_INVOICE_BLOCKED` |

### Test 24 — Red-Flag Phrase Buried in Long Normal Text
| Field | Value |
|---|---|
| **Category** | Edge Case (Post-Visit) |
| **Scenario** | Bleeding mention buried in 200-word normal recovery message |
| **Input** | `{ patientId: "PAT-00000024", visitId: "VIS-00000024", painScore: 2, freeTextResponse: "I had a good day today. Woke up feeling refreshed and had a nice breakfast. Went for a short walk around the garden which felt great. My appetite has improved significantly since the procedure. I have been taking my medications as prescribed and feel like my energy levels are slowly coming back. My family visited me today which really lifted my spirits. The only small thing I noticed was some light bleeding from the surgical site when I changed the dressing, but it stopped quite quickly. Otherwise I feel very positive about my recovery and looking forward to getting back to normal activities soon." }` |
| **Expected Output** | NLP detects "bleeding from the surgical site" — bleeding red flag detected despite being buried in 200 words of positive text. Escalated to clinical team. |
| **Escalation** | Clinical Team |
| **Risk Level** | High |
| **Audit Log** | `POST_VISIT_CHECK_IN_RECEIVED`, `RED_FLAG_DETECTED`, `ESCALATION_CREATED` |

### Test 25 — Expired Insurance + High Risk Combo
| Field | Value |
|---|---|
| **Category** | Edge Case (Billing) |
| **Scenario** | Billing claim with expired insurance — processes without crash |
| **Input** | `{ patientId: "PAT-00000025", visitId: "VIS-00000025", treatmentCodes: ["CONS01"], amount: 350.00, invoiceDate: "2026-03-10", insurancePolicyId: "POL-MY-20200101", policyExpiryDate: "2025-12-31", coveredCodes: ["CONS01"] }` |
| **Expected Output** | Claim rejected: expired insurance. System processes gracefully — no crash. Patient notified. Billing team alerted. Invoice record created but flagged as rejected. Audit log records expiry event. |
| **Escalation** | Billing Team |
| **Risk Level** | High |
| **Audit Log** | `INVOICE_CREATED`, `INSURANCE_EXPIRED_DETECTED` |

---

## Summary

| Category | Tests | Edge Cases | Total |
|---|---|---|---|
| Pre-Visit | 5 | 1 | 6 |
| Post-Visit | 5 | 2 | 7 |
| Billing | 4 | 2 | 6 |
| Retention | 3 | 0 | 3 |
| Clinical Triage | 3 | 0 | 3 |
| **Total** | **20** | **5** | **25** |

All 25 scenarios cover the minimum required 20 from the assessment plus 5 additional edge cases for robustness testing.
