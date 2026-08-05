'use client';

import React, { useState, FormEvent } from 'react';
import FormStatus from './FormStatus';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string; 
  serviceFeatures: string[];
  servicePrice?: string;
}

export default function OrderModal({ isOpen, onClose, serviceName, serviceFeatures, servicePrice }: OrderModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  // Honeypot field — real visitors never see or fill this in. Left blank on submit
  // for humans; if a bot fills it, the server silently no-ops instead of sending mail.
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          serviceName: serviceName,
          servicePrice: servicePrice || 'TBD',
          features: serviceFeatures,
          website // honeypot — should always be empty for real submissions
        })
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Order received! Check your email.' });
        setTimeout(() => {
          onClose();
          setStatus({ type: null, message: '' });
          setFormData({ name: '', email: '', phone: '' });
          setWebsite('');
        }, 3000);
      } else {
        setStatus({ type: 'error', message: result.message || 'Failed to submit.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
        
        {/* Header */}
        <div className="bg-td-purple p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Order: {serviceName}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Price confirmation — shown before the client commits to anything */}
          {servicePrice && (
            <div className="bg-td-accent/10 border border-td-accent/30 rounded-lg p-4 mb-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-td-purple">Estimated Investment</span>
              <span className="text-xl font-bold text-td-purple">R {servicePrice}</span>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            Please provide your details below. We will send an order summary to your email — including the price shown above — and contact you to confirm the next steps and finalize scope.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-td-purple focus:border-td-purple" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-td-purple focus:border-td-purple" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-td-purple focus:border-td-purple" />
            </div>

            {/* Honeypot — visually and structurally hidden from real users/assistive tech */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="order-website">Company Website</label>
              <input
                type="text"
                id="order-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>

            {status.message && (
                <FormStatus type={status.type} message={status.message} />
            )}

            <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-td-purple hover:bg-td-accent text-white font-bold rounded transition duration-200 disabled:opacity-50">
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}