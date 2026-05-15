import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ArrowLeft, Activity, AlertTriangle, Info } from "lucide-react";
import { DualTimer } from "../components/DualTimer";
import { VitalsPanel, VitalsData } from "../components/VitalsPanel";
import { ClinicalEventLog, EventLog } from "../components/ClinicalEventLog";
import { ClinicalWorkspace, ClinicalAction } from "../components/ClinicalWorkspace";
import { DebriefingDashboard, PerformanceMetrics, JourneyStep, LearningPearl } from "../components/DebriefingDashboard";

type Stage = "initial" | "5min" | "10min" | "complete";

export default function EnhancedStatusEpilepticusCase() {
  const [stage, setStage] = useState<Stage>("initial");
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [simulatedTime, setSimulatedTime] = useState(0);
  const [eventLog, setEventLog] = useState<EventLog[]>([]);
  const [sequenceErrors, setSequenceErrors] = useState<string[]>([]);
  const [vitals, setVitals] = useState<VitalsData>({
    hr: 122,
    bp: "140/90",
    rr: 26,
    spo2: 89,
    temp: 37.8,
    gcs: 3,
  });
  const [journey, setJourney] = useState<JourneyStep[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const initialHistoryActions: ClinicalAction[] = useMemo(() => [
    {
      id: "airway-check",
      name: "Assess Airway Patency",
      category: "Primary Survey",
      timeCost: 15,
      costLevel: "low",
      description: "Check for airway obstruction, secretions, foreign body",
    },
    {
      id: "breathing-check",
      name: "Assess Breathing & Ventilation",
      category: "Primary Survey",
      timeCost: 20,
      costLevel: "low",
      description: "Auscultate chest, check respiratory effort",
    },
    {
      id: "circulation-check",
      name: "Assess Circulation",
      category: "Primary Survey",
      timeCost: 15,
      costLevel: "low",
      description: "Check pulses, capillary refill, skin color",
    },
  ], []);

  const initialOrderActions: ClinicalAction[] = useMemo(() => [
    {
      id: "monitoring",
      name: "Continuous Cardiac & SpO₂ Monitoring",
      category: "Monitoring",
      timeCost: 30,
      costLevel: "low",
      description: "Essential vital signs monitoring",
    },
    {
      id: "oxygen",
      name: "High-flow O₂ 10-15 L/min via Non-rebreather",
      category: "Airway & Breathing",
      timeCost: 20,
      costLevel: "low",
      description: "Correct hypoxemia",
    },
    {
      id: "iv-access",
      name: "Two Large-bore IV Lines (18G)",
      category: "Circulation",
      timeCost: 60,
      costLevel: "low",
      description: "Establish vascular access for medications",
    },
    {
      id: "bs-check",
      name: "Rapid Glucose Check (Finger-stick)",
      category: "Labs",
      timeCost: 15,
      costLevel: "low",
      description: "Rule out hypoglycemia as cause",
    },
    {
      id: "dextrose-thiamine",
      name: "D50W 50 mL IV + Thiamine 100 mg IV",
      category: "Medications",
      timeCost: 45,
      costLevel: "low",
      description: "Empiric treatment if BS low or unknown",
      prerequisites: ["iv-access"],
    },
    {
      id: "diazepam-10",
      name: "Diazepam 10 mg IV (or Lorazepam 4 mg IV)",
      category: "Medications",
      timeCost: 120,
      costLevel: "medium",
      description: "First-line benzodiazepine for seizure termination",
      prerequisites: ["iv-access"],
    },
    {
      id: "labs",
      name: "STAT Labs: CBC, BMP, LFT, Ca, Mg, Phenytoin Level",
      category: "Labs",
      timeCost: 30,
      costLevel: "medium",
      description: "Identify reversible causes - results appear immediately",
    },
    {
      id: "ecg",
      name: "ECG 12-Lead",
      category: "Diagnostics",
      timeCost: 45,
      costLevel: "low",
      description: "Assess for arrhythmia, QTc prolongation",
    },
  ], []);

  const initialCommunicationActions: ClinicalAction[] = useMemo(() => [
    {
      id: "identify-self",
      name: "Introduce Self & Role to Team",
      category: "Professionalism",
      timeCost: 10,
      costLevel: "low",
      description: "Establish professional rapport",
    },
    {
      id: "team-briefing",
      name: "Brief Team on Emergency Plan",
      category: "Teamwork",
      timeCost: 30,
      costLevel: "low",
      description: "Closed-loop communication with team",
    },
  ], []);

  const secondStageOrderActions: ClinicalAction[] = useMemo(() => [
    {
      id: "diazepam-second",
      name: "Diazepam 10 mg IV (Second Dose)",
      category: "Medications",
      timeCost: 120,
      costLevel: "medium",
      description: "Repeat benzodiazepine after 5-10 minutes",
      prerequisites: ["diazepam-10"],
    },
    {
      id: "phenytoin-loading",
      name: "Phenytoin 20 mg/kg IV Loading (1500 mg)",
      category: "Medications",
      timeCost: 240,
      costLevel: "high",
      description: "Second-line antiepileptic - max rate 50 mg/min",
      prerequisites: ["iv-access"],
    },
    {
      id: "levetiracetam",
      name: "Levetiracetam 3000 mg IV",
      category: "Medications",
      timeCost: 180,
      costLevel: "high",
      description: "Alternative second-line agent",
      prerequisites: ["iv-access"],
    },
    {
      id: "valproate",
      name: "Valproate 40 mg/kg IV (3000 mg)",
      category: "Medications",
      timeCost: 180,
      costLevel: "high",
      description: "Alternative second-line agent",
      prerequisites: ["iv-access"],
    },
  ], []);

  const thirdStageHistoryActions: ClinicalAction[] = useMemo(() => [
    {
      id: "neuro-exam",
      name: "Complete Neurological Examination",
      category: "Neurological Assessment",
      timeCost: 180,
      costLevel: "low",
      description: "Assess GCS, cranial nerves, motor/sensory function",
    },
    {
      id: "mental-status",
      name: "Mental Status Assessment",
      category: "Neurological Assessment",
      timeCost: 60,
      costLevel: "low",
      description: "Evaluate orientation, memory, cognition",
    },
  ], []);

  const thirdStageOrderActions: ClinicalAction[] = useMemo(() => [
    {
      id: "ct-brain",
      name: "CT Brain Non-Contrast STAT",
      category: "Imaging",
      timeCost: 300,
      costLevel: "high",
      description: "Rule out hemorrhage, mass, structural lesion",
    },
    {
      id: "check-labs",
      name: "Review STAT Lab Results",
      category: "Labs",
      timeCost: 30,
      costLevel: "low",
      description: "Check previously ordered labs",
      prerequisites: ["labs"],
    },
    {
      id: "phenytoin-maintenance",
      name: "Phenytoin 100 mg PO TID (Maintenance)",
      category: "Medications",
      timeCost: 30,
      costLevel: "low",
      description: "Continue antiepileptic therapy",
      prerequisites: ["phenytoin-loading"],
    },
    {
      id: "eeg",
      name: "Urgent EEG",
      category: "Diagnostics",
      timeCost: 240,
      costLevel: "high",
      description: "Assess for subclinical seizures, epileptiform activity",
    },
  ], []);

  const thirdStageCommunicationActions: ClinicalAction[] = useMemo(() => [
    {
      id: "family-update",
      name: "Update Family on Patient Status",
      category: "Communication",
      timeCost: 120,
      costLevel: "low",
      description: "Explain situation with empathy and clarity",
    },
    {
      id: "admit-icu",
      name: "Arrange ICU Admission & Handoff",
      category: "Disposition",
      timeCost: 90,
      costLevel: "low",
      description: "Coordinate care transition to ICU team",
    },
  ], []);

  const handleActionToggle = useCallback((action: ClinicalAction) => {
    setSelectedActions((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(action.id)) {
        newSelected.delete(action.id);
      } else {
        newSelected.add(action.id);
      }
      return newSelected;
    });
  }, []);

  const validateSequence = useCallback((actionId: string, completed: Set<string>): string | null => {
    const ivMedications = ["diazepam-10", "dextrose-thiamine", "phenytoin-loading", "levetiracetam", "valproate"];

    if (ivMedications.includes(actionId) && !completed.has("iv-access")) {
      return "FATAL ERROR: Cannot administer IV medication without established IV access!";
    }
    if (actionId === "dextrose-thiamine" && !completed.has("bs-check")) {
      return "WARNING: Best practice is to check blood sugar before empiric dextrose administration.";
    }
    if (actionId === "diazepam-second" && !completed.has("diazepam-10")) {
      return "FATAL ERROR: Cannot give second dose without administering first dose!";
    }
    if (actionId === "check-labs" && !completed.has("labs")) {
      return "FATAL ERROR: No labs were ordered previously!";
    }
    if (actionId === "phenytoin-maintenance" && !completed.has("phenytoin-loading")) {
      return "FATAL ERROR: Maintenance dose requires loading dose first!";
    }
    return null;
  }, []);

  const isActionCorrectForStage = useCallback((actionId: string, currentStage: Stage): boolean => {
    if (currentStage === "initial") {
      return [
        "airway-check", "breathing-check", "circulation-check",
        "monitoring", "oxygen", "iv-access", "bs-check",
        "dextrose-thiamine", "diazepam-10", "labs", "ecg",
        "identify-self", "team-briefing"
      ].includes(actionId);
    }
    if (currentStage === "5min") {
      return ["diazepam-second", "phenytoin-loading", "levetiracetam", "valproate"].includes(actionId);
    }
    if (currentStage === "10min") {
      return [
        "neuro-exam", "mental-status", "ct-brain", "check-labs",
        "phenytoin-maintenance", "eeg", "family-update", "admit-icu"
      ].includes(actionId);
    }
    return false;
  }, []);

  const getActionResult = useCallback((actionId: string): string => {
    const results: { [key: string]: string } = {
      "airway-check": "✓ Airway patent, no obstruction. Tongue position maintained, no blood/secretions.",
      "breathing-check": "✓ Bilateral breath sounds equal. Chest rise symmetric. RR: 26, labored during seizure.",
      "circulation-check": "✓ Radial pulses 2+ bilateral, cap refill <2s. Skin warm, slightly diaphoretic.",
      "monitoring": "✓ Monitor connected. HR: 122 bpm, SpO₂: 89%, Rhythm: Sinus Tachycardia. Continuous monitoring active.",
      "oxygen": "✓ High-flow O₂ 15L via NRB started. SpO₂ improved: 89% → 94% within 2 minutes.",
      "iv-access": "✓ Two 18G IV lines established in bilateral antecubital fossae. NS 0.9% infusion at 100 mL/hr started.",
      "bs-check": "✓ Finger-stick Blood Glucose: 90 mg/dL (NORMAL). Hypoglycemia ruled out as cause.",
      "dextrose-thiamine": "✓ D50W 50 mL + Thiamine 100 mg IV administered. BS: 90→105 mg/dL. Wernicke's prophylaxis complete.",
      "diazepam-10": "✓ Diazepam 10 mg IV push given slowly over 2 minutes. No respiratory depression. Monitoring for response...",
      "labs": "✓ STAT Labs Results: CBC (WBC 11.2, Hb 14.5), BMP (Na 138, K 4.0, Cr 0.9), Ca 9.1 mg/dL, Mg 2.0 mg/dL, Phenytoin Level <2 μg/mL (SUB-THERAPEUTIC - explains breakthrough seizure!)",
      "ecg": "✓ ECG Results: Sinus Tachycardia 122 bpm, normal axis, no acute ST-T changes, QTc: 420 ms (normal).",
      "identify-self": "✓ Introduced self to team. Established role as team leader. Team ready for orders.",
      "team-briefing": "✓ Team briefed on Status Epilepticus protocol. Roles assigned. Closed-loop communication established.",
      "diazepam-second": "✓ Second dose Diazepam 10 mg IV administered (Total: 20 mg cumulative). Seizure activity beginning to subside...",
      "phenytoin-loading": "✓ Phenytoin loading 1500 mg (20 mg/kg) infusing at 50 mg/min in 100 mL NS over 30 minutes. BP/ECG monitored.",
      "levetiracetam": "✓ Levetiracetam 3000 mg (60 mg/kg) IV infusion started over 15 minutes. Well tolerated.",
      "valproate": "✓ Valproate 3000 mg (40 mg/kg) IV loading dose infusing over 10 minutes.",
      "neuro-exam": "✓ Complete Neuro Exam: GCS 13 (E3V4M6), Pupils 3mm reactive bilaterally, CN II-XII intact, Motor 5/5 all extremities, Sensation intact, DTRs 2+ symmetric, No Babinski, Gait deferred.",
      "mental-status": "✓ Mental Status: Lethargic but arousable, oriented to person only, following simple commands, post-ictal confusion improving.",
      "ct-brain": "✓ CT Brain Non-Contrast Results: No acute hemorrhage, mass effect, or midline shift. No skull fracture. Age-appropriate minimal cerebral atrophy. Old calcified granuloma noted.",
      "check-labs": "✓ Lab review confirms: Sub-therapeutic Phenytoin level (<2), normal electrolytes, no metabolic derangement. Non-compliance confirmed as trigger.",
      "phenytoin-maintenance": "✓ Phenytoin 100 mg PO TID prescribed. Patient counseled on medication compliance. Follow-up level in 48-72 hours.",
      "eeg": "✓ EEG Results: Background slowing consistent with post-ictal state. No ongoing seizure activity. No epileptiform discharges during 20-min recording.",
      "family-update": "✓ Family updated with empathy. Explained status epilepticus, treatment given, current stability. Questions answered. Family reassured.",
      "admit-icu": "✓ ICU bed secured. Comprehensive handoff given to ICU team. Patient transferred safely with continuous monitoring.",
    };
    return results[actionId] || "✓ Action completed successfully.";
  }, []);

  const handleSubmitPhase = useCallback(() => {
    const errors: string[] = [];
    let timeAdded = 0;
    let correct = 0;
    let total = 0;

    const allActions = [
      ...initialOrderActions,
      ...initialHistoryActions,
      ...initialCommunicationActions,
      ...secondStageOrderActions,
      ...thirdStageHistoryActions,
      ...thirdStageOrderActions,
      ...thirdStageCommunicationActions
    ];

    const actionsToProcess = Array.from(selectedActions);

    actionsToProcess.forEach((actionId) => {
      const action = allActions.find((a) => a.id === actionId);
      if (!action) return;

      const error = validateSequence(actionId, completedActions);
      if (error) {
        errors.push(error);
        setEventLog((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${actionId}-${Math.random()}`,
            timestamp: simulatedTime + timeAdded,
            action: action.name,
            result: error,
            type: error.includes("FATAL") ? "error" : "warning",
          },
        ]);
      } else {
        const isCorrect = isActionCorrectForStage(actionId, stage);
        const result = getActionResult(actionId);

        setEventLog((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${actionId}-${Math.random()}`,
            timestamp: simulatedTime + timeAdded,
            action: action.name,
            result: result,
            type: isCorrect ? "success" : "info",
          },
        ]);

        if (isCorrect) correct++;
        total++;

        setJourney((prev) => [
          ...prev,
          {
            id: actionId,
            time: simulatedTime + timeAdded,
            action: action.name,
            isCorrect,
            isCritical: action.category === "Medications",
          },
        ]);

        setCompletedActions((prev) => new Set(prev).add(actionId));
      }

      timeAdded += action.timeCost;
    });

    setCorrectCount((prev) => prev + correct);
    setTotalCount((prev) => prev + total);
    setSimulatedTime((prev) => prev + timeAdded);

    if (errors.length > 0) {
      setSequenceErrors(errors);
    }

    setSelectedActions(new Set());
  }, [
    selectedActions,
    completedActions,
    simulatedTime,
    stage,
    initialOrderActions,
    initialHistoryActions,
    initialCommunicationActions,
    secondStageOrderActions,
    thirdStageHistoryActions,
    thirdStageOrderActions,
    thirdStageCommunicationActions,
    validateSequence,
    isActionCorrectForStage,
    getActionResult
  ]);

  useEffect(() => {
    if (completedActions.has("oxygen")) {
      setVitals((prev) => prev.spo2 !== 94 ? { ...prev, spo2: 94 } : prev);
    }

    if (stage === "5min" && (completedActions.has("diazepam-second") || completedActions.has("phenytoin-loading"))) {
      setVitals((prev) => {
        if (prev.gcs !== 10) {
          return {
            hr: 102,
            bp: "135/88",
            rr: 20,
            spo2: 96,
            temp: 37.5,
            gcs: 10,
          };
        }
        return prev;
      });
    }

    if (stage === "10min") {
      setVitals((prev) => {
        if (prev.gcs !== 13) {
          return {
            hr: 88,
            bp: "128/82",
            rr: 16,
            spo2: 98,
            temp: 37.2,
            gcs: 13,
          };
        }
        return prev;
      });
    }
  }, [completedActions, stage]);

  const handleNextStage = useCallback(() => {
    setSequenceErrors([]);

    if (stage === "initial") {
      setStage("5min");
    } else if (stage === "5min") {
      setStage("10min");
    } else if (stage === "10min") {
      setStage("complete");
    }
  }, [stage]);

  const metrics: PerformanceMetrics = useMemo(() => ({
    diagnosisAccuracy: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
    resourceStewardship: simulatedTime < 1200 ? 90 : simulatedTime < 1800 ? 75 : 60,
    timeManagement: simulatedTime < 1200 ? 95 : simulatedTime < 1800 ? 80 : 65,
    professionalism: completedActions.has("identify-self") && completedActions.has("family-update") ? 95 :
                     completedActions.has("identify-self") || completedActions.has("family-update") ? 85 : 70,
  }), [totalCount, correctCount, simulatedTime, completedActions]);

  const learningPearls: LearningPearl[] = useMemo(() => [
    {
      topic: "Definition of Status Epilepticus",
      content: "Continuous seizure activity >5 minutes OR ≥2 sequential seizures without return to baseline consciousness. This is a neurological emergency requiring immediate intervention to prevent permanent brain damage.",
      guideline: "Neurocritical Care Society Guidelines 2023",
    },
    {
      topic: "First-Line Treatment Protocol",
      content: "Benzodiazepines are first-line: Lorazepam 0.1 mg/kg IV (max 4 mg) is preferred, or Diazepam 0.15 mg/kg IV (max 10 mg). Must be administered within the first 5 minutes for optimal neurological outcomes. Repeat once if seizure continues after 5-10 minutes.",
      guideline: "AES/ACNS Evidence-Based Guidelines for Status Epilepticus 2023",
    },
    {
      topic: "Rule Out Reversible Causes",
      content: "Always check blood glucose immediately - hypoglycemia is the most common reversible cause. Also assess for: hypoxia, electrolyte disturbances (Na, Ca, Mg), toxins/drugs, infection (meningitis/encephalitis), and medication non-compliance. The mnemonic VITAMINS helps: Vascular, Infection, Trauma, Autoimmune, Metabolic, Idiopathic/Iatrogenic, Neoplasm, Seizure disorder.",
      guideline: "ACEP Clinical Policy on Seizures",
    },
    {
      topic: "Second-Line Antiepileptic Therapy",
      content: "If seizures persist after 2 doses of benzodiazepines (refractory SE), immediately initiate second-line agents: Fosphenytoin 20 mg PE/kg IV (or Phenytoin 20 mg/kg at max 50 mg/min), Valproate 40 mg/kg IV, or Levetiracetam 60 mg/kg IV. All three have similar efficacy. Monitor for hypotension with fosphenytoin/phenytoin.",
      guideline: "Neurocritical Care Society Status Epilepticus Guidelines 2023",
    },
    {
      topic: "Airway Management & ICU Transfer",
      content: "Indications for intubation: persistent altered mental status preventing airway protection, respiratory failure (hypoxia despite O₂, hypercarbia), or need for third-line agents (midazolam/propofol infusions). All status epilepticus patients require ICU-level monitoring. Continuous EEG is recommended to detect subclinical seizures.",
      guideline: "Neurocritical Care Society ICU Management Guidelines",
    },
  ], []);

  const getStageInfo = useCallback(() => {
    const stageInfo = {
      initial: {
        title: "T+0 min: Initial Emergency Management",
        description: "34-year-old male with known epilepsy presents with continuous generalized tonic-clonic seizure >5 minutes. History: Non-compliant with Phenytoin ×3 days. Your goal: Terminate seizure, secure airway/breathing/circulation, and identify reversible causes.",
        badge: "CRITICAL"
      },
      "5min": {
        title: "T+5 min: Refractory Seizure - Escalate Treatment",
        description: "Despite initial benzodiazepine dose, seizure activity persists after 5 minutes. This is now REFRACTORY Status Epilepticus. Immediate escalation to second-line antiepileptic therapy is required. Consider airway protection.",
        badge: "CRITICAL"
      },
      "10min": {
        title: "T+15 min: Post-Ictal Phase - Stabilization & Workup",
        description: "Seizure has terminated. Patient is post-ictal with improving GCS (currently 10-13). Continue stabilization, complete diagnostic workup, address underlying cause (medication non-compliance), and arrange ICU admission for monitoring.",
        badge: "STABLE"
      }
    };
    return stageInfo[stage] || stageInfo.initial;
  }, [stage]);

  const currentStageInfo = getStageInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b-2 border-slate-300 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Exit case and return to home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Exit Case</span>
            </Link>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-right">
                <div className="text-xs text-slate-500">Patient ID: SE-001</div>
                <div className="text-sm font-bold text-slate-900">M, 34yr, 75kg • Status Epilepticus</div>
                <div className="text-xs text-red-600" role="alert">⚠ Allergy: Penicillin</div>
              </div>
              <DualTimer
                simulatedTime={simulatedTime}
                criticalTime={1800}
                warningTime={1200}
              />
            </div>
          </div>
        </div>
      </div>

      {simulatedTime > 1800 && stage !== "complete" && (
        <Alert className="mx-4 mt-4 bg-red-100 border-2 border-red-500 animate-pulse" role="alert">
          <AlertTriangle className="h-5 w-5 text-red-700" />
          <AlertTitle className="text-red-900 font-bold">CRITICAL TIME EXCEEDED</AlertTitle>
          <AlertDescription className="text-red-800">
            &gt;30 minutes of seizure activity dramatically increases risk of permanent neurological damage and
            refractory status epilepticus requiring ICU-level care with third-line agents!
          </AlertDescription>
        </Alert>
      )}

      {selectedActions.size === 0 && stage !== "complete" && eventLog.length === 0 && (
        <Alert className="mx-4 mt-4 bg-blue-50 border-2 border-blue-300">
          <Info className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-900 font-semibold">Getting Started</AlertTitle>
          <AlertDescription className="text-blue-800 text-sm">
            Select appropriate actions from the tabs below. Review each option carefully - time costs and prerequisites are displayed. Click "Submit Actions" when ready to proceed.
          </AlertDescription>
        </Alert>
      )}

      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <VitalsPanel vitals={vitals} />
          </div>

          <div className="lg:col-span-6 space-y-6">
            {stage !== "complete" && (
              <>
                <Card className="border-2 border-blue-400 bg-blue-50/50 shadow-md">
                  <CardHeader className="border-b-2 border-blue-300 bg-blue-100">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-base text-blue-900 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        {currentStageInfo.title}
                      </CardTitle>
                      <Badge className={currentStageInfo.badge === "STABLE" ? "bg-green-600" : "bg-red-600"}>
                        {currentStageInfo.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {currentStageInfo.description}
                    </p>
                  </CardContent>
                </Card>

                <ClinicalWorkspace
                  historyActions={stage === "10min" ? thirdStageHistoryActions : initialHistoryActions}
                  orderActions={
                    stage === "initial" ? initialOrderActions :
                    stage === "5min" ? secondStageOrderActions :
                    thirdStageOrderActions
                  }
                  communicationActions={stage === "10min" ? thirdStageCommunicationActions : initialCommunicationActions}
                  selectedActions={selectedActions}
                  onActionToggle={handleActionToggle}
                  onSubmitPhase={handleSubmitPhase}
                  completedActions={completedActions}
                />

                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div className="text-sm text-slate-600">
                    {selectedActions.size > 0 && (
                      <span className="text-blue-600 font-medium">
                        {selectedActions.size} action(s) selected - click Submit to proceed
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleNextStage}
                    variant="outline"
                    className="border-slate-400"
                    aria-label="Advance to next clinical phase"
                  >
                    Advance to Next Phase →
                  </Button>
                </div>
              </>
            )}

            {stage === "complete" && (
              <>
                <DebriefingDashboard
                  metrics={metrics}
                  journey={journey}
                  learningPearls={learningPearls}
                  totalTime={simulatedTime}
                  correctActions={correctCount}
                  totalActions={totalCount}
                />
                <Link to="/">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    Return to Home
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="lg:col-span-3">
            <ClinicalEventLog events={eventLog} sequenceErrors={sequenceErrors} />
          </div>
        </div>
      </div>
    </div>
  );
}
