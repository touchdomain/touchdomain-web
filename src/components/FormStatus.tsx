'use client';

interface FormStatusProps {
  type: 'success' | 'error' | null;
  message: string;
}

// Shared confirmation UI for every form on the site (Contact, Consultation,
// Order, Quote) — replaces the plain colored text box every form used
// to show with a small animated checkmark (or shake, for errors) so a
// successful submission actually feels like it landed.
export default function FormStatus({ type, message }: FormStatusProps) {
  if (!type || !message) return null;

  const isError = type === 'error';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-md text-left ${
        isError ? 'bg-red-50 border border-red-100' : 'bg-td-purple/5 border border-td-accent/20'
      }`}
    >
      <svg
        viewBox="0 0 52 52"
        className={`w-7 h-7 shrink-0 ${isError ? 'animate-shakeX' : 'animate-circlePop'}`}
      >
        <circle cx="26" cy="26" r="25" className={isError ? 'fill-red-500' : 'fill-td-purple'} />
        {isError ? (
          <path
            d="M18 18l16 16M34 18L18 34"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M14 27l7 7 17-17"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-checkDraw"
            style={{ strokeDasharray: 48, strokeDashoffset: 48 }}
          />
        )}
      </svg>

      <span
        className={`text-[14px] font-medium animate-fadeSlideUp ${
          isError ? 'text-red-600' : 'text-td-purple'
        }`}
      >
        {message}
      </span>
    </div>
  );
}