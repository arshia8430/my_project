import { Clock, AlertTriangle } from "lucide-react";

interface TimerProps {
  elapsedTime: number;
  criticalTime?: number;
  warningTime?: number;
}

export function Timer({ elapsedTime, criticalTime, warningTime }: TimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = () => {
    if (criticalTime && elapsedTime >= criticalTime) {
      return { color: "bg-red-600 border-red-700", text: "Critical", textColor: "text-white", icon: true };
    }
    if (warningTime && elapsedTime >= warningTime) {
      return { color: "bg-orange-500 border-orange-600", text: "Warning", textColor: "text-white", icon: true };
    }
    return { color: "bg-white border-gray-300", text: "Time Elapsed", textColor: "text-gray-700", icon: false };
  };

  const status = getTimeStatus();

  return (
    <div className={`${status.color} border-2 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <Clock className={`w-5 h-5 ${status.textColor}`} />
        <div>
          <div className={`text-xs ${status.textColor} opacity-80`}>{status.text}</div>
          <div className={`text-2xl font-mono font-bold ${status.textColor}`}>{formatTime(elapsedTime)}</div>
        </div>
      </div>
      {status.icon && (
        <AlertTriangle className={`w-5 h-5 ${status.textColor}`} />
      )}
    </div>
  );
}
