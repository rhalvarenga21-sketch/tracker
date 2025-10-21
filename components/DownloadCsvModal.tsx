import React, { useState, useMemo } from 'react';
import { Region, Ticket } from '../types';
import { REGIONS } from '../constants';

interface DownloadCsvModalProps {
    onClose: () => void;
    onDownload: (regions: Region[]) => void;
    tickets: Ticket[];
}

const DownloadCsvModal: React.FC<DownloadCsvModalProps> = ({ onClose, onDownload, tickets }) => {
    const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);

    const regionCounts = useMemo(() => {
        const counts = new Map<Region, number>();
        REGIONS.forEach(region => counts.set(region, 0)); // Initialize all regions
        for (const ticket of tickets) {
            counts.set(ticket.region, (counts.get(ticket.region) || 0) + 1);
        }
        return counts;
    }, [tickets]);

    const totalTickets = tickets.length;

    const handleToggleRegion = (region: Region) => {
        setSelectedRegions(prev =>
            prev.includes(region)
                ? prev.filter(r => r !== region)
                : [...prev, region]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRegions(REGIONS);
        } else {
            setSelectedRegions([]);
        }
    };

    const handleDownloadClick = () => {
        if (selectedRegions.length > 0) {
            onDownload(selectedRegions);
        }
    };

    const allSelected = selectedRegions.length === REGIONS.length;
    const isDownloadDisabled = selectedRegions.length === 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-base-200 rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-base-300 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Download CSV Report</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6">
                    <p className="text-text-secondary mb-4">Select the regions to include in your report.</p>
                    <div className="space-y-3">
                        <div className="border-b border-slate-600 pb-3">
                            <label className="flex items-center justify-between space-x-3 cursor-pointer">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded bg-base-300 border-slate-500 text-primary focus:ring-primary"
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                    />
                                    <span className="font-semibold text-text-primary">Select All</span>
                                </div>
                                <span className="text-sm text-text-secondary">({totalTickets} logs)</span>
                            </label>
                        </div>
                        {REGIONS.map(region => (
                            <label key={region} className="flex items-center justify-between space-x-3 cursor-pointer">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded bg-base-300 border-slate-500 text-primary focus:ring-primary"
                                        checked={selectedRegions.includes(region)}
                                        onChange={() => handleToggleRegion(region)}
                                    />
                                    <span>{region}</span>
                                </div>
                                <span className="text-sm text-text-secondary">({regionCounts.get(region) || 0} logs)</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="bg-base-300 p-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-text-primary font-semibold rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDownloadClick}
                        disabled={isDownloadDisabled}
                        className="px-4 py-2 bg-primary hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DownloadCsvModal;