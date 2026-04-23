const Footer = () => {
    const currentYear = new Date().getFullYear(); // Dynamic year

    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-6 py-4 text-center text-sm">
                <p>&copy; {currentYear} SDG Buddy. All rights reserved.</p>
                <p className="text-gray-400 mt-1">
                    SDG icons and related visual assets are sourced from the official{' '}
                    <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400">
                        UN Sustainable Development Goals
                    </a>{' '}
                    website and remain the property of their respective owners.
                </p>
                <p className="text-gray-400 mt-1">
                    SDG Buddy is an independent project and is not affiliated with the United Nations.
                </p>
            </div>
        </footer>
    );
};

export default Footer;