
import React from 'react';

interface ReportModalProps {
    report: string;
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="text-lg text-text-secondary">Gemini is analyzing your activities...</p>
    </div>
);

const ReportModal: React.FC<ReportModalProps> = ({ report, isLoading, error, onClose }) => {
    const formattedReport = report
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal-400">$1</strong>')
        .replace(/\* (.*?)(?=\n\*|\n\n|$)/g, '<li class="ml-4 list-disc">$1</li>')
        .replace(/(\d\.)/g, '<br/><strong class="text-amber-500">$1</strong>');
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-base-200 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-base-300 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">Management Report</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {isLoading && <LoadingSpinner />}
                    {error && <div className="text-red-400 bg-red-500/10 p-4 rounded-md">{error}</div>}
                    {!isLoading && !error && (
                         <div className="prose prose-invert max-w-none text-text-secondary" dangerouslySetInnerHTML={{ __html: formattedReport }} />
                    )}
                </div>
                 <div className="bg-base-300 p-4 flex justify-end">
                     <button onClick={onClose} className="px-4 py-2 bg-primary hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors">Close</button>
                 </div>
            </div>
        </div>
    );
};

export default ReportModal;
