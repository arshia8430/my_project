import { useLocation, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Trophy, XCircle, Clock, Target, Home, RotateCcw, Skull } from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface ResultState {
  totalTime: number;
  totalWrongAnswers: number;
  totalQuestions: number;
  died?: boolean;
  caseName?: string;
  caseCategory?: string;
  sessionId?: string;
}

export default function FinalResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ResultState) || {};

  const {
    totalTime = 0,
    totalWrongAnswers = 0,
    totalQuestions = 1,
    died = false,
    caseName = "Clinical Case",
    caseCategory = "",
  } = state;

  const correctAnswers = Math.max(0, totalQuestions - totalWrongAnswers);
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const score = died ? 0 : Math.max(0, 100 - totalWrongAnswers * 10 - Math.floor(totalTime / 10));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPerformance = () => {
    if (died) {
      return {
        title: "بیمار فوت کرد",
        grade: "F",
        color: "text-red-600",
        bgColor: "bg-red-100",
        message: "متاسفانه به دلیل تاخیر زیاد در تصمیم‌گیری، بیمار فوت کرد. سرعت عمل در موارد اورژانسی بسیار حیاتی است.",
      };
    }
    if (accuracy >= 80 && totalTime < 300) {
      return {
        title: "عالی!",
        grade: "A+",
        color: "text-green-600",
        bgColor: "bg-green-100",
        message: "عملکرد فوق‌العاده! سرعت و دقت شما در حد یک پزشک حاذق است.",
      };
    }
    if (accuracy >= 80) {
      return {
        title: "خوب",
        grade: "A",
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        message: "دقت خوب! سرعت تصمیم‌گیری را بیشتر تمرین کنید.",
      };
    }
    if (accuracy >= 60 && totalTime < 600) {
      return {
        title: "قابل قبول",
        grade: "B",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        message: "عملکرد خوب، اما می‌توانید بهتر باشید. تمرین بیشتر کنید.",
      };
    }
    if (accuracy >= 60) {
      return {
        title: "متوسط",
        grade: "C",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        message: "باید روی تصمیم‌گیری سریع‌تر و دقیق‌تر کار کنید.",
      };
    }
    return {
      title: "نیاز به تمرین",
      grade: "D",
      color: "text-red-600",
      bgColor: "bg-red-100",
      message: "دانش پایه نیاز به تقویت دارد. گایدلاین‌های مربوطه را مطالعه کنید.",
    };
  };

  const performance = getPerformance();

  useEffect(() => {
    if (!died && accuracy >= 80) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#3b82f6", "#06b6d4", "#10b981"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#3b82f6", "#06b6d4", "#10b981"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [died, accuracy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-4 border-cyan-400 shadow-2xl bg-white">
          <CardHeader className={`${performance.bgColor} border-b-4 border-cyan-300 pb-8`}>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              {died ? (
                <Skull className="w-24 h-24 text-red-600 mb-4" />
              ) : (
                <Trophy className={`w-24 h-24 ${performance.color} mb-4`} />
              )}
              <div className="text-sm text-gray-600 mb-1">{caseName} {caseCategory ? `— ${caseCategory}` : ""}</div>
              <CardTitle className={`text-4xl ${performance.color} mb-2`}>
                {performance.title}
              </CardTitle>
              <div className={`text-6xl font-bold ${performance.color} mb-3`}>
                {performance.grade}
              </div>
              <p className={`text-center ${performance.color} text-sm max-w-md leading-relaxed`}>
                {performance.message}
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="pt-8 pb-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div className="text-sm text-blue-700 font-semibold">زمان کل</div>
                </div>
                <div className="text-4xl font-bold text-blue-900 font-mono">{formatTime(totalTime)}</div>
                <div className="text-xs text-blue-600 mt-1">
                  {totalTime < 300 ? "سریع ⚡" : totalTime < 600 ? "متوسط" : "کند"}
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-green-600" />
                  <div className="text-sm text-green-700 font-semibold">دقت</div>
                </div>
                <div className="text-4xl font-bold text-green-900">{accuracy}%</div>
                <div className="text-xs text-green-600 mt-1">
                  {correctAnswers} از {totalQuestions} صحیح
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-6 h-6 text-purple-600" />
                  <div className="text-sm text-purple-700 font-semibold">پاسخ‌های نادرست</div>
                </div>
                <div className="text-4xl font-bold text-purple-900">{totalWrongAnswers}</div>
                <div className="text-xs text-purple-600 mt-1">
                  {totalWrongAnswers === 0 ? "بی‌نقص! 🎉" : "تلاش بیشتر"}
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-orange-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-orange-600" />
                  <div className="text-sm text-orange-700 font-semibold">امتیاز</div>
                </div>
                <div className="text-4xl font-bold text-orange-900">{score}</div>
                <div className="text-xs text-orange-600 mt-1">
                  {died ? "بیمار فوت کرد" : "از ۱۰۰"}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4"
            >
              <Button
                onClick={() => navigate("/")}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                کیس جدید
              </Button>
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex-1 border-2 border-blue-500 text-blue-700 hover:bg-blue-50"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                تمرین مجدد
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
