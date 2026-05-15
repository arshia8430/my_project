import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Stethoscope, Play, Brain, Heart, Activity, Settings, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../../services/api";

export default function NewHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const randomCase = await api.getRandomCase();
      navigate(`/case/${randomCase.case_id}`);
    } catch {
      setError("خطا در اتصال به سرور. لطفاً مطمئن شوید بک‌اند در حال اجرا است.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl w-full text-center"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
            <Stethoscope className="w-20 h-20 text-cyan-400" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-6xl font-bold text-white mb-4"
        >
          Clinical Mastery
        </motion.h1>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl text-blue-200 mb-3"
        >
          سامانه تمرین تصمیم‌گیری بالینی
        </motion.p>

        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-blue-300/80 mb-12"
        >
          Interactive Emergency Medicine Training Platform
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 rounded-xl px-6 py-3 text-red-200 text-sm max-w-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-12 py-8 text-2xl rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 border-2 border-white/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                در حال انتخاب کیس...
              </>
            ) : (
              <>
                <Play className="w-8 h-8 mr-3" fill="currentColor" />
                شروع تمرین
              </>
            )}
          </Button>

          <div className="flex items-center gap-8 text-blue-200/80 text-sm">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <span>Clinical Cases</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-cyan-400" />
              <span>Real-time Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Progressive Learning</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 text-blue-300/60 text-xs"
        >
          یک کیس اورژانسی به صورت تصادفی از بانک کیس‌ها انتخاب می‌شود
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-4"
        >
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 text-xs text-blue-400/50 hover:text-blue-300/80 transition"
          >
            <Settings size={12} /> Admin Panel
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
