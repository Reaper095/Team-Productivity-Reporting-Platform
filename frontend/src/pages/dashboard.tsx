import React, { useState, useEffect, useCallback } from 'react';
import FilterPanel from '../components/FilterPanel';
import ChartDisplay from '../components/ChartDisplay';
import TextQueryInput from '../components/TextQueryInput';
import PDFExportButton from '../components/PDFExportButton';
import LoadingIndicator, { ChartSkeleton } from '../components/LoadingIndicator';
import ErrorAlert, { DataErrorAlert, NetworkErrorAlert } from '../components/ErrorAlert';
import { apiClient, Filters } from '../lib/apiClient';

const dateRangeToDays = (range: string): number => {
  switch (range) {
    case '3months': return 90;
    case '6months': return 180;
    case '12months': return 365;
    default: return 30;
  }
};

const daysToDateRange = (days: number): string => {
  switch (days) {
    case 90: return '3months';
    case 180: return '6months';
    case 365: return '12months';
    default: return '3months';
  }
};

interface MetricData {
  name: string;
  value: number;
  date: string;
}

interface DashboardState {
  velocityData: MetricData[];
  bugRateData: MetricData[];
  resolutionData: MetricData[];
  isLoading: boolean;
  error: string | null;
}

const Dashboard: React.FC = () => {
  // ✅ Separate filters from main state to avoid useEffect issues
  const [filters, setFilters] = useState<Filters>({
    dateRange: '3months',
    team: 'all',  // ✅ Changed from teamId to team to match API client
    project: ''
  });

  const [state, setState] = useState<DashboardState>({
    velocityData: [],
    bugRateData: [],
    resolutionData: [],
    isLoading: true,
    error: null
  });

  const [queryLoading, setQueryLoading] = useState(false);

  // ✅ Use useCallback to prevent unnecessary re-renders
  const loadDashboardData = useCallback(async () => {
    console.log('🔄 Loading dashboard data with filters:', filters);
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // ✅ Test API connectivity first
      console.log('🏥 Testing API connectivity...');
      const healthCheck = await apiClient.healthCheck();
      console.log('✅ Health check result:', healthCheck);

      console.log('📊 Fetching metrics data...');
      const [velocityResponse, bugRateResponse, resolutionResponse] = await Promise.all([
        apiClient.getVelocityMetrics(filters),
        apiClient.getBugRateMetrics(filters),
        apiClient.getResolutionMetrics(filters)
      ]);

      console.log('✅ All API responses received:', {
        velocity: velocityResponse,
        bugRate: bugRateResponse,
        resolution: resolutionResponse
      });

      setState(prev => ({
        ...prev,
        velocityData: velocityResponse.data || [],
        bugRateData: bugRateResponse.data || [],
        resolutionData: resolutionResponse.data || [],
        isLoading: false
      }));

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Dashboard data loading failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        isLoading: false
      }));
    }
  }, [filters]); // ✅ Depend on filters directly

  // ✅ Load data when filters change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ✅ Initial load on component mount
  useEffect(() => {
    console.log('🚀 Dashboard component mounted');
    // Test API base URL configuration
    console.log('🌐 API Configuration:', {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    });
  }, []);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    console.log('🔧 Filter change requested:', newFilters);
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      console.log('🔧 Updated filters:', updated);
      return updated;
    });
  };

  const handleTextQuery = async (query: string) => {
    console.log('🔍 Processing text query:', query);
    setQueryLoading(true);
    
    try {
      const response = await apiClient.processTextQuery(query);
      console.log('✅ Text query response:', response);

      if (response.result && response.result.length > 0) {
        const queryLower = query.toLowerCase();
        
        // More intelligent query routing based on keywords
        if (queryLower.includes('velocity') || queryLower.includes('story') || 
            queryLower.includes('sprint') || queryLower.includes('throughput')) {
          setState(prev => ({ ...prev, velocityData: response.result || [] }));
          console.log('📈 Updated velocity data from query');
        } else if (queryLower.includes('bug') || queryLower.includes('defect') || 
                   queryLower.includes('error') || queryLower.includes('quality')) {
          setState(prev => ({ ...prev, bugRateData: response.result || [] }));
          console.log('🐛 Updated bug rate data from query');
        } else if (queryLower.includes('resolution') || queryLower.includes('fix') || 
                   queryLower.includes('time') || queryLower.includes('close')) {
          setState(prev => ({ ...prev, resolutionData: response.result || [] }));
          console.log('⏱️ Updated resolution data from query');
        } else {
          // For general queries like "Q1 trends", default to velocity
          setState(prev => ({ ...prev, velocityData: response.result || [] }));
          console.log('📊 Updated default metrics from general query');
        }
        
        // Show success message instead of error
        console.log('✅ Query processed successfully:', response.interpretation);
      } else {
        console.log('ℹ️ Query returned no data, showing guidance');
        setState(prev => ({
          ...prev,
          error: response.interpretation || 'Try asking about specific metrics like "team velocity" or "bug rates"'
        }));
      }
    } catch (error) {
      console.error('❌ Text query failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to process text query. Please try again with specific metrics like "velocity trends" or "bug analysis".'
      }));
    } finally {
      setQueryLoading(false);
    }
  };

  const handleErrorClose = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const handleRetry = () => {
    console.log('🔄 Retry requested');
    loadDashboardData();
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingIndicator
          fullScreen
          text="Loading team productivity dashboard..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Team Productivity Dashboard
            </h1>
            <PDFExportButton
              data={{
                velocity: state.velocityData,
                bugRate: state.bugRateData,
                resolution: state.resolutionData,
                filters: filters // ✅ Use separate filters state
              }}
              filename="team-productivity-dashboard"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.error && (
          <DataErrorAlert
            onRetry={handleRetry}
            onClose={handleErrorClose}
          />
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ask About Your Team's Performance
          </h2>
          <TextQueryInput
            onQuery={handleTextQuery}
            isLoading={queryLoading}
          />
        </div>

        <div className="mb-8">
          <FilterPanel
            teams={[
              { id: 'frontend', name: 'Frontend Team' },
              { id: 'backend', name: 'Backend Team' },
              { id: 'all', name: 'All Teams' }
            ]}
            selectedTeam={filters.team} // ✅ Use filters.team instead of filters.teamId
            selectedPeriod={dateRangeToDays(filters.dateRange)}
            onTeamChange={(team) => handleFilterChange({ team })} // ✅ Pass team, not teamId
            onPeriodChange={(days) => handleFilterChange({ dateRange: daysToDateRange(days) })}
            onRefresh={loadDashboardData}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <ChartDisplay
              data={state.velocityData}
              title="Team Velocity Trend"
              type="line"
              dataKey="value"
              xAxisKey="date"
              color="#10B981"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <ChartDisplay
              data={state.bugRateData}
              title="Bug Rate Analysis"
              type="bar"
              dataKey="value"
              xAxisKey="date"
              color="#EF4444"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <ChartDisplay
            data={state.resolutionData}
            title="Mean Resolution Time"
            type="line"
            dataKey="value"
            xAxisKey="date"
            color="#8B5CF6"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Current Velocity
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {state.velocityData.length > 0
                ? state.velocityData[state.velocityData.length - 1]?.value || 0
                : 0
              }
            </p>
            <p className="text-sm text-gray-500">Story Points/Sprint</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bug Rate
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {state.bugRateData.length > 0
                ? `${state.bugRateData[state.bugRateData.length - 1]?.value || 0}%`
                : '0%'
              }
            </p>
            <p className="text-sm text-gray-500">Defects/Total Issues</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Avg Resolution Time
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {state.resolutionData.length > 0
                ? `${state.resolutionData[state.resolutionData.length - 1]?.value || 0}d`
                : '0d'
              }
            </p>
            <p className="text-sm text-gray-500">Days to Resolution</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;