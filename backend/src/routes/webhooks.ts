import { Router, Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { githubService } from '../services/githubService';
import { openAIService } from '../services/openaiService';
import { config } from '../config/env';

const router = Router();

router.post('/github', async (req: Request, res: Response) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (event !== 'pull_request') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const action = payload.action;
    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
      return res.status(200).json({ message: 'Action ignored' });
    }

    const pr = payload.pull_request;
    const repo = payload.repository.full_name;
    const prNumber = pr.number;

    console.log(`📥 Webhook: Analyzing PR #${prNumber} in ${repo}`);

    const prInfo = await githubService.getPRInfo(repo, prNumber);
    
    const codeFiles = await githubService.getPRCodeFiles(repo, prNumber);
    
    if (codeFiles.length === 0) {
      await postPRComment(repo, prNumber, {
        overallScore: 100,
        files: [],
        summary: 'No code files found in this PR',
        totalIssues: 0,
        criticalIssues: 0,
        warnings: 0,
      });
      
      return res.status(200).json({ message: 'No code files to analyze' });
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

    const analysisResult = {
      overallScore: Math.round(avgScore),
      files: fileAnalyses,
      totalIssues: allIssues.length,
      criticalIssues,
      warnings,
      summary: `Analyzed ${fileAnalyses.length} files in PR #${prInfo.number}. Found ${criticalIssues} critical issues and ${warnings} warnings.`,
    };

    await postPRComment(repo, prNumber, analysisResult);

    return res.status(200).json({
      success: true,
      message: 'PR analyzed and comment posted',
      data: analysisResult,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process webhook',
    });
  }
});

async function postPRComment(
  repo: string,
  prNumber: number,
  result: {
    overallScore: number;
    files: Array<{
      filename: string;
      language: string;
      status: string;
      issues: Array<{
        severity: string;
        message: string;
        suggestion?: string;
      }>;
      qualityScore: number;
      summary: string;
    }>;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    summary: string;
  }
): Promise<void> {
  try {
    if (!config.githubToken) {
      console.warn('GITHUB_TOKEN not set, skipping PR comment');
      return;
    }

    const octokit = new Octokit({ auth: config.githubToken });
    const [owner, repoName] = repo.split('/');

    let comment = `## 🤖 AI Code Analysis Results\n\n`;
    comment += `**Overall Quality Score:** ${result.overallScore}/100\n\n`;
    comment += `**Summary:**\n`;
    comment += `- Files Analyzed: ${result.files.length}\n`;
    comment += `- Total Issues: ${result.totalIssues}\n`;
    comment += `- Critical Issues: ${result.criticalIssues} 🔴\n`;
    comment += `- Warnings: ${result.warnings} ⚠️\n\n`;
    comment += `${result.summary}\n\n`;

    if (result.files.length > 0) {
      comment += `### Files Analysis\n\n`;
      
      for (const file of result.files) {
        const statusEmoji = file.status === 'added' ? '➕' : file.status === 'modified' ? '📝' : '🗑️';
        comment += `#### ${statusEmoji} ${file.filename}\n`;
        comment += `- **Status:** ${file.status}\n`;
        comment += `- **Language:** ${file.language}\n`;
        comment += `- **Quality Score:** ${file.qualityScore}/100\n`;
        comment += `- **Issues Found:** ${file.issues.length}\n\n`;

        if (file.issues.length > 0) {
          const topIssues = file.issues.slice(0, 5);
          for (const issue of topIssues) {
            const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
            comment += `${emoji} **${issue.severity.toUpperCase()}**: ${issue.message}\n`;
            if (issue.suggestion) {
              comment += `   💡 *${issue.suggestion}*\n`;
            }
          }
          if (file.issues.length > 5) {
            comment += `\n*... and ${file.issues.length - 5} more issues*\n`;
          }
        }
        comment += `\n`;
      }
    }

    comment += `---\n*Analyzed by [Code Intelligence AI](https://github.com/yourusername/code-intelligence-ai)*`;

    await octokit.rest.issues.createComment({
      owner,
      repo: repoName,
      issue_number: prNumber,
      body: comment,
    });

    console.log(`✅ Posted analysis comment on PR #${prNumber}`);
  } catch (error) {
    console.error('Failed to post PR comment:', error);
  }
}

export default router;

