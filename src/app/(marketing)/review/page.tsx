import type { Metadata } from 'next';
import ReviewClient from './ReviewClient';

export const metadata: Metadata = {
  title: 'Leave a Review | Touch Domain',
  description: 'Share your experience working with Touch Domain — your feedback helps other South African businesses find us.',
  alternates: {
    canonical: '/review',
  },
};

export default function ReviewPage() {
  return <ReviewClient />;
}
