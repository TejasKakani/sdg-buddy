const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-6 py-4 text-center text-sm">
                <p>&copy; 2024 SDG Buddy. Empowering change, one action at a time.</p>
                <p className="text-gray-400 mt-1">
                    Learn more about the{' '}
                    <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400">
                        UN Sustainable Development Goals
                    </a>.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
