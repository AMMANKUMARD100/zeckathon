import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Target, 
  FileCheck2, 
  AlertTriangle, 
  ArrowUpRight, 
  BookOpen, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock
} from 'lucide-react';
import { fetchDashboardSummary } from '../services/api';

interface OverviewProps {
  setCurrentTab: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setCurrentTab }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Disclaimer */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
            <Sparkles size={14} />
            <span>SEBI-Compliant RIA Advisory Architecture</span>
          </div>
          <h1 className="text-2xl font-bold">FinPilot AI — Adviser Cockpit</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Evidence-grounded portfolio builder with deterministic SEBI Regulation 17 guardrails and verbatim Scheme Information Document (SID) citations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setCurrentTab('suitability-lab')}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-navy-900 font-semibold rounded-lg text-sm shadow transition-colors flex items-center space-x-1"
          >
            <span>Launch Evaluation Lab</span>
            <ArrowUpRight size={16} />
          </button>
          <button 
            onClick={() => setCurrentTab('clients')}
            className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white font-medium rounded-lg text-sm transition-colors"
          >
            New Client Profile
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <div className="text-slate-500 text-xs font-medium">Total Clients</div>
            <div className="text-2xl font-bold text-slate-800">{summary?.total_clients ?? 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Target size={24} />
          </div>
          <div>
            <div className="text-slate-500 text-xs font-medium">Active Goals</div>
            <div className="text-2xl font-bold text-slate-800">{summary?.active_goals ?? 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-slate-500 text-xs font-medium">Proposals Created</div>
            <div className="text-2xl font-bold text-slate-800">{summary?.proposals_generated ?? 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-slate-500 text-xs font-medium">Suitability Flags</div>
            <div className="text-2xl font-bold text-amber-600">{summary?.suitability_issues_flagged ?? 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-slate-500 text-xs font-medium">Indexed Docs</div>
            <div className="text-2xl font-bold text-slate-800">{summary?.indexed_documents ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Activity & Quick Evaluation Personas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Advisory Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-slate-500" />
              <h2 className="font-semibold text-slate-800">Recent Proposal Assessments</h2>
            </div>
            <button 
              onClick={() => setCurrentTab('proposals')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
            >
              View All Proposals →
            </button>
          </div>

          {summary?.recent_activity?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {summary.recent_activity.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-slate-800">{item.client_name}</div>
                    <div className="text-xs text-slate-500">Goal: {item.goal_name} • SIP: ₹{item.sip?.toLocaleString('en-IN')}/mo</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.decision === 'PASS' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : item.decision === 'FLAG'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.decision} ({item.score}%)
                    </span>
                    <button 
                      onClick={() => setCurrentTab('proposals')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              No proposal activity yet. Launch the Evaluation Lab or create a new client to start.
            </div>
          )}
        </div>

        {/* Official Competition Track Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold">
            <ShieldCheck size={20} className="text-teal-600" />
            <h3>PS4 Specifications</h3>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              <strong className="text-slate-800">Track 4:</strong> AI Advisory — Compliant Co-pilot for SEBI-registered RIAs.
            </p>
            <p>
              <strong className="text-slate-800">Universal Rules:</strong> Publicly verifiable data, mandatory AI tool disclosure, zero look-ahead bias, and reproducible code.
            </p>
            <p>
              <strong className="text-slate-800">Suitability Mandate:</strong> Regulation 17 KYC & suitability checks must run deterministically. Prohibits recommending speculative instruments without loss-capacity validation.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentTab('suitability-lab')}
              className="w-full py-2.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-medium rounded-lg text-center transition-colors"
            >
              Test 6 Official Rulebook Personas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
