// Card data + answer key for the Inspection Readiness game.
// correctZone: 'before' | 'after' | 'wrong'
// `wrong` cards are deliberate traps that must be dropped into the Wrong bin.

export const ZONES = [
  { id: 'before', title: 'BEFORE Inspection', subtitle: 'Correct preparation actions', color: '#3b82f6' },
  { id: 'after', title: 'AFTER Inspection', subtitle: 'Correct response & CAPA actions', color: '#8b5cf6' },
  { id: 'wrong', title: 'Wrong / Bad practice', subtitle: 'Traps — do NOT do these', color: '#ef4444' },
];

export const CARDS = [
  // ---------- BEFORE — correct ----------
  { id: 'b1', correctZone: 'before', text: 'Inform Affiliate Quality & Compliance, PV-QMS, the RAPV subregional lead, RA Lead and relevant local stakeholders about the upcoming inspection.' },
  { id: 'b2', correctZone: 'before', text: 'Form the Core Team with support from PV-QMS and identify the relevant SMEs for each inspection agenda topic.' },
  { id: 'b3', correctZone: 'before', text: 'Use a request tracker to monitor all pre-inspection document requests, owners, deadlines, review status and submission status. Assign document owners and agree who performs review/QC before submission — done with PV-QMS, PV QA and SMEs.' },
  { id: 'b4', correctZone: 'before', text: 'Request CVs, training records, AE case listing, PSMF/PSSF and relevant SOPs from the global SMEs; verify before sharing that documents are current effective versions.' },
  { id: 'b5', correctZone: 'before', text: 'Prepare the opening meeting presentation with input from local and global stakeholders: affiliate info, organizational chart, PV & RA collaboration, product list, general PV system overview.' },
  { id: 'b6', correctZone: 'before', text: 'Review known risk areas, gaps, deviations, non-conformances, CAPAs and past inspection/audit learnings relevant to the scope. Check ongoing and past CAPAs so the team is ready to discuss them.' },
  { id: 'b7', correctZone: 'before', text: 'Align with RA on product list, safety variation line listing, RA-related agenda items, and any RA-owned CAPAs or compliance topics.' },
  { id: 'b8', correctZone: 'before', text: 'Together with QMS and PV QA, identify back-office support during the inspection: who manages document requests, who tracks questions, who coordinates follow-up.' },
  { id: 'b9', correctZone: 'before', text: 'Arrange IT support, test room technology, brief reception and greeter staff, confirm visitor badges, transportation, dietary requirements, catering and any site-specific factors such as planned drills.' },
  { id: 'b10', correctZone: 'before', text: 'After the quality check of all requested documents is completed, provide the documents to the inspectors on time.' },

  // ---------- BEFORE — traps ----------
  { id: 'bw1', correctZone: 'wrong', text: 'Bring extra chocolate and hope the inspectors ask fewer questions.' },
  { id: 'bw2', correctZone: 'wrong', text: 'Prepare inspirational quotes for the inspection room walls.' },
  { id: 'bw3', correctZone: 'wrong', text: 'Start preparing for document requests after lunch because Wednesday still feels far away.' },
  { id: 'bw4', correctZone: 'wrong', text: 'Ask the DSO, DSO Back-up and RA Lead to send their most current CVs and training records from their local files.' },
  { id: 'bw5', correctZone: 'wrong', text: 'Ask each SME to prepare their own documents and send them directly to the inspector to save time.' },
  { id: 'bw6', correctZone: 'wrong', text: 'Prepare the AE case listing manually from LSMV by selecting the required fields (country, date range, submission details) using QBE functionality.' },

  // ---------- AFTER — correct ----------
  { id: 'a1', correctZone: 'after', text: 'After receipt of the inspection report, coordinate with QA / PV-QMS to review the report and clarify ownership of each observation, finding, requested clarification and follow-up action.' },
  { id: 'a2', correctZone: 'after', text: 'Confirm whether each observation or finding involves PV, RA, both functions or any other function before preparing the response.' },
  { id: 'a3', correctZone: 'after', text: 'Assign clear owners and target dates for each finding, observation, commitment, CAPA and follow-up action.' },
  { id: 'a4', correctZone: 'after', text: 'Review each finding carefully and assess the root or probable cause, impact, correction, CAPA and target completion date.' },
  { id: 'a6', correctZone: 'after', text: 'Ensure the PV Lead provides guidance on the content, wording, consistency and final alignment of inspection responses.' },
  { id: 'a7', correctZone: 'after', text: 'For AE case-related findings, involve the DSO and verify the case record, submission evidence, escalation history and any related deviation or CAPA.' },
  { id: 'a8', correctZone: 'after', text: 'For RA-related findings, involve the RA Lead and verify official RA source records for product lists, safety variations, submissions and related communication evidence.' },
  { id: 'a9', correctZone: 'after', text: 'Define CAPAs that address the root cause and include realistic target dates, clear ownership and effectiveness checks where applicable.' },
  { id: 'a10', correctZone: 'after', text: 'Agree with the HA on the proposed CAPAs and follow up on the approved CAPAs together with the relevant function.' },

  // ---------- AFTER — traps ----------
  { id: 'aw1', correctZone: 'wrong', text: 'Let QA consolidate the inspection responses and determine the final wording, while PV and RA provide input only if clarification is needed.' },
  { id: 'aw2', correctZone: 'wrong', text: 'Create CAPAs that correct the specific example identified by the inspector without addressing the underlying process gap.' },
  { id: 'aw3', correctZone: 'wrong', text: 'Prepare responses as fast as possible using general statements such as "the process has been updated".' },
  { id: 'aw4', correctZone: 'wrong', text: 'In order to save time, start working on the CAPAs before obtaining approval from the Health Authority.' },
];

export const SCENARIOS = [
  {
    id: 'pv',
    tag: 'PV',
    color: '#10b981',
    prompt: '"How do you monitor whether applicable cases are submitted to the Health Authority within the required timelines? Additionally, if a case is late, how is this identified, escalated, documented and prevented from recurring?"',
  },
  {
    id: 'ra',
    tag: 'RA',
    color: '#f59e0b',
    prompt: '"Please walk me through how safety variations are tracked from receipt through local implementation. What procedures are in place? How do you identify delays, document them and escalate them if needed?"',
  },
];

export const TEAMS = [
  { id: 't1', name: 'Aurora', color: '#6366f1' },
  { id: 't2', name: 'Nimbus', color: '#06b6d4' },
  { id: 't3', name: 'Solstice', color: '#f97316' },
  { id: 't4', name: 'Vertex', color: '#ec4899' },
  { id: 't5', name: 'Quasar', color: '#14b8a6' },
  { id: 't6', name: 'Zephyr', color: '#a855f7' },
];
