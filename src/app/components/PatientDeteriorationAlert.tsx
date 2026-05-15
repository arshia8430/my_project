import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { AlertTriangle, Skull, HeartPulse } from "lucide-react";
import { motion } from "motion/react";

interface PatientDeteriorationAlertProps {
  open: boolean;
  severity: "warning" | "critical" | "death";
  message: string;
  onContinue: () => void;
}

export function PatientDeteriorationAlert({
  open,
  severity,
  message,
  onContinue,
}: PatientDeteriorationAlertProps) {
  const getSeverityConfig = () => {
    switch (severity) {
      case "death":
        return {
          icon: <Skull className="w-16 h-16 text-red-600" />,
          title: "بیمار فوت کرد",
          bgColor: "bg-red-100",
          borderColor: "border-red-500",
          textColor: "text-red-900",
        };
      case "critical":
        return {
          icon: <HeartPulse className="w-16 h-16 text-orange-600" />,
          title: "وضعیت بیمار وخیم شد",
          bgColor: "bg-orange-100",
          borderColor: "border-orange-500",
          textColor: "text-orange-900",
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-yellow-600" />,
          title: "هشدار!",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-500",
          textColor: "text-yellow-900",
        };
    }
  };

  const config = getSeverityConfig();

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className={`${config.bgColor} border-4 ${config.borderColor} max-w-md`}>
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            {config.icon}
          </motion.div>
          <AlertDialogTitle className={`text-center text-2xl ${config.textColor}`}>
            {config.title}
          </AlertDialogTitle>
          <AlertDialogDescription className={`text-center text-base ${config.textColor} leading-relaxed mt-4`}>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center mt-4">
          <Button
            onClick={onContinue}
            className={severity === "death" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
            size="lg"
          >
            {severity === "death" ? "مشاهده نتایج" : "ادامه"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
