import { getClientOnboarding } from '@/lib/portal-data';
import { PageHeader } from '@/components/portal/ui';
import OnboardingForm from './onboarding-form';

export const metadata = { title: 'Onboarding' };

export default async function OnboardingPage() {
  const onboarding = await getClientOnboarding();

  return (
    <div>
      <PageHeader
        title="Project onboarding"
        subtitle="Tell us about your business and what you need. Everything here goes straight to your project team."
      />
      <OnboardingForm initial={onboarding} />
    </div>
  );
}
