import type { ProjectStatus } from '@/lib/database.types';

/**
 * Baseline progress for a project status, used when there are no (or few)
 * delivery milestones so the bar still moves as the project advances through
 * its stages. Milestone-based progress can push it higher.
 */
export const STATUS_PROGRESS: Record<ProjectStatus, number> = {
  discovery: 15,
  in_progress: 50,
  review: 85,
  completed: 100,
  paused: 0, // handled specially — see progressFor()
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  discovery: 'Discovery',
  in_progress: 'In progress',
  review: 'In review',
  completed: 'Completed',
  paused: 'Paused',
};

/** The visible ordered stages a project moves through. */
export const STATUS_STEPS: { status: ProjectStatus; label: string }[] = [
  { status: 'discovery', label: 'Discovery' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'review', label: 'Review' },
  { status: 'completed', label: 'Live' },
];

/**
 * Progress percentage: the higher of the status baseline and the share of
 * delivery milestones completed. `paused` keeps whatever was there.
 */
export function progressFor(
  status: ProjectStatus,
  milestonesTotal: number,
  milestonesDone: number,
  currentPct: number
): number {
  if (status === 'paused') return currentPct;
  if (status === 'completed') return 100;
  const milestonePct = milestonesTotal > 0 ? Math.round((milestonesDone / milestonesTotal) * 100) : 0;
  return Math.max(STATUS_PROGRESS[status], milestonePct);
}
