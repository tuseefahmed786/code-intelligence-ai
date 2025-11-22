import { Router, Request, Response } from 'express';
import { codeAnalyzer } from '../services/codeAnalyzer';
import { openAIService } from '../services/openaiService';
import { githubService } from '../services/githubService';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';

const router = Router();

const analyzeCodeSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  context: z.string().optional(),
});

const analyzeCodebaseSchema = z.object({
  directoryPath: z.string().min(1),
  generateDocs: z.boolean().optional(),
  maxFiles: z.number().int().positive().max(100).optional(),
});

const generateDocsSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  filePath: z.string().optional(),
});

const generateTestsSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  framework: z.string().optional(),
});

const analyzePRSchema = z.object({
  repo: z.string().regex(/^[\w\-\.]+\/[\w\-\.]+$/, 'Invalid repo format. Use "owner/repo"'),
  prNumber: z.number().int().positive(),
});

router.post('/code', async (req: Request, res: Response) => {
  try {
    const body = analyzeCodeSchema.parse(req.body);
    
    const result = await openAIService.analyzeCode(
      body.code,
      body.language,
      body.context
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error analyzing code:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze code',
    });
  }
});

router.post('/codebase', async (req: Request, res: Response) => {
  try {
    const body = analyzeCodebaseSchema.parse(req.body);
    
    try {
      const stats = await fs.stat(body.directoryPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({
          success: false,
          error: 'Path is not a directory',
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Directory does not exist',
      });
    }

    const result = await codeAnalyzer.analyzeCodebase(body.directoryPath, {
      generateDocs: body.generateDocs,
      maxFiles: body.maxFiles,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error analyzing codebase:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze codebase',
    });
  }
});

router.post('/architecture', async (req: Request, res: Response) => {
  try {
    const { directoryPath, maxFiles = 20 } = req.body;

    if (!directoryPath) {
      return res.status(400).json({
        success: false,
        error: 'directoryPath is required',
      });
    }

    const files = await codeAnalyzer.readCodebase(directoryPath, maxFiles);
    
    const fileData = files.map(f => ({
      path: f.path,
      code: f.code.substring(0, 5000),
    }));

    const result = await openAIService.analyzeArchitecture(
      fileData,
      files[0]?.language || 'javascript'
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error analyzing architecture:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze architecture',
    });
  }
});

router.post('/documentation/generate', async (req: Request, res: Response) => {
  try {
    const body = generateDocsSchema.parse(req.body);
    
    const result = await openAIService.generateDocumentation(
      body.code,
      body.language,
      body.filePath
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error generating documentation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate documentation',
    });
  }
});

router.post('/tests/generate', async (req: Request, res: Response) => {
  try {
    const body = generateTestsSchema.parse(req.body);
    
    const result = await openAIService.generateTests(
      body.code,
      body.language,
      body.framework
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error generating tests:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate tests',
    });
  }
});

router.post('/pr', async (req: Request, res: Response) => {
  try {
    const body = analyzePRSchema.parse(req.body);
    
    const prInfo = await githubService.getPRInfo(body.repo, body.prNumber);
    
    const codeFiles = await githubService.getPRCodeFiles(body.repo, body.prNumber);
    
    if (codeFiles.length === 0) {
      return res.json({
        success: true,
        data: {
          pr: {
            number: prInfo.number,
            title: prInfo.title,
            state: prInfo.state,
            head: prInfo.head.ref,
            base: prInfo.base.ref,
          },
          files: [],
          summary: 'No code files found in this PR',
          overallScore: 100,
          totalIssues: 0,
          criticalIssues: 0,
          warnings: 0,
        },
      });
    }

    const fileAnalyses = [];
    for (const file of codeFiles) {
      try {
        const analysis = await openAIService.analyzeCode(
          file.code,
          file.language,
          `PR #${prInfo.number}: ${file.filename} (${file.status})`
        );
        
        fileAnalyses.push({
          filename: file.filename,
          language: file.language,
          status: file.status,
          issues: analysis.issues,
          qualityScore: analysis.qualityScore,
          summary: analysis.summary,
        });
      } catch (error) {
        console.warn(`Failed to analyze ${file.filename}:`, error);
        fileAnalyses.push({
          filename: file.filename,
          language: file.language,
          status: file.status,
          issues: [],
          qualityScore: 0,
          summary: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const allIssues = fileAnalyses.flatMap(f => f.issues);
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const warnings = allIssues.filter(i => i.severity === 'warning').length;
    const avgScore = fileAnalyses.length > 0
      ? fileAnalyses.reduce((sum, f) => sum + f.qualityScore, 0) / fileAnalyses.length
      : 0;

    res.json({
      success: true,
      data: {
        pr: {
          number: prInfo.number,
          title: prInfo.title,
          body: prInfo.body,
          state: prInfo.state,
          head: prInfo.head.ref,
          base: prInfo.base.ref,
        },
        files: fileAnalyses,
        overallScore: Math.round(avgScore),
        totalIssues: allIssues.length,
        criticalIssues,
        warnings,
        summary: `Analyzed ${fileAnalyses.length} files in PR #${prInfo.number}. Found ${criticalIssues} critical issues and ${warnings} warnings.`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error analyzing PR:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze PR',
    });
  }
});

export default router;

