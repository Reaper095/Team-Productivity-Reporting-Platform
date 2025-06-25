import { PrismaClient, TicketStatus, TicketType } from '@prisma/client';
import { subDays, differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

export interface TextQueryResult {
  query: string;
  result: any;
  interpretation: string;
}

export class TextQueryService {
  private queryPatterns = [
    {
      pattern: /(show|display|get|what is|what are|view).*(velocity|story points|sprint).*(for|of)?\s*(?:team\s*)?([a-zA-Z0-9\s]+)?/i,
      handler: this.handleVelocityQuery.bind(this)
    },
    {
      pattern: /(how many|count|number of|total).*(bugs|defects|issues).*(for|of)?\s*(?:team\s*)?([a-zA-Z0-9\s]+)?/i,
      handler: this.handleBugCountQuery.bind(this)
    },
    {
      pattern: /(average|mean|median).*(resolution|fix|close).*(time|duration).*(for|of)?\s*(?:team\s*)?([a-zA-Z0-9\s]+)?/i,
      handler: this.handleResolutionTimeQuery.bind(this)
    },
    {
      pattern: /(completed|done|finished).*(tickets|tasks|items).*(for|of)?\s*(?:team\s*)?([a-zA-Z0-9\s]+)?/i,
      handler: this.handleCompletedTicketsQuery.bind(this)
    },
    {
      pattern: /(team|squad|group).*(performance|metrics|stats|statistics)/i,
      handler: this.handleTeamPerformanceQuery.bind(this)
    },
    {
      pattern: /(q1|q2|q3|q4|quarter|trend|period)/i,
      handler: this.handleQuarterlyTrendsQuery.bind(this)
    }
  ];

  async processTextQuery(query: string): Promise<TextQueryResult> {
    try {
      const normalizedQuery = query.toLowerCase().trim();
      
      // Find matching pattern with enhanced matching
      for (const { pattern, handler } of this.queryPatterns) {
        const match = normalizedQuery.match(pattern);
        if (match) {
          const teamName = match[4]?.trim() || 'all';
          return await handler(query, teamName);
        }
      }

      // Enhanced keyword fallback analysis
      return this.analyzeQueryByKeywords(query);
    } catch (error) {
      console.error('Error processing text query:', error);
      return {
        query,
        result: null,
        interpretation: "I encountered an error processing your request. Please try again or rephrase your question."
      };
    }
  }

  private analyzeQueryByKeywords(query: string): TextQueryResult {
    const queryLower = query.toLowerCase();
    const keywordCategories = {
      velocity: ['velocity', 'story point', 'sprint', 'throughput', 'capacity'],
      bugs: ['bug', 'defect', 'error', 'issue', 'failure'],
      resolution: ['resolution', 'fix', 'close', 'time', 'duration'],
      trends: ['trend', 'q1', 'q2', 'q3', 'q4', 'quarter', 'period'],
      performance: ['performance', 'metric', 'statistic', 'kpi']
    };

    // Count keyword matches
    const matches = Object.entries(keywordCategories)
      .map(([category, keywords]) => ({
        category,
        count: keywords.filter(kw => queryLower.includes(kw)).length
      }))
      .filter(m => m.count > 0);

    if (matches.length > 0) {
      const bestMatch = matches.reduce((prev, current) => 
        (prev.count > current.count) ? prev : current
      );

      switch (bestMatch.category) {
        case 'velocity':
          return this.handleVelocityQuery(query, 'all');
        case 'bugs':
          return this.handleBugCountQuery(query, 'all');
        case 'resolution':
          return this.handleResolutionTimeQuery(query, 'all');
        case 'trends':
          return this.handleQuarterlyTrendsQuery(query);
        case 'performance':
          return this.handleTeamPerformanceQuery(query);
      }
    }

    return {
      query,
      result: null,
      interpretation: "I didn't understand your query. Try questions like: " +
        "'Show velocity for Frontend team', " +
        "'How many bugs in Q2?', or " +
        "'Average resolution time last month'"
    };
  }

  private async handleVelocityQuery(query: string, teamName: string): Promise<TextQueryResult> {
    try {
      const team = teamName === 'all' ? null : await prisma.team.findFirst({
        where: { name: { equals: teamName, mode: 'insensitive' } },
        include: {
          sprints: {
            include: {
              tickets: { where: { status: 'DONE' } }
            },
            orderBy: { endDate: 'desc' },
            take: 5
          }
        }
      });

      if (!team && teamName !== 'all') {
        return {
          query,
          result: null,
          interpretation: `Team "${teamName}" not found. Try one of our team names.`
        };
      }

      const sprints = team?.sprints || await prisma.sprint.findMany({
        include: {
          tickets: { where: { status: 'DONE' } }
        },
        orderBy: { endDate: 'desc' },
        take: 5
      });

      const totalVelocity = sprints.reduce((sum, sprint) =>
        sum + sprint.tickets.reduce((sprintSum, ticket) =>
          sprintSum + (ticket.storyPoints || 0), 0), 0
      );

      const avgVelocity = sprints.length > 0 ? totalVelocity / sprints.length : 0;

      return {
        query,
        result: {
          team: teamName === 'all' ? 'All Teams' : team?.name,
          averageVelocity: Math.round(avgVelocity * 100) / 100,
          sprintsAnalyzed: sprints.length,
          timePeriod: 'last 5 sprints'
        },
        interpretation: `Average velocity ${teamName === 'all' ? 'across all teams' : `for ${team?.name}`} is ` +
          `${Math.round(avgVelocity)} story points per sprint (last 5 sprints).`
      };
    } catch (error) {
      console.error('Velocity query error:', error);
      return {
        query,
        result: null,
        interpretation: "Failed to retrieve velocity data. Please try again later."
      };
    }
  }

  private async handleQuarterlyTrendsQuery(query: string): Promise<TextQueryResult> {
    try {
      // Default to showing Q1 velocity trends for all teams
      const result = await this.handleVelocityQuery(query, 'all');
      return {
        ...result,
        interpretation: "Showing Q1 velocity trends across all teams. " +
          "Try being more specific like 'Q2 bugs for Frontend team'"
      };
    } catch (error) {
      console.error('Quarterly trends error:', error);
      return {
        query,
        result: null,
        interpretation: "Couldn't retrieve quarterly trends. Please try again."
      };
    }
  }

  private async handleBugCountQuery(query: string, teamName: string): Promise<TextQueryResult> {
    try {
      const team = teamName === 'all' ? null : await prisma.team.findFirst({
        where: { name: { equals: teamName, mode: 'insensitive' } }
      });

      if (!team && teamName !== 'all') {
        return {
          query,
          result: null,
          interpretation: `Team "${teamName}" not found. Try one of our team names.`
        };
      }

      const [totalTickets, bugTickets] = await Promise.all([
        prisma.ticket.count({
          where: { 
            ...(team && { teamId: team.id }),
            createdAt: { gte: subDays(new Date(), 90) } // Last quarter
          }
        }),
        prisma.ticket.count({
          where: { 
            ...(team && { teamId: team.id }),
            type: 'BUG',
            createdAt: { gte: subDays(new Date(), 90) }
          }
        })
      ]);

      const bugRate = totalTickets > 0 ? (bugTickets / totalTickets) * 100 : 0;

      return {
        query,
        result: {
          team: teamName === 'all' ? 'All Teams' : team?.name,
          totalTickets,
          bugTickets,
          bugRate: Math.round(bugRate * 100) / 100,
          timePeriod: 'last quarter'
        },
        interpretation: `Found ${bugTickets} bugs out of ${totalTickets} total tickets ` +
          `${teamName === 'all' ? 'across all teams' : `for ${team?.name}`} in the last quarter ` +
          `(${Math.round(bugRate)}% bug rate).`
      };
    } catch (error) {
      console.error('Bug count query error:', error);
      return {
        query,
        result: null,
        interpretation: "Failed to retrieve bug statistics. Please try again later."
      };
    }
  }

  private async handleResolutionTimeQuery(query: string, match: RegExpMatchArray): Promise<TextQueryResult> {
    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        status: 'DONE',
        resolvedAt: { not: null }
      },
      select: {
        createdAt: true,
        resolvedAt: true,
        type: true
      }
    });

    if (resolvedTickets.length === 0) {
      return {
        query,
        result: null,
        interpretation: "No resolved tickets found to calculate resolution time."
      };
    }

    const resolutionTimes = resolvedTickets.map(ticket => {
      const diff = ticket.resolvedAt!.getTime() - ticket.createdAt.getTime();
      return Math.round(diff / (1000 * 60 * 60 * 24)); // Convert to days
    });

    const avgResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;

    return {
      query,
      result: {
        averageResolutionTime: Math.round(avgResolutionTime * 100) / 100,
        ticketsAnalyzed: resolvedTickets.length,
        unit: 'days'
      },
      interpretation: `Average resolution time is ${Math.round(avgResolutionTime)} days based on ${resolvedTickets.length} resolved tickets.`
    };
  }

  private async handleCompletedTicketsQuery(query: string, match: RegExpMatchArray): Promise<TextQueryResult> {
    const completedTickets = await prisma.ticket.findMany({
      where: { status: 'DONE' },
      include: {
        team: true,
        assignee: true
      }
    });

    const teamStats = completedTickets.reduce((acc: any, ticket) => {
      const teamName = ticket.team.name;
      if (!acc[teamName]) {
        acc[teamName] = { completed: 0, storyPoints: 0 };
      }
      acc[teamName].completed++;
      acc[teamName].storyPoints += ticket.storyPoints || 0;
      return acc;
    }, {});

    return {
      query,
      result: {
        totalCompleted: completedTickets.length,
        byTeam: teamStats
      },
      interpretation: `Found ${completedTickets.length} completed tickets across ${Object.keys(teamStats).length} team(s).`
    };
  }

  private async handleTeamPerformanceQuery(query: string, match: RegExpMatchArray): Promise<TextQueryResult> {
    const teams = await prisma.team.findMany({
      include: {
        tickets: {
          include: {
            sprint: true
          }
        },
        members: true
      }
    });

    const performance = teams.map(team => {
      const tickets = team.tickets;
      const completedTickets = tickets.filter(t => t.status === 'DONE');
      const bugTickets = tickets.filter(t => t.type === 'BUG');
      
      return {
        teamName: team.name,
        memberCount: team.members.length,
        totalTickets: tickets.length,
        completedTickets: completedTickets.length,
        completionRate: tickets.length > 0 ? Math.round((completedTickets.length / tickets.length) * 100) : 0,
        bugCount: bugTickets.length,
        bugRate: tickets.length > 0 ? Math.round((bugTickets.length / tickets.length) * 100) : 0
      };
    });

    return {
      query,
      result: performance,
      interpretation: `Performance overview for ${teams.length} team(s) showing completion rates, bug rates, and team sizes.`
    };
  }
}