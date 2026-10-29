import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieChartIcon, 
  Search, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { fetchProposals, fetchProposalById } from '../services/api';

export const ProposalList: React.FC = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProposals().then(data => setProposals(data));
  }, []);

  const handleSelect = async (id: string) => {
    setLoading(true);
    try {
      const p = await fetchProposalById(id);
      setSelectedProposal(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Portfolio Proposals & Explainability Ledger</h1>
        <p className="text-slate-500 text-sm">
          Audit trail of all generated model portfolios, compliance decisions, and mathematical calculation assumptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposal Table List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 font-semibold text-slate-700 text-sm">
            Proposals History ({proposals.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {proposals.length > 0 ? (
              proposals.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedProposal?.id === p.id ? 'bg-teal-50/60 border-l-4 border-teal-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-slate-800 text-sm">{p.client_name}</div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      p.suitability_decision === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
                      p.suitability_decision === 'FLAG' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {p.suitability_decision}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Goal: {p.goal_name}</div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="font-medium text-teal-700">SIP: ₹{p.recommended_monthly_sip?.toLocaleString('en-IN')}/mo</span>
                    <span className="text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No portfolio proposals generated yet.
              </div>
            )}
          </div>
        </div>

        {/* Selected Proposal Audit View */}
        <div className="lg:col-span-2">
          {selectedProposal ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    selectedProposal.suitability_decision === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
                    selectedProposal.suitability_decision === 'FLAG' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedProposal.suitability_decision} ({selectedProposal.suitability_score}%)
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 mt-2">{selectedProposal.goal.name}</h2>
                  <div className="text-xs text-slate-500">
                    Client: {selectedProposal.client.name} • Horizon: {selectedProposal.goal.horizon_years} yrs • Target: ₹{selectedProposal.target_amount?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Assumed Annual Return</div>
                  <div className="text-lg font-bold text-teal-600">{selectedProposal.assumed_return_rate}% p.a.</div>
                  <div className="text-[10px] text-slate-400">Ordinary Annuity Sinking Fund</div>
                </div>
              </div>

              {/* Asset Breakdown */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Portfolio Allocation</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="text-xs text-blue-600 font-semibold">Equity</div>
                    <div className="text-xl font-bold text-blue-900 mt-1">{selectedProposal.allocation.equity_pct}%</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-xs text-slate-600 font-semibold">Debt</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">{selectedProposal.allocation.debt_pct}%</div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="text-xs text-emerald-600 font-semibold">Liquid Cash</div>
                    <div className="text-xl font-bold text-emerald-900 mt-1">{selectedProposal.allocation.liquid_cash_pct}%</div>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Investment Rationale</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedProposal.investment_rationale}
                </div>
              </div>

              {/* Evaluated Rules */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suitability Rule Audit</h3>
                <div className="space-y-2">
                  {selectedProposal.passed_rules?.map((r: any, i: number) => (
                    <div key={i} className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded text-xs flex items-center justify-between text-emerald-900">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span className="font-medium">{r.rule_name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-mono">{r.regulatory_reference}</span>
                    </div>
                  ))}
                  {selectedProposal.failed_rules?.map((r: any, i: number) => (
                    <div key={i} className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs flex items-center justify-between text-rose-900">
                      <div className="flex items-center space-x-2">
                        <XCircle size={14} className="text-rose-600" />
                        <span className="font-semibold">{r.rule_name}: {r.message}</span>
                      </div>
                      <span className="text-[10px] text-rose-700 font-mono">{r.regulatory_reference}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fiduciary Disclaimers */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">Statutory Notice & Disclaimers:</div>
                <p>• Not a SEBI registered investment product recommendation until officially ratified by a registered RIA.</p>
                <p>• Mathematical model assumptions are illustrative. Past performance does not guarantee future results.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
              <PieChartIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p>Select a proposal from the ledger on the left to inspect detailed compliance rules, asset splits, and mathematical notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
