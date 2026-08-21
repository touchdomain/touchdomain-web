'use client';
import { useState, FormEvent } from 'react';
import FormStatus from './FormStatus';

// Computes South African public holidays for a given year. Fixed-date holidays are listed directly; Good Friday and
// Family Day (Easter Monday) are computed from Easter Sunday each year via the
// standard "anonymous Gregorian" algorithm.
// NOTE: this doesn't account for the SA rule that a holiday falling on a Sunday
// shifts the following Monday to also be a holiday, or one-off holidays declared
// by government notice (e.g. election days) — those are rare enough that we're
// comfortable handling them manually if they ever affect a booking.
function getEasterSunday(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function getSAHolidaysForYear(year: number): string[] {
    const toISO = (d: Date) => d.toISOString().split('T')[0];

    const fixedDates = [
        `${year}-01-01`, // New Year's Day
        `${year}-03-21`, // Human Rights Day
        `${year}-04-27`, // Freedom Day
        `${year}-05-01`, // Workers' Day
        `${year}-06-16`, // Youth Day
        `${year}-08-09`, // National Women's Day
        `${year}-09-24`, // Heritage Day
        `${year}-12-16`, // Day of Reconciliation
        `${year}-12-25`, // Christmas Day
        `${year}-12-26`, // Day of Goodwill
    ];

    const easterSunday = getEasterSunday(year);
    const goodFriday = new Date(easterSunday);
    goodFriday.setDate(easterSunday.getDate() - 2);
    const familyDay = new Date(easterSunday);
    familyDay.setDate(easterSunday.getDate() + 1);

    return [...fixedDates, toISO(goodFriday), toISO(familyDay)];
}

function isBookingDateTimeValid(dateTimeString: string) {
    const selectedDate = new Date(dateTimeString);
    const dayOfWeek = selectedDate.getDay();
    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();

    if (dayOfWeek === 0) return { isValid: false, message: 'Sundays are not available for consultations.' };

    const dateString = selectedDate.toISOString().split('T')[0];
    const holidaysThisYear = getSAHolidaysForYear(selectedDate.getFullYear());
    if (holidaysThisYear.includes(dateString)) {
        return { isValid: false, message: 'Selected date is a public holiday and not available for consultations.' };
    }

    if (dayOfWeek === 6) return { isValid: false, message: 'Consultations are only available on weekdays.' };
    
    if (hours < 8 || hours >= 17 || (hours === 17 && minutes > 0)) {
        return { isValid: false, message: 'Consultations are only available between 8:00 AM and 5:00 PM.' };
    }

    return { isValid: true, message: '' };
}

export default function ConsultationModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', datetime: '', reason: '', budget: '', timeline: '' });
    const [status, setStatus] = useState<{ type: 'error' | 'success' | null, message: string }>({ type: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Honeypot — real visitors never see or fill this field.
    const [website, setWebsite] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        // Run your custom validation first
        const validation = isBookingDateTimeValid(formData.datetime);
        if (!validation.isValid) {
            setStatus({ type: 'error', message: validation.message });
            return;
        }

        setIsSubmitting(true);
        try {
            // Send data to the backend API route
            const payload = {
                consultationName: formData.name,
                consultationEmail: formData.email,
                consultationPhone: formData.phone,
                consultationDateTime: formData.datetime,
                consultationReason: formData.reason,
                consultationBudget: formData.budget,
                consultationTimeline: formData.timeline,
                website // honeypot — should always be empty for real submissions
            };

            const response = await fetch('/api/book-consultation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            // Parse the actual response from your Node.js server
            const result = await response.json();

            if (response.ok) {
                // The server successfully sent the email
                setStatus({ type: 'success', message: result.message || 'Consultation booked successfully!' });
                
                // Wait 3 seconds so the user can read the success message, then close modal
                setTimeout(() => {
                    onClose();
                    setStatus({ type: null, message: '' });
                    setWebsite('');
                }, 3000);
            } else {
                // The server threw an error (e.g., missing fields, SMTP failure)
                setStatus({ type: 'error', message: result.message || 'Failed to book consultation.' });
            }
        } catch (error) {
            console.error("Booking submission error:", error);
            setStatus({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-td-purple">Book Free Consultation</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                        <div>
                            <label className="block text-sm font-medium text-td-purple mb-1">Full Name</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-0 border-b-2 border-td-purple bg-white py-2 outline-none focus:border-td-accent transition-colors" placeholder="Enter your full name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-td-purple mb-1">Email Address</label>
                            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-0 border-b-2 border-td-purple bg-white py-2 outline-none focus:border-td-accent transition-colors" placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-td-purple mb-1">Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-0 border-b-2 border-td-purple bg-white py-2 outline-none focus:border-td-accent transition-colors" placeholder="081 234 5678" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-td-purple mb-1">What's prompting you to reach out?</label>
                            <select required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors">
                                <option value="" disabled>Select an option</option>
                                <option value="Starting a new business">Starting a new business</option>
                                <option value="My current website needs work">My current website needs work</option>
                                <option value="I don't have a website yet">I don't have a website yet</option>
                                <option value="Not sure yet, that's why I need a chat">Not sure yet, that's why I need a chat</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-td-purple mb-1">Do you have a rough budget in mind?</label>
                            <select required value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors">
                                <option value="" disabled>Select an option</option>
                                <option value="Under R5,000">Under R5,000</option>
                                <option value="R5,000 - R15,000">R5,000 – R15,000</option>
                                <option value="R15,000+">R15,000+</option>
                                <option value="Not sure yet, happy to get guidance">Not sure yet, happy to get guidance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-td-purple mb-1">When are you hoping to get started?</label>
                            <select required value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors">
                                <option value="" disabled>Select an option</option>
                                <option value="ASAP">ASAP</option>
                                <option value="Within the next month">Within the next month</option>
                                <option value="Just exploring for now">Just exploring for now</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-td-purple mb-1">Preferred Date & Time</label>
                            <input type="datetime-local" required value={formData.datetime} onChange={e => setFormData({...formData, datetime: e.target.value})} className="w-full border-0 border-b-2 border-td-purple bg-white py-2 outline-none focus:border-td-accent transition-colors text-gray-600" />
                            <p className="text-xs text-gray-400 mt-1">Weekdays only, 08:00 - 17:00</p>
                        </div>

                        {status.message && (
                            <FormStatus type={status.type} message={status.message} />
                        )}

                        {/* Honeypot — visually and structurally hidden from real users/assistive tech */}
                        <div className="sr-only" aria-hidden="true">
                            <label htmlFor="consult-website">Company Website</label>
                            <input
                                type="text"
                                id="consult-website"
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                value={website}
                                onChange={e => setWebsite(e.target.value)}
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full mt-4 inline-block text-sm px-6 py-3 bg-td-purple text-white rounded-full transition-all hover:bg-td-accent font-semibold disabled:opacity-50">
                            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}