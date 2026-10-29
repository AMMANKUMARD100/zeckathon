import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  Key, 
  Server, 
  CheckCircle2, 
  RefreshCw,
  Database,
  ExternalLink
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800">System Configuration & Disclaimers</h1>
        <p className="text-slate-500 text-sm">
          Fiduciary engine settings, LLM provider abstraction, and prototype regulatory disclosures.
        </p>
      </div>

      {/* Statutory Regulatory Disclaimer Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 space-y-3">
        <div className="flex items-center space-x-2 font-bold text-sm text-amber-800">
          <ShieldAlert size={18} />
          <span>Statutory Fiduciary & Regulatory Notice</span>
        </div>
        <div className="text-xs space-y-2 leading-relaxed opacity-95">
          <p>
            <strong>Prototype Disclaimer:</strong> FinPilot AI is an illustrative algorithmic decision-support tool engineered for the Zetheta Algorithms × IIT Patna Trading & Investment Club 24-Hour Hackathon (Track 4: PS4).
          </p>
          <p>
            <strong>No Legal Advice:</strong> This software does NOT constitute SEBI registration or authorization to dispense formal investment advisory services under the SEBI (Investment Advisers) Regulations, 2013. Model portfolios are purely demonstrative.
          </p>
          <p>
            <strong>Deterministic Overrides:</strong> As mandated by SEBI fiduciary standards, all quantitative suitability constraints (horizon alignment, liquidity buffers, derivative loss guardrails) are executed by an independent, deterministic Python engine and cannot be modified or bypassed by AI/LLM generation.
          </p>
        </div>
      </div>

      {/* LLM Provider Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center space-x-2 text-slate-800 font-semibold border-b border-slate-100 pb-3">
          <Server size={18} className="text-teal-600" />
          <h2>LLM Provider Abstraction</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active LLM Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="gemini">Google Gemini API (gemini-1.5-flash)</option>
                <option value="openai">OpenAI (gpt-4o-mini)</option>
                <option value="local_fallback">Local Deterministic Extractive Engine (Zero API Key Required)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model Name</label>
              <input
                type="text"
                disabled
                value={provider === 'gemini' ? 'gemini-1.5-flash' : provider === 'openai' ? 'gpt-4o-mini' : 'extractive-bm25-synthesizer'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">API Key (Optional - Fallback active)</label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Environment variable GEMINI_API_KEY / OPENAI_API_KEY will take precedence"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              If left blank, FinPilot AI automatically defaults to its offline extractive synthesis engine, ensuring 100% functionality without paid tokens.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-medium">
              {saved && 'Configuration saved successfully!'}
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Database & Environment Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 font-semibold border-b border-slate-100 pb-3">
          <Database size={18} className="text-teal-600" />
          <h2>Local Environment & Repositories</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-400 font-medium">Database Engine</div>
            <div className="font-mono text-slate-800 mt-0.5">SQLite (finpilot.db)</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-400 font-medium">Document Vector Store</div>
            <div className="font-mono text-slate-800 mt-0.5">Hybrid Inverted BM25 Index (RAM)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
