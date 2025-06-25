import express from 'express';
import { MetricsService } from '../services/metrics.service';
import { TextQueryService } from '../services/textQuery.service';
import { z } from 'zod';

const router = express.Router();
const metricsService = new MetricsService();
const textQueryService = new TextQueryService();

// Validation schemas
const teamIdSchema = z.object({
  team: z.string().min(1, 'Team ID is required')
});

const velocityQuerySchema = z.object({
  team: z.string().min(1),
  sprintId: z.string().optional()
});

const metricsQuerySchema = z.object({
  team: z.string().min(1),
  days: z.coerce.number().min(1).max(365).optional()
});

const textQuerySchema = z.object({
  query: z.string().min(1, 'Query text is required')
});

// GET /api/metrics/velocity
router.get('/velocity', async (req, res) => {
  try {
    const { team, sprintId } = velocityQuerySchema.parse(req.query);
    const metrics = await metricsService.getVelocityMetrics(team, sprintId);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Velocity metrics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch velocity metrics'
    });
  }
});

// GET /api/metrics/bug-rate
router.get('/bug-rate', async (req, res) => {
  try {
    const { team, days = 30 } = metricsQuerySchema.parse(req.query);
    const metrics = await metricsService.getBugRateMetrics(team, days);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Bug rate metrics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bug rate metrics'
    });
  }
});

// GET /api/metrics/mean-resolution
router.get('/mean-resolution', async (req, res) => {
  try {
    const { team, days = 30 } = metricsQuerySchema.parse(req.query);
    const metrics = await metricsService.getResolutionTimeMetrics(team, days);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Resolution time metrics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resolution time metrics'
    });
  }
});

// GET /api/metrics/all
router.get('/all', async (req, res) => {
  try {
    const { team } = teamIdSchema.parse(req.query);
    const metrics = await metricsService.getAllMetrics(team);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('All metrics error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all metrics'
    });
  }
});

// POST /api/metrics/text-query
router.post('/text-query', async (req, res) => {
  try {
    const { query } = textQuerySchema.parse(req.body);
    const result = await textQueryService.processTextQuery(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Text query error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to process text query'
    });
  }
});

export default router;