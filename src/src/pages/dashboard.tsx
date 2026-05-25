import { useState, useRef } from 'react';
import { useAuth } from '../lib/auth-context';
import { useUsage } from '../lib/use-usage';
import { supabase } from '../lib/supabase';
import { FileText, Upload, Copy, Download, Loader2, AlertCircle, CheckCircle, Sparkles, RotateCcw, Lock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Link } from 'react-router-dom';

type TailorResult = {
  tailoredResume: string;
  keywords: string[];
  changes: string[];
};

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { canUseTailor, incrementUsage, getUsageDisplay, refetch: refetchUsage } = useUsage();
  const [jobDescription, setJobDescription] = useState('');
  const [originalResume, setOriginalResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usage = getUsageDisplay();

  const handleFileUpload = async (file: File) => {
    if (file.type === 'application/pdf') {
      setError('PDF parsing is limited. Please copy/paste your resume text for best results.');
      return;
    }
    if (file.type === 'text/plain') {
      const text = await file.text();
      setOriginalResume(text);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setOriginalResume(text);
    } catch {
      setError('Unable to access clipboard. Please paste manually.');
    }
  };

  const handleTailor = async () => {
    if (!jobDescription.trim() || !originalResume.trim()) {
      setError('Please provide both a job description and your resume');
      return;
    }

    if (!canUseTailor()) {
      setError('You have reached your monthly limit. Upgrade to Pro for unlimited tailors.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tailor-resume`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            jobDescription: jobDescription.trim(),
            originalResume: originalResume.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to tailor resume');
      }

      const data = await response.json();

      setResult({
        tailoredResume: data.tailoredResume,
        keywords: data.keywords || [],
        changes: data.changes || [],
      });

      await incrementUsage();
      await refetchUsage();

      if (user) {
        await supabase.from('tailored_resumes').insert({
          user_id: user.id,
          job_description: jobDescription.trim(),
          original_resume: originalResume.trim(),
          tailored_resume: data.tailoredResume,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.tailoredResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lines = doc.splitTextToSize(result.tailoredResume, maxWidth);
    let y = margin;

    doc.setFontSize(11);
    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 6;
    });

    doc.save('tailored-resume.pdf');
  };

  const handleReset = () => {
    setJobDescription('');
    setOriginalResume('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Lock className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Sign in to Access Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Create an account or sign in to start tailoring your resume
        </p>
        <Link
          to="/auth"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold"
        >
          Get Started Free
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {usage && (
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                {usage.remaining} of {usage.limit} free tailors remaining this month
              </span>
            </div>
          </div>
          {profile?.subscription_tier === 'free' && usage.remaining === 0 && (
            <Link
              to="/pricing"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
            >
              Upgrade for Unlimited
            </Link>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            {error.includes('monthly limit') && (
              <Link to="/pricing" className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2 inline-block">
                Upgrade to Pro for unlimited tailors
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Job Description
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Paste the job posting
              </span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here. Include the job title, responsibilities, requirements, and any specific skills mentioned..."
              className="w-full h-48 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Your Resume
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Paste from Clipboard
                </button>
              </div>
            </div>
            <textarea
              value={originalResume}
              onChange={(e) => setOriginalResume(e.target.value)}
              placeholder="Paste your current resume text here, or upload a file below..."
              className="w-full h-48 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Upload .txt or .pdf file</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleTailor}
              disabled={loading || !jobDescription.trim() || !originalResume.trim()}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tailoring Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Tailor My Resume
                </>
              )}
            </button>
            {(jobDescription || originalResume || result) && (
              <button
                onClick={handleReset}
                className="px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Tailored Resume
              </h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              )}
            </div>

            {result ? (
              <div className="space-y-6">
                {result.keywords.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Keywords Matched
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.changes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Key Changes Made
                    </h3>
                    <ul className="space-y-1">
                      {result.changes.map((change, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Tailored Resume
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto font-mono">
                    {result.tailoredResume}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 dark:text-slate-500">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tailored resume yet</p>
                <p className="text-sm max-w-xs text-center">
                  Add a job description and your resume, then click "Tailor My Resume" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
