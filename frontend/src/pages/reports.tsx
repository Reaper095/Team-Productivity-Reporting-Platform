import React, { useState, useEffect } from 'react';
import FilterPanel from '../components/FilterPanel';
import PDFExportButton from '../components/PDFExportButton';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorAlert from '../components/ErrorAlert';
import { Calendar, TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface ReportData {
  summary: {
    totalSprints: number;
    avgVelocity: number;
    totalBugs: number;
    avgResolutionTime: number;
    teamMembers: string[];
    reportPeriod: string;
  };
  trends: {
    velocityTrend: 'up' | 'down' | 'stable';
    bugTrend: 'up' | 'down' | 'stable';
    resolutionTrend: 'up' | 'down' | 'stable';
  };
  insights: string[];
  recommendations: string[];
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    team: '',
    dateRange: 90  // default to 90 days (i.e., "Last 3 months")
});

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: ReportData = {
        summary: {
          totalSprints: 12,
          avgVelocity: 28.5,
          totalBugs: 89,
          avgResolutionTime: 3.2,
          teamMembers: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'],
          reportPeriod: filters.dateRange === 90 ? 'Last 3 Months' :
                        filters.dateRange === 180 ? 'Last 6 Months' : 'Last 12 Months'
        },
        trends: {
          velocityTrend: 'up',
          bugTrend: 'down',
          resolutionTrend: 'stable'
        },
        insights: [
          'Team velocity has improved by 15% over the selected period',
          'Bug resolution time has decreased significantly in recent sprints',
          'Frontend team shows higher velocity compared to backend team',
          'Most critical bugs are resolved within 2 days on average'
        ],
        recommendations: [
          'Continue current development practices to maintain velocity growth',
          'Implement automated testing to further reduce bug rates',
          'Consider cross-training team members to balance workload',
          'Schedule regular retrospectives to identify improvement areas'
        ]
      };
      
      setReportData(mockData);
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded-full"></div>;
    }
  };

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'Trending Up';
      case 'down':
        return 'Trending Down';
      default:
        return 'Stable';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingIndicator 
          fullScreen 
          text="Generating productivity report..." 
          size="lg" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Team Productivity Report
            </h1>
            <PDFExportButton 
              data={reportData}
              filename="team-productivity-report"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onRetry={loadReportData}
            onClose={() => setError(null)}
          />
        )}

        {/* Filters */}
        <div className="mb-8">
          <FilterPanel
            teams={[
                { id: 'frontend', name: 'Frontend Team' },
                { id: 'backend', name: 'Backend Team' },
                { id: 'all', name: 'All Teams' }
            ]}
            selectedTeam={filters.team}
            selectedPeriod={filters.dateRange}
            onTeamChange={(teamId) => setFilters(prev => ({ ...prev, team: teamId }))}
            onPeriodChange={(days) => setFilters(prev => ({ ...prev, dateRange: days }))}
            onRefresh={loadReportData}
            />

        </div>

        {reportData && (
          <>
            {/* Report Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Executive Summary
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {reportData.summary.reportPeriod}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.summary.totalSprints}
                  </div>
                  <div className="text-sm text-gray-600">Total Sprints</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.summary.avgVelocity}
                  </div>
                  <div className="text-sm text-gray-600">Avg Velocity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.summary.totalBugs}
                  </div>
                  <div className="text-sm text-gray-600">Total Bugs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {reportData.summary.avgResolutionTime}d
                  </div>
                  <div className="text-sm text-gray-600">Avg Resolution</div>
                </div>
              </div>
            </div>

            {/* Trends Analysis */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trend Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Velocity</div>
                    <div className="text-sm text-gray-600">
                      {getTrendText(reportData.trends.velocityTrend)}
                    </div>
                  </div>
                  {getTrendIcon(reportData.trends.velocityTrend)}
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Bug Rate</div>
                    <div className="text-sm text-gray-600">
                      {getTrendText(reportData.trends.bugTrend)}
                    </div>
                  </div>
                  {getTrendIcon(reportData.trends.bugTrend)}
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Resolution Time</div>
                    <div className="text-sm text-gray-600">
                      {getTrendText(reportData.trends.resolutionTrend)}
                    </div>
                  </div>
                  {getTrendIcon(reportData.trends.resolutionTrend)}
                </div>
              </div>
            </div>

            {/* Team Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Team Composition
              </h3>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-700">
                  {reportData.summary.teamMembers.length} Team Members:
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {reportData.summary.teamMembers.map((member, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {member}
                  </span>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Insights
              </h3>
              <ul className="space-y-3">
                {reportData.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recommendations
              </h3>
              <ul className="space-y-3">
                {reportData.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;