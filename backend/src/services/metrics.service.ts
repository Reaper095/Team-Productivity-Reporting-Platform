import { PrismaClient, TicketStatus, TicketType } from '@prisma/client';
import { subDays, differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

export interface VelocityMetrics {
  team: string;
  sprintId?: string;
  totalStoryPoints: number;
  completedStoryPoints: number;
  velocity: number;
  averageVelocity: number;
}

export interface BugRateMetrics {
  team: string;
  period: string;
  totalTickets: number;
  bugTickets: number;
  bugRate: number;
}

export interface ResolutionTimeMetrics {
  team: string;
  period: string;
  averageResolutionTime: number;
  medianResolutionTime: number;
  minResolutionTime: number;
  maxResolutionTime: number;
}

export class MetricsService {
  private async getTeamId(teamName: string): Promise<string | undefined> {
    if (teamName === 'all') return undefined;
    const team = await prisma.team.findUnique({
      where: { name: teamName },
      select: { id: true }
    });
    return team?.id;
  }

  async getVelocityMetrics(teamName: string, sprintId?: string): Promise<VelocityMetrics> {
    try {
      const teamId = await this.getTeamId(teamName);
      const whereClause: any = {
        ...(teamId && { teamId }),
        ...(sprintId && { sprintId }),
        status: TicketStatus.DONE,
        storyPoints: { not: null }
      };

      const tickets = await prisma.ticket.findMany({ where: whereClause });
      const totalStoryPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      const recentSprints = await prisma.sprint.findMany({
        where: { ...(teamId && { teamId }) },
        include: {
          tickets: {
            where: {
              status: TicketStatus.DONE,
              storyPoints: { not: null }
            }
          }
        },
        orderBy: { endDate: 'desc' },
        take: 5
      });

      const sprintVelocities = recentSprints.map(sprint =>
        sprint.tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
      );

      const avgVel = sprintVelocities.length
        ? sprintVelocities.reduce((sum, v) => sum + v, 0) / sprintVelocities.length
        : 0;

      return {
        team: teamName,
        sprintId,
        totalStoryPoints,
        completedStoryPoints: totalStoryPoints,
        velocity: totalStoryPoints,
        averageVelocity: Math.round(avgVel * 100) / 100
      };
    } catch (err) {
      console.error('Error calculating velocity metrics:', err);
      throw err;
    }
  }

  async getBugRateMetrics(teamName: string, days: number = 30): Promise<BugRateMetrics> {
    try {
      const teamId = await this.getTeamId(teamName);
      const startDate = subDays(new Date(), days);

      const [totalTickets, bugTickets] = await Promise.all([
        prisma.ticket.count({
          where: { 
            ...(teamId && { teamId }),
            createdAt: { gte: startDate } 
          }
        }),
        prisma.ticket.count({
          where: { 
            ...(teamId && { teamId }),
            type: TicketType.BUG, 
            createdAt: { gte: startDate } 
          }
        })
      ]);

      const bugRate = totalTickets
        ? Math.round((bugTickets / totalTickets) * 10000) / 100
        : 0;

      return {
        team: teamName,
        period: `${days} days`,
        totalTickets,
        bugTickets,
        bugRate
      };
    } catch (err) {
      console.error('Error calculating bug rate metrics:', err);
      throw err;
    }
  }

  async getResolutionTimeMetrics(teamName: string, days: number = 30): Promise<ResolutionTimeMetrics> {
    try {
      const teamId = await this.getTeamId(teamName);
      const startDate = subDays(new Date(), days);

      const resolvedTickets = await prisma.ticket.findMany({
        where: {
          ...(teamId && { teamId }),
          status: TicketStatus.DONE,
          resolvedAt: { not: null },
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true,
          resolvedAt: true
        }
      });

      if (!resolvedTickets.length) {
        return {
          team: teamName,
          period: `${days} days`,
          averageResolutionTime: 0,
          medianResolutionTime: 0,
          minResolutionTime: 0,
          maxResolutionTime: 0
        };
      }

      const resolutionTimes = resolvedTickets
        .map(t => differenceInDays(t.resolvedAt!, t.createdAt))
        .sort((a, b) => a - b);

      const avg = resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length;
      const mid = Math.floor(resolutionTimes.length / 2);
      const median =
        resolutionTimes.length % 2 !== 0
          ? resolutionTimes[mid]
          : (resolutionTimes[mid - 1] + resolutionTimes[mid]) / 2;

      return {
        team: teamName,
        period: `${days} days`,
        averageResolutionTime: Math.round(avg * 100) / 100,
        medianResolutionTime: median,
        minResolutionTime: resolutionTimes[0],
        maxResolutionTime: resolutionTimes[resolutionTimes.length - 1]
      };
    } catch (err) {
      console.error('Error calculating resolution time metrics:', err);
      throw err;
    }
  }

  async getAllMetrics(team: string) {
    try {
      const [velocity, bugRate, resolutionTime] = await Promise.all([
        this.getVelocityMetrics(team),
        this.getBugRateMetrics(team),
        this.getResolutionTimeMetrics(team)
      ]);

      return {
        velocity,
        bugRate,
        resolutionTime,
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error generating all metrics:', err);
      throw err;
    }
  }
}