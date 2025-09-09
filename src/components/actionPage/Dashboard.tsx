import React from 'react';

interface DashboardProps {
  totalPoints: number;
}

const Dashboard: React.FC<DashboardProps> = ({ totalPoints }) => {
    return (
        <section id="dashboard" className="bg-white p-6 shadow-lg border border-gray-100">
            <div className="text-center">
                <p className="text-gray-500 text-sm font-medium">Your Total Impact Score</p>
                <p id="total-points" className="text-6xl font-bold text-emerald-500 my-2">
                    {(totalPoints ?? 0).toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">You're doing great! Keep it up!</p>
            </div>
        </section>
    );
};

export default Dashboard;

