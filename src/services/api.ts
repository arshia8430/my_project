const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface CaseData {
  id: number;
  case_id: string;
  name: string;
  diagnosis: string;
  condition: string;
  position: string;
  diet: string;
  initial_vitals: {
    hr: number;
    spo2: number;
    bp: string;
    gcs: number;
  };
  stages: any[];
  difficulty: string;
  category: string;
}

export interface ResultData {
  session_id: string;
  case_id: number;
  total_time: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  died: boolean;
  answers_log: any[];
  hints_used: number;
}

export interface StatsData {
  total_sessions: number;
  total_cases: number;
  average_accuracy: number;
  average_time: number;
  average_score: number;
  best_grade_count: Record<string, number>;
  cases_by_difficulty: Record<string, number>;
}

export const api = {
  // Cases API
  async getRandomCase(): Promise<CaseData> {
    const response = await fetch(`${API_BASE_URL}/cases/random`);
    if (!response.ok) throw new Error("Failed to fetch random case");
    return response.json();
  },

  async getAllCases(): Promise<CaseData[]> {
    const response = await fetch(`${API_BASE_URL}/cases/`);
    if (!response.ok) throw new Error("Failed to fetch cases");
    return response.json();
  },

  async getCaseById(caseId: string): Promise<CaseData> {
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}`);
    if (!response.ok) throw new Error("Failed to fetch case");
    return response.json();
  },

  // Results API
  async saveResult(data: ResultData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/results/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to save result");
    return response.json();
  },

  async getResult(sessionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/results/${sessionId}`);
    if (!response.ok) throw new Error("Failed to fetch result");
    return response.json();
  },

  async getRecentResults(limit: number = 10): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/results/?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch recent results");
    return response.json();
  },

  // Statistics API
  async getStatsSummary(): Promise<StatsData> {
    const response = await fetch(`${API_BASE_URL}/stats/summary`);
    if (!response.ok) throw new Error("Failed to fetch stats");
    return response.json();
  },

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/stats/leaderboard?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch leaderboard");
    return response.json();
  },

  async getCaseStats(caseId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/stats/case/${caseId}/stats`);
    if (!response.ok) throw new Error("Failed to fetch case stats");
    return response.json();
  },

  async createCase(data: Omit<CaseData, "id">): Promise<CaseData> {
    const response = await fetch(`${API_BASE_URL}/cases/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to create case");
    }
    return response.json();
  },

  async updateCase(caseId: string, data: Omit<CaseData, "id">): Promise<CaseData> {
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update case");
    }
    return response.json();
  },

  async deleteCase(caseId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to delete case");
    }
  },
};

// Helper function to generate unique session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
