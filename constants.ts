
import { Region, ConnectType, TicketStatus } from './types';

export const REGIONS: Region[] = ['Americas', 'Asia Pacific', 'EMEA', 'Middle and Eastern Europe'];
export const CONNECT_TYPES: ConnectType[] = ['Email', 'Meeting', 'Phone call'];
export const STATUSES: TicketStatus[] = ['Pending (Partner Action)', 'Pending (Internal Action)', 'Resolved'];

export const DISCUSSION_AREAS = {
  HARDWARE: 'Hardware Support',
  SOFTWARE: 'Software Support',
  ACCOUNT: 'Account Management',
  NETWORK: 'Network Issues',
  GENERAL: 'General Inquiry',
};

export const SUB_AREAS: Record<string, string[]> = {
  [DISCUSSION_AREAS.HARDWARE]: [
    'Desktop/Laptop issues',
    'Peripheral issues (mouse, keyboard)',
    'Printer problems',
    'Mobile device support',
    'Other',
  ],
  [DISCUSSION_AREAS.SOFTWARE]: [
    'Application error/crash',
    'Installation/Update request',
    'Feature request',
    'OS issues (Windows, macOS)',
    'Other',
  ],
  [DISCUSSION_AREAS.ACCOUNT]: [
    'Password reset',
    'New account creation',
    'Permission change',
    'Account deletion',
    'Other',
  ],
  [DISCUSSION_AREAS.NETWORK]: [
    'No internet connection',
    'Slow Wi-Fi',
    'VPN access problem',
    'Firewall request',
    'Other',
  ],
  [DISCUSSION_AREAS.GENERAL]: [
    'How-to question',
    'Policy clarification',
    'Status update request',
    'Other',
  ],
};
