import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { ArrowRight, Activity, AlertCircle, CheckCircle2, FileText, Clock, Info } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Timer } from "../components/Timer";

type Stage = "initial" | "5min" | "10min" | "20min" | "complete";

interface Order {
  id: string;
  text: string;
  stage: string;
  timeCost: number;
}

interface ActionDefinition {
  id: string;
  text: string;
  timeCost: number;
  isCorrect?: boolean;
  result?: string;
}

interface ActionResult {
  action: string;
  result: string;
  time: number;
}

export default function StatusEpilepticusCase() {
  const [stage, setStage] = useState<Stage>("initial");
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<Order[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [actionResults, setActionResults] = useState<ActionResult[]>([]);
  const [feedback, setFeedback] = useState<{correct: string[], incorrect: string[], missing: string[]}>({
    correct: [],
    incorrect: [],
    missing: []
  });

  const initialActions: ActionDefinition[] = [
    { 
      id: "monitoring", 
      text: "Continuous Cardiac & SpO₂ Monitoring", 
      timeCost: 30, 
      isCorrect: true,
      result: "مونیتورینگ برقرار شد. HR: 122, SpO₂: 89%, Rhythm: Sinus Tachycardia"
    },
    { 
      id: "oxygen", 
      text: "High-flow O₂ 10-15 L/min via Non-rebreather Mask", 
      timeCost: 20, 
      isCorrect: true,
      result: "اکسیژن شروع شد. SpO₂ بهبود یافت: 89% → 94%"
    },
    { 
      id: "iv-access", 
      text: "دسترسی وریدی - Two Large-bore IV Lines (18G)", 
      timeCost: 60, 
      isCorrect: true,
      result: "دو لاین وریدی 18G در دو دست برقرار شد. Normal Saline آغاز گردید."
    },
    { 
      id: "intubation-initial", 
      text: "اینتوباسیون و تهویه مکانیکی", 
      timeCost: 180, 
      isCorrect: false,
      result: "❌ اینتوباسیون در این مرحله زود است. فعلاً Airway باز و تنفس کافی است."
    },
    { 
      id: "ecg", 
      text: "ECG 12-Lead", 
      timeCost: 45, 
      isCorrect: true,
      result: "ECG: Sinus Tachycardia 122 bpm, No acute ST-T changes, QTc: 420 ms"
    },
    { 
      id: "bs-check", 
      text: "Rapid Glucose Check (Finger-stick)", 
      timeCost: 15, 
      isCorrect: true,
      result: "✓ Blood Sugar: 90 mg/dL (نرمال - Hypoglycemia رد شد)"
    },
    { 
      id: "dextrose-thiamine", 
      text: "D50W 50 mL IV Push + Thiamine 100 mg IV", 
      timeCost: 45, 
      isCorrect: true,
      result: "تزریق انجام شد. BS: 90→105 mg/dL. Thiamine برای جلوگیری از Wernicke's encephalopathy"
    },
    { 
      id: "diazepam-10", 
      text: "Diazepam 10 mg IV (over 2 min) یا Lorazepam 4 mg IV", 
      timeCost: 120, 
      isCorrect: true,
      result: "✓ Diazepam 10 mg تزریق شد. در حال مشاهده پاسخ..."
    },
    { 
      id: "labs", 
      text: "STAT Labs: CBC, BMP, LFT, Ca, Mg, Phenytoin Level", 
      timeCost: 30, 
      isCorrect: true,
      result: "نمونه‌ها ارسال شد. نتایج در 45-60 دقیقه آماده خواهد شد."
    }
  ];

  const secondStageActions: ActionDefinition[] = [
    { 
      id: "diazepam-second", 
      text: "Diazepam 10 mg IV (دوز دوم) یا Lorazepam 4 mg IV", 
      timeCost: 120, 
      isCorrect: true,
      result: "✓ دوز دوم Benzodiazepine تزریق شد. Total: 20 mg Diazepam equivalent"
    },
    { 
      id: "intubation-5min", 
      text: "اینتوباسیون فوری", 
      timeCost: 180, 
      isCorrect: false,
      result: "❌ هنوز نیاز به اینتوباسیون نیست. SpO₂: 94%, Airway patent"
    },
    { 
      id: "dextrose-5min", 
      text: "تزریق مجدد Dextrose", 
      timeCost: 45, 
      isCorrect: false,
      result: "❌ BS قبلاً چک شد و نرمال است (105 mg/dL). نیازی به دوز بیشتر نیست."
    },
    { 
      id: "midazolam-intranasal", 
      text: "Midazolam 5-10 mg Intranasal یا Buccal", 
      timeCost: 60, 
      isCorrect: true,
      result: "✓ Midazolam 10 mg Intranasal داده شد (مسیر جایگزین)"
    },
    { 
      id: "phenytoin-loading", 
      text: "Phenytoin 20 mg/kg IV Loading Dose (1500 mg for 75kg)", 
      timeCost: 240, 
      isCorrect: true,
      result: "✓ Phenytoin Loading آغاز شد: 1500 mg در 100 mL NS با نرخ max 50 mg/min"
    }
  ];

  const thirdStageActions: ActionDefinition[] = [
    { 
      id: "intubation-10min", 
      text: "اینتوباسیون", 
      timeCost: 180, 
      isCorrect: false,
      result: "❌ تشنج متوقف شده، بیمار در Post-ictal state. Airway stable, SpO₂: 96%"
    },
    { 
      id: "flumazenil", 
      text: "Flumazenil (Benzodiazepine Reversal)", 
      timeCost: 60, 
      isCorrect: false,
      result: "❌ خطرناک! Flumazenil در Status Epilepticus مطلقاً ممنوع - می‌تواند تشنج را برگرداند"
    },
    { 
      id: "wait-recovery", 
      text: "Post-ictal Period: مشاهده و اجازه ریکاوری (10-20 min)", 
      timeCost: 0, 
      isCorrect: true,
      result: "✓ بیمار در Post-ictal state است. GCS به تدریج بهبود می‌یابد."
    },
    { 
      id: "neuro-brief", 
      text: "Brief Neurological Assessment", 
      timeCost: 60, 
      isCorrect: true,
      result: "GCS: 8 (E2V2M4), Pupils: 3mm reactive bilaterally, No focal deficits"
    }
  ];

  const fourthStageActions: ActionDefinition[] = [
    { 
      id: "neuro-full", 
      text: "Complete Neurological Examination", 
      timeCost: 180, 
      isCorrect: true,
      result: "GCS: 13 (E3V4M6), CN II-XII intact, Motor: 5/5 all extremities, No Babinski, DTR: 2+ symmetric"
    },
    { 
      id: "phenobarbital", 
      text: "Phenobarbital Infusion", 
      timeCost: 120, 
      isCorrect: false,
      result: "❌ در این مرحله نیازی نیست. تشنج متوقف و بیمار در حال بهبود است."
    },
    { 
      id: "ct-brain", 
      text: "CT Brain بدون کنتراست", 
      timeCost: 300, 
      isCorrect: true,
      result: "✓ CT Brain: No acute hemorrhage, mass effect, or midline shift. Age-appropriate atrophy."
    },
    { 
      id: "labs-check", 
      text: "بررسی نتایج آزمایشات", 
      timeCost: 30, 
      isCorrect: true,
      result: "CBC: WBC 11.2, Hb 14.5 | BMP: Normal | Ca: 9.1, Mg: 2.0 | Phenytoin: <2 μg/mL (تراپوتیک: 10-20)"
    },
    { 
      id: "phenytoin-maintenance", 
      text: "Phenytoin Maintenance Dose", 
      timeCost: 45, 
      isCorrect: true,
      result: "✓ Phenytoin 100 mg PO TID prescribed. Level را در 48 ساعت چک کنید."
    }
  ];

  const toggleAction = (actionDef: ActionDefinition, stageName: string) => {
    const actionId = actionDef.id;
    const newSelected = new Set(selectedActions);
    
    if (newSelected.has(actionId)) {
      // Remove action
      newSelected.delete(actionId);
      setOrders(orders.filter(o => o.id !== actionId));
      setActionResults(actionResults.filter(r => r.action !== actionDef.text));
      setElapsedTime(prev => Math.max(0, prev - actionDef.timeCost));
    } else {
      // Add action
      newSelected.add(actionId);
      setOrders([...orders, { 
        id: actionId, 
        text: actionDef.text, 
        stage: stageName,
        timeCost: actionDef.timeCost 
      }]);
      setElapsedTime(prev => prev + actionDef.timeCost);
      
      // Add result if exists
      if (actionDef.result) {
        setActionResults([...actionResults, {
          action: actionDef.text,
          result: actionDef.result,
          time: elapsedTime + actionDef.timeCost
        }]);
      }
    }
    setSelectedActions(newSelected);
  };

  const getActionsForStage = (): ActionDefinition[] => {
    switch(stage) {
      case "initial": return initialActions;
      case "5min": return secondStageActions;
      case "10min": return thirdStageActions;
      case "20min": return fourthStageActions;
      default: return [];
    }
  };

  const checkAnswers = () => {
    const correct: string[] = [];
    const incorrect: string[] = [];
    const missing: string[] = [];
    const currentActions = getActionsForStage();

    selectedActions.forEach(actionId => {
      const action = currentActions.find(a => a.id === actionId);
      if (action) {
        if (action.isCorrect) {
          correct.push(actionId);
        } else {
          incorrect.push(actionId);
        }
      }
    });

    currentActions.forEach(action => {
      if (action.isCorrect && !selectedActions.has(action.id)) {
        missing.push(action.id);
      }
    });

    setFeedback({ correct, incorrect, missing });
  };

  const proceedToNextStage = () => {
    setSelectedActions(new Set());
    setFeedback({ correct: [], incorrect: [], missing: [] });
    
    if (stage === "initial") {
      setStage("5min");
    } else if (stage === "5min") {
      setStage("10min");
    } else if (stage === "10min") {
      setStage("20min");
    } else if (stage === "20min") {
      setStage("complete");
    }
  };

  const getStageName = () => {
    switch(stage) {
      case "initial": return "T+0 min: Initial Management";
      case "5min": return "T+5 min: Seizure Persists";
      case "10min": return "T+10 min: Post-Seizure";
      case "20min": return "T+20 min: Recovery Phase";
      default: return "";
    }
  };

  const getStageDescription = () => {
    switch(stage) {
      case "initial": return "بیمار با تشنج مداوم وارد اورژانس شده است";
      case "5min": return "با وجود دوز اول Benzodiazepine، تشنج ادامه دارد";
      case "10min": return "تشنج متوقف شده - بیمار در Post-ictal state (GCS: 8-9)";
      case "20min": return "بیمار به تدریج هوشیار می‌شود (GCS: 12-13)";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="text-sm">Exit Case</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">Case ID: SE-001</div>
                <div className="text-sm font-medium text-gray-900">Status Epilepticus</div>
              </div>
              <Timer 
                elapsedTime={elapsedTime} 
                criticalTime={1800}
                warningTime={1200}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Case Progress</h3>
            <span className="text-xs text-gray-500">
              {stage === "initial" ? "1" : stage === "5min" ? "2" : stage === "10min" ? "3" : stage === "20min" ? "4" : "5"} / 5
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={stage === "initial" ? "default" : "outline"} className={stage === "initial" ? "bg-blue-600" : ""}>T+0</Badge>
            <div className={`h-1 flex-1 rounded ${stage !== "initial" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "5min" ? "default" : "outline"} className={stage === "5min" ? "bg-blue-600" : ""}>T+5</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "10min" || stage === "20min" || stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "10min" ? "default" : "outline"} className={stage === "10min" ? "bg-blue-600" : ""}>T+10</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "20min" || stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "20min" ? "default" : "outline"} className={stage === "20min" ? "bg-blue-600" : ""}>T+20</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "complete" ? "default" : "outline"} className={stage === "complete" ? "bg-green-600" : ""}>Complete</Badge>
          </div>
        </div>

        {/* Critical Warning */}
        {elapsedTime > 1800 && stage !== "complete" && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-700" />
            <AlertTitle className="text-red-900">Critical Time Exceeded</AlertTitle>
            <AlertDescription className="text-red-700">
              بیش از ۳۰ دقیقه از شروع تشنج گذشته است. خطر Neuronal Injury و عوارض دائمی به شدت افزایش یافته است.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Info */}
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Patient Information</CardTitle>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Emergency</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Age/Sex</div>
                    <div className="text-sm font-medium">34 / M</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Weight</div>
                    <div className="text-sm font-medium">75 kg</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="text-sm font-medium">ED</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Code</div>
                    <div className="text-sm font-medium">Full</div>
                  </div>
                </div>
                
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-sm">Chief Complaint</AlertTitle>
                  <AlertDescription className="text-xs">
                    Generalized Tonic-Clonic Seizure &gt;5 minutes with recurrence. EMS transport time: 10 minutes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Medical History:</div>
                    <ul className="text-gray-700 space-y-1 mr-4 text-xs">
                      <li>• <strong>Diagnosis:</strong> Generalized Epilepsy (8 years)</li>
                      <li>• <strong>Medication:</strong> Phenytoin 100 mg PO TID</li>
                      <li className="text-red-600">• <strong>Non-compliance:</strong> No medication × 3 days</li>
                      <li>• <strong>Last Seizure:</strong> 6 months ago (well-controlled)</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2 rounded text-xs">
                      <div className="text-gray-600">BP</div>
                      <div className="font-mono font-medium">140/90</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-xs">
                      <div className="text-gray-600">HR</div>
                      <div className="font-mono font-medium">122</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-xs">
                      <div className="text-gray-600">RR</div>
                      <div className="font-mono font-medium">26</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-xs">
                      <div className="text-gray-600">Temp</div>
                      <div className="font-mono font-medium">37.8°C</div>
                    </div>
                    <div className="bg-orange-50 p-2 rounded text-xs border border-orange-200">
                      <div className="text-gray-600">SpO₂</div>
                      <div className="font-mono font-medium text-orange-700">89%</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-xs border border-red-200">
                      <div className="text-gray-600">GCS</div>
                      <div className="font-mono font-medium text-red-700">3</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs">
                    <div className="font-medium mb-1">Physical Exam:</div>
                    <div className="grid md:grid-cols-2 gap-2 text-gray-700">
                      <div>• Generalized tonic-clonic movements</div>
                      <div>• Unresponsive to stimuli</div>
                      <div>• Foam at mouth, tongue bite</div>
                      <div>• Pupils: 3mm, reactive</div>
                      <div>• Increased muscle tone</div>
                      <div>• Babinski: + bilateral</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Scenario */}
            {stage !== "complete" && (
              <Card className="border border-blue-200 bg-blue-50">
                <CardHeader className="border-b border-blue-200">
                  <CardTitle className="text-base text-blue-900">{getStageName()}</CardTitle>
                  <CardDescription className="text-blue-700 text-sm">{getStageDescription()}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-900 mb-3">
                    <strong>سوال:</strong> کدام اقدامات را در این مرحله انجام می‌دهید؟
                  </p>
                  <div className="space-y-2">
                    {getActionsForStage().map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center space-x-2 space-x-reverse flex-1">
                          <Checkbox
                            id={action.id}
                            checked={selectedActions.has(action.id)}
                            onCheckedChange={() => toggleAction(action, getStageName())}
                          />
                          <label htmlFor={action.id} className="flex-1 cursor-pointer text-sm">
                            {action.text}
                          </label>
                        </div>
                        {action.timeCost > 0 && (
                          <Badge variant="outline" className="mr-2 flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {action.timeCost >= 60 ? `${Math.floor(action.timeCost / 60)}m` : `${action.timeCost}s`}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={checkAnswers} variant="outline" className="flex-1" size="sm">
                      Check Answers
                    </Button>
                    <Button onClick={proceedToNextStage} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                      Next Stage →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Results */}
            {actionResults.length > 0 && (
              <Card className="border border-green-200">
                <CardHeader className="border-b border-green-100 bg-green-50">
                  <CardTitle className="text-base text-green-900">Action Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {actionResults.slice(-5).reverse().map((result, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-xs text-gray-500">T+{Math.floor(result.time / 60)}:{(result.time % 60).toString().padStart(2, '0')}</div>
                        </div>
                        <div className="text-xs font-medium text-gray-700 mb-1">{result.action}</div>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{result.result}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback */}
            {(feedback.correct.length > 0 || feedback.incorrect.length > 0 || feedback.missing.length > 0) && (
              <Card className="border border-gray-200">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-base">Performance Feedback</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {feedback.correct.length > 0 && (
                      <div>
                        <h4 className="text-sm text-green-700 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Correct Actions ({feedback.correct.length}):
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1 mr-6">
                          {feedback.correct.map((item, idx) => (
                            <div key={idx}>✓ {getActionsForStage().find(a => a.id === item)?.text}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {feedback.incorrect.length > 0 && (
                      <div>
                        <h4 className="text-sm text-red-700 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Incorrect Actions ({feedback.incorrect.length}):
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1 mr-6">
                          {feedback.incorrect.map((item, idx) => (
                            <div key={idx}>✗ {getActionsForStage().find(a => a.id === item)?.text}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {feedback.missing.length > 0 && (
                      <div>
                        <h4 className="text-sm text-orange-700 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Missed Actions ({feedback.missing.length}):
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1 mr-6">
                          {feedback.missing.map((item, idx) => (
                            <div key={idx}>! {getActionsForStage().find(a => a.id === item)?.text}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Case Complete */}
            {stage === "complete" && (
              <Card className="border-2 border-green-300 bg-green-50">
                <CardHeader className="border-b border-green-200">
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <CheckCircle2 className="w-5 h-5" />
                    Case Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded border border-green-200">
                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</div>
                          <div className="text-xs text-gray-600">Total Time</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                          <div className="text-xs text-gray-600">Actions Taken</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {elapsedTime <= 1200 ? "Excellent" : elapsedTime <= 1800 ? "Good" : "Fair"}
                          </div>
                          <div className="text-xs text-gray-600">Performance</div>
                        </div>
                      </div>
                      
                      {elapsedTime <= 1200 && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800 text-sm">
                            ✓ عالی! مدیریت زمانی شما در محدوده ایده‌آل بود (&lt;20 دقیقه).
                          </AlertDescription>
                        </Alert>
                      )}
                      {elapsedTime > 1200 && elapsedTime <= 1800 && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <Info className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800 text-sm">
                            زمان نسبتاً خوب بود. سعی کنید تصمیمات را سریع‌تر بگیرید.
                          </AlertDescription>
                        </Alert>
                      )}
                      {elapsedTime > 1800 && (
                        <Alert className="bg-red-50 border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800 text-sm">
                            زمان طولانی بود (&gt;30 min). در موارد واقعی این می‌تواند منجر به آسیب دائمی شود.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded border border-gray-200 text-sm">
                      <h4 className="font-medium mb-2 text-gray-900">Key Learning Points:</h4>
                      <ul className="space-y-1 mr-4 text-gray-700 text-xs">
                        <li>• Status Epilepticus تعریف: تشنج &gt;5 min یا ≥2 حمله بدون بازگشت هوشیاری</li>
                        <li>• First-line: Benzodiazepines (Lorazepam 4mg یا Diazepam 10mg IV)</li>
                        <li>• Second-line: Phenytoin/Fosphenytoin, Valproate, Levetiracetam</li>
                        <li>• همیشه BS check کنید - Hypoglycemia شایع‌ترین علت قابل درمان</li>
                        <li>• Flumazenil در SE مطلقاً Contraindicated است</li>
                        <li>• اینتوباسیون فقط در Airway compromise یا Refractory SE</li>
                        <li>• Golden Time: کنترل در 30-60 دقیقه اول برای جلوگیری از آسیب دائمی</li>
                      </ul>
                    </div>

                    <Link to="/">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Return to Home</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Orders */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4" />
                  Order Sheet
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono border border-gray-200">
                    <div className="space-y-0.5 text-gray-700">
                      <div><strong>Diagnosis:</strong> Status Epilepticus</div>
                      <div><strong>Condition:</strong> Critical</div>
                      <div><strong>Position:</strong> Supine, HOB 30°</div>
                      <div><strong>Diet:</strong> NPO</div>
                    </div>
                  </div>

                  <Separator />

                  {orders.length === 0 ? (
                    <div className="text-center text-gray-400 py-6 text-xs">
                      No orders placed yet
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {orders.map((order, index) => (
                        <div key={order.id} className="bg-gray-50 p-2.5 rounded text-xs border border-gray-200">
                          <div className="flex items-start justify-between mb-1">
                            <div className="text-gray-500">{order.stage}</div>
                            {order.timeCost > 0 && (
                              <Badge variant="secondary" className="text-xs py-0">
                                {order.timeCost >= 60 ? `${Math.floor(order.timeCost / 60)}m` : `${order.timeCost}s`}
                              </Badge>
                            )}
                          </div>
                          <div className="font-mono text-gray-900">{index + 1}. {order.text}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {orders.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <strong>Total Orders:</strong>
                          <span>{orders.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <strong>Time Spent:</strong>
                          <span>{Math.floor(orders.reduce((sum, o) => sum + o.timeCost, 0) / 60)} min</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
