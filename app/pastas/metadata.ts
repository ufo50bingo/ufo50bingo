import { BLITZ } from './blitz';
import { CAMPANELLA3 } from './campanella3';
import { CHOCO } from './choco';
import { CLARITY } from './clarity';
import { NOZZLO } from './nozzlo';
import { SPICY } from './spicy';
import { STANDARD } from './standard';

export const METADATA = [
  {
    name: 'Standard',
    update_time: 1754679600,
    pasta: STANDARD,
    isMenu: false,
  },
  {
    name: 'Spicy',
    update_time: 1754679600,
    pasta: SPICY,
    isMenu: false,
  },
  {
    name: 'Blitz',
    update_time: 1754679600,
    pasta: BLITZ,
    isMenu: false,
  },
  {
    name: 'Nozzlo',
    update_time: 1754679600,
    pasta: NOZZLO,
    isMenu: false,
  },
  {
    name: 'Choco',
    update_time: 1754679600,
    pasta: CHOCO,
    isMenu: true,
  },
  {
    name: 'Campanella 3',
    update_time: 1754679600,
    pasta: CAMPANELLA3,
    isMenu: true,
  },
  {
    name: 'Clarity',
    update_time: 1754679600,
    pasta: CLARITY,
    isMenu: true,
  },
] as const;
