import React from 'react';

// --- UI Component Placeholders ---
// In a real project, these would be in separate files (e.g., @/components/ui/)

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const FeaturesSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 md:mb-24">
    <Card className="border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <CardContent>
        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Track Your Impact</h3>
        <p className="text-gray-600">
          Log daily sustainable actions and see your real-time contribution to the 17 UN SDGs with detailed analytics.
        </p>
      </CardContent>
    </Card>

    <Card className="border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <CardContent>
        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
          <span className="text-2xl">🏆</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Earn Achievements</h3>
        <p className="text-gray-600">
          Unlock badges, build streaks, and level up as you maintain sustainable habits and reach milestones.
        </p>
      </CardContent>
    </Card>

    <Card className="border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <CardContent>
        <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
          <span className="text-2xl">🌐</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Learn & Connect</h3>
        <p className="text-gray-600">
          Discover how your actions create ripple effects across multiple SDGs and understand global sustainability.
        </p>
      </CardContent>
    </Card>
  </div>
);


export default FeaturesSection;