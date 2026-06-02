import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { rtlMixedTextProps } from "../utils/bidi";

export interface HospitalOrder {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface HospitalOrderSheetProps {
  patientName: string;
  diagnosis: string;
  condition: string;
  position: string;
  diet: string;
  orders: HospitalOrder[];
}

export function HospitalOrderSheet({
  patientName,
  diagnosis,
  condition,
  position,
  diet,
  orders,
}: HospitalOrderSheetProps) {
  return (
    <Card className="border-2 border-blue-300 shadow-lg bg-white h-full">
      <CardHeader className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900 text-base">
          <FileText className="w-5 h-5" />
          Hospital Order Sheet
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 px-4">
        <div className="space-y-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-600 font-semibold mb-2" {...rtlMixedTextProps}>Patient: {patientName}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-700 font-medium">Imp:</span>{" "}
                <span className="text-gray-800" {...rtlMixedTextProps}>{diagnosis}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Cond:</span>{" "}
                <span className={condition === "urgent" || condition === "critical" ? "text-red-600 font-semibold" : "text-gray-800"}>
                  {condition}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Pos:</span>{" "}
                <span className="text-gray-800" {...rtlMixedTextProps}>{position}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Diet:</span>{" "}
                <span className="text-gray-800 uppercase">{diet}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-blue-200 pt-3 mb-2">
          <div className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wide">
            Physician Orders:
          </div>
        </div>

        <ScrollArea className="h-[450px] pr-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No orders yet</p>
              <p className="text-xs mt-1">Select actions to add orders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className={`p-2.5 rounded-lg border-l-4 transition-all ${
                    order.isCorrect === true
                      ? "bg-green-50 border-green-500"
                      : order.isCorrect === false
                      ? "bg-red-50 border-red-500"
                      : "bg-blue-50 border-blue-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-blue-900 font-mono font-bold text-sm min-w-[20px]">
                      {index + 1}.
                    </span>
                    <span className="text-gray-900 text-sm flex-1 leading-relaxed" {...rtlMixedTextProps}>
                      {order.text}
                    </span>
                    {order.isCorrect === true && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    )}
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
