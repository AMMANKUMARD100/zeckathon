const API_BASE = 'http://localhost:8000/api';

export interface ClientProfile {
  id: string;
  full_name: string;
  persona_tag?: string;
  age: number;
  city?: string;
  occupation?: string;
  household_details?: string;
  monthly_take_home_income: number;
  essential_monthly_expenses: number;
  discretionary_monthly_expenses: number;
  existing_savings_investments: number;
  emergency_savings: number;
  outstanding_loans_liabilities: number;
  immediate_liquidity_needs: number;
  risk_tolerance_stated: string;
  financial_loss_capacity: string;
  investment_experience_years: number;
  has_fo_trading_history: boolean;
  fo_drawdown_amount: number;
  special_constraints?: string;
  is_illustrative_test_persona?: boolean;
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  client_id: string;
  goal_name: string;
  goal_category: string;
  target_amount: number;
  current_dedicated_savings: number;
  time_horizon_years: number;
  is_capital_preservation_priority: boolean;
  liquidity_frequency: string;
  monthly_withdrawal_required: number;
  assumed_inflation_rate: number;
  created_at: string;
}

export interface ProposalDetail {
  id: string;
  client: any;
  goal: any;
  shortfall: number;
  recommended_monthly_sip: number;
  assumed_return_rate: number;
  calculation_basis_notes: string;
  allocation: {
    equity_pct: number;
    debt_pct: number;
    liquid_cash_pct: number;
    gold_pct: number;
  };
  allocation_details: Array<{
    asset_class: string;
    category_name: string;
    percentage: number;
    rationale: string;
    sebi_risk_meter: string;
  }>;
  suitability_decision: 'PASS' | 'FLAG' | 'REJECT' | 'INSUFFICIENT_DATA';
  suitability_score: number;
  passed_rules: any[];
  failed_rules: any[];
  flagged_issues: string[];
  required_next_action: string;
  investment_rationale: string;
  risk_disclosures: string[];
  limitations_notes: string;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  fund_house?: string;
  scheme_name?: string;
  category?: string;
  doc_type: string;
  filename: string;
  total_pages: number;
  status: string;
  index_error?: string;
  source_notes?: string;
  file_size_bytes: number;
  created_at: string;
}

export interface PersonaScenario {
  persona_id: string;
  tag: string;
  official_facts: any;
  test_assumptions: any;
  goals: any[];
  expected_suitability_behavior: string;
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  return res.json();
}

export async function fetchClients(search = '') {
  const url = search ? `${API_BASE}/clients/?search=${encodeURIComponent(search)}` : `${API_BASE}/clients/`;
  const res = await fetch(url);
  return res.json();
}

export async function createClient(data: any) {
  const res = await fetch(`${API_BASE}/clients/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteClient(id: string) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchClientGoals(clientId: string) {
  const res = await fetch(`${API_BASE}/goals/client/${clientId}`);
  return res.json();
}

export async function createGoal(data: any) {
  const res = await fetch(`${API_BASE}/goals/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function generateProposal(data: any) {
  const res = await fetch(`${API_BASE}/portfolio/generate-proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchProposals() {
  const res = await fetch(`${API_BASE}/portfolio/proposals`);
  return res.json();
}

export async function fetchProposalById(id: string) {
  const res = await fetch(`${API_BASE}/portfolio/proposals/${id}`);
  return res.json();
}

export async function queryRAG(query: string) {
  const res = await fetch(`${API_BASE}/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents/`);
  return res.json();
}

export async function uploadDocument(formData: FormData) {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function deleteDocument(docId: string) {
  const res = await fetch(`${API_BASE}/documents/${docId}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchPersonas(): Promise<PersonaScenario[]> {
  const res = await fetch(`${API_BASE}/evaluation/personas`);
  return res.json();
}

export async function loadPersonaScenario(personaId: string) {
  const res = await fetch(`${API_BASE}/evaluation/personas/${personaId}/load`, {
    method: 'POST',
  });
  return res.json();
}
