import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { fetchDocuments, uploadDocument, deleteDocument } from '../services/api';

export const DocumentLibrary: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    fund_house: '',
    scheme_name: '',
    doc_type: 'SID',
    source_notes: 'Public SEBI / AMC filing',
    file: null as File | null
  });

  const loadDocs = () => {
    fetchDocuments().then(data => setDocuments(data));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('file', uploadForm.file);
    fd.append('title', uploadForm.title);
    fd.append('fund_house', uploadForm.fund_house);
    fd.append('scheme_name', uploadForm.scheme_name);
    fd.append('doc_type', uploadForm.doc_type);
    fd.append('source_notes', uploadForm.source_notes);

    try {
      await uploadDocument(fd);
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        fund_house: '',
        scheme_name: '',
        doc_type: 'SID',
        source_notes: 'Public SEBI / AMC filing',
        file: null
      });
      loadDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this document and purge indexed chunks from RAG index?')) {
      await deleteDocument(id);
      loadDocs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Document Management & Evidence Library</h1>
          <p className="text-slate-500 text-sm">
            Central repository for Scheme Information Documents (SIDs), factsheets, and regulatory circulars indexed for semantic retrieval.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm flex items-center space-x-2 shadow transition-colors"
        >
          <Upload size={16} />
          <span>Upload PDF Document</span>
        </button>
      </div>

      {/* Document Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Document Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Fund House / Entity</th>
                <th className="px-5 py-3">Indexed Pages</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length > 0 ? (
                documents.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800 flex items-center space-x-2">
                        <FileText size={16} className="text-teal-600 shrink-0" />
                        <span>{d.title}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{d.filename}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium uppercase">
                        {d.doc_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {d.fund_house || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      {d.total_pages} Pages
                    </td>
                    <td className="px-5 py-3.5">
                      {d.status === 'indexed' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                          <CheckCircle2 size={14} />
                          <span>Indexed</span>
                        </span>
                      ) : d.status === 'pending' ? (
                        <span className="inline-flex items-center space-x-1 text-amber-600 text-xs font-semibold">
                          <Clock size={14} />
                          <span>Processing</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-rose-600 text-xs font-semibold">
                          <AlertCircle size={14} />
                          <span>Error</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No documents indexed yet. Upload a Scheme Information Document (SID) or Factsheet to enable grounded citations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Upload Scheme Information Document</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Top 100 Fund SID 2026"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mutual Fund House</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Mutual Fund"
                    value={uploadForm.fund_house}
                    onChange={(e) => setUploadForm({ ...uploadForm, fund_house: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={uploadForm.doc_type}
                    onChange={(e) => setUploadForm({ ...uploadForm, doc_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="SID">Scheme Information Doc (SID)</option>
                    <option value="factsheet">Monthly Factsheet</option>
                    <option value="KIM">Key Info Memo (KIM)</option>
                    <option value="rulebook">Regulation / Rulebook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select PDF File *</label>
                <input
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files ? e.target.files[0] : null })}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
                >
                  {uploading ? 'Extracting & Indexing Pages...' : 'Upload & Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
