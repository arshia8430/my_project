import { Activity, Heart, Thermometer, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface VitalsData {
  hr: number;
  bp: string;
  rr: number;
  spo2: number;
  temp: number;
  gcs: number;
}

interface VitalsPanelProps {
  vitals: VitalsData;
}

export function VitalsPanel({ vitals }: VitalsPanelProps) {
  const getVitalStatus = (type: string, value: number | string) => {
    switch (type) {
      case "hr":
        const hr = value as number;
        if (hr < 60 || hr > 100) return { color: "bg-amber-100 border-amber-300 text-amber-800", status: "abnormal" };
        if (hr > 90) return { color: "bg-yellow-50 border-yellow-200 text-yellow-700", status: "warning" };
        return { color: "bg-emerald-50 border-emerald-200 text-emerald-700", status: "normal" };

      case "spo2":
        const spo2 = value as number;
        if (spo2 < 90) return { color: "bg-red-100 border-red-300 text-red-800", status: "critical" };
        if (spo2 < 94) return { color: "bg-amber-100 border-amber-300 text-amber-800", status: "abnormal" };
        return { color: "bg-emerald-50 border-emerald-200 text-emerald-700", status: "normal" };

      case "rr":
        const rr = value as number;
        if (rr < 12 || rr > 20) return { color: "bg-amber-100 border-amber-300 text-amber-800", status: "abnormal" };
        return { color: "bg-emerald-50 border-emerald-200 text-emerald-700", status: "normal" };

      case "temp":
        const temp = value as number;
        if (temp > 38.3 || temp < 36) return { color: "bg-amber-100 border-amber-300 text-amber-800", status: "abnormal" };
        return { color: "bg-emerald-50 border-emerald-200 text-emerald-700", status: "normal" };

      case "gcs":
        const gcs = value as number;
        if (gcs <= 8) return { color: "bg-red-100 border-red-300 text-red-800", status: "critical" };
        if (gcs <= 12) return { color: "bg-amber-100 border-amber-300 text-amber-800", status: "abnormal" };
        return { color: "bg-emerald-50 border-emerald-200 text-emerald-700", status: "normal" };

      default:
        return { color: "bg-slate-50 border-slate-200 text-slate-700", status: "normal" };
    }
  };

  const hrStatus = getVitalStatus("hr", vitals.hr);
  const spo2Status = getVitalStatus("spo2", vitals.spo2);
  const rrStatus = getVitalStatus("rr", vitals.rr);
  const tempStatus = getVitalStatus("temp", vitals.temp);
  const gcsStatus = getVitalStatus("gcs", vitals.gcs);

  return (
    <Card className="border-slate-300 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-200 bg-slate-50">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Dynamic Vitals Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className={`${hrStatus.color} border-2 rounded-lg p-3 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium">Heart Rate</span>
            </div>
            {hrStatus.status !== "normal" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                {hrStatus.status === "critical" ? "CRITICAL" : "ABNORMAL"}
              </span>
            )}
          </div>
          <div className="font-mono text-2xl font-bold">{vitals.hr}</div>
          <div className="text-xs opacity-75">bpm</div>
        </div>

        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-medium text-slate-700">Blood Pressure</span>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-800">{vitals.bp}</div>
          <div className="text-xs text-slate-600">mmHg</div>
        </div>

        <div className={`${rrStatus.color} border-2 rounded-lg p-3 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span className="text-xs font-medium">Respiratory Rate</span>
            </div>
            {rrStatus.status !== "normal" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">ABNORMAL</span>
            )}
          </div>
          <div className="font-mono text-2xl font-bold">{vitals.rr}</div>
          <div className="text-xs opacity-75">breaths/min</div>
        </div>

        <div className={`${spo2Status.color} border-2 rounded-lg p-3 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">SpO₂</span>
            </div>
            {spo2Status.status !== "normal" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                {spo2Status.status === "critical" ? "CRITICAL" : "ABNORMAL"}
              </span>
            )}
          </div>
          <div className="font-mono text-2xl font-bold">{vitals.spo2}%</div>
          <div className="text-xs opacity-75">oxygen saturation</div>
        </div>

        <div className={`${tempStatus.color} border-2 rounded-lg p-3 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs font-medium">Temperature</span>
            </div>
            {tempStatus.status !== "normal" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">ABNORMAL</span>
            )}
          </div>
          <div className="font-mono text-2xl font-bold">{vitals.temp}°C</div>
          <div className="text-xs opacity-75">body temp</div>
        </div>

        <div className={`${gcsStatus.color} border-2 rounded-lg p-3 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">GCS Score</span>
            </div>
            {gcsStatus.status !== "normal" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                {gcsStatus.status === "critical" ? "CRITICAL" : "IMPAIRED"}
              </span>
            )}
          </div>
          <div className="font-mono text-2xl font-bold">{vitals.gcs}/15</div>
          <div className="text-xs opacity-75">consciousness level</div>
        </div>
      </CardContent>
    </Card>
  );
}
