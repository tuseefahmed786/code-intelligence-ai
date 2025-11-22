import * as fs from 'fs/promises';
import * as path from 'path';
import { openAIService } from './openaiService';

export interface FileAnalysis {
  path: string;
  language: string;
  code: string;
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    type: string;
    message: string;
    line?: number;
    suggestion?: string;
  }>;
  qualityScore: number;
  documentation?: {
    description: string;
    parameters?: Array<{ name: string; type: string; description: string }>;
    returns?: string;
    examples?: string[];
  };
}

export interface CodebaseAnalysis {
  files: FileAnalysis[];
  overallScore: number;
  totalIssues: number;
  criticalIssues: number;
  warnings: number;
  summary: string;
}

class CodeAnalyzer {
  private readonly supportedExtensions: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.swift': 'swift',
    '.kt': 'kotlin',
  };

  private getLanguageFromPath(filePath: string): string | null {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedExtensions[ext] || null;
  }

  private async shouldIgnoreFile(filePath: string): Promise<boolean> {
    const ignorePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '.env',
      'package-lock.json',
      'yarn.lock',
      '.DS_Store',
    ];

    return ignorePatterns.some(pattern => filePath.includes(pattern));
  }

  async readCodebase(directoryPath: string, maxFiles: number = 50): Promise<Array<{ path: string; code: string; language: string }>> {
    const files: Array<{ path: string; code: string; language: string }> = [];
    const shouldIgnoreFile = this.shouldIgnoreFile.bind(this);
    const getLanguageFromPath = this.getLanguageFromPath.bind(this);

    const walkDir = async (dir: string, baseDir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          if (files.length >= maxFiles) break;

          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(baseDir, fullPath);

          if (await shouldIgnoreFile(relativePath)) {
            continue;
          }

          if (entry.isDirectory()) {
            await walkDir(fullPath, baseDir);
          } else if (entry.isFile()) {
            const language = getLanguageFromPath(relativePath);
            if (language) {
              try {
                const code = await fs.readFile(fullPath, 'utf-8');
                if (code.length < 100000) {
                  files.push({
                    path: relativePath,
                    code,
                    language,
                  });
                }
              } catch (error) {
                console.warn(`Failed to read file ${fullPath}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to read directory ${dir}:`, error);
      }
    };

    await walkDir(directoryPath, directoryPath);
    return files;
  }

  async analyzeFile(filePath: string, code: string, language: string): Promise<FileAnalysis> {
    try {
      const analysis = await openAIService.analyzeCode(code, language, `File: ${filePath}`);

      return {
        path: filePath,
        language,
        code,
        issues: analysis.issues,
        qualityScore: analysis.qualityScore,
      };
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return {
        path: filePath,
        language,
        code,
        issues: [{
          severity: 'warning',
          type: 'analysis-error',
          message: `Failed to analyze: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
        qualityScore: 0,
      };
    }
  }

  async analyzeCodebase(directoryPath: string, options?: {
    generateDocs?: boolean;
    maxFiles?: number;
  }): Promise<CodebaseAnalysis> {
    console.log(`📁 Reading codebase from ${directoryPath}...`);
    const files = await this.readCodebase(directoryPath, options?.maxFiles || 50);
    console.log(`📄 Found ${files.length} files to analyze`);

    const fileAnalyses: FileAnalysis[] = [];
    let processed = 0;

    for (const file of files) {
      processed++;
      console.log(`[${processed}/${files.length}] Analyzing ${file.path}...`);
      
      const analysis = await this.analyzeFile(file.path, file.code, file.language);

      if (options?.generateDocs) {
        try {
          const docs = await openAIService.generateDocumentation(file.code, file.language, file.path);
          analysis.documentation = docs;
        } catch (error) {
          console.warn(`Failed to generate docs for ${file.path}:`, error);
        }
      }

      fileAnalyses.push(analysis);

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const allIssues = fileAnalyses.flatMap(f => f.issues);
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const warnings = allIssues.filter(i => i.severity === 'warning').length;
    const avgScore = fileAnalyses.length > 0
      ? fileAnalyses.reduce((sum, f) => sum + f.qualityScore, 0) / fileAnalyses.length
      : 0;

    return {
      files: fileAnalyses,
      overallScore: Math.round(avgScore),
      totalIssues: allIssues.length,
      criticalIssues,
      warnings,
      summary: `Analyzed ${fileAnalyses.length} files. Found ${criticalIssues} critical issues and ${warnings} warnings.`,
    };
  }
}

export const codeAnalyzer = new CodeAnalyzer();

