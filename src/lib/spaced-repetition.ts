export type StatusColor = 'Green' | 'Orange' | 'Yellow' | 'Red';

const STATUS_RANK: Record<StatusColor, number> = {
  Green: 0,
  Orange: 1,
  Yellow: 2,
  Red: 3,
};

/**
 * Compute the effective (decayed) status based on the stored status
 * and the time elapsed since last revision.
 *
 * Decay rules:
 *   Green  → Orange  after 7 days
 *   Orange → Yellow  after 14 days
 *   Yellow → Red     after 21 days
 *   Red    stays Red
 */
export function computeActiveStatus(
  storedStatus: string,
  lastRevisedTimestamp: Date
): StatusColor {
  const now = new Date();
  const diffMs = now.getTime() - lastRevisedTimestamp.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  let status = (storedStatus as StatusColor) || 'Red';

  // Ensure the status is valid
  if (!STATUS_RANK.hasOwnProperty(status)) {
    status = 'Red';
  }

  // Apply decay cascade
  if (status === 'Green' && diffDays > 7) {
    status = 'Orange';
  }
  if (status === 'Orange' && diffDays > 14) {
    status = 'Yellow';
  }
  if (status === 'Yellow' && diffDays > 21) {
    status = 'Red';
  }

  return status;
}

/**
 * Get the weight for quiz selection.
 * Higher weight = more likely to be selected.
 */
export function getQuizWeight(status: StatusColor): number {
  switch (status) {
    case 'Red':
      return 10;
    case 'Yellow':
      return 6;
    case 'Orange':
      return 3;
    case 'Green':
      return 1;
    default:
      return 10;
  }
}
