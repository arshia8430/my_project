import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { ArrowRight, Heart, AlertCircle, CheckCircle2, Info, Clock } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Timer } from "../components/Timer";

type Stage = "initial" | "monitoring" | "labs" | "treatment" | "complete";

export default function HypertensionCase() {
  const [stage, setStage] = useState<Stage>("initial");
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [selectedTreatment, setSelectedTreatment] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fixed patient data
  const patientData = {
    age: 52,
    gender: "مرد",
    bp: "156/92",
    bpSystolic: 156,
    bpDiastolic: 92,
    weight: 82,
    height: 172,
    bmi: 27.7,
    history: [
      "سابقه MI (Anterior Wall STEMI) ۵ سال قبل - PCI with DES to LAD",
      "Diabetes Mellitus Type 2 - dx 8 years ago (HbA1c: 7.2%)",
      "Dyslipidemia on Statin therapy",
      "سیگاری فعال (20 pack-years)"
    ],
    medications: ["ASA 80 mg OD", "Atorvastatin 40 mg OD", "Metformin 1000 mg BD", "Glim epride 2 mg OD"]
  };

  const toggleAction = (actionId: string, timeCost: number = 0) => {
    const newSelected = new Set(selectedActions);
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId);
      setElapsedTime(prev => Math.max(0, prev - timeCost));
    } else {
      newSelected.add(actionId);
      setElapsedTime(prev => prev + timeCost);
    }
    setSelectedActions(newSelected);
  };

  const toggleTest = (testId: string, timeCost: number = 0) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
      setElapsedTime(prev => Math.max(0, prev - timeCost));
    } else {
      newSelected.add(testId);
      setElapsedTime(prev => prev + timeCost);
    }
    setSelectedTests(newSelected);
  };

  const checkInitialActions = () => {
    const correct = selectedActions.has("abpm") && selectedActions.has("lifestyle") && selectedActions.has("end-organ");
    const incorrect = selectedActions.has("losartan") || selectedActions.has("valsartan") || selectedActions.has("amlodipine-losartan");
    
    if (correct && !incorrect) {
      setFeedback("✓ عالی! رویکرد شما مطابق با Guidelines است. تشخیص HTN نیاز به تایید با ABPM یا HBPM دارد.");
    } else if (incorrect) {
      setFeedback("✗ شروع فوری دارو در ویزیت اول بدون تایید تشخیص توصیه نمی‌شود (مگر Stage 2 HTN با عوارض).");
    } else {
      setFeedback("! برخی اقدامات کلیدی را فراموش کرده‌اید.");
    }
  };

  const checkTests = () => {
    const requiredTests = new Set(["electrolytes", "cbc", "ecg", "tsh", "lipid", "acvd", "uacr"]);
    const incorrectTests = new Set(["renal-us", "renal-artery-us", "echo"]);
    
    const hasAllRequired = Array.from(requiredTests).every(test => selectedTests.has(test));
    const hasIncorrect = Array.from(incorrectTests).some(test => selectedTests.has(test));
    
    if (hasAllRequired && !hasIncorrect) {
      setFeedback("✓ پنل آزمایشی شما کامل است. این آزمایشات برای ارزیابی Secondary HTN و End-organ damage کافی هستند.");
    } else if (hasIncorrect) {
      setFeedback("! برخی تست‌ها (USG, Echo) بدون اندیکاسیون خاص در Initial workup توصیه نمی‌شوند.");
    } else {
      setFeedback("✗ برخی آزمایشات ضروری را انتخاب نکرده‌اید.");
    }
  };

  const checkTreatment = () => {
    if (selectedTreatment === "lifestyle-ace") {
      setFeedback("✓ بسیار عالی! ACE-I/ARB در بیماران با سابقه CAD و DM خط اول درمان است (ACC/AHA 2017).");
      setElapsedTime(prev => prev + 120);
    } else if (selectedTreatment === "lifestyle-ccb") {
      setFeedback("✓ قابل قبول. CCB نیز در این بیمار مناسب است، اما ACE-I به دلیل Cardio-renal protection اولویت دارد.");
      setElapsedTime(prev => prev + 120);
    } else if (selectedTreatment === "lifestyle-only") {
      setFeedback("✗ با BP 156/92، سابقه CAD و DM، شروع دارو الزامی است (Risk-based approach).");
    } else if (selectedTreatment === "losartan-hctz") {
      setFeedback("! ترکیب در خط اول توصیه نمی‌شود. ابتدا با Monotherapy شروع کنید.");
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
                <div className="text-xs text-gray-500">Case ID: HTN-002</div>
                <div className="text-sm font-medium text-gray-900">Hypertension Management</div>
              </div>
              <Timer elapsedTime={elapsedTime} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Progress */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Case Progress</h3>
            <span className="text-xs text-gray-500">
              {stage === "initial" ? "1" : stage === "monitoring" ? "2" : stage === "labs" ? "3" : stage === "treatment" ? "4" : "5"} / 5
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={stage === "initial" ? "default" : "outline"} className={stage === "initial" ? "bg-blue-600" : ""}>Visit 1</Badge>
            <div className={`h-1 flex-1 rounded ${stage !== "initial" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "monitoring" ? "default" : "outline"} className={stage === "monitoring" ? "bg-blue-600" : ""}>ABPM</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "labs" || stage === "treatment" || stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "labs" ? "default" : "outline"} className={stage === "labs" ? "bg-blue-600" : ""}>Labs</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "treatment" || stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "treatment" ? "default" : "outline"} className={stage === "treatment" ? "bg-blue-600" : ""}>Treatment</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "complete" ? "default" : "outline"} className={stage === "complete" ? "bg-green-600" : ""}>Complete</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Patient Information</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Outpatient</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">Age/Sex</div>
                  <div className="text-sm font-medium">{patientData.age} / {patientData.gender}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">Weight/Height</div>
                  <div className="text-sm font-medium">{patientData.weight}kg / {patientData.height}cm</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">BMI</div>
                  <div className="text-sm font-medium">{patientData.bmi}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                  <div className="text-xs text-gray-500">BP (Office)</div>
                  <div className="text-sm font-medium text-orange-700">{patientData.bp}</div>
                </div>
              </div>

              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-sm">Chief Complaint</AlertTitle>
                <AlertDescription className="text-xs">
                  بیمار برای چک‌آپ روتین مراجعه کرده. فشار خون در ویزیت امروز {patientData.bp} اندازه‌گیری شد.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-900 mb-1">Medical History:</div>
                  <ul className="text-gray-700 space-y-1 mr-4 text-xs">
                    {patientData.history.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <div className="font-medium text-gray-900 mb-1">Current Medications:</div>
                  <ul className="text-gray-700 space-y-1 mr-4 text-xs">
                    {patientData.medications.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                  <div className="font-medium mb-1">Physical Exam:</div>
                  <div className="grid md:grid-cols-2 gap-2 text-gray-700">
                    <div>• General: Alert, no distress</div>
                    <div>• Cardiovascular: RRR, no murmurs</div>
                    <div>• Lungs: Clear bilaterally</div>
                    <div>• Extremities: No edema</div>
                    <div>• Neuro: Grossly intact</div>
                    <div>• Fundoscopy: Grade I changes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage-specific content */}
          {stage === "initial" && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="text-base text-blue-900">Visit 1: Initial Assessment</CardTitle>
                <CardDescription className="text-blue-700 text-sm">
                  فشار خون {patientData.bp} در ویزیت امروز - اقدام بعدی چیست؟
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {[
                    { id: "losartan", text: "شروع فوری Losartan 50 mg OD", time: 60 },
                    { id: "valsartan", text: "شروع فوری Valsartan 80 mg OD", time: 60 },
                    { id: "amlodipine-losartan", text: "شروع فوری ترکیب Amlodipine 5mg + Losartan 50mg", time: 60 },
                    { id: "abpm", text: "ABPM / Home BP Monitoring (2 weeks, 2x/day)", time: 30 },
                    { id: "lifestyle", text: "Lifestyle Modifications Counseling (DASH diet, Exercise, Salt <2g/day)", time: 45 },
                    { id: "end-organ", text: "End-Organ Damage Assessment (Labs + ECG)", time: 15 }
                  ].map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center space-x-2 space-x-reverse flex-1">
                        <Checkbox
                          id={action.id}
                          checked={selectedActions.has(action.id)}
                          onCheckedChange={() => toggleAction(action.id, action.time)}
                        />
                        <label htmlFor={action.id} className="flex-1 cursor-pointer text-sm">
                          {action.text}
                        </label>
                      </div>
                      <Badge variant="outline" className="mr-2 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {action.time}s
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={checkInitialActions} variant="outline" className="flex-1" size="sm">
                    Check Answers
                  </Button>
                  <Button onClick={() => setStage("monitoring")} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                    Next Stage →
                  </Button>
                </div>
                {feedback && (
                  <Alert className="mt-4">
                    <AlertDescription className="text-sm">{feedback}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {stage === "monitoring" && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="text-base text-blue-900">2 Weeks Later: ABPM Results</CardTitle>
                <CardDescription className="text-blue-700 text-sm">
                  میانگین ABPM: 145/88 mmHg (Daytime: 148/90, Nighttime: 138/82)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    تشخیص: <strong>Stage 1 Hypertension</strong> (BP 130-139/80-89)<br />
                    با توجه به سابقه CAD و DM، بیمار در گروه High cardiovascular risk قرار دارد.
                  </AlertDescription>
                </Alert>
                <Button onClick={() => setStage("labs")} className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                  Order Labs →
                </Button>
              </CardContent>
            </Card>
          )}

          {stage === "labs" && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="text-base text-blue-900">Laboratory Workup</CardTitle>
                <CardDescription className="text-blue-700 text-sm">
                  کدام آزمایشات را درخواست می‌دهید؟
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {[
                    { id: "electrolytes", text: "Na, K, Ca, Mg", time: 15 },
                    { id: "cbc", text: "Complete Blood Count", time: 15 },
                    { id: "creatinine", text: "Creatinine, eGFR", time: 15 },
                    { id: "ecg", text: "ECG 12-Lead", time: 45 },
                    { id: "tsh", text: "TSH, Free T4", time: 15 },
                    { id: "lipid", text: "Lipid Profile (LDL, HDL, TG)", time: 15 },
                    { id: "acvd", text: "Calculate ASCVD Risk Score", time: 30 },
                    { id: "uacr", text: "Urine Albumin/Creatinine Ratio", time: 15 },
                    { id: "renal-us", text: "Renal Ultrasound", time: 300 },
                    { id: "renal-artery-us", text: "Renal Artery Doppler", time: 420 },
                    { id: "echo", text: "Echocardiography", time: 600 }
                  ].map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center space-x-2 space-x-reverse flex-1">
                        <Checkbox
                          id={test.id}
                          checked={selectedTests.has(test.id)}
                          onCheckedChange={() => toggleTest(test.id, test.time)}
                        />
                        <label htmlFor={test.id} className="flex-1 cursor-pointer text-sm">
                          {test.text}
                        </label>
                      </div>
                      <Badge variant="outline" className="mr-2 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {test.time >= 60 ? `${Math.floor(test.time/60)}m` : `${test.time}s`}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={checkTests} variant="outline" className="flex-1" size="sm">
                    Check Answers
                  </Button>
                  <Button onClick={() => setStage("treatment")} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                    Review Results →
                  </Button>
                </div>
                {feedback && (
                  <Alert className="mt-4">
                    <AlertDescription className="text-sm">{feedback}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {stage === "treatment" && (
            <div className="space-y-6">
              <Card className="border border-green-200">
                <CardHeader className="border-b border-green-100 bg-green-50">
                  <CardTitle className="text-base text-green-900">Laboratory Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-gray-600">Na</div>
                      <div className="font-mono">140 mEq/L</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-gray-600">K</div>
                      <div className="font-mono">4.2 mEq/L</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-gray-600">Cr</div>
                      <div className="font-mono">1.1 mg/dL</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-gray-600">eGFR</div>
                      <div className="font-mono">78 mL/min</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-gray-600">TSH</div>
                      <div className="font-mono">2.4 mIU/L</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-gray-600">LDL</div>
                      <div className="font-mono">95 mg/dL</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-gray-600">UACR</div>
                      <div className="font-mono">28 mg/g</div>
                    </div>
                    <div className="bg-orange-50 p-2 rounded border border-orange-200">
                      <div className="text-gray-600">ASCVD Risk</div>
                      <div className="font-mono text-orange-700">18.5%</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-gray-600">ECG</div>
                      <div className="font-mono">NSR, No LVH</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-200 bg-blue-50">
                <CardHeader className="border-b border-blue-200">
                  <CardTitle className="text-base text-blue-900">Treatment Plan</CardTitle>
                  <CardDescription className="text-blue-700 text-sm">
                    با توجه به نتایج، چه درمانی را شروع می‌کنید؟
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <RadioGroup value={selectedTreatment} onValueChange={setSelectedTreatment}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                        <RadioGroupItem value="lifestyle-only" id="lifestyle-only" />
                        <Label htmlFor="lifestyle-only" className="flex-1 cursor-pointer text-sm">
                          فقط Lifestyle Modifications
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                        <RadioGroupItem value="lifestyle-ace" id="lifestyle-ace" />
                        <Label htmlFor="lifestyle-ace" className="flex-1 cursor-pointer text-sm">
                          Lifestyle + ACE-I (Lisinopril 10mg OD یا Enalapril 5mg BD)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                        <RadioGroupItem value="lifestyle-ccb" id="lifestyle-ccb" />
                        <Label htmlFor="lifestyle-ccb" className="flex-1 cursor-pointer text-sm">
                          Lifestyle + CCB (Amlodipine 5mg OD)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                        <RadioGroupItem value="losartan-hctz" id="losartan-hctz" />
                        <Label htmlFor="losartan-hctz" className="flex-1 cursor-pointer text-sm">
                          Losartan 50mg + Hydrochlorothiazide 12.5mg
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={checkTreatment} variant="outline" className="flex-1" size="sm">
                      Check Answer
                    </Button>
                    <Button onClick={() => setStage("complete")} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                      Complete Case →
                    </Button>
                  </div>
                  {feedback && (
                    <Alert className="mt-4">
                      <AlertDescription className="text-sm">{feedback}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

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
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</div>
                      <div className="text-xs text-gray-600">Total Time</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded border border-gray-200 text-sm">
                    <h4 className="font-medium mb-2 text-gray-900">Key Learning Points:</h4>
                    <ul className="space-y-1 mr-4 text-gray-700 text-xs">
                      <li>• تشخیص HTN: نیاز به تایید با ABPM یا HBPM (≥2 ویزیت)</li>
                      <li>• BP Goal در CAD + DM: &lt;130/80 mmHg (ACC/AHA 2017)</li>
                      <li>• First-line در CAD: ACE-I/ARB (Cardioprotective + Renoprotective)</li>
                      <li>• ASCVD Risk Score برای تصمیم‌گیری درمانی ضروری است</li>
                      <li>• Workup: رد Secondary causes + End-organ damage assessment</li>
                      <li>• Lifestyle: DASH diet, ورزش ≥150 min/week, نمک &lt;2g/day, وزن BMI &lt;25</li>
                      <li>• Follow-up: BP check هر 4 هفته تا کنترل، سپس هر 3-6 ماه</li>
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
      </div>
    </div>
  );
}
