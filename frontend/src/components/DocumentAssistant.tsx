import React, { useState } from 'react';
import { 
  FileSearch, 
  Send, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink, 
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { queryRAG } from '../services/api';

export const DocumentAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      role: 'system',
      message: 'Hello! I am your SEBI RIA Document Grounding Assistant. Ask any question regarding indexed mutual fund Scheme Information Documents (SIDs), factsheets, or the hackathon rulebook. All claims are supported with exact page citations.',
      citations: []
    }
  ]);

  const sampleQueries = [
    "What is the exit load structure disclosed in the Scheme Information Document?",
    "What are the principal risk factors and time horizon suitability stated in the SID?",
    "What is the Total Expense Ratio (TER) cap specified for the scheme?",
    "What are the PS4 evaluation personas in the hackathon rulebook?"
  ];

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    const userMsg = queryText.trim();
    setQuery('');
    setLoading(true);

    // Add user message to UI
    setChatHistory(prev => [...prev, { role: 'user', message: userMsg, citations: [] }]);

    try {
      const res = await queryRAG(userMsg);
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          message: res.answer,
          citations: res.citations || [],
          evidenceFound: res.evidence_found,
          providerUsed: res.provider_used
        }
      ]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          message: 'Error communicating with document retrieval service. Please ensure the backend is running.',
          citations: [],
          evidenceFound: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Mutual Fund Document Assistant (RAG)</h1>
        <p className="text-slate-500 text-sm">
          Strictly evidence-grounded Q&A over Scheme Information Documents (SIDs) and Factsheets with exact PDF page-level citations.
        </p>
      </div>

      {/* Suggested Quick Queries */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
          <HelpCircle size={14} />
          <span>Quick Sample Queries Grounded in Verified Documents:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 rounded-lg text-slate-600 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Transcript Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {chatHistory.map((item, index) => {
            const isUser = item.role === 'user';
            return (
              <div 
                key={index} 
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-teal-600 text-white rounded-br-none' 
                    : item.role === 'system'
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-line">{item.message}</div>

                  {/* Provider Pill */}
                  {item.providerUsed && (
                    <div className="mt-2 text-[10px] text-slate-400 font-mono">
                      Grounding: {item.providerUsed}
                    </div>
                  )}

                  {/* Page-Level Citations Box */}
                  {item.citations && item.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                        <BookOpen size={14} className="text-teal-600" />
                        <span>Verified Source Citations ({item.citations.length} Passages Found):</span>
                      </div>
                      <div className="space-y-2">
                        {item.citations.map((cite: any, cIdx: number) => (
                          <div 
                            key={cIdx} 
                            className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-teal-800 font-semibold">
                              <span className="flex items-center space-x-1">
                                <FileText size={12} />
                                <span>{cite.document_name}</span>
                              </span>
                              <span className="px-2 py-0.5 bg-teal-100 text-teal-900 rounded font-bold">
                                Page {cite.page_number}
                              </span>
                            </div>
                            <p className="text-slate-600 italic">"{cite.passage}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.evidenceFound === false && item.role !== 'system' && (
                    <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center space-x-2">
                      <AlertCircle size={14} />
                      <span>Evidence not found in indexed documents. Factual statements withheld.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
              <Sparkles size={14} className="animate-spin text-teal-600" />
              <span>Searching indexed documents & validating citations...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-xl flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question about fund risks, expense ratios, asset allocations, or rules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={() => handleSend(query)}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-1 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
