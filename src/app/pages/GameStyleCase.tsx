import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Activity, Lightbulb, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HospitalOrderSheet, HospitalOrder } from "../components/HospitalOrderSheet";
import { PatientDeteriorationAlert } from "../components/PatientDeteriorationAlert";
import { api, CaseData, generateSessionId } from "../../services/api";
import { rtlMixedBlockProps, rtlMixedTextProps } from "../utils/bidi";

interface Vitals {
  hr: number;
  spo2: number;
  bp: string;
  gcs: number;
}

interface AnswerAttempt {
  stage_index: number;
  question: string;
  selected_option: string;
  is_correct: boolean;
  time_spent: number;
}

export default function GameStyleCase() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  // Loading state
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Game state
  const [currentStage, setCurrentStage] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [orders, setOrders] = useState<HospitalOrder[]>([]);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [answersLog, setAnswersLog] = useState<AnswerAttempt[]>([]);
  const [totalWrongAnswers, setTotalWrongAnswers] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Deterioration alert
  const [showDeteriorationAlert, setShowDeteriorationAlert] = useState(false);
  const [deteriorationSeverity, setDeteriorationSeverity] = useState<"warning" | "critical" | "death">("warning");
  const [deteriorationMessage, setDeteriorationMessage] = useState("");

  // Timing
  const gameStartTime = useRef(Date.now());
  const stageStartTime = useRef(Date.now());
  const sessionId = useRef(generateSessionId());

  // Load case from API
  useEffect(() => {
    if (!caseId) return;
    api.getCaseById(caseId)
      .then((data) => {
        setCaseData(data);
        setVitals(data.initial_vitals);
      })
      .catch(() => setLoadError("کیس پیدا نشد. لطفاً دوباره تلاش کنید."));
  }, [caseId]);

  // Reset stage timer on stage change
  useEffect(() => {
    stageStartTime.current = Date.now();
    setShowDeteriorationAlert(false);
  }, [currentStage]);

  // Deterioration timer — only for question stages
  useEffect(() => {
    if (!caseData) return;
    const stage = caseData.stages[currentStage];
    if (stage?.type !== "question") return;

    const interval = setInterval(() => {
      if (showResult || showDeteriorationAlert) return;
      const elapsed = Date.now() - stageStartTime.current;

      if (elapsed > 180000) {
        setDeteriorationSeverity("death");
        setDeteriorationMessage(
          "زمان بیش از حد طولانی شد. بیمار به دلیل تاخیر در تصمیم‌گیری دچار آسیب غیرقابل برگشت شد و فوت کرد."
        );
        setShowDeteriorationAlert(true);
      } else if (elapsed > 120000) {
        setDeteriorationSeverity("critical");
        setDeteriorationMessage(
          "هشدار! وضعیت بیمار به شدت وخیم شده. خطر آسیب دائمی بالا رفته — سریعاً تصمیم بگیرید!"
        );
        setShowDeteriorationAlert(true);
      } else if (elapsed > 60000) {
        setDeteriorationSeverity("warning");
        setDeteriorationMessage(
          "توجه! زمان در حال گذشتن است. هر ثانیه تاخیر می‌تواند به بیمار آسیب بزند."
        );
        setShowDeteriorationAlert(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [caseData, currentStage, showResult, showDeteriorationAlert]);

  const handleOptionSelect = useCallback((optionId: string) => {
    if (showResult) return;
    setSelectedOption(optionId);
  }, [showResult]);

  const handleSubmit = useCallback(() => {
    if (!selectedOption || !caseData) return;
    const stage = caseData.stages[currentStage];
    if (stage.type !== "question" || !stage.options) return;

    const selected = stage.options.find((opt: any) => opt.id === selectedOption);
    const correct = selected?.isCorrect ?? false;
    const timeSpent = Math.floor((Date.now() - stageStartTime.current) / 1000);

    setAnswersLog((prev) => [
      ...prev,
      {
        stage_index: currentStage,
        question: stage.question,
        selected_option: selected?.text ?? selectedOption,
        is_correct: correct,
        time_spent: timeSpent,
      },
    ]);

    if (correct) {
      setIsCorrect(true);
      setShowResult(true);

      if (stage.orderText) {
        setOrders((prev) => [
          ...prev,
          { id: `order-${currentStage}-${Date.now()}`, text: stage.orderText!, isCorrect: true },
        ]);
      }

      // Apply partial vitals update
      if (stage.vitalsUpdate && vitals) {
        setVitals((prev) => prev ? { ...prev, ...stage.vitalsUpdate } : prev);
      }
    } else {
      setIsCorrect(false);
      setShowResult(true);
      setWrongAttempts((prev) => prev + 1);
      setTotalWrongAnswers((prev) => prev + 1);

      if (selected?.text) {
        setOrders((prev) => [
          ...prev,
          { id: `order-${currentStage}-${Date.now()}`, text: selected.text, isCorrect: false },
        ]);
      }
    }
  }, [selectedOption, caseData, currentStage, vitals]);

  const finishCase = useCallback(async (died: boolean) => {
    if (!caseData) return;
    const totalTime = Math.floor((Date.now() - gameStartTime.current) / 1000);
    const questionStages = caseData.stages.filter((s: any) => s.type === "question");
    const correctCount = questionStages.length - totalWrongAnswers;

    // Save result to API (non-blocking — don't let API failure block navigation)
    try {
      await api.saveResult({
        session_id: sessionId.current,
        case_id: caseData.id,
        total_time: totalTime,
        total_questions: questionStages.length,
        correct_answers: Math.max(0, correctCount),
        wrong_answers: totalWrongAnswers,
        died,
        answers_log: answersLog,
        hints_used: hintsUsed,
      });
    } catch {
      // ignore save errors; still navigate to results
    }

    navigate("/final-results", {
      state: {
        totalTime,
        totalWrongAnswers,
        totalQuestions: questionStages.length,
        died,
        caseName: caseData.diagnosis,
        caseCategory: caseData.category,
        sessionId: sessionId.current,
      },
    });
  }, [caseData, totalWrongAnswers, answersLog, hintsUsed, navigate]);

  const handleNext = useCallback(() => {
    if (!caseData || !isCorrect) return;

    // Skip to next non-story stage, or go through stages in order
    const nextStage = currentStage + 1;
    if (nextStage < caseData.stages.length) {
      setCurrentStage(nextStage);
      setSelectedOption(null);
      setShowResult(false);
      setIsCorrect(false);
      setShowHint(false);
      setWrongAttempts(0);
    } else {
      finishCase(false);
    }
  }, [caseData, isCorrect, currentStage, finishCase]);

  // For story stages — just advance
  const handleStoryNext = useCallback(() => {
    if (!caseData) return;
    const nextStage = currentStage + 1;
    if (nextStage < caseData.stages.length) {
      setCurrentStage(nextStage);
    } else {
      finishCase(false);
    }
  }, [caseData, currentStage, finishCase]);

  const handleTryAgain = useCallback(() => {
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
  }, []);

  const handleShowHint = useCallback(() => {
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
  }, []);

  const handleDeteriorationContinue = useCallback(() => {
    setShowDeteriorationAlert(false);
    if (deteriorationSeverity === "death") {
      finishCase(true);
    }
  }, [deteriorationSeverity, finishCase]);

  // Loading / error states
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-400 border-2">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-800 text-lg mb-6">{loadError}</p>
            <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
              بازگشت به صفحه اصلی
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!caseData || !vitals) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-xl text-blue-200">در حال بارگذاری کیس...</p>
        </div>
      </div>
    );
  }

  const stages = caseData.stages;
  const currentStageData = stages[currentStage];
  const isStory = currentStageData?.type === "story";

  // Count only question stages for progress
  const questionStages = stages.filter((s: any) => s.type === "question");
  const completedQuestions = stages
    .slice(0, currentStage)
    .filter((s: any) => s.type === "question").length;
  const progressPercentage = questionStages.length > 0
    ? (completedQuestions / questionStages.length) * 100
    : 0;

  const difficultyColor =
    caseData.difficulty === "hard"
      ? "bg-red-500"
      : caseData.difficulty === "medium"
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <PatientDeteriorationAlert
        open={showDeteriorationAlert}
        severity={deteriorationSeverity}
        message={deteriorationMessage}
        onContinue={handleDeteriorationContinue}
      />

      {/* Header / Vitals Bar */}
      <div className="bg-gradient-to-r from-blue-800 to-cyan-700 border-b-4 border-cyan-400 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-cyan-300" />
              <div>
                <div className="text-sm text-cyan-200 font-semibold" {...rtlMixedTextProps}>{caseData.diagnosis}</div>
                <div className="text-xs text-cyan-300" {...rtlMixedTextProps}>{caseData.category} — {caseData.name}</div>
              </div>
              <span className={`text-xs text-white font-bold px-2 py-0.5 rounded-full ${difficultyColor}`}>
                {caseData.difficulty === "hard" ? "سخت" : caseData.difficulty === "medium" ? "متوسط" : "آسان"}
              </span>
            </div>

            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <div className="text-center">
                <div className="text-xs text-cyan-200">HR</div>
                <div className={`text-lg font-bold font-mono ${vitals.hr > 100 ? "text-yellow-300" : "text-white"}`}>
                  {vitals.hr}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-cyan-200">SpO₂</div>
                <div className={`text-lg font-bold font-mono ${vitals.spo2 < 90 ? "text-red-400" : vitals.spo2 < 95 ? "text-yellow-300" : "text-white"}`}>
                  {vitals.spo2}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-cyan-200">BP</div>
                <div className="text-lg font-bold text-white font-mono">{vitals.bp}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-cyan-200">GCS</div>
                <div className={`text-lg font-bold font-mono ${vitals.gcs <= 8 ? "text-red-400" : vitals.gcs <= 12 ? "text-yellow-300" : "text-white"}`}>
                  {vitals.gcs}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-cyan-300 mb-1">
              <span>پیشرفت</span>
              <span>{completedQuestions} / {questionStages.length} سوال</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-blue-950" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Question / Story Card */}
          <div className="lg:col-span-8">
            <Card className="border-2 border-blue-400 shadow-2xl bg-white/95 backdrop-blur">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isStory ? (
                      /* Story Stage */
                      <div>
                        <Badge className="bg-purple-600 mb-4">داستان بالینی</Badge>
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                          <p className="text-gray-800 text-lg leading-relaxed" {...rtlMixedBlockProps}>
                            {currentStageData.question}
                          </p>
                        </div>
                        <Button
                          onClick={handleStoryNext}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          size="lg"
                        >
                          {currentStage < stages.length - 1 ? "ادامه ←" : "مشاهده نتایج"}
                        </Button>
                      </div>
                    ) : (
                      /* Question Stage */
                      <div>
                        <div className="mb-6">
                          <Badge className="bg-blue-600 mb-4">
                            سوال {completedQuestions + 1} از {questionStages.length}
                          </Badge>
                          <h2 className="text-xl font-bold text-gray-900 leading-relaxed" {...rtlMixedBlockProps}>
                            {currentStageData.question}
                          </h2>
                        </div>

                        <div className="space-y-3 mb-6">
                          {(currentStageData.options ?? []).map((option: any) => {
                            const isSelected = selectedOption === option.id;
                            const showCorrect = showResult && option.isCorrect;
                            const showWrong = showResult && isSelected && !option.isCorrect;

                            return (
                              <motion.button
                                key={option.id}
                                onClick={() => handleOptionSelect(option.id)}
                                disabled={showResult}
                                whileHover={!showResult ? { scale: 1.01 } : {}}
                                whileTap={!showResult ? { scale: 0.99 } : {}}
                                className={`w-full p-4 rounded-xl border-2 transition-all ${
                                  showCorrect
                                    ? "bg-green-100 border-green-500 shadow-lg"
                                    : showWrong
                                    ? "bg-red-100 border-red-500"
                                    : isSelected
                                    ? "bg-blue-100 border-blue-500"
                                    : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                } ${showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <div className="flex flex-row-reverse items-center justify-between gap-3">
                                  <span className="text-base text-gray-900 flex-1" {...rtlMixedTextProps}>{option.text}</span>
                                  {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />}
                                  {showWrong && <XCircle className="w-6 h-6 text-red-600 shrink-0" />}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>

                        {showResult && !isCorrect && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4"
                          >
                            <p className="text-red-800 text-sm">
                              ❌ پاسخ نادرست! دوباره تلاش کنید یا از راهنما استفاده کنید.
                            </p>
                          </motion.div>
                        )}

                        {showResult && isCorrect && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4"
                          >
                            <p className="text-green-800 text-sm font-semibold">
                              ✅ عالی! پاسخ صحیح است.
                            </p>
                            {currentStageData.orderText && (
                              <p className="text-green-700 text-xs mt-1" {...rtlMixedTextProps}>
                                دستور ثبت شد: {currentStageData.orderText}
                              </p>
                            )}
                          </motion.div>
                        )}

                        {showHint && currentStageData.hint && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4"
                          >
                            <div className="flex flex-row-reverse items-start gap-2">
                              <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                              <p className="text-yellow-800 text-sm flex-1" {...rtlMixedTextProps}>{currentStageData.hint}</p>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex gap-3">
                          {!showResult && (
                            <>
                              <Button
                                onClick={handleSubmit}
                                disabled={!selectedOption}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                                size="lg"
                              >
                                تایید پاسخ
                              </Button>
                              {wrongAttempts >= 1 && !showHint && currentStageData.hint && (
                                <Button
                                  onClick={handleShowHint}
                                  variant="outline"
                                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                                  size="lg"
                                >
                                  <Lightbulb className="w-5 h-5 mr-2" />
                                  راهنما
                                </Button>
                              )}
                            </>
                          )}

                          {showResult && !isCorrect && (
                            <Button
                              onClick={handleTryAgain}
                              className="flex-1 bg-orange-600 hover:bg-orange-700"
                              size="lg"
                            >
                              تلاش مجدد
                            </Button>
                          )}

                          {showResult && isCorrect && (
                            <Button
                              onClick={handleNext}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              size="lg"
                            >
                              {currentStage < stages.length - 1 ? "مرحله بعد ←" : "مشاهده نتایج"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Hospital Order Sheet */}
          <div className="lg:col-span-4">
            <HospitalOrderSheet
              patientName={caseData.name}
              diagnosis={caseData.diagnosis}
              condition={caseData.condition}
              position={caseData.position}
              diet={caseData.diet}
              orders={orders}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
