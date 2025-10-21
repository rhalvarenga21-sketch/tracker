
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ticket, TicketStatus, Region } from './types';
import Header from './components/Header';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import ReportModal from './components/ReportModal';
import Login from './components/Login';
import DownloadCsvModal from './components/DownloadCsvModal';
import { generateReport } from './services/geminiService';
import { PlusIcon, AiIcon, DownloadIcon } from './components/icons/Icons';
import { REGIONS, STATUSES } from './constants';


const App: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [generatedReport, setGeneratedReport] = useState<string>('');
    const [isReportLoading, setIsReportLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<TicketStatus | 'All'>('All');

    useEffect(() => {
        const storedRegion = localStorage.getItem('activity-tracker-region');
        if (storedRegion) {
            setSelectedRegion(storedRegion as Region);
        }
    }, []);

    useEffect(() => {
        if (selectedRegion) {
            localStorage.setItem('activity-tracker-region', selectedRegion);
        } else {
            localStorage.removeItem('activity-tracker-region');
        }
    }, [selectedRegion]);

    useEffect(() => {
        try {
            const storedTickets = localStorage.getItem('activity-tracker-tickets');
            if (storedTickets) {
                let parsedTickets: Ticket[] = JSON.parse(storedTickets);
                
                // Migrate old data for backwards compatibility
                const statusMap: { [key: string]: TicketStatus } = {
                    'Pending': 'Pending (Internal Action)',
                    'Open': 'Pending (Internal Action)',
                    'Closed': 'Resolved',
                };
                const validStatuses: string[] = ['Pending (Partner Action)', 'Pending (Internal Action)', 'Resolved'];

                parsedTickets = parsedTickets.map(ticket => {
                    const migratedTicket = { ...ticket };
                    let changed = false;

                    // Status migration
                    if (!validStatuses.includes(migratedTicket.currentStatus)) {
                        migratedTicket.currentStatus = statusMap[migratedTicket.currentStatus] || 'Pending (Internal Action)';
                        changed = true;
                    }
                    
                    // Region typo migration
                    if ((migratedTicket.region as string) === 'Middle and Easter Europe') {
                        migratedTicket.region = 'Middle and Eastern Europe';
                        changed = true;
                    }

                    return changed ? migratedTicket : ticket;
                });
                
                setTickets(parsedTickets);
            }
        } catch (err) {
            console.error("Failed to parse tickets from localStorage", err);
            setTickets([]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('activity-tracker-tickets', JSON.stringify(tickets));
    }, [tickets]);

    const handleLogin = (region: Region) => {
        setSelectedRegion(region);
    };

    const handleLogout = () => {
        setSelectedRegion(null);
    };

    const handleOpenFormModal = (ticket: Ticket | null = null) => {
        setEditingTicket(ticket);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingTicket(null);
    };

    const handleSaveTicket = (ticket: Ticket) => {
        if (editingTicket) {
            setTickets(tickets.map(t => (t.id === ticket.id ? ticket : t)));
        } else {
            setTickets([ticket, ...tickets]);
        }
        handleCloseFormModal();
    };

    const handleDeleteTicket = (id: string) => {
        setTickets(tickets.filter(t => t.id !== id));
    };
    
    const ticketsForRegion = tickets.filter(ticket => ticket.region === selectedRegion);

    const filteredTickets = useMemo(() => {
        return ticketsForRegion
            .filter(ticket => {
                if (filterStatus === 'All') return true;
                return ticket.currentStatus === filterStatus;
            })
            .filter(ticket => {
                const lowercasedSearch = searchTerm.toLowerCase().trim();
                if (!lowercasedSearch) return true;
                return (
                    ticket.partnerName.toLowerCase().includes(lowercasedSearch) ||
                    ticket.partnerId.toLowerCase().includes(lowercasedSearch) ||
                    ticket.actionTaken.toLowerCase().includes(lowercasedSearch) ||
                    ticket.discussionArea.toLowerCase().includes(lowercasedSearch) ||
                    ticket.discussionSubArea.toLowerCase().includes(lowercasedSearch)
                );
            });
    }, [ticketsForRegion, filterStatus, searchTerm]);


    const handleGenerateReport = useCallback(async () => {
        if (filteredTickets.length === 0) {
            setError("Cannot generate a report with no activities. Please add some activities or adjust your filters.");
            setGeneratedReport('');
            setIsReportModalOpen(true);
            return;
        }
        setIsReportLoading(true);
        setError('');
        setGeneratedReport('');
        setIsReportModalOpen(true);
        try {
            const report = await generateReport(filteredTickets);
            setGeneratedReport(report);
        } catch (err) {
            console.error(err);
            setError('Failed to generate report. Please check your API key and try again.');
        } finally {
            setIsReportLoading(false);
        }
    }, [filteredTickets]);

    const handleDownloadCsv = (regionsToDownload: Region[]) => {
        const ticketsToDownload = tickets.filter(ticket => 
            regionsToDownload.includes(ticket.region)
        );

        if (ticketsToDownload.length === 0) {
            alert("No activities to download for the selected region(s).");
            return;
        }

        const headers = [
            'Connect Date', 'Partner ID', 'Partner Name', 'Region', 
            'Type of Connect', 'Discussion Area', 'Discussion Sub-Area', 
            'Action Taken', 'Current Status'
        ];
        
        const escapeCsvField = (field: string | undefined | null) => {
            const stringField = String(field || '');
            if (/[",\n\r]/.test(stringField)) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };

        const csvRows = [
            headers.join(','),
            ...ticketsToDownload.map(ticket => [
                escapeCsvField(ticket.connectDate),
                escapeCsvField(ticket.partnerId),
                escapeCsvField(ticket.partnerName),
                escapeCsvField(ticket.region),
                escapeCsvField(ticket.typeOfConnect),
                escapeCsvField(ticket.discussionArea),
                escapeCsvField(ticket.discussionSubArea),
                escapeCsvField(ticket.actionTaken),
                escapeCsvField(ticket.currentStatus)
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const regionString = regionsToDownload.length === REGIONS.length
            ? 'all-regions'
            : regionsToDownload.length > 1
            ? 'multiple-regions'
            : (regionsToDownload[0] || 'report').toLowerCase().replace(/\s+/g, '-');

        link.setAttribute('href', url);
        link.setAttribute('download', `activity-report-${regionString}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloadModalOpen(false);
    };

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case 'Pending (Partner Action)': return 'bg-amber-500/20 text-amber-400';
            case 'Pending (Internal Action)': return 'bg-sky-500/20 text-sky-400';
            case 'Resolved': return 'bg-green-500/20 text-green-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    if (!selectedRegion) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-base-100 font-sans">
            <Header region={selectedRegion} onLogout={handleLogout} />
            <main className="container mx-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-text-primary">Daily Activity Log</h2>
                    <div className="flex items-center gap-2 sm:gap-4">
                         <button
                            onClick={() => setIsDownloadModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base bg-secondary hover:bg-base-300 text-text-primary font-semibold rounded-lg shadow-md transition-all duration-300"
                            aria-label="Download activities as CSV"
                        >
                            <DownloadIcon />
                            <span className="hidden sm:inline">Download CSV</span>
                        </button>
                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base bg-secondary hover:bg-base-300 text-text-primary font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={filteredTickets.length === 0}
                            aria-label="Generate AI report"
                        >
                            <AiIcon />
                            <span className="hidden sm:inline">Generate Report</span>
                        </button>
                        <button
                            onClick={() => handleOpenFormModal()}
                            className="flex items-center gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base bg-primary hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
                        >
                            <PlusIcon />
                            <span className="hidden sm:inline">Add Activity</span>
                        </button>
                    </div>
                </div>

                {ticketsForRegion.length > 0 ? (
                    <>
                        <div className="mb-6 flex items-center gap-4 flex-wrap">
                            <div className="relative flex-grow min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search by partner, action, area..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-base-200 border border-slate-600 rounded-lg py-2 pl-4 pr-10 text-text-primary focus:ring-primary focus:border-primary transition-all"
                                    aria-label="Search activities"
                                />
                            </div>
                            <div className="relative">
                                <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                                <select
                                    id="status-filter"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'All')}
                                    className="appearance-none w-full md:w-auto bg-base-200 border border-slate-600 rounded-lg py-2 pl-3 pr-8 text-text-primary focus:ring-primary focus:border-primary cursor-pointer"
                                >
                                    <option value="All">All Statuses</option>
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        {filteredTickets.length > 0 ? (
                            <TicketList 
                                tickets={filteredTickets} 
                                onEdit={handleOpenFormModal} 
                                onDelete={handleDeleteTicket}
                                getStatusColor={getStatusColor}
                            />
                        ) : (
                             <div className="text-center py-16 px-6 bg-base-200 rounded-lg shadow-inner">
                                <h3 className="text-xl font-semibold text-text-primary">No Matching Activities Found</h3>
                                <p className="text-text-secondary mt-2">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 px-6 bg-base-200 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold text-text-primary">No Activities Logged for {selectedRegion}</h3>
                        <p className="text-text-secondary mt-2">Click "Add Activity" to start tracking your work in this region.</p>
                    </div>
                )}
            </main>

            {isFormModalOpen && (
                <TicketForm
                    ticket={editingTicket}
                    onSave={handleSaveTicket}
                    onClose={handleCloseFormModal}
                    selectedRegion={selectedRegion}
                    allTickets={tickets}
                    getStatusColor={getStatusColor}
                />
            )}
             {isReportModalOpen && (
                <ReportModal
                    report={generatedReport}
                    isLoading={isReportLoading}
                    error={error}
                    onClose={() => setIsReportModalOpen(false)}
                />
            )}
            {isDownloadModalOpen && (
                <DownloadCsvModal
                    onClose={() => setIsDownloadModalOpen(false)}
                    onDownload={handleDownloadCsv}
                    tickets={tickets}
                />
            )}
        </div>
    );
};

export default App;
