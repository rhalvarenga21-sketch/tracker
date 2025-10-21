
import React, { useState, useEffect } from 'react';
import { Ticket, Region, ConnectType, TicketStatus } from '../types';
import { REGIONS, CONNECT_TYPES, STATUSES, DISCUSSION_AREAS, SUB_AREAS } from '../constants';

interface TicketFormProps {
    ticket: Ticket | null;
    onSave: (ticket: Ticket) => void;
    onClose: () => void;
    selectedRegion: Region;
    allTickets: Ticket[];
    getStatusColor: (status: TicketStatus) => string;
}

const TicketForm: React.FC<TicketFormProps> = ({ ticket, onSave, onClose, selectedRegion, allTickets, getStatusColor }) => {
    const [formData, setFormData] = useState<Omit<Ticket, 'id'>>({
        connectDate: ticket?.connectDate || new Date().toISOString().split('T')[0],
        partnerId: ticket?.partnerId || '',
        partnerName: ticket?.partnerName || '',
        region: ticket?.region || selectedRegion,
        typeOfConnect: ticket?.typeOfConnect || 'Email',
        discussionArea: ticket?.discussionArea || Object.values(DISCUSSION_AREAS)[0],
        discussionSubArea: ticket?.discussionSubArea || '',
        actionTaken: ticket?.actionTaken || '',
        currentStatus: ticket?.currentStatus || 'Pending (Internal Action)',
    });

    const [subAreas, setSubAreas] = useState<string[]>([]);
    const [partnerHistory, setPartnerHistory] = useState<Ticket[]>([]);

    useEffect(() => {
        setSubAreas(SUB_AREAS[formData.discussionArea] || []);
        if (ticket?.discussionArea !== formData.discussionArea) {
             setFormData(prev => ({...prev, discussionSubArea: SUB_AREAS[formData.discussionArea]?.[0] || ''}));
        }
    }, [formData.discussionArea, ticket]);
    
     useEffect(() => {
        const partnerIdTrimmed = formData.partnerId.trim();
        const partnerNameTrimmed = formData.partnerName.trim();

        if (!allTickets || allTickets.length === 0) return;

        // If Partner ID is entered and Partner Name is empty, try to find and fill the name.
        if (partnerIdTrimmed && !partnerNameTrimmed) {
            const matchingTicket = allTickets.find(t => t.partnerId.trim().toLowerCase() === partnerIdTrimmed.toLowerCase());
            if (matchingTicket) {
                setFormData(prev => ({ ...prev, partnerName: matchingTicket.partnerName }));
            }
        }
        
        // If Partner Name is entered and Partner ID is empty, try to find and fill the ID.
        else if (partnerNameTrimmed && !partnerIdTrimmed) {
            const matchingTicket = allTickets.find(t => t.partnerName.trim().toLowerCase() === partnerNameTrimmed.toLowerCase());
            if (matchingTicket) {
                setFormData(prev => ({ ...prev, partnerId: matchingTicket.partnerId }));
            }
        }
    }, [formData.partnerId, formData.partnerName, allTickets]);

    useEffect(() => {
        const partnerIdTrimmed = formData.partnerId.trim().toLowerCase();
        const partnerNameTrimmed = formData.partnerName.trim().toLowerCase();

        if (!partnerIdTrimmed && !partnerNameTrimmed) {
            setPartnerHistory([]);
            return;
        }

        const history = allTickets.filter(t => {
            if (ticket && t.id === ticket.id) {
                return false;
            }
            if (partnerIdTrimmed) {
                return t.partnerId.trim().toLowerCase() === partnerIdTrimmed;
            }
            return t.partnerName.trim().toLowerCase() === partnerNameTrimmed;

        }).sort((a, b) => new Date(b.connectDate).getTime() - new Date(a.connectDate).getTime());

        setPartnerHistory(history);

    }, [formData.partnerId, formData.partnerName, allTickets, ticket]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalTicket: Ticket = {
            id: ticket?.id || new Date().getTime().toString(),
            ...formData
        };
        onSave(finalTicket);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-base-200 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                         <h2 className="text-2xl font-bold text-text-primary mb-6">{ticket ? 'Edit Activity' : 'Add New Activity'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Connect Date</label>
                                <input type="date" name="connectDate" value={formData.connectDate} onChange={handleChange} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Partner ID</label>
                                <input type="text" name="partnerId" value={formData.partnerId} onChange={handleChange} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary" placeholder="e.g., 12345" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-1">Partner Name</label>
                                <input type="text" name="partnerName" value={formData.partnerName} onChange={handleChange} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary" required placeholder="e.g., Acme Corp" />
                            </div>
                            
                            {partnerHistory.length > 0 && (
                                <div className="md:col-span-2 mt-2">
                                    <h3 className="text-md font-semibold text-text-primary mb-2 border-b border-slate-600 pb-1">Partner History</h3>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {partnerHistory.map(histTicket => (
                                            <div key={histTicket.id} className="p-3 bg-base-300 rounded-md text-sm border border-slate-700">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="font-semibold text-text-primary">
                                                        {new Date(histTicket.connectDate).toLocaleDateString()}
                                                    </p>
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(histTicket.currentStatus)}`}>
                                                        {histTicket.currentStatus}
                                                    </span>
                                                </div>
                                                <div className="flex items-start text-text-secondary" title={histTicket.actionTaken}>
                                                    <span className="font-medium text-text-secondary/80 whitespace-nowrap">{histTicket.discussionArea}:</span>
                                                    <p className="truncate ml-2 flex-1">
                                                        {histTicket.actionTaken}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Region</label>
                                <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary disabled:bg-slate-700 disabled:text-slate-400" disabled>
                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Type of Connect</label>
                                <select name="typeOfConnect" value={formData.typeOfConnect} onChange={handleChange} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary">
                                    {CONNECT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Discussion Area</label>
                                <select name="discussionArea" value={formData.discussionArea} onChange={handleChange} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary">
                                    {Object.values(DISCUSSION_AREAS).map(area => <option key={area} value={area}>{area}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Discussion Sub-Area</label>
                                <select name="discussionSubArea" value={formData.discussionSubArea} onChange={handleChange} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary" required>
                                    {subAreas.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-1">Action Taken</label>
                                <textarea name="actionTaken" value={formData.actionTaken} onChange={handleChange} rows={4} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Current Status</label>
                                <select name="currentStatus" value={formData.currentStatus} onChange={handleChange} className="w-full bg-base-300 border border-slate-600 rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary">
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-base-300 p-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-text-primary font-semibold rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketForm;
