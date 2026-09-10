'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ProjectMissionControlPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<any>(null);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amountZar, setAmountZar] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadMissionControlData() {
      // 1. Fetch Project
      const { data: projData } = await supabase
        .from('projects')
        .select('*, profiles(full_name, email, company_name)')
        .eq('id', projectId)
        .single();
      setProject(projData);

      // 2. Fetch Onboarding
      const { data: onboardingData } = await supabase
        .from('project_onboarding')
        .select('*')
        .eq('project_id', projectId)
        .single();
      setOnboarding(onboardingData);

      // 3. Fetch Milestones
      const { data: milestoneData } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      setMilestones(milestoneData || []);

      // 4. Fetch Client Files
      const { data: fileData } = await supabase
        .from('client_files')
        .select('*')
        .eq('project_id', projectId);
      setFiles(fileData || []);

      setLoading(false);
    }

    if (projectId) loadMissionControlData();
  }, [projectId]);

  const toggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    const updatedStatus = !currentStatus;
    
    // Optimistic UI Update
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, is_completed: updatedStatus } : m))
    );

    await supabase
      .from('milestones')
      .update({ is_completed: updatedStatus, completed_at: updatedStatus ? new Date().toISOString() : null })
      .eq('id', milestoneId);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceFile || !project) return;

    setSubmittingInvoice(true);
    setInvoiceMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', invoiceFile);
      formData.append('folderId', project.google_drive_folder_id || '');

      // Upload PDF to Google Drive via our upload API
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload invoice to Drive');
      }

      // Save Invoice Metadata to Supabase
      const { error: dbError } = await supabase.from('invoices').insert({
        client_id: project.client_id,
        invoice_number: invoiceNumber,
        amount_zar: parseFloat(amountZar),
        due_date: dueDate,
        status: 'unpaid',
        pdf_drive_file_id: uploadData.file.id,
      });

      if (dbError) throw dbError;

      setInvoiceMessage('Invoice created and synced to Google Drive successfully!');
      setInvoiceNumber('');
      setAmountZar('');
      setDueDate('');
      setInvoiceFile(null);
    } catch (err: any) {
      setInvoiceMessage(`Error: ${err.message}`);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400 p-8 animate-pulse">Loading Mission Control...</div>;
  }

  return (
    <div className="max-w-6xl space-y-10 pb-16">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
            {project?.status}
          </span>
          <h1 className="text-3xl font-bold text-white mt-2">{project?.title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Client: <span className="text-white font-medium">{project?.profiles?.full_name}</span> ({project?.profiles?.company_name || project?.profiles?.email})
          </p>
        </div>
        <div className="text-right bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-sm text-slate-400">Target Launch Date</div>
          <div className="text-lg font-semibold text-white">{project?.target_launch_date || 'Not specified'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Read-Only Onboarding & Files */}
        <div className="lg:col-span-2 space-y-8">
          {/* Read-Only Onboarding Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-4">Client Onboarding Answers</h2>
            {onboarding ? (
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Business Goals</span>
                  <p className="text-slate-300 mt-0.5 bg-slate-950 p-3 rounded-lg border border-slate-800/60">{onboarding.business_goals || onboarding.primary_goal || 'No data provided'}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Brand Identity & Vibe</span>
                  <p className="text-slate-300 mt-0.5 bg-slate-950 p-3 rounded-lg border border-slate-800/60">{onboarding.brand_identity || onboarding.brand_vibe || 'No data provided'}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Tech Infrastructure & Hosting</span>
                  <p className="text-slate-300 mt-0.5 bg-slate-950 p-3 rounded-lg border border-slate-800/60">{onboarding.tech_infrastructure || onboarding.domain_status || 'No data provided'}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Design & Web Requirements</span>
                  <p className="text-slate-300 mt-0.5 bg-slate-950 p-3 rounded-lg border border-slate-800/60">{onboarding.design_preferences || onboarding.must_have_features || 'No data provided'}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">No onboarding form submitted yet.</p>
            )}
          </div>

          {/* Linked Google Drive Files */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-4">Google Drive Client Files</h2>
            {files.length > 0 ? (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-sm font-medium text-slate-300 truncate max-w-xs">{file.file_name}</span>
                    <a
                      href={`https://drive.google.com/file/d/${file.drive_file_id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline font-medium"
                    >
                      View on Drive ↗
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">No files uploaded for this project yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Milestones & Invoice Generator */}
        <div className="space-y-8">
          {/* Interactive Milestones */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-4">Milestones Tracker</h2>
            <div className="space-y-3">
              {milestones.length > 0 ? (
                milestones.map((m) => (
                  <label key={m.id} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={m.is_completed}
                      onChange={() => toggleMilestone(m.id, m.is_completed)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className={`text-sm font-medium block ${m.is_completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {m.title}
                      </span>
                      {m.due_date && <span className="text-xs text-slate-500">Due: {m.due_date}</span>}
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">No milestones defined for this project.</p>
              )}
            </div>
          </div>

          {/* Invoice Generation Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-4">Generate & Issue Invoice</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Amount (ZAR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountZar}
                  onChange={(e) => setAmountZar(e.target.value)}
                  placeholder="e.g. 4500.00"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Upload Invoice PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => e.target.files?.[0] && setInvoiceFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={submittingInvoice}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {submittingInvoice ? 'Uploading & Saving...' : 'Issue Invoice'}
              </button>

              {invoiceMessage && (
                <p className={`text-xs p-2.5 rounded-lg border ${invoiceMessage.startsWith('Error') ? 'bg-red-950/50 border-red-500/50 text-red-200' : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'}`}>
                  {invoiceMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}