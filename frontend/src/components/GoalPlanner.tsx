import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Calculator, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { fetchClients, fetchClientGoals, createGoal, generateProposal } from '../services/api';

interface GoalPlannerProps {
  onProposalGenerated?: (proposal: any) => void;
}

export const GoalPlanner: React.FC<GoalPlannerProps> = ({ onProposalGenerated }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // New Goal Form
  const [goalForm, setGoalForm] = useState({
    goal_name: '',
    goal_category: 'wealth_creation',
    target_amount: 1000000,
    current_dedicated_savings: 50000,
    time_horizon_years: 5.0,
    is_capital_preservation_priority: false,
    liquidity_frequency: 'none',
    monthly_withdrawal_required: 0,
    assumed_inflation_rate: 6.0
  });

  // Proposal generation override
  const [customReturnRate, setCustomReturnRate] = useState<number | undefined>(undefined);
  const [proposalResult, setProposalResult] = useState<any>(null);

  useEffect(() => {
    fetchClients().then(data => {
      setClients(data);
      if (data.length > 0) {
        setSelectedClientId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientGoals(selectedClientId).then(data => {
        setGoals(data);
        if (data.length > 0) {
          setSelectedGoalId(data[0].id);
        } else {
          setSelectedGoalId('');
        }
      });
    }
  }, [selectedClientId]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    setLoading(true);
    try {
      await createGoal({ ...goalForm, client_id: selectedClientId });
      setShowGoalModal(false);
      const updatedGoals = await fetchClientGoals(selectedClientId);
      setGoals(updatedGoals);
      if (updatedGoals.length > 0) {
        setSelectedGoalId(updatedGoals[updatedGoals.length - 1].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (!selectedClientId || !selectedGoalId) return;
    setLoading(true);
    try {
      const res = await generateProposal({
        client_id: selectedClientId,
        goal_id: selectedGoalId,
        assumed_return_rate: customReturnRate
      });
      setProposalResult(res);
      if (onProposalGenerated) {
        onProposalGenerated(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Goal-Based Portfolio Builder</h1>
        <p className="text-slate-500 text-sm">
          Calculates monthly SIP requirements using verified ordinary annuity mathematics and validates with SEBI suitability checks.
        </p>
      </div>

      {/* Select Client & Select Goal Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.persona_tag || `${c.age} yrs`} - Income: ₹{c.monthly_take_home_income?.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-700">Financial Goal</label>
            <button
              onClick={() => setShowGoalModal(true)}
              className="text-xs text-teal-600 font-semibold hover:text-teal-700 flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Add Goal</span>
            </button>
          </div>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            disabled={goals.length === 0}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white disabled:bg-slate-50"
          >
            {goals.length > 0 ? (
              goals.map(g => (
                <option key={g.id} value={g.id}>
                  {g.goal_name} (Target: ₹{g.target_amount?.toLocaleString('en-IN')} in {g.time_horizon_years} yrs)
                </option>
              ))
            ) : (
              <option value="">No goals found for this client. Please add one.</option>
            )}
          </select>
        </div>
      </div>

      {/* Goal Details & Parameters */}
      {selectedGoal && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 rounded">
                {selectedGoal.goal_category}
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-1">{selectedGoal.goal_name}</h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Target Timeframe</div>
              <div className="font-semibold text-slate-700">{selectedGoal.time_horizon_years} Years ({selectedGoal.time_horizon_years * 12} Months)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Target Amount (FV)</div>
              <div className="text-xl font-bold text-slate-800 mt-1">
                ₹{selectedGoal.target_amount?.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Current Dedicated Savings</div>
              <div className="text-xl font-bold text-slate-800 mt-1">
                ₹{selectedGoal.current_dedicated_savings?.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Net Gap / Shortfall</div>
              <div className="text-xl font-bold text-slate-800 mt-1">
                ₹{Math.max(0, selectedGoal.target_amount - selectedGoal.current_dedicated_savings)?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateProposal}
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm shadow flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Calculator size={18} />
              <span>{loading ? 'Evaluating Suitability & Sinking Fund...' : 'Generate Compliant Proposal'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Generated Proposal Card */}
      {proposalResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-lg font-bold text-sm ${
                proposalResult.suitability.decision === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
                proposalResult.suitability.decision === 'FLAG' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {proposalResult.suitability.decision}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Proposal Result: {proposalResult.suitability.decision}</h3>
                <p className="text-xs text-slate-500">Compliance Score: {proposalResult.suitability.score}% • Rules Evaluated: {proposalResult.suitability.rules_evaluated}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Required Monthly SIP</div>
              <div className="text-2xl font-extrabold text-teal-600">
                ₹{proposalResult.calculations.required_monthly_sip?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Proposed Asset Split */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Proposed Asset Allocation</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-xs text-blue-600 font-semibold">Equity Mutual Funds</div>
                <div className="text-xl font-bold text-blue-900 mt-1">{proposalResult.proposed_allocation.equity_pct}%</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs text-slate-600 font-semibold">Debt / Accrual Funds</div>
                <div className="text-xl font-bold text-slate-800 mt-1">{proposalResult.proposed_allocation.debt_pct}%</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                <div className="text-xs text-emerald-600 font-semibold">Liquid / Cash Buffer</div>
                <div className="text-xl font-bold text-emerald-900 mt-1">{proposalResult.proposed_allocation.liquid_cash_pct}%</div>
              </div>
            </div>
          </div>

          {/* Investment Rationale */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
            {proposalResult.rationale}
          </div>

          {/* Suitability Flags & Rejections */}
          {proposalResult.suitability.issues_detected.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-800 font-semibold text-xs">
                <AlertTriangle size={16} />
                <span>Compliance Engine Advisory Issues</span>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                {proposalResult.suitability.issues_detected.map((issue: string, i: number) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Regulatory Risk Disclosures */}
          <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 space-y-1">
            {proposalResult.risk_disclosures.map((d: string, i: number) => (
              <p key={i}>• {d}</p>
            ))}
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Add New Financial Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Child Higher Education Corpus"
                  value={goalForm.goal_name}
                  onChange={(e) => setGoalForm({ ...goalForm, goal_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={goalForm.goal_category}
                    onChange={(e) => setGoalForm({ ...goalForm, goal_category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="wealth_creation">Wealth Creation</option>
                    <option value="emergency">Emergency Reserve</option>
                    <option value="education">Child Education</option>
                    <option value="retirement">Retirement Corpus</option>
                    <option value="healthcare">Parent Healthcare</option>
                    <option value="income_stream">Income Stream (SWP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Horizon (Years) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={goalForm.time_horizon_years}
                    onChange={(e) => setGoalForm({ ...goalForm, time_horizon_years: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={goalForm.target_amount}
                    onChange={(e) => setGoalForm({ ...goalForm, target_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Dedicated Savings (₹)</label>
                  <input
                    type="number"
                    value={goalForm.current_dedicated_savings}
                    onChange={(e) => setGoalForm({ ...goalForm, current_dedicated_savings: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
