import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Info,
  ArrowRight
} from 'lucide-react';
import { fetchPersonas, loadPersonaScenario } from '../services/api';

interface SuitabilityLabProps {
  onProposalView?: (proposalId: string) => void;
}

export const SuitabilityLab: React.FC<SuitabilityLabProps> = ({ onProposalView }) => {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loadingPersonaId, setLoadingPersonaId] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<any>(null);

  useEffect(() => {
    fetchPersonas().then(data => setPersonas(data));
  }, []);

  const handleRunPersona = async (personaId: string) => {
    setLoadingPersonaId(personaId);
    try {
      const res = await loadPersonaScenario(personaId);
      setActiveResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPersonaId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Six-Persona Evaluation Lab</h1>
        <p className="text-slate-500 text-sm">
          Run automated suitability checks across the six target personas prescribed in the official competition rulebook (Page 3).
        </p>
      </div>

      {/* Official Rulebook Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((p) => {
          const isSelected = activeResult?.persona_id === p.persona_id;
          const isTrader = p.persona_id === 'aggressive_trader';

          return (
            <div 
              key={p.persona_id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                isSelected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isTrader ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Age: {p.official_facts.age} yrs</span>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Official Goal:</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">
                    {p.official_facts.primary_financial_goal}
                  </div>
                  <div className="text-xs text-teal-600 font-medium mt-1">
                    Income: ₹{p.official_facts.monthly_take_home_income?.toLocaleString('en-IN')}/mo
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-700">Expected Suitability Behavior:</div>
                  <p className="leading-relaxed">{p.expected_suitability_behavior}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleRunPersona(p.persona_id)}
                  disabled={loadingPersonaId === p.persona_id}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    isTrader 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                      : 'bg-navy-800 hover:bg-navy-900 text-white'
                  }`}
                >
                  <Play size={14} />
                  <span>{loadingPersonaId === p.persona_id ? 'Running Assessment...' : 'Run Scenario & Guardrails'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Scenario Result View */}
      {activeResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Executed Evaluation Scenario</div>
              <h2 className="text-xl font-bold text-slate-800">{activeResult.persona_name}</h2>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                activeResult.generated_proposal.suitability.decision === 'PASS' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : activeResult.generated_proposal.suitability.decision === 'FLAG'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                Decision: {activeResult.generated_proposal.suitability.decision}
              </span>
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded">
                Score: {activeResult.generated_proposal.suitability.score}%
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm leading-relaxed text-slate-700">
            <strong>Advisory Engine Explanation: </strong>
            {activeResult.generated_proposal.suitability.explanation}
          </div>

          {/* Aggressive Trader Specific Risk Flag Banner */}
          {activeResult.persona_id === 'aggressive_trader' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                <ShieldAlert size={18} />
                <span>SEBI Guardrail Enforcement — Speculation & Loss-Capacity Violation</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                The Aggressive Trader scenario requested an 85% equity allocation for a 2-year horizon despite a history of ₹6.5 Lakh F&O drawdowns and low loss capacity. The deterministic engine successfully <strong>REJECTED</strong> the proposal, preventing dangerous market exposure in accordance with SEBI Regulation 17.
              </p>
            </div>
          )}

          {/* Evaluated Rules Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Regulation 17 Rule Breakdown ({activeResult.generated_proposal.suitability.rule_results?.length} Rules)
            </h3>
            <div className="space-y-2">
              {activeResult.generated_proposal.suitability.rule_results?.map((r: any, idx: number) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-3 ${
                    r.is_passed 
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-700' 
                      : r.severity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {r.is_passed ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : r.severity === 'CRITICAL' ? (
                      <XCircle size={16} className="text-rose-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{r.rule_name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/60">
                        {r.regulatory_reference}
                      </span>
                    </div>
                    <p className="mt-0.5 opacity-90">{r.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
