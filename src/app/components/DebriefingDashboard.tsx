import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Target, TrendingUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export interface PerformanceMetrics {
  diagnosisAccuracy: number;
  resourceStewardship: number;
  timeManagement: number;
  professionalism: number;
}

export interface JourneyStep {
  id: string;
  time: number;
  action: string;
  isCorrect: boolean;
  isCritical?: boolean;
}

export interface LearningPearl {
  topic: string;
  content: string;
  guideline?: string;
}

interface DebriefingDashboardProps {
  metrics: PerformanceMetrics;
  journey: JourneyStep[];
  learningPearls: LearningPearl[];
  totalTime: number;
  correctActions: number;
  totalActions: number;
}

export function DebriefingDashboard({
  metrics,
  journey,
  learningPearls,
  totalTime,
  correctActions,
  totalActions,
}: DebriefingDashboardProps) {
  const radarData = [
    { id: "diagnosis", subject: "Diagnosis", value: metrics.diagnosisAccuracy, fullMark: 100 },
    { id: "resource", subject: "Resources", value: metrics.resourceStewardship, fullMark: 100 },
    { id: "time", subject: "Time Mgmt", value: metrics.timeManagement, fullMark: 100 },
    { id: "communication", subject: "Communication", value: metrics.professionalism, fullMark: 100 },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOverallGrade = () => {
    const avg = (metrics.diagnosisAccuracy + metrics.resourceStewardship + metrics.timeManagement + metrics.professionalism) / 4;
    if (avg >= 90) return { grade: "Excellent", color: "text-emerald-600", bgColor: "bg-emerald-50" };
    if (avg >= 80) return { grade: "Good", color: "text-blue-600", bgColor: "bg-blue-50" };
    if (avg >= 70) return { grade: "Satisfactory", color: "text-amber-600", bgColor: "bg-amber-50" };
    return { grade: "Needs Improvement", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const overall = getOverallGrade();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-emerald-300 bg-emerald-50/30 shadow-lg">
        <CardHeader className="border-b border-emerald-200 bg-emerald-100/50">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <Target className="w-5 h-5" />
            Post-Encounter Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-lg border-2 border-slate-300 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Total Time</div>
                    <div className="text-2xl font-mono font-bold text-slate-900">
                      {formatTime(totalTime)}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Actions Taken</div>
                    <div className="text-2xl font-mono font-bold text-slate-900">
                      {totalActions}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Accuracy Rate</div>
                    <div className="text-2xl font-mono font-bold text-slate-900">
                      {totalActions > 0 ? Math.round((correctActions / totalActions) * 100) : 0}%
                    </div>
                  </div>
                  <div className={`${overall.bgColor} p-3 rounded border-2 border-current ${overall.color}`}>
                    <div className="text-xs mb-1 font-medium">Overall Grade</div>
                    <div className="text-xl font-bold">
                      {overall.grade}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border-2 border-slate-300 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">OSCE Competency Assessment</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid key="polar-grid" stroke="#cbd5e1" />
                    <PolarAngleAxis key="polar-angle" dataKey="subject" tick={{ fill: "#475569", fontSize: 11 }} />
                    <PolarRadiusAxis key="polar-radius" angle={90} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Radar
                      key="radar-performance"
                      name="Performance"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg border-2 border-slate-300 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Clinical Decision Journey Map
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {journey.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.isCorrect
                              ? "bg-emerald-100 border-2 border-emerald-500"
                              : "bg-red-100 border-2 border-red-500"
                          }`}
                        >
                          {step.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-700" />
                          )}
                        </div>
                        {idx < journey.length - 1 && (
                          <div className={`w-0.5 h-12 ${step.isCorrect ? "bg-emerald-300" : "bg-red-300"}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-slate-600">
                            T+{formatTime(step.time)}
                          </span>
                          {step.isCritical && (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          )}
                        </div>
                        <div className="text-sm text-slate-900">{step.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-300">
        <CardHeader className="border-b border-slate-200 bg-slate-50">
          <CardTitle className="text-base text-slate-800">Evidence-Based Learning Pearls</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Accordion type="single" collapsible className="w-full">
            {learningPearls.map((pearl, idx) => (
              <AccordionItem key={`pearl-${idx}-${pearl.topic.replace(/\s+/g, '-')}`} value={`item-${idx}`}>
                <AccordionTrigger className="text-sm font-medium text-slate-900 hover:text-blue-600">
                  {pearl.topic}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                      {pearl.content}
                    </p>
                    {pearl.guideline && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
                        <strong>Guideline Reference:</strong> {pearl.guideline}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
