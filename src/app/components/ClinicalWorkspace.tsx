import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Stethoscope,
  Syringe,
  MessageSquare,
  Clock,
  Search,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export interface ClinicalAction {
  id: string;
  name: string;
  category: string;
  timeCost: number;
  costLevel?: "low" | "medium" | "high";
  prerequisites?: string[];
  description?: string;
}

interface ClinicalWorkspaceProps {
  historyActions: ClinicalAction[];
  orderActions: ClinicalAction[];
  communicationActions: ClinicalAction[];
  selectedActions: Set<string>;
  onActionToggle: (action: ClinicalAction) => void;
  onSubmitPhase: () => void;
  completedActions?: Set<string>;
}

export function ClinicalWorkspace({
  historyActions,
  orderActions,
  communicationActions,
  selectedActions,
  onActionToggle,
  onSubmitPhase,
  completedActions = new Set(),
}: ClinicalWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  const getCostBadge = (level?: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive" className="text-xs">$$$ High Cost</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">$$ Moderate</Badge>;
      case "low":
        return <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-700">$ Low Cost</Badge>;
      default:
        return null;
    }
  };

  const checkPrerequisites = (action: ClinicalAction) => {
    if (!action.prerequisites || action.prerequisites.length === 0) return true;
    return action.prerequisites.every((prereqId) => completedActions.has(prereqId));
  };

  const renderActionItem = (action: ClinicalAction) => {
    const hasPrerequisites = checkPrerequisites(action);
    const isSelected = selectedActions.has(action.id);

    return (
      <TooltipProvider key={action.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`border-2 rounded-lg p-3 transition-all ${
                !hasPrerequisites
                  ? "opacity-50 bg-gray-100 border-gray-300 cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-50 border-blue-400 shadow-sm"
                  : "bg-white border-slate-300 hover:border-blue-300 hover:shadow-sm cursor-pointer"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  disabled={!hasPrerequisites}
                  onCheckedChange={() => hasPrerequisites && onActionToggle(action)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 mb-1">
                    {action.name}
                  </div>
                  {action.description && (
                    <div className="text-xs text-slate-600 mb-2">
                      {action.description}
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ⏱️ {formatTime(action.timeCost)}
                    </Badge>
                    {action.costLevel && getCostBadge(action.costLevel)}
                  </div>
                  {!hasPrerequisites && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Prerequisites not met</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="text-xs space-y-1">
              <div className="font-semibold">Estimated Time: {formatTime(action.timeCost)}</div>
              {action.costLevel && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Resource Cost: {action.costLevel.toUpperCase()}
                </div>
              )}
              {action.prerequisites && action.prerequisites.length > 0 && (
                <div className="text-amber-600 mt-2">
                  <div className="font-semibold">Prerequisites Required</div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const filterActions = (actions: ClinicalAction[]) => {
    if (!searchQuery) return actions;
    return actions.filter((action) =>
      action.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const groupByCategory = (actions: ClinicalAction[]) => {
    const grouped: { [key: string]: ClinicalAction[] } = {};
    actions.forEach((action) => {
      if (!grouped[action.category]) {
        grouped[action.category] = [];
      }
      grouped[action.category].push(action);
    });
    return grouped;
  };

  return (
    <Card className="border-2 border-slate-300 shadow-md">
      <CardHeader className="border-b border-slate-200 bg-slate-50">
        <CardTitle className="text-base text-slate-800">
          Clinical Interaction Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">History & Physical</span>
              <span className="sm:hidden">H&P</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Syringe className="w-4 h-4" />
              <span className="hidden sm:inline">Orders & Interventions</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Communication</span>
              <span className="sm:hidden">Comm</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              <strong>Instructions:</strong> Select the history and physical examination components
              you wish to perform. Each selection adds time to your clinical encounter.
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {historyActions.map(renderActionItem)}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search labs, imaging, medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-slate-300"
              />
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {Object.entries(groupByCategory(filterActions(orderActions))).map(
                ([category, actions]) => (
                  <div key={category}>
                    <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {actions.map(renderActionItem)}
                    </div>
                  </div>
                )
              )}
            </div>
          </TabsContent>

          <TabsContent value="communication" className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900">
              <strong>OSCE Communication Skills:</strong> Demonstrate professionalism and
              patient-centered communication.
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {communicationActions.map(renderActionItem)}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <strong>{selectedActions.size}</strong> action(s) selected
          </div>
          <Button
            onClick={onSubmitPhase}
            disabled={selectedActions.size === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Actions →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
