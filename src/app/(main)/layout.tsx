import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import React from "react";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div style={{
            
        }}>
            <div style={{
                
            }}>
            <Header />
              {children}
            <Footer />
            </div>
        </div>
    );
};

export default MainLayout;