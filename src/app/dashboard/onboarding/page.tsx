'use client';

import { useState, useEffect, useRef } from 'react';
import { getOnboardingProgress, saveOnboardingProgress } from '@/lib/actions/onboarding';
import { useDebounce } from '@/hooks/use-debounce';

interface OnboardingData {
  business_name: string;
  business_goals: string;
  brand_identity: string;
  content_strategy: string;
  tech_infrastructure: string;
  design_preferences: string;
}

export default function OnboardingPage() {
  const [formData, setFormData] = useState<OnboardingData>({
    business_name: '',
    business_goals: '',
    brand_identity: '',
    content_strategy: '',
    tech_infrastructure: '',
    design_preferences: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isFirstRender = useRef(true);

  // Fetch initial data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const result = await getOnboardingProgress();
      if (result.success && result.data) {
        setFormData({
          business_name: result.data.business_name || '',
          business_goals: result.data.business_goals || '',
          brand_identity: result.data.brand_identity || '',
          content_strategy: result.data.content_strategy || '',
          tech_infrastructure: result.data.tech_infrastructure || '',
          design_preferences: result.data.design_preferences || '',
        });
      }
      setIsLoading(false);
    };

    fetchInitialData();
  }, []);

  const debouncedData = useDebounce(formData, 800);

  // Auto-save effect
  useEffect(() => {
    // Skip if we are still loading initial data or on first render
    if (isLoading) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const autoSave = async () => {
      setSaveStatus('saving');
      const result = await saveOnboardingProgress(debouncedData);
      
      if (result.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    };

    autoSave();
  }, [debouncedData, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Block rendering the form until the data is fetched to avoid overwriting existing data with empty strings
  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-8 pb-12 animate-pulse">
        <div className="h-8 w-1/3 bg-slate-800 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
        <div className="mt-8 space-y-6">
          <div className="h-40 w-full bg-slate-800/50 rounded-2xl"></div>
          <div className="h-40 w-full bg-slate-800/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Onboarding</h1>
          <p className="mt-1 text-sm text-slate-400">
            Tell us about your requirements. Your progress is saved automatically as you type.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm font-medium">
          {saveStatus === 'saving' && <span className="text-amber-400 animate-pulse">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-emerald-400">✓ Saved</span>}
          {saveStatus === 'error' && <span className="text-red-400">Failed to save</span>}
        </div>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-medium text-white mb-4">1. Business Overview</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Primary Goals</label>
              <textarea
                name="business_goals"
                value={formData.business_goals}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="What is the main objective of this project?"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-medium text-white mb-4">2. Brand Identity</h2>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Brand Guidelines & Vibe</label>
            <textarea
              name="brand_identity"
              value={formData.brand_identity}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Describe your desired brand identity (colors, tone, logo requirements, etc.)"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-medium text-white mb-4">3. Digital Infrastructure & Tech Access</h2>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Hosting, Domains & Accounts</label>
            <textarea
              name="tech_infrastructure"
              value={formData.tech_infrastructure}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="List any existing domains, preferred digital infrastructure, or hosting platforms we should use."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-medium text-white mb-4">4. Web App & Design Preferences</h2>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Web Development Requirements</label>
            <textarea
              name="design_preferences"
              value={formData.design_preferences}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Any specific features, reference websites, or layouts you want included in the web development phase?"
            />
          </div>
        </section>
      </form>
    </div>
  );
}