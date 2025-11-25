// Queue Times API park ID mapping
export const QUEUE_TIMES_PARK_IDS: { [key: string]: number } = {
  'magic-kingdom': 6,
  'epcot': 5,
  'hollywood-studios': 7,
  'animal-kingdom': 8,
  'universal-studios-florida': 65,
  'islands-of-adventure': 64,
  'epic-universe': 334,
};

// Park display names
export const PARK_NAMES: { [key: string]: string } = {
  'magic-kingdom': 'Magic Kingdom',
  'epcot': 'EPCOT',
  'hollywood-studios': 'Hollywood Studios',
  'animal-kingdom': 'Animal Kingdom',
  'universal-studios-florida': 'Universal Studios Florida',
  'islands-of-adventure': 'Islands of Adventure',
  'epic-universe': 'Epic Universe',
};

export interface RideWaitTime {
  id: string;
  name: string;
  waitTime: number | null;
  isOpen: boolean;
}
