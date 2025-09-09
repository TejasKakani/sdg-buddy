import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'lg' | 'default';
  'data-testid'?: string;
}

const Button = ({ className, size, children, ...props }: ButtonProps) => {
  const sizeClasses = size === 'lg' ? 'text-lg px-8 py-3' : 'px-4 py-2';
  return (
    <button
      className={`rounded-md text-white font-semibold transition-colors ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const CallToActionSection = ({ onLoginClick }: { onLoginClick: () => void }) => (
  <div className="text-center">
    <h2 className="text-3xl font-bold text-gray-900 mb-4">
      Ready to Make a Difference?
    </h2>
    <p className="text-lg md:text-xl text-gray-600 mb-8">
      Join the movement towards a sustainable future. Start tracking your impact today.
    </p>
    <Button
      onClick={onLoginClick}
      size="lg"
      className="bg-emerald-600 hover:bg-emerald-700"
      data-testid="button-cta-login"
    >
      Begin Tracking
    </Button>
  </div>
);

export default CallToActionSection;