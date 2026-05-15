import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  CheckCircle,
  XCircle,
  BookOpen,
  HelpCircle,
  Activity,
  FileText,
  Stethoscope,
  AlertTriangle,
  Copy,
  Eye,
} from "lucide-react";
import { api, CaseData } from "../../services/api";
import { logoutAdmin } from "../utils/adminAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VitalsData {
  hr: number;
  spo2: number;
  bp: string;
  gcs: number;
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Stage {
  type: "story" | "question";
  question: string;
  options?: QuestionOption[];
  hint?: string;
  orderText?: string;
  vitalsUpdate?: Partial<VitalsData>;
}

interface CaseForm {
  case_id: string;
  name: string;
  diagnosis: string;
  condition: string;
  position: string;
  diet: string;
  difficulty: string;
  category: string;
  initial_vitals: VitalsData;
  stages: Stage[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultVitals: VitalsData = { hr: 80, spo2: 98, bp: "120/80", gcs: 15 };

const defaultForm = (): CaseForm => ({
  case_id: "",
  name: "",
  diagnosis: "",
  condition: "moderate",
  position: "supine",
  diet: "regular",
  difficulty: "medium",
  category: "Emergency Medicine",
  initial_vitals: { ...defaultVitals },
  stages: [],
});

const defaultOption = (): QuestionOption => ({
  id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  text: "",
  isCorrect: false,
});

const defaultStory = (): Stage => ({ type: "story", question: "" });

const defaultQuestion = (): Stage => ({
  type: "question",
  question: "",
  options: [defaultOption(), defaultOption(), defaultOption(), defaultOption()],
  hint: "",
  orderText: "",
  vitalsUpdate: undefined,
});

// ─── Helper components ────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

function difficultyBadge(d: string) {
  const map: Record<string, string> = {
    easy: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
  };
  return <Badge label={d} color={map[d] ?? "bg-slate-100 text-slate-600"} />;
}

function conditionBadge(c: string) {
  const map: Record<string, string> = {
    moderate: "bg-blue-100 text-blue-700",
    urgent: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };
  return <Badge label={c} color={map[c] ?? "bg-slate-100 text-slate-600"} />;
}

// ─── Input helpers ────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-slate-300";

const selectCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

// ─── Vitals mini-editor ───────────────────────────────────────────────────────

function VitalsEditor({
  vitals,
  onChange,
}: {
  vitals: VitalsData;
  onChange: (v: VitalsData) => void;
}) {
  const set = (k: keyof VitalsData, val: string) => {
    onChange({
      ...vitals,
      [k]: k === "bp" ? val : Number(val),
    });
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="HR (bpm)">
        <input
          type="number"
          className={inputCls}
          value={vitals.hr}
          onChange={(e) => set("hr", e.target.value)}
          min={20}
          max={300}
        />
      </Field>
      <Field label="SpO₂ (%)">
        <input
          type="number"
          className={inputCls}
          value={vitals.spo2}
          onChange={(e) => set("spo2", e.target.value)}
          min={50}
          max={100}
        />
      </Field>
      <Field label="BP (systolic/diastolic)">
        <input
          type="text"
          className={inputCls}
          value={vitals.bp}
          onChange={(e) => set("bp", e.target.value)}
          placeholder="120/80"
        />
      </Field>
      <Field label="GCS (3–15)">
        <input
          type="number"
          className={inputCls}
          value={vitals.gcs}
          onChange={(e) => set("gcs", e.target.value)}
          min={3}
          max={15}
        />
      </Field>
    </div>
  );
}

// ─── Vitals update mini-editor (partial) ─────────────────────────────────────

function VitalsUpdateEditor({
  vitals,
  onChange,
}: {
  vitals: Partial<VitalsData>;
  onChange: (v: Partial<VitalsData>) => void;
}) {
  const toggle = (k: keyof VitalsData) => {
    if (k in vitals) {
      const next = { ...vitals };
      delete next[k];
      onChange(next);
    } else {
      onChange({ ...vitals, [k]: k === "bp" ? "120/80" : 80 });
    }
  };
  const set = (k: keyof VitalsData, val: string) => {
    onChange({ ...vitals, [k]: k === "bp" ? val : Number(val) });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">
        Toggle a field to include it in the vitals change after this action.
      </p>
      {(["hr", "spo2", "bp", "gcs"] as (keyof VitalsData)[]).map((k) => (
        <div key={k} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggle(k)}
            className={`w-6 h-6 rounded flex items-center justify-center border transition ${
              k in vitals
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-slate-300 text-slate-400 hover:border-blue-400"
            }`}
          >
            {k in vitals ? <CheckCircle size={14} /> : <Plus size={14} />}
          </button>
          <span className="text-xs font-mono text-slate-600 w-12">{k.toUpperCase()}</span>
          {k in vitals && (
            <input
              type={k === "bp" ? "text" : "number"}
              className="rounded border border-slate-200 px-2 py-1 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={vitals[k] as string | number}
              onChange={(e) => set(k, e.target.value)}
              placeholder={k === "bp" ? "120/80" : "0"}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Stage Editor ─────────────────────────────────────────────────────────────

function StageEditor({
  stage,
  index,
  total,
  onChange,
  onDelete,
  onMove,
  onDuplicate,
}: {
  stage: Stage;
  index: number;
  total: number;
  onChange: (s: Stage) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
}) {
  const [showVitalsUpdate, setShowVitalsUpdate] = useState(
    !!stage.vitalsUpdate && Object.keys(stage.vitalsUpdate).length > 0
  );
  const [collapsed, setCollapsed] = useState(false);

  const setField = <K extends keyof Stage>(k: K, v: Stage[K]) =>
    onChange({ ...stage, [k]: v });

  const setOption = (i: number, opt: QuestionOption) => {
    const opts = [...(stage.options ?? [])];
    opts[i] = opt;
    setField("options", opts);
  };

  const addOption = () =>
    setField("options", [...(stage.options ?? []), defaultOption()]);

  const removeOption = (i: number) => {
    const opts = (stage.options ?? []).filter((_, idx) => idx !== i);
    setField("options", opts);
  };

  const isStory = stage.type === "story";

  const typeColors = isStory
    ? "border-l-indigo-400 bg-indigo-50/30"
    : "border-l-blue-500 bg-blue-50/20";

  return (
    <div className={`rounded-xl border-l-4 border border-slate-200 ${typeColors} overflow-hidden`}>
      {/* Stage header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/60 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          {isStory ? (
            <BookOpen size={15} className="text-indigo-500" />
          ) : (
            <HelpCircle size={15} className="text-blue-500" />
          )}
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Stage {index + 1} — {isStory ? "Story" : "Question"}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition"
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition"
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 transition"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="px-2 py-1 rounded text-xs text-slate-500 hover:bg-slate-100 transition"
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 text-red-400 transition"
            title="Delete stage"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(["story", "question"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  if (t === "question" && stage.type === "story") {
                    onChange({
                      ...defaultQuestion(),
                      question: stage.question,
                    });
                  } else if (t === "story" && stage.type === "question") {
                    onChange({ type: "story", question: stage.question });
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  stage.type === t
                    ? t === "story"
                      ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                      : "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {t === "story" ? (
                  <BookOpen size={12} />
                ) : (
                  <HelpCircle size={12} />
                )}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Main text */}
          <Field label={isStory ? "Narrative text" : "Question"} required>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={stage.question}
              onChange={(e) => setField("question", e.target.value)}
              placeholder={
                isStory
                  ? "Enter the clinical narrative shown to the student…"
                  : "Enter the clinical question…"
              }
              dir="auto"
            />
          </Field>

          {/* Question-specific fields */}
          {!isStory && (
            <>
              {/* Options */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Answer Options
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 transition"
                  >
                    <Plus size={11} /> Add option
                  </button>
                </div>

                {(stage.options ?? []).map((opt, oi) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    {/* Correct toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setOption(oi, { ...opt, isCorrect: !opt.isCorrect })
                      }
                      title={opt.isCorrect ? "Mark as incorrect" : "Mark as correct"}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                        opt.isCorrect
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 text-slate-300 hover:border-emerald-400 hover:text-emerald-400"
                      }`}
                    >
                      <CheckCircle size={14} />
                    </button>

                    <input
                      type="text"
                      className={`${inputCls} flex-1`}
                      value={opt.text}
                      onChange={(e) =>
                        setOption(oi, { ...opt, text: e.target.value })
                      }
                      placeholder={`Option ${oi + 1}…`}
                      dir="auto"
                    />

                    <button
                      type="button"
                      onClick={() => removeOption(oi)}
                      disabled={(stage.options ?? []).length <= 2}
                      className="flex-shrink-0 p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition disabled:opacity-30"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}

                {(stage.options ?? []).filter((o) => o.isCorrect).length === 0 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle size={12} /> Mark at least one option as correct.
                  </p>
                )}
              </div>

              {/* Hint */}
              <Field label="Hint (optional)">
                <input
                  type="text"
                  className={inputCls}
                  value={stage.hint ?? ""}
                  onChange={(e) => setField("hint", e.target.value)}
                  placeholder="Hint shown after a wrong answer…"
                  dir="auto"
                />
              </Field>

              {/* Order text */}
              <Field label="Order Sheet Entry (optional)">
                <input
                  type="text"
                  className={inputCls}
                  value={stage.orderText ?? ""}
                  onChange={(e) => setField("orderText", e.target.value)}
                  placeholder="e.g. IV line 18G ×2, O₂ NRB 15 L/min"
                />
              </Field>

              {/* Vitals update */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVitalsUpdate((v) => !v);
                      if (showVitalsUpdate) setField("vitalsUpdate", undefined);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      showVitalsUpdate
                        ? "bg-teal-100 border-teal-300 text-teal-700"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Activity size={12} />
                    {showVitalsUpdate ? "Vitals update enabled" : "Add vitals change"}
                  </button>
                </div>

                {showVitalsUpdate && (
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <VitalsUpdateEditor
                      vitals={stage.vitalsUpdate ?? {}}
                      onChange={(v) => setField("vitalsUpdate", v)}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Case Form ────────────────────────────────────────────────────────────────

function CaseFormPanel({
  initial,
  onSave,
  onCancel,
}: {
  initial: CaseForm | null;
  onSave: (form: CaseForm, originalId?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CaseForm>(initial ?? defaultForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalId = initial?.case_id;

  const setF = <K extends keyof CaseForm>(k: K, v: CaseForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addStory = () => setF("stages", [...form.stages, defaultStory()]);
  const addQuestion = () => setF("stages", [...form.stages, defaultQuestion()]);

  const updateStage = (i: number, s: Stage) => {
    const stages = [...form.stages];
    stages[i] = s;
    setF("stages", stages);
  };

  const deleteStage = (i: number) =>
    setF("stages", form.stages.filter((_, idx) => idx !== i));

  const moveStage = (i: number, dir: -1 | 1) => {
    const stages = [...form.stages];
    const j = i + dir;
    if (j < 0 || j >= stages.length) return;
    [stages[i], stages[j]] = [stages[j], stages[i]];
    setF("stages", stages);
  };

  const duplicateStage = (i: number) => {
    const stages = [...form.stages];
    const clone = JSON.parse(JSON.stringify(stages[i]));
    // Give options fresh IDs
    if (clone.options) {
      clone.options = clone.options.map((o: QuestionOption) => ({
        ...o,
        id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      }));
    }
    stages.splice(i + 1, 0, clone);
    setF("stages", stages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.case_id.trim()) return setError("Case ID is required.");
    if (!form.name.trim()) return setError("Case name is required.");
    if (!form.diagnosis.trim()) return setError("Diagnosis is required.");
    if (form.stages.length === 0)
      return setError("Add at least one stage before saving.");
    for (const [i, s] of form.stages.entries()) {
      if (!s.question.trim())
        return setError(`Stage ${i + 1}: text cannot be empty.`);
      if (s.type === "question") {
        if (!s.options || s.options.length < 2)
          return setError(`Stage ${i + 1}: needs at least 2 options.`);
        if (!s.options.some((o) => o.isCorrect))
          return setError(`Stage ${i + 1}: mark at least one correct option.`);
        for (const [oi, o] of s.options.entries()) {
          if (!o.text.trim())
            return setError(`Stage ${i + 1}, Option ${oi + 1}: text cannot be empty.`);
        }
      }
    }

    setSaving(true);
    try {
      await onSave(form, originalId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0 h-full">
      {/* Sticky header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Stethoscope size={18} className="text-blue-500" />
          <h2 className="font-bold text-slate-800 text-lg">
            {initial ? "Edit Case" : "New Case"}
          </h2>
          {initial && (
            <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
              {initial.case_id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? "Saving…" : "Save Case"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Basic info ── */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText size={15} className="text-slate-400" /> Case Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Case ID (slug)" required>
              <input
                type="text"
                className={inputCls}
                value={form.case_id}
                onChange={(e) =>
                  setF(
                    "case_id",
                    e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="e.g. chest-pain-002"
              />
            </Field>
            <Field label="Patient Name / Code" required>
              <input
                type="text"
                className={inputCls}
                value={form.name}
                onChange={(e) => setF("name", e.target.value)}
                placeholder="e.g. Patient SE-001"
              />
            </Field>
          </div>
          <Field label="Diagnosis" required>
            <input
              type="text"
              className={inputCls}
              value={form.diagnosis}
              onChange={(e) => setF("diagnosis", e.target.value)}
              placeholder="e.g. Status Epilepticus"
              dir="auto"
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Condition">
              <select
                className={selectCls}
                value={form.condition}
                onChange={(e) => setF("condition", e.target.value)}
              >
                <option value="moderate">Moderate</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
            <Field label="Difficulty">
              <select
                className={selectCls}
                value={form.difficulty}
                onChange={(e) => setF("difficulty", e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Category">
              <input
                type="text"
                className={inputCls}
                value={form.category}
                onChange={(e) => setF("category", e.target.value)}
                placeholder="Emergency Medicine"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Position">
              <input
                type="text"
                className={inputCls}
                value={form.position}
                onChange={(e) => setF("position", e.target.value)}
                placeholder="e.g. supine, HOB 30°"
              />
            </Field>
            <Field label="Diet">
              <select
                className={selectCls}
                value={form.diet}
                onChange={(e) => setF("diet", e.target.value)}
              >
                <option value="regular">Regular</option>
                <option value="npo">NPO</option>
                <option value="cardiac">Cardiac</option>
                <option value="diabetic">Diabetic</option>
                <option value="soft">Soft</option>
                <option value="liquid">Liquid</option>
              </select>
            </Field>
          </div>
        </section>

        {/* ── Vitals ── */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Activity size={15} className="text-slate-400" /> Initial Vitals
          </h3>
          <VitalsEditor
            vitals={form.initial_vitals}
            onChange={(v) => setF("initial_vitals", v)}
          />
        </section>

        {/* ── Stages ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BookOpen size={15} className="text-slate-400" /> Stages
              <span className="text-xs font-normal text-slate-400">
                ({form.stages.length})
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addStory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition"
              >
                <BookOpen size={12} /> Add Story
              </button>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition"
              >
                <HelpCircle size={12} /> Add Question
              </button>
            </div>
          </div>

          {form.stages.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 flex flex-col items-center gap-3 text-slate-400">
              <BookOpen size={28} className="opacity-40" />
              <p className="text-sm">No stages yet. Add a story or question to get started.</p>
            </div>
          )}

          <div className="space-y-3">
            {form.stages.map((stage, i) => (
              <StageEditor
                key={i}
                stage={stage}
                index={i}
                total={form.stages.length}
                onChange={(s) => updateStage(i, s)}
                onDelete={() => deleteStage(i)}
                onMove={(dir) => moveStage(i, dir)}
                onDuplicate={() => duplicateStage(i)}
              />
            ))}
          </div>
        </section>
      </div>
    </form>
  );
}

// ─── Case Card ────────────────────────────────────────────────────────────────

function CaseCard({
  c,
  onEdit,
  onDelete,
  onPreview,
}: {
  c: CaseData;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const stageCount = (c.stages ?? []).length;
  const questionCount = (c.stages ?? []).filter(
    (s: Stage) => s.type === "question"
  ).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Stethoscope size={16} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{c.diagnosis}</p>
          <p className="text-xs text-slate-400 truncate">{c.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {difficultyBadge(c.difficulty)}
        {conditionBadge(c.condition)}
        <Badge label={c.category} color="bg-slate-100 text-slate-600" />
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <BookOpen size={11} /> {stageCount} stages
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle size={11} /> {questionCount} questions
        </span>
        <span className="ml-auto font-mono text-slate-300 text-[10px]">{c.case_id}</span>
      </div>

      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition"
        >
          <Edit3 size={12} /> Edit
        </button>
        <button
          onClick={onPreview}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 transition"
        >
          <Eye size={12} />
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-50 border border-red-200 transition"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Preview modal ────────────────────────────────────────────────────────────

function PreviewModal({ c, onClose }: { c: CaseData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-800">{c.diagnosis}</h2>
            <p className="text-xs text-slate-400">{c.name} · {c.case_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          {/* Vitals */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "HR", value: `${c.initial_vitals.hr} bpm` },
              { label: "SpO₂", value: `${c.initial_vitals.spo2}%` },
              { label: "BP", value: c.initial_vitals.bp },
              { label: "GCS", value: c.initial_vitals.gcs },
            ].map((v) => (
              <div key={v.label} className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">{v.label}</p>
                <p className="font-bold text-slate-800 text-sm">{v.value}</p>
              </div>
            ))}
          </div>

          {/* Stages */}
          <div className="space-y-3">
            {(c.stages ?? []).map((s: Stage, i: number) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  s.type === "story"
                    ? "border-indigo-200 bg-indigo-50/40"
                    : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {s.type === "story" ? (
                    <BookOpen size={13} className="text-indigo-500" />
                  ) : (
                    <HelpCircle size={13} className="text-blue-500" />
                  )}
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Stage {i + 1} · {s.type}
                  </span>
                </div>
                <p className="text-sm text-slate-700" dir="auto">{s.question}</p>
                {s.type === "question" && s.options && (
                  <div className="mt-3 space-y-1">
                    {s.options.map((o) => (
                      <div
                        key={o.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                          o.isCorrect
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : "bg-white border border-slate-200 text-slate-600"
                        }`}
                      >
                        {o.isCorrect ? (
                          <CheckCircle size={12} className="text-emerald-500" />
                        ) : (
                          <XCircle size={12} className="text-slate-300" />
                        )}
                        <span dir="auto">{o.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                {s.hint && (
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                    💡 {s.hint}
                  </p>
                )}
                {s.orderText && (
                  <p className="mt-1 text-xs text-teal-600 font-mono bg-teal-50 rounded px-2 py-1">
                    📋 {s.orderText}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  c,
  onConfirm,
  onCancel,
}: {
  c: CaseData;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Delete Case</h2>
            <p className="text-xs text-slate-400">{c.name}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">{c.diagnosis}</span>? This
          action cannot be undone and will also remove all associated results.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [view, setView] = useState<"list" | "form">("list");
  const [editingCase, setEditingCase] = useState<CaseForm | null>(null);
  const [previewCase, setPreviewCase] = useState<CaseData | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<CaseData | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCases = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await api.getAllCases();
      setCases(data);
    } catch {
      setFetchError("Failed to load cases. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleSave = async (form: CaseForm, originalId?: string) => {
    const payload = {
      ...form,
      // Ensure vitalsUpdate fields that are empty objects are stripped
      stages: form.stages.map((s) => {
        const clean = { ...s };
        if (
          clean.vitalsUpdate &&
          Object.keys(clean.vitalsUpdate).length === 0
        ) {
          delete clean.vitalsUpdate;
        }
        return clean;
      }),
    };

    if (originalId) {
      await api.updateCase(originalId, payload as Omit<CaseData, "id">);
      showToast("Case updated successfully.");
    } else {
      await api.createCase(payload as Omit<CaseData, "id">);
      showToast("Case created successfully.");
    }
    await loadCases();
    setView("list");
    setEditingCase(null);
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteCase(deleteCandidate.case_id);
      showToast("Case deleted.");
      await loadCases();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Delete failed.", "error");
    } finally {
      setDeleteCandidate(null);
    }
  };

  const openEdit = (c: CaseData) => {
    setEditingCase({
      case_id: c.case_id,
      name: c.name,
      diagnosis: c.diagnosis,
      condition: c.condition,
      position: c.position,
      diet: c.diet,
      difficulty: c.difficulty,
      category: c.category,
      initial_vitals: { ...c.initial_vitals } as VitalsData,
      stages: JSON.parse(JSON.stringify(c.stages ?? [])) as Stage[],
    });
    setView("form");
  };

  const openCreate = () => {
    setEditingCase(null);
    setView("form");
  };

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      !q ||
      c.diagnosis.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.case_id.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    const matchD =
      filterDifficulty === "all" || c.difficulty === filterDifficulty;
    return matchQ && matchD;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold border transition ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Delete confirm */}
      {deleteCandidate && (
        <DeleteConfirm
          c={deleteCandidate}
          onConfirm={handleDelete}
          onCancel={() => setDeleteCandidate(null)}
        />
      )}

      {/* Preview */}
      {previewCase && (
        <PreviewModal c={previewCase} onClose={() => setPreviewCase(null)} />
      )}

      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-20">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Stethoscope size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-sm">Admin Panel</span>
          <span className="text-xs text-slate-400">Clinical Case Manager</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              logoutAdmin();
              navigate("/admin/login");
            }}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 text-sm font-semibold rounded-lg transition"
          >
            Logout
          </button>
          {view === "list" && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            >
              <Plus size={15} /> New Case
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      {view === "form" ? (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <CaseFormPanel
            initial={editingCase}
            onSave={handleSave}
            onCancel={() => {
              setView("list");
              setEditingCase(null);
            }}
          />
        </div>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Total Cases",
                value: cases.length,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Easy",
                value: cases.filter((c) => c.difficulty === "easy").length,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Medium",
                value: cases.filter((c) => c.difficulty === "medium").length,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Hard",
                value: cases.filter((c) => c.difficulty === "hard").length,
                color: "text-red-600",
                bg: "bg-red-50",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-xl ${s.bg} border border-white px-5 py-4 flex items-center gap-3`}
              >
                <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                className={inputCls + " pl-9"}
                placeholder="Search cases…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <select
              className={selectCls + " w-auto"}
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              onClick={loadCases}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition"
            >
              Refresh
            </button>
            <span className="text-xs text-slate-400 ml-auto">
              {filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Cases grid */}
          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Loading cases…
            </div>
          )}

          {fetchError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
              <AlertTriangle size={16} />
              {fetchError}
            </div>
          )}

          {!loading && !fetchError && filteredCases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
              <Stethoscope size={36} className="opacity-30" />
              <p className="text-sm">
                {searchQuery || filterDifficulty !== "all"
                  ? "No cases match your filters."
                  : "No cases yet. Create your first one!"}
              </p>
              {!searchQuery && filterDifficulty === "all" && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={15} /> New Case
                </button>
              )}
            </div>
          )}

          {!loading && !fetchError && filteredCases.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCases.map((c) => (
                <CaseCard
                  key={c.case_id}
                  c={c}
                  onEdit={() => openEdit(c)}
                  onDelete={() => setDeleteCandidate(c)}
                  onPreview={() => setPreviewCase(c)}
                />
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
