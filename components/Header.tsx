import React from 'react';
import { Region } from '../types';

interface HeaderProps {
    region: Region;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ region, onLogout }) => {
    return (
        <header className="bg-base-200 shadow-lg">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-500">
                        Daily Activity Tracker
                    </h1>
                     <p className="text-text-secondary mt-1">
                        Region: <span className="font-semibold text-text-primary">{region}</span>
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-text-primary font-semibold rounded-lg transition-colors"
                >
                    Change Region
                </button>
            </div>
        </header>
    );
};

export default Header;