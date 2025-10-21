import React from 'react';
import { Ticket, TicketStatus } from '../types';
import TicketItem from './TicketItem';

interface TicketListProps {
    tickets: Ticket[];
    onEdit: (ticket: Ticket) => void;
    onDelete: (id: string) => void;
    getStatusColor: (status: TicketStatus) => string;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, onEdit, onDelete, getStatusColor }) => {
    return (
        <div className="bg-base-200 rounded-lg shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-primary uppercase bg-base-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Partner Name</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Discussion Area</th>
                            <th scope="col" className="px-6 py-3">Action Taken</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <TicketItem
                                key={ticket.id}
                                ticket={ticket}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                getStatusColor={getStatusColor}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TicketList;