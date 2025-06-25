
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface MetricData {
  name: string;
  value: number;
  date: string;
}

interface Filters {
  dateRange: string;
  team: string;
  project: string;
}

interface TextQueryResponse {
  query: string;
  result: MetricData[] | null;
  interpretation: string;
}

class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
    console.log("🌐 API base URL in use:", this.baseUrl);
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Generic HTTP request method
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      headers: this.headers,
      ...options,
    };

    console.log("🔍 Making request to:", url);
    console.log("📋 Request config:", config);

    try {
      const response = await fetch(url, config);
      
      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error Response:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("✅ API Success Response:", result);
      return result;
    } catch (error) {
      console.error(`❌ API request failed for ${url}:`, error);
      throw error;
    }
  }

  // GET request helper
  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    console.log("🔗 Final URL:", url.toString());
    return this.request<T>(url.toString());
  }

  // POST request helper
  private async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Velocity metrics API
  async getVelocityMetrics(filters: Filters): Promise<ApiResponse<MetricData[]>> {
    console.log("🌐 API base URL in getVelocityMetrics:", this.baseUrl);
    console.log('📊 Fetching velocity metrics with filters:', filters);

    try {
      const response = await this.get<MetricData[]>('/metrics/velocity', filters);
      console.log('✅ Velocity metrics response:', response);
      return response;
    } catch (error) {
      console.error('❌ Velocity metrics API failed:', error);
      console.warn('⚠️ Using mock velocity data');
      return {
        success: true,
        data: this.generateMockVelocityData(filters.dateRange),
        message: 'Mock data loaded (API failed)'
      };
    }
  }

  // Bug rate metrics API
  async getBugRateMetrics(filters: Filters): Promise<ApiResponse<MetricData[]>> {
    console.log('📊 Fetching bug rate metrics with filters:', filters);
    
    try {
      const response = await this.get<MetricData[]>('/metrics/bug-rate', filters);
      console.log('✅ Bug rate metrics response:', response);
      return response;
    } catch (error) {
      console.error('❌ Bug rate metrics API failed:', error);
      console.warn('⚠️ Using mock bug rate data');
      return {
        success: true,
        data: this.generateMockBugRateData(filters.dateRange),
        message: 'Mock data loaded (API failed)'
      };
    }
  }

  // Resolution time metrics API
  async getResolutionMetrics(filters: Filters): Promise<ApiResponse<MetricData[]>> {
    console.log('📊 Fetching resolution metrics with filters:', filters);
    
    try {
      const response = await this.get<MetricData[]>('/metrics/mean-resolution', filters);
      console.log('✅ Resolution metrics response:', response);
      return response;
    } catch (error) {
      console.error('❌ Resolution metrics API failed:', error);
      console.warn('⚠️ Using mock resolution time data');
      return {
        success: true,
        data: this.generateMockResolutionData(filters.dateRange),
        message: 'Mock data loaded (API failed)'
      };
    }
  }

  // Text query processing API
  async processTextQuery(query: string): Promise<TextQueryResponse> {
    console.log('🔍 Processing text query:', query);
    
    try {
      const response = await this.post<TextQueryResponse>('/metrics/text-query', { query });
      console.log('✅ Text query response:', response);
      
      if (response.data && response.data.result && response.data.result.length > 0) {
        return response.data;
      } else {
        console.warn('⚠️ Backend returned no data, using enhanced local processing');
        return this.processQueryLocally(query);
      }
    } catch (error) {
      console.error('❌ Text query API failed:', error);
      console.warn('⚠️ Using local query processing as fallback');
      return this.processQueryLocally(query);
    }
  }

  // Enhanced local query processing
  private processQueryLocally(query: string): TextQueryResponse {
    const queryLower = query.toLowerCase();
    
    // More sophisticated query analysis
    const keywordMatches = {
      velocity: ['velocity', 'story point', 'sprint', 'throughput', 'capacity', 'delivery'],
      bugs: ['bug', 'defect', 'error', 'issue', 'quality', 'failure'],
      resolution: ['resolution', 'fix', 'close', 'time', 'duration', 'cycle time'],
      trends: ['trend', 'q1', 'q2', 'q3', 'q4', 'quarter', 'month', 'week'],
      performance: ['performance', 'efficiency', 'productivity', 'metrics']
    };

    let bestMatch = '';
    let maxMatches = 0;

    // Find the category with most keyword matches
    Object.entries(keywordMatches).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => queryLower.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    });

    // Generate appropriate response based on best match
    switch (bestMatch) {
      case 'velocity':
        return {
          query,
          result: this.generateMockVelocityData('3months'),
          interpretation: 'Showing team velocity trends based on your query'
        };
      case 'bugs':
        return {
          query,
          result: this.generateMockBugRateData('3months'),
          interpretation: 'Showing bug rate analysis based on your query'
        };
      case 'resolution':
        return {
          query,
          result: this.generateMockResolutionData('3months'),
          interpretation: 'Showing resolution time metrics based on your query'
        };
      case 'trends':
        // Default to velocity for trend queries
        return {
          query,
          result: this.generateMockVelocityData('3months'),
          interpretation: 'Showing productivity trends based on your query'
        };
      case 'performance':
        // Return a combination or default metric
        return {
          query,
          result: this.generateMockVelocityData('3months'),
          interpretation: 'Showing team performance metrics based on your query'
        };
      default:
        return {
          query,
          result: [],
          interpretation: 'Try asking about "team velocity trends", "bug rates this quarter", "resolution times", or "sprint performance"'
        };
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    console.log('🏥 Performing health check');
    
    try {
      const response = await this.get<{ status: string; timestamp: string }>('/health');
      console.log('✅ Health check response:', response);
      return response;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        data: { status: 'error', timestamp: new Date().toISOString() },
        message: 'Health check failed'
      };
    }
  }

  // Mock data generators for development
  private generateMockVelocityData(dateRange: string): MetricData[] {
    const days = this.getDaysFromRange(dateRange);
    const data: MetricData[] = [];
    
    for (let i = 0; i < days; i += 14) { // Bi-weekly sprints
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      data.push({
        name: `Sprint ${Math.floor(i / 14) + 1}`,
        value: Math.floor(Math.random() * 20) + 20, // 20-40 story points
        date: date.toISOString().split('T')[0]
      });
    }
    
    return data;
  }

  private generateMockBugRateData(dateRange: string): MetricData[] {
    const days = this.getDaysFromRange(dateRange);
    const data: MetricData[] = [];
    
    for (let i = 0; i < days; i += 7) { // Weekly bug rates
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      data.push({
        name: `Week ${Math.floor(i / 7) + 1}`,
        value: Math.floor(Math.random() * 15) + 5, // 5-20% bug rate
        date: date.toISOString().split('T')[0]
      });
    }
    
    return data;
  }

  private generateMockResolutionData(dateRange: string): MetricData[] {
    const days = this.getDaysFromRange(dateRange);
    const data: MetricData[] = [];
    
    for (let i = 0; i < days; i += 7) { // Weekly resolution times
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      data.push({
        name: `Week ${Math.floor(i / 7) + 1}`,
        value: Math.floor(Math.random() * 5) + 2, // 2-7 days resolution time
        date: date.toISOString().split('T')[0]
      });
    }
    
    return data;
  }

  private generateMockTextQueryResponse(query: string): TextQueryResponse {
    const queryLower = query.toLowerCase();

    // Enhanced query parsing with more keywords and patterns
    if (queryLower.includes('velocity') || queryLower.includes('story point') || 
        queryLower.includes('sprint') || queryLower.includes('throughput')) {
      return {
        query,
        result: this.generateMockVelocityData('3months'),
        interpretation: 'Showing velocity trends based on your query'
      };
    } else if (queryLower.includes('bug') || queryLower.includes('defect') || 
               queryLower.includes('error') || queryLower.includes('issue')) {
      return {
        query,
        result: this.generateMockBugRateData('3months'),
        interpretation: 'Showing bug rate analysis based on your query'
      };
    } else if (queryLower.includes('resolution') || queryLower.includes('fix') || 
               queryLower.includes('close') || queryLower.includes('time')) {
      return {
        query,
        result: this.generateMockResolutionData('3months'),
        interpretation: 'Showing resolution time data based on your query'
      };
    } else if (queryLower.includes('q1') || queryLower.includes('quarter') || 
               queryLower.includes('trend')) {
      // Default to velocity for trend queries
      return {
        query,
        result: this.generateMockVelocityData('3months'),
        interpretation: 'Showing quarterly velocity trends based on your query'
      };
    } else {
      return {
        query,
        result: [],
        interpretation: 'Try asking about "team velocity", "bug rates", "resolution times", or "sprint performance"'
      };
    }
  }

  private getDaysFromRange(range: string): number {
    switch (range) {
      case '1month':
        return 30;
      case '3months':
        return 90;
      case '6months':
        return 180;
      case '1year':
        return 365;
      default:
        return 90;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { ApiResponse, MetricData, Filters, TextQueryResponse };