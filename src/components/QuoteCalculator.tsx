'use client'; // Tells Next.js this component runs in the browser

import { useState, useEffect, ChangeEvent } from 'react';

// ── Pricing Configuration ──────────────────────────────────────────
const PRICING = {
    websiteType: { 'Informational': 1500, 'E-commerce Store': 5000, 'Portfolio/Personal': 1200, 'Custom Web Application': null },
    websiteSecurity: 300,
    onPageOptimization: 400,
    advancedSEO: 900
};

export default function QuoteCalculator() {
    // 1. Define the state (memory) of the form
    const [selections, setSelections] = useState({
        websiteType: '',
        websiteSecurity: false,
        onPageOptimization: false,
        advancedSEO: false,
    });

    const [priceDisplay, setPriceDisplay] = useState({ total: 0, consultationRequired: false });

    // 2. Handle input changes dynamically
    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelections({ ...selections, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelections({ ...selections, [e.target.name]: e.target.checked });
    };

    // 3. Automatically calculate price whenever selections change
    useEffect(() => {
        let total = 0;
        let requiresConsult = false;

        // Check dropdowns
        if (selections.websiteType) {
            const val = PRICING.websiteType[selections.websiteType as keyof typeof PRICING.websiteType];
            val === null ? (requiresConsult = true) : (total += val);
        }

        // Check booleans
        if (selections.websiteSecurity) total += PRICING.websiteSecurity;
        if (selections.onPageOptimization) total += PRICING.onPageOptimization;
        if (selections.advancedSEO) total += PRICING.advancedSEO;

        setPriceDisplay({ total, consultationRequired: requiresConsult });
    }, [selections]);

    return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-td-purple mb-6">Customize Your Package</h2>
        
        <form className="space-y-6">
            {/* Select Input */}
            <div>
                <label className="block text-sm font-semibold text-td-dark mb-2">Website Type</label>
                <select 
                    name="websiteType" 
                    value={selections.websiteType} 
                    onChange={handleSelectChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-td-accent focus:border-td-accent transition-shadow bg-gray-50"
                >
                    <option value="">Select an option...</option>
                    <option value="Informational">Informational</option>
                    <option value="E-commerce Store">E-commerce Store</option>
                    <option value="Custom Web Application">Custom Web Application</option>
                </select>
            </div>

            {/* Checkbox Inputs */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                    <input 
                        type="checkbox" 
                        name="websiteSecurity" 
                        checked={selections.websiteSecurity} 
                        onChange={handleCheckboxChange} 
                        className="w-5 h-5 text-td-purple rounded focus:ring-td-accent border-gray-300" 
                    />
                    <span className="font-medium text-td-dark">Website Security (+R300)</span>
                </label>
                <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                    <input 
                        type="checkbox" 
                        name="advancedSEO" 
                        checked={selections.advancedSEO} 
                        onChange={handleCheckboxChange} 
                        className="w-5 h-5 text-td-purple rounded focus:ring-td-accent border-gray-300" 
                    />
                    <span className="font-medium text-td-dark">Advanced SEO (+R900)</span>
                </label>
            </div>
        </form>

        {/* Dynamic Price Display */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border-l-4 border-td-accent">
            <h3 className="text-2xl font-bold text-td-purple">
                Estimated Price: {priceDisplay.consultationRequired ? 'R TBD' : `R ${priceDisplay.total.toLocaleString('en-ZA')}`}
            </h3>
            {priceDisplay.consultationRequired && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                    * Some of your selections require a personalized consultation.
                </p>
            )}
        </div>
    </div>
);
}