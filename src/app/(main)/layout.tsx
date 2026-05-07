import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div>
            <div>
            <Header/>
              {children}
            <Footer />
            </div>
        </div>
    );
};

export default MainLayout;