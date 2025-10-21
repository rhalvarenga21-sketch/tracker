
export type Region = 'Americas' | 'Asia Pacific' | 'EMEA' | 'Middle and Eastern Europe';
export type ConnectType = 'Email' | 'Meeting' | 'Phone call';
export type TicketStatus = 'Pending (Partner Action)' | 'Pending (Internal Action)' | 'Resolved';

export interface Ticket {
    id: string;
    connectDate: string;
    partnerId: string;
    partnerName: string;
    region: Region;
    typeOfConnect: ConnectType;
    discussionArea: string;
    discussionSubArea: string;
    actionTaken: string;
    currentStatus: TicketStatus;
}
