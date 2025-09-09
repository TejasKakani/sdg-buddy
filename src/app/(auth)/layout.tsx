import React from "react";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div style={{
            
        }}>
            <div style={{
                
            }}>
              {children}
            </div>
        </div>
    );
};

export default AuthLayout;