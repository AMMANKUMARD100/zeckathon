import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { fetchClients, createClient, deleteClient } from '../services/api';

interface ClientManagerProps {
  onSelectClient?: (client: any) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ onSelectClient }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    persona_tag: 'custom_advisory',
    age: 30,
    city: 'Mumbai',
    occupation: 'Professional',
    household_details: 'Single',
    monthly_take_home_income: 75000,
    essential_monthly_expenses: 35000,
    discretionary_monthly_expenses: 15000,
    existing_savings_investments: 100000,
    emergency_savings: 50000,
    outstanding_loans_liabilities: 0,
    immediate_liquidity_needs: 10000,
    risk_tolerance_stated: 'moderate',
    financial_loss_capacity: 'medium',
    investment_experience_years: 3,
    has_fo_trading_history: false,
    fo_drawdown_amount: 0,
    special_constraints: ''
  });

  const loadClientList = () => {
    fetchClients(search)
      .then(data => setClients(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadClientList();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createClient(formData);
      setShowWizard(false);
      setStep(1);
      loadClientList();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this client record?')) {
      await deleteClient(id);
      loadClientList();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Client Profiling & KYC Registry</h1>
          <p className="text-slate-500 text-sm">
            SEBI Regulation 17 compliant risk-capacity profiling separating psychological tolerance from financial loss capacity.
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm flex items-center space-x-2 shadow transition-colors"
        >
          <UserPlus size={16} />
          <span>New Client Profile</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by client name, persona tag, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Client Name</th>
                <th className="px-5 py-3">Age / City</th>
                <th className="px-5 py-3">Monthly Income</th>
                <th className="px-5 py-3">Stated Tolerance vs Capacity</th>
                <th className="px-5 py-3">F&O History</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.length > 0 ? (
                clients.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    onClick={() => onSelectClient && onSelectClient(c)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{c.full_name}</div>
                      {c.persona_tag && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          {c.persona_tag}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.age} yrs • {c.city || 'India'}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      ₹{c.monthly_take_home_income?.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="capitalize font-medium text-slate-700">{c.risk_tolerance_stated}</span>
                        <span className="text-slate-400">/</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          c.financial_loss_capacity === 'low' ? 'bg-rose-50 text-rose-600' :
                          c.financial_loss_capacity === 'high' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {c.financial_loss_capacity?.toUpperCase()} Capacity
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.has_fo_trading_history ? (
                        <span className="inline-flex items-center space-x-1 text-rose-600 text-xs font-semibold">
                          <TrendingDown size={14} />
                          <span>-₹{c.fo_drawdown_amount?.toLocaleString('en-IN')}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => handleDelete(c.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No client profiles found. Click "New Client Profile" or load an official Persona from the Suitability Lab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profiling Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">SEBI RIA Client Profiling Wizard</h3>
                <p className="text-xs text-slate-300">Regulation 17 KYC & Loss-Bearing Capacity Protocol</p>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-teal-500 font-bold text-navy-900' : 'bg-navy-800 text-slate-400'}`}>1. Demographics</span>
                <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-teal-500 font-bold text-navy-900' : 'bg-navy-800 text-slate-400'}`}>2. Cashflow & Debt</span>
                <span className={`px-2 py-1 rounded ${step === 3 ? 'bg-teal-500 font-bold text-navy-900' : 'bg-navy-800 text-slate-400'}`}>3. Risk & Loss Capacity</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g. Ramesh Iyer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Age *</label>
                      <input
                        type="number"
                        required
                        min="18"
                        max="100"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Household / Dependents Details</label>
                    <input
                      type="text"
                      value={formData.household_details}
                      onChange={(e) => setFormData({ ...formData, household_details: e.target.value })}
                      placeholder="e.g. Married, 2 school-going children, dependent parents"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Take-Home Income (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formData.monthly_take_home_income}
                        onChange={(e) => setFormData({ ...formData, monthly_take_home_income: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Essential Monthly Expenses (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formData.essential_monthly_expenses}
                        onChange={(e) => setFormData({ ...formData, essential_monthly_expenses: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Discretionary Monthly Expenses (₹)</label>
                      <input
                        type="number"
                        value={formData.discretionary_monthly_expenses}
                        onChange={(e) => setFormData({ ...formData, discretionary_monthly_expenses: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Liquid Buffer (₹)</label>
                      <input
                        type="number"
                        value={formData.emergency_savings}
                        onChange={(e) => setFormData({ ...formData, emergency_savings: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Savings & Investments (₹)</label>
                      <input
                        type="number"
                        value={formData.existing_savings_investments}
                        onChange={(e) => setFormData({ ...formData, existing_savings_investments: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Outstanding Loans & Liabilities (₹)</label>
                      <input
                        type="number"
                        value={formData.outstanding_loans_liabilities}
                        onChange={(e) => setFormData({ ...formData, outstanding_loans_liabilities: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>
                      <strong>SEBI Suitability Prudence:</strong> A client's stated risk willingness (tolerance) cannot override their objective financial loss-bearing capacity.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Stated Risk Tolerance *</label>
                      <select
                        value={formData.risk_tolerance_stated}
                        onChange={(e) => setFormData({ ...formData, risk_tolerance_stated: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="conservative">Conservative (Capital preservation priority)</option>
                        <option value="moderate">Moderate (Balanced growth and risk)</option>
                        <option value="aggressive">Aggressive (High market drawdown willingness)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Financial Loss-Bearing Capacity *</label>
                      <select
                        value={formData.financial_loss_capacity}
                        onChange={(e) => setFormData({ ...formData, financial_loss_capacity: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="low">Low (Cannot afford capital impairment)</option>
                        <option value="medium">Medium (Moderate drawdown capacity)</option>
                        <option value="high">High (Substantial surplus, multi-year recovery capacity)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Market Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.investment_experience_years}
                        onChange={(e) => setFormData({ ...formData, investment_experience_years: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">F&O Trading History</label>
                      <div className="flex items-center space-x-4 mt-2">
                        <label className="flex items-center space-x-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.has_fo_trading_history}
                            onChange={(e) => setFormData({ ...formData, has_fo_trading_history: e.target.checked })}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span>Active / Past F&O Exposure</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.has_fo_trading_history && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                      <label className="block text-xs font-semibold text-rose-800 mb-1">Historical F&O Drawdown / Loss Amount (₹)</label>
                      <input
                        type="number"
                        value={formData.fo_drawdown_amount}
                        onChange={(e) => setFormData({ ...formData, fo_drawdown_amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm"
                        placeholder="e.g. 650000"
                      />
                      <p className="text-xs text-rose-600 mt-1">
                        Required for SEBI derivative risk profiling guardrails.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-navy-800 text-white rounded-lg text-sm font-medium hover:bg-navy-900 disabled:opacity-50"
                  >
                    {loading ? 'Saving Profile...' : 'Save & Verify Profile'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
