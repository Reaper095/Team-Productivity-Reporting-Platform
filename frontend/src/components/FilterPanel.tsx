import React from 'react';
import { RefreshCw, Filter } from 'lucide-react';

interface Team {
  id: string;
  name: string;
}

interface FilterPanelProps {
  teams: Team[];
  selectedTeam: string;
  selectedPeriod: number;
  onTeamChange: (teamId: string) => void;
  onPeriodChange: (days: number) => void;
  onRefresh: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  teams,
  selectedTeam,
  selectedPeriod,
  onTeamChange,
  onPeriodChange,
  onRefresh
}) => {
  const periodOptions = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' },
    { value: 180, label: 'Last 6 months' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Team Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a team...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Period Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <div>
          <button
            onClick={onRefresh}
            disabled={!selectedTeam}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Applied Filters Display */}
      {selectedTeam && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Active filters:</span> {' '}
            {teams.find(t => t.id === selectedTeam)?.name} • {' '}
            {periodOptions.find(p => p.value === selectedPeriod)?.label}
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;