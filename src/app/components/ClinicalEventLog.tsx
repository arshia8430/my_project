import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

export interface EventLog {
  id: string;
  timestamp: number;
  action: string;
  result?: string;
  type: "success" | "warning" | "error" | "info";
}

interface ClinicalEventLogProps {
  events: EventLog[];
  sequenceErrors?: string[];
}

export function ClinicalEventLog({ events, sequenceErrors = [] }: ClinicalEventLogProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `T+${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-emerald-500 bg-emerald-50/50";
      case "warning":
        return "border-l-amber-500 bg-amber-50/50";
      case "error":
        return "border-l-red-500 bg-red-50/50";
      default:
        return "border-l-blue-500 bg-blue-50/50";
    }
  };

  return (
    <Card className="border-slate-300 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-200 bg-slate-50">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Clinical Event Log
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-3">
        {sequenceErrors.length > 0 && (
          <div className="mb-3 space-y-2">
            {sequenceErrors.map((error, idx) => (
              <div
                key={idx}
                className="bg-red-100 border-2 border-red-400 rounded-lg p-3 animate-pulse"
              >
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-red-900 mb-1">
                      SEQUENCE VIOLATION
                    </div>
                    <div className="text-xs text-red-800">{error}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ScrollArea className="h-[400px] pr-3">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No events logged yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Actions will appear here as you work
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {events
                .slice()
                .reverse()
                .map((event) => (
                  <div
                    key={event.id}
                    className={`border-l-4 ${getEventColor(event.type)} rounded-r-lg p-3 transition-all duration-200 hover:shadow-sm`}
                  >
                    <div className="flex items-start gap-2">
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-slate-600">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 mb-1">
                          {event.action}
                        </div>
                        {event.result && (
                          <div className="text-xs text-slate-700 bg-white/70 p-2 rounded border border-slate-200 mt-2">
                            {event.result}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
