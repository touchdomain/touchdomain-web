"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client"; // Your Supabase browser client
import { generateContractPdf } from "@/lib/pdf/generate"; // We will create this next
import { PACKAGES, CAREPLAN_PLANS, HOSTING_PLANS } from "@/lib/pricing-data";

export default function ContractGenerator() {
  const supabase = createClient();
  const [clients, setClients] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Core Form State
  const [docType, setDocType] = useState("sa"); // 'sa', 'hosting', 'careplan', 'invoice'
  const [agreementDate, setAgreementDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Client State
  const [clientContact, setClientContact] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientReg, setClientReg] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [projectName, setProjectName] = useState("");
  const [sowRef, setSowRef] = useState("");

  // SA State
  const [totalFee, setTotalFee] = useState<number>(0);
  const [deliverables, setDeliverables] = useState("");
  const [outOfScope, setOutOfScope] = useState("");
  const [clientMaterials, setClientMaterials] = useState("");
  const [revisions, setRevisions] = useState(2);

  // Fetch clients on load to populate a quick-select dropdown
  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from("profiles").select("*").eq("role", "client");
      if (data) setClients(data);
    }
    loadClients();
  }, []);

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = clients.find(c => c.id === e.target.value);
    if (selected) {
      setClientContact(selected.full_name || "");
      setClientCompany(selected.company_name || "");
      // You can add address to profiles table later and auto-fill it here
    }
  };

  const handlePackageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pkgKey = e.target.value;
    const pkg = PACKAGES[pkgKey as keyof typeof PACKAGES];
    if (pkg) {
      setDeliverables(pkg.deliverables.join("\n"));
      setTotalFee(pkg.fee);
      setOutOfScope("");
      setClientMaterials("");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Pass all React state directly into your existing PDF logic
      await generateContractPdf({
        docType,
        agreementDate,
        clientContact,
        clientCompany,
        clientReg,
        clientAddress,
        projectName,
        sowRef,
        totalFee,
        deliverables,
        outOfScope,
        clientMaterials,
        revisions
      });
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-baseline">
        <h1 className="text-3xl font-serif font-bold text-slate-900">
          Touch<span className="text-teal-700">Domain</span>
        </h1>
        <span className="text-sm font-mono text-slate-500">Contract Generator</span>
      </header>

      {/* Document Type Selector */}
      <section className="bg-white border border-slate-200 rounded-md p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full border border-teal-600 text-teal-700 flex items-center justify-center font-mono text-xs">0</span>
          Document Type
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { id: "sa", label: "Service Agreement + SOW" },
            { id: "hosting", label: "Hosting & Email Addendum" },
            { id: "careplan", label: "Care Plan / Retainer" },
            { id: "invoice", label: "Invoice" }
          ].map((type) => (
            <label key={type.id} className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer transition-colors ${docType === type.id ? 'border-teal-600 bg-teal-50' : 'border-slate-300'}`}>
              <input type="radio" name="docType" value={type.id} checked={docType === type.id} onChange={(e) => setDocType(e.target.value)} className="accent-teal-600" />
              <span className="text-sm font-medium text-slate-800">{type.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Client Details */}
      <section className="bg-white border border-slate-200 rounded-md p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full border border-teal-600 text-teal-700 flex items-center justify-center font-mono text-xs">1</span>
          Client & Project
        </h2>
        
        {/* Supabase Quick Select */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Autofill from Database (Optional)</label>
          <select onChange={handleClientSelect} className="w-full p-2 border border-slate-300 rounded text-sm">
            <option value="">-- Select an existing client --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.full_name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Client Contact Name *</label>
            <input type="text" value={clientContact} onChange={e => setClientContact(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-600 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Company / Legal Name *</label>
            <input type="text" value={clientCompany} onChange={e => setClientCompany(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-600 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Client Address *</label>
            <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-600 outline-none" />
          </div>
        </div>
      </section>

      {/* Dynamic SOW Section */}
      {docType === 'sa' && (
        <section className="bg-white border border-slate-200 rounded-md p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-teal-600 text-teal-700 flex items-center justify-center font-mono text-xs">2</span>
            Package & Deliverables
          </h2>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Quick Select Package</label>
            <select onChange={handlePackageSelect} className="w-full p-2 border border-slate-300 rounded text-sm">
              <option value="">-- Choose to autofill deliverables --</option>
              {Object.entries(PACKAGES).map(([key, pkg]) => (
                <option key={key} value={key}>{pkg.label} (R{pkg.fee})</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Deliverables</label>
              <textarea value={deliverables} onChange={e => setDeliverables(e.target.value)} rows={5} className="w-full p-2 border border-slate-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Out of Scope</label>
              <textarea value={outOfScope} onChange={e => setOutOfScope(e.target.value)} rows={5} className="w-full p-2 border border-slate-300 rounded text-sm" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Total Fee (ZAR)</label>
            <input type="number" value={totalFee} onChange={e => setTotalFee(parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded text-sm" />
          </div>
        </section>
      )}

      {/* Floating Action Footer */}
      <footer className="sticky bottom-0 bg-gray-50/90 backdrop-blur-md py-4 mt-8 flex justify-end gap-4 border-t border-slate-200">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 px-6 rounded shadow-sm disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate PDF"}
        </button>
      </footer>
    </div>
  );
}