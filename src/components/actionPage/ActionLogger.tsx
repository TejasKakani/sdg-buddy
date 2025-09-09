'use client';

import { useState } from 'react';
import { Plus, Leaf, BookText, Target } from 'lucide-react';

// Define the structure of a single SDG data object
interface Sdg {
  id: number;
  title: string;
}

// Define the props for the ActionLogger component
interface ActionLoggerProps {
  sdgData: Sdg[];
  onActionSubmit: () => void;
}

const ActionLogger: React.FC<ActionLoggerProps> = ({ sdgData = [], onActionSubmit }) => {
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDescription(e.target.value);
      if (error) setError(null);
    }

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
        if (error) setError(null);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !category) {
            setError('Please describe your action and select a related SDG.');
            return;
        }
        
        onActionSubmit(); // Call the parent function to update points and show toast
        
        // Reset form fields and error
        setDescription('');
        setCategory('');
        setError(null);
    };

    return (
        <section id="log-action" className="bg-white p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-6">
              <Leaf className="h-7 w-7 text-emerald-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">Log a Sustainable Action</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="action-description" className="block text-sm font-medium text-gray-700 mb-1">What did you do?</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <BookText className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input 
                          type="text" 
                          id="action-description" 
                          value={description}
                          onChange={handleDescriptionChange}
                          placeholder="e.g., Used a reusable coffee cup" 
                          className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      />
                    </div>
                </div>
                <div>
                    <label htmlFor="sdg-category" className="block text-sm font-medium text-gray-700 mb-1">Related SDG</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Target className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <select 
                          id="sdg-category" 
                          value={category}
                          onChange={handleCategoryChange}
                          className="mt-1 block w-full appearance-none pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                      >
                          <option value="">Select a goal...</option>
                          {sdgData.map(sdg => (
                              <option key={sdg.id} value={sdg.id}>
                                  Goal {sdg.id}: {sdg.title}
                              </option>
                          ))}
                      </select>
                    </div>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg">
                    Add to My Impact
                    <Plus className="ml-2 h-5 w-5" />
                </button>
            </form>
        </section>
    );
};

export default ActionLogger;

