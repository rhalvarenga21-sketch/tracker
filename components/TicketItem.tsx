import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { EditIcon, TrashIcon } from './icons/Icons';

interface TicketItemProps {
    ticket: Ticket;
    onEdit: (ticket: Ticket) => void;
    onDelete: (id: string) => void;
    getStatusColor: (status: TicketStatus) => string;
}

const TicketItem: React.FC<TicketItemProps> = ({ ticket, onEdit, onDelete, getStatusColor }) => {
    return (
        <tr className="bg-base-200 border-b border-base-300 hover:bg-base-300/50 transition-colors duration-200">
            <th scope="row" className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                {ticket.partnerName}
            </th>
            <td className="px-6 py-4">
                {new Date(ticket.connectDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
                {ticket.discussionArea}
            </td>
            <td className="px-6 py-4 max-w-xs" title={ticket.actionTaken}>
                <p className="truncate">
                    {ticket.actionTaken}
                </p>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.currentStatus)}`}>
                    {ticket.currentStatus}
                </span>
            </td>
            <td className="px-6 py-4 flex items-center gap-4">
                <button onClick={() => onEdit(ticket)} className="text-blue-400 hover:text-blue-300 transition-colors" aria-label="Edit item">
                    <EditIcon />
                </button>
                <button onClick={() => onDelete(ticket.id)} className="text-red-500 hover:text-red-400 transition-colors" aria-label="Delete item">
                    <TrashIcon />
                </button>
            </td>
        </tr>
    );
};

export default TicketItem;