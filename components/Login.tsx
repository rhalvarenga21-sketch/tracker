import React, { useState } from 'react';
import { REGIONS } from '../constants';
import { Region } from '../types';

interface LoginProps {
    onLogin: (region: Region) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(selectedRegion);
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
            <div className="bg-base-200 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-500 mb-2">
                    Daily Activity Tracker
                </h1>
                <p className="text-text-secondary text-center mb-8">
                    Please select your region to continue
                </p>
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label htmlFor="region-select" className="block text-sm font-medium text-text-secondary mb-2">Region</label>
                        <select
                            id="region-select"
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value as Region)}
                            className="w-full bg-base-300 border border-slate-600 rounded-md p-3 text-text-primary focus:ring-primary focus:border-primary"
                        >
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-primary hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;