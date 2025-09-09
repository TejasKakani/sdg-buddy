import { Bell, CheckCircle2 } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 lg:px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        SDG <span className="text-emerald-500">Buddy</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="text-gray-600 hover:text-emerald-500 transition-colors">
                        <Bell className="h-6 w-6" />
                    </button>
                    <img src="https://placehold.co/40x40/a7f3d0/14532d?text=U" alt="User Avatar" className="h-10 w-10 rounded-full border-2 border-emerald-200" />
                </div>
            </nav>
        </header>
    );
};

export default Header;
