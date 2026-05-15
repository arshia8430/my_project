import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { ArrowRight, Activity, AlertCircle, CheckCircle2, Info, Clock } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Timer } from "../components/Timer";

type Stage = "admission" | "labs" | "treatment" | "followup" | "complete";

export default function PneumoniaCase() {
  const [stage, setStage] = useState<Stage>("admission");
  const [admissionDecision, setAdmissionDecision] = useState<string>("");
  const [selectedLabs, setSelectedLabs] = useState<Set<string>>(new Set());
  const [selectedAntibiotics, setSelectedAntibiotics] = useState<Set<string>>(new Set());
  const [treatmentDuration, setTreatmentDuration] = useState<string>("");
  const [followupPlan, setFollowupPlan] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState(0);

  const toggleLab = (labId: string, timeCost: number = 0) => {
    const newSelected = new Set(selectedLabs);
    if (newSelected.has(labId)) {
      newSelected.delete(labId);
      setElapsedTime(prev => Math.max(0, prev - timeCost));
    } else {
      newSelected.add(labId);
      setElapsedTime(prev => prev + timeCost);
    }
    setSelectedLabs(newSelected);
  };

  const toggleAntibiotic = (antibioticId: string, timeCost: number = 0) => {
    const newSelected = new Set(selectedAntibiotics);
    if (newSelected.has(antibioticId)) {
      newSelected.delete(antibioticId);
      setElapsedTime(prev => Math.max(0, prev - timeCost));
    } else {
      newSelected.add(antibioticId);
      setElapsedTime(prev => prev + timeCost);
    }
    setSelectedAntibiotics(newSelected);
  };

  const checkAdmission = () => {
    if (admissionDecision === "no-admission") {
      setFeedback("✓ صحیح! CURB-65 Score = 0. بیمار کاندید درمان سرپایی است (ACC/ATS Guidelines).");
      setElapsedTime(prev => prev + 60);
    } else if (admissionDecision === "ward") {
      setFeedback("! این بیمار معیارهای بستری ندارد. CURB-65 = 0, Age <65, Stable vitals.");
      setElapsedTime(prev => prev + 60);
    } else if (admissionDecision === "icu") {
      setFeedback("✗ هیچ معیار ICU admission وجود ندارد. Major criteria: Mechanical ventilation, Septic shock.");
      setElapsedTime(prev => prev + 60);
    }
  };

  const checkLabs = () => {
    const hasEssential = selectedLabs.has("pa-cxr") && selectedLabs.has("cbc");
    const hasUnnecessary = selectedLabs.has("ct-chest") || selectedLabs.has("blood-culture") || selectedLabs.has("abg");
    
    if (hasEssential && !hasUnnecessary) {
      setFeedback("✓ عالی! CXR و CBC در outpatient CAP کافی است.");
    } else if (hasUnnecessary) {
      setFeedback("! CT/Blood Culture/ABG در low-risk outpatient معمولاً لازم نیست.");
    } else {
      setFeedback("✗ حداقل CXR و CBC را انتخاب کنید.");
    }
  };

  const checkTreatment = () => {
    const hasCorrectAntib = selectedAntibiotics.has("azithromycin") || selectedAntibiotics.has("doxycycline") || selectedAntibiotics.has("levofloxacin");
    const hasCorrectDuration = treatmentDuration === "5-days";
    
    if (hasCorrectAntib && hasCorrectDuration) {
      if (selectedAntibiotics.has("azithromycin") && treatmentDuration === "5-days") {
        setFeedback("✓ بسیار عالی! Azithromycin 500mg × 5 days یکی از بهترین گزینه‌ها برای outpatient CAP.");
      } else {
        setFeedback("✓ انتخاب مناسبی است.");
      }
    } else if (!hasCorrectAntib) {
      setFeedback("! یک ماکرولید یا فلوروکینولون انتخاب کنید.");
    } else if (!hasCorrectDuration) {
      setFeedback("! مدت درمان ۵-۷ روز توصیه می‌شود.");
    }
  };

  const checkFollowup = () => {
    if (followupPlan === "3-days-no-cxr") {
      setFeedback("✓ صحیح! Follow-up در 48-72 ساعت برای ارزیابی پاسخ کلینیکی. CXR لازم نیست مگر بدتر شود.");
      setElapsedTime(prev => prev + 30);
    } else if (followupPlan === "3-days-cxr") {
      setFeedback("! CXR در این مرحله لازم نیست. فقط Clinical response کافی است.");
      setElapsedTime(prev => prev + 30);
    } else {
      setFeedback("! Follow-up زود‌هنگام (48-72h) برای اطمینان از پاسخ به درمان ضروری است.");
      setElapsedTime(prev => prev + 30);
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
                <div className="text-xs text-gray-500">Case ID: CAP-003</div>
                <div className="text-sm font-medium text-gray-900">Community-Acquired Pneumonia</div>
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
              {stage === "admission" ? "1" : stage === "labs" ? "2" : stage === "treatment" ? "3" : stage === "followup" ? "4" : "5"} / 5
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={stage === "admission" ? "default" : "outline"} className={stage === "admission" ? "bg-blue-600" : ""}>Admit</Badge>
            <div className={`h-1 flex-1 rounded ${stage !== "admission" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "labs" ? "default" : "outline"} className={stage === "labs" ? "bg-blue-600" : ""}>Labs</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "treatment" || stage === "followup" || stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "treatment" ? "default" : "outline"} className={stage === "treatment" ? "bg-blue-600" : ""}>Rx</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "followup" || stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "followup" ? "default" : "outline"} className={stage === "followup" ? "bg-blue-600" : ""}>F/U</Badge>
            <div className={`h-1 flex-1 rounded ${stage === "complete" ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <Badge variant={stage === "complete" ? "default" : "outline"} className={stage === "complete" ? "bg-green-600" : ""}>Done</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Patient Information</CardTitle>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Outpatient</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">Age/Sex</div>
                  <div className="text-sm font-medium">34 / M</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">PMH</div>
                  <div className="text-sm font-medium">None</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">Smoking</div>
                  <div className="text-sm font-medium">No</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-500">Meds</div>
                  <div className="text-sm font-medium">None</div>
                </div>
              </div>

              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-sm">Chief Complaint</AlertTitle>
                <AlertDescription className="text-xs">
                  Productive cough, dyspnea, fever (39°C), myalgia, headache × 4 days. No antibiotics in past 3 months.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 p-2 rounded text-xs border border-blue-200">
                  <div className="text-gray-600">HR</div>
                  <div className="font-mono font-medium">93/min</div>
                </div>
                <div className="bg-blue-50 p-2 rounded text-xs border border-blue-200">
                  <div className="text-gray-600">RR</div>
                  <div className="font-mono font-medium">26/min</div>
                </div>
                <div className="bg-blue-50 p-2 rounded text-xs border border-blue-200">
                  <div className="text-gray-600">BP</div>
                  <div className="font-mono font-medium">100/72</div>
                </div>
                <div className="bg-blue-50 p-2 rounded text-xs border border-blue-200">
                  <div className="text-gray-600">SpO₂</div>
                  <div className="font-mono font-medium">95%</div>
                </div>
                <div className="bg-orange-50 p-2 rounded text-xs border border-orange-200">
                  <div className="text-gray-600">Temp</div>
                  <div className="font-mono font-medium text-orange-700">39°C</div>
                </div>
                <div className="bg-green-50 p-2 rounded text-xs border border-green-200">
                  <div className="text-gray-600">Mental</div>
                  <div className="font-mono font-medium">Alert</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs">
                <div className="font-medium mb-1">Physical Exam:</div>
                <div className="grid md:grid-cols-2 gap-2 text-gray-700">
                  <div>• Chest: Inspiratory crackles RLL</div>
                  <div>• Chest: Rhonchi present</div>
                  <div>• Percussion: Dull over RLL</div>
                  <div>• Tactile fremitus: ↑ RLL</div>
                  <div>• General: No distress</div>
                  <div>• Cardiovascular: RRR</div>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                <div className="font-medium mb-1">CURB-65 Score Calculation:</div>
                <div className="grid grid-cols-2 gap-1 text-gray-700">
                  <div>• <strong>C</strong>onfusion: No (0)</div>
                  <div>• <strong>U</strong>rea &gt;7 mmol/L: Unknown</div>
                  <div>• <strong>R</strong>R ≥30: No (26) (0)</div>
                  <div>• <strong>B</strong>P &lt;90 or ≤60: No (0)</div>
                  <div>• Age ≥<strong>65</strong>: No (34) (0)</div>
                  <div className="col-span-2"><strong>Total: 0</strong> (Low risk)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage 1: Admission Decision */}
          {stage === "admission" && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="text-base text-blue-900">Decision Point: Hospitalization</CardTitle>
                <CardDescription className="text-blue-700 text-sm">
                  آیا این بیمار نیاز به بستری دارد؟
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <RadioGroup value={admissionDecision} onValueChange={setAdmissionDecision}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                      <RadioGroupItem value="icu" id="icu" />
                      <Label htmlFor="icu" className="flex-1 cursor-pointer text-sm">
                        Yes, admit to ICU
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                      <RadioGroupItem value="ward" id="ward" />
                      <Label htmlFor="ward" className="flex-1 cursor-pointer text-sm">
                        Yes, admit to general ward
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                      <RadioGroupItem value="no-admission" id="no-admission" />
                      <Label htmlFor="no-admission" className="flex-1 cursor-pointer text-sm">
                        No, outpatient treatment
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
                <div className="flex gap-3 mt-4">
                  <Button onClick={checkAdmission} variant="outline" className="flex-1" size="sm">
                    Check Answer
                  </Button>
                  <Button onClick={() => setStage("labs")} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
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

          {/* Stage 2: Labs */}
          {stage === "labs" && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="text-base text-blue-900">Diagnostic Workup</CardTitle>
                <CardDescription className="text-blue-700 text-sm">
                  کدام تست‌ها را برای این بیمار سرپایی درخواست می‌دهید؟
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {[
                    { id: "pa-cxr", text: "Chest X-Ray (PA view)", time: 300 },
                    { id: "lateral-cxr", text: "Chest X-Ray (Lateral view)", time: 180 },
                    { id: "ct-chest", text: "CT Chest", time: 900 },
                    { id: "cbc", text: "Complete Blood Count", time: 15 },
                    { id: "bun-cr", text: "BUN, Creatinine", time: 15 },
                    { id: "blood-culture", text: "Blood Culture × 2", time: 30 },
                    { id: "sputum-culture", text: "Sputum Culture", time: 60 },
                    { id: "covid-pcr", text: "SARS-CoV-2 PCR", time: 30 },
                    { id: "influenza-pcr", text: "Influenza PCR", time: 30 },
                    { id: "abg", text: "Arterial Blood Gas", time: 45 }
                  ].map((lab) => (
                    <div key={lab.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center space-x-2 space-x-reverse flex-1">
                        <Checkbox
                          id={lab.id}
                          checked={selectedLabs.has(lab.id)}
                          onCheckedChange={() => toggleLab(lab.id, lab.time)}
                        />
                        <label htmlFor={lab.id} className="flex-1 cursor-pointer text-sm">
                          {lab.text}
                        </label>
                      </div>
                      <Badge variant="outline" className="mr-2 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {lab.time >= 60 ? `${Math.floor(lab.time/60)}m` : `${lab.time}s`}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={checkLabs} variant="outline" className="flex-1" size="sm">
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

          {/* Stage 3: Treatment */}
          {stage === "treatment" && (
            <div className="space-y-6">
              <Card className="border border-green-200">
                <CardHeader className="border-b border-green-100 bg-green-50">
                  <CardTitle className="text-base text-green-900">Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 text-sm">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <strong>CXR:</strong> Right lower lobe infiltrate, no effusion
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <strong>CBC:</strong> WBC 14.2, Neutrophils 82%, Hb 14.1, Plt 285
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-200 bg-blue-50">
                <CardHeader className="border-b border-blue-200">
                  <CardTitle className="text-base text-blue-900">Antibiotic Selection</CardTitle>
                  <CardDescription className="text-blue-700 text-sm">
                    کدام آنتی‌بیوتیک و به مدت چند روز؟
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm mb-2 font-medium">Antibiotic:</h4>
                      <div className="space-y-2">
                        {[
                          { id: "amoxicillin", text: "Amoxicillin 500mg PO TID", time: 30 },
                          { id: "doxycycline", text: "Doxycycline 100mg PO BID", time: 30 },
                          { id: "azithromycin", text: "Azithromycin 500mg PO daily", time: 30 },
                          { id: "levofloxacin", text: "Levofloxacin 750mg PO daily", time: 30 }
                        ].map((ab) => (
                          <div key={ab.id} className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                            <Checkbox
                              id={ab.id}
                              checked={selectedAntibiotics.has(ab.id)}
                              onCheckedChange={() => toggleAntibiotic(ab.id, ab.time)}
                            />
                            <label htmlFor={ab.id} className="flex-1 cursor-pointer text-sm">
                              {ab.text}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm mb-2 font-medium">Duration:</h4>
                      <RadioGroup value={treatmentDuration} onValueChange={(v) => { setTreatmentDuration(v); setElapsedTime(prev => prev + 30); }}>
                        <div className="space-y-2">
                          {[
                            { id: "3-days", text: "3 days" },
                            { id: "5-days", text: "5 days" },
                            { id: "7-days", text: "7 days" },
                            { id: "10-days", text: "10 days" }
                          ].map((dur) => (
                            <div key={dur.id} className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                              <RadioGroupItem value={dur.id} id={dur.id} />
                              <Label htmlFor={dur.id} className="flex-1 cursor-pointer text-sm">
                                {dur.text}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={checkTreatment} variant="outline" className="flex-1" size="sm">
                      Check Answer
                    </Button>
                    <Button onClick={() => setStage("followup")} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                      Plan Follow-up →
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

          {/* Stage 4: Follow-up */}
          {stage === "followup" && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="text-base text-blue-900">Follow-up Plan</CardTitle>
                <CardDescription className="text-blue-700 text-sm">
                  بیمار را چه زمانی دوباره ویزیت می‌کنید؟
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <RadioGroup value={followupPlan} onValueChange={setFollowupPlan}>
                  <div className="space-y-2">
                    {[
                      { id: "3-days-no-cxr", text: "48-72 hours, clinical assessment only" },
                      { id: "3-days-cxr", text: "48-72 hours with repeat CXR" },
                      { id: "after-treatment-cxr", text: "After treatment completion with CXR" },
                      { id: "6-weeks-cxr", text: "6 weeks with CXR (if indicated)" }
                    ].map((plan) => (
                      <div key={plan.id} className="flex items-center space-x-2 space-x-reverse p-3 bg-white hover:bg-gray-50 rounded border border-gray-200">
                        <RadioGroupItem value={plan.id} id={plan.id} />
                        <Label htmlFor={plan.id} className="flex-1 cursor-pointer text-sm">
                          {plan.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <div className="flex gap-3 mt-4">
                  <Button onClick={checkFollowup} variant="outline" className="flex-1" size="sm">
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
          )}

          {/* Stage 5: Complete */}
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
                      <li>• <strong>CURB-65:</strong> 0-1 = outpatient, 2 = consider admit, ≥3 = ICU</li>
                      <li>• <strong>Outpatient CAP:</strong> CXR + CBC کافی است</li>
                      <li>• <strong>First-line:</strong> Macrolide (Azithromycin) یا Doxycycline</li>
                      <li>• <strong>Alternative:</strong> Respiratory Fluoroquinolone (Levofloxacin, Moxifloxacin)</li>
                      <li>• <strong>Duration:</strong> معمولاً ۵-۷ روز (minimum 5 days)</li>
                      <li>• <strong>Follow-up:</strong> 48-72h برای clinical response، CXR در 4-6 weeks اگر risk factors</li>
                      <li>• <strong>Red Flags:</strong> Worsening symptoms, hemoptysis, persistent fever &gt;72h</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded border border-blue-200 text-xs">
                    <h4 className="font-medium mb-2">PSI/PORT Score vs CURB-65:</h4>
                    <p className="text-gray-700">
                      PSI (Pneumonia Severity Index) پیچیده‌تر و دقیق‌تر، CURB-65 ساده‌تر و کاربردی‌تر.
                      در practice معمولاً CURB-65 استفاده می‌شود.
                    </p>
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
