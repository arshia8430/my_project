import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface DualTimerProps {
  simulatedTime: number;
  criticalTime?: number;
  warningTime?: number;
}

export function DualTimer({ simulatedTime, criticalTime, warningTime }: DualTimerProps) {
  const [realElapsedTime, setRealElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = () => {
    if (criticalTime && simulatedTime >= criticalTime) {
      return {
        bgColor: "bg-red-600",
        borderColor: "border-red-700",
        textColor: "text-white",
        label: "CRITICAL",
        showIcon: true
      };
    }
    if (warningTime && simulatedTime >= warningTime) {
      return {
        bgColor: "bg-amber-500",
        borderColor: "border-amber-600",
        textColor: "text-white",
        label: "WARNING",
        showIcon: true
      };
    }
    return {
      bgColor: "bg-white",
      borderColor: "border-slate-300",
      textColor: "text-slate-700",
      label: "ACTIVE",
      showIcon: false
    };
  };

  const status = getTimeStatus();

  return (
    <div className={`${status.bgColor} ${status.borderColor} border-2 px-5 py-3 rounded-lg shadow-md transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <Clock className={`w-6 h-6 ${status.textColor}`} />
        <div className="flex flex-col">
          <div className={`text-xs font-medium ${status.textColor} opacity-80 mb-0.5`}>
            Simulated Clinical Time
          </div>
          <div className={`text-3xl font-mono font-bold ${status.textColor} leading-none mb-1.5`}>
            T+{formatTime(simulatedTime)}
          </div>
          <div className={`text-xs ${status.textColor} opacity-70 flex items-center gap-1.5`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            Real-Time: {formatTime(realElapsedTime)}
          </div>
        </div>
        {status.showIcon && (
          <AlertTriangle className={`w-6 h-6 ${status.textColor} animate-pulse`} />
        )}
      </div>
    </div>
  );
}
