import { Octokit } from '@octokit/rest';
import { config } from '../config/env';

interface PRFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

interface PRInfo {
  number: number;
  title: string;
  body: string;
  state: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  files: PRFile[];
}

class GitHubService {
  private octokit: Octokit | null = null;

  constructor() {
    if (config.githubToken) {
      this.octokit = new Octokit({
        auth: config.githubToken,
      });
    }
  }

  private ensureClient(): Octokit {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized. Please set GITHUB_TOKEN in environment variables.');
    }
    return this.octokit;
  }

  private parseRepo(repo: string): { owner: string; repo: string } {
    const parts = repo.split('/');
    if (parts.length !== 2) {
      throw new Error('Invalid repository format. Use "owner/repo"');
    }
    return { owner: parts[0], repo: parts[1] };
  }

  async getPRInfo(repo: string, prNumber: number): Promise<PRInfo> {
    const client = this.ensureClient();
    const { owner, repo: repoName } = this.parseRepo(repo);

    try {
      const { data: pr } = await client.pulls.get({
        owner,
        repo: repoName,
        pull_number: prNumber,
      });

      const { data: files } = await client.pulls.listFiles({
        owner,
        repo: repoName,
        pull_number: prNumber,
      });

      return {
        number: pr.number,
        title: pr.title,
        body: pr.body || '',
        state: pr.state,
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
        },
        files: files.map((file) => ({
          filename: file.filename,
          status: file.status as 'added' | 'modified' | 'removed' | 'renamed',
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch || undefined,
        })),
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`PR #${prNumber} not found in ${repo}`);
      }
      if (error.status === 401 || error.status === 403) {
        throw new Error('GitHub authentication failed. Check your GITHUB_TOKEN.');
      }
      throw new Error(`Failed to fetch PR: ${error.message}`);
    }
  }

  extractCodeChanges(patch: string): Array<{
    line: number;
    content: string;
    type: 'added' | 'removed' | 'context';
  }> {
    const changes: Array<{
      line: number;
      content: string;
      type: 'added' | 'removed' | 'context';
    }> = [];

    if (!patch) return changes;

    const lines = patch.split('\n');
    let addedLine = 0;
    let removedLine = 0;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match) {
          removedLine = parseInt(match[1], 10);
          addedLine = parseInt(match[2], 10);
        }
        continue;
      }

      if (line.startsWith('+') && !line.startsWith('+++')) {
        changes.push({
          line: addedLine++,
          content: line.substring(1),
          type: 'added',
        });
        removedLine++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        changes.push({
          line: removedLine++,
          content: line.substring(1),
          type: 'removed',
        });
      } else if (line.startsWith(' ')) {
        changes.push({
          line: addedLine++,
          content: line.substring(1),
          type: 'context',
        });
        removedLine++;
      }
    }

    return changes;
  }

  async getFileContent(repo: string, path: string, ref: string): Promise<string> {
    const client = this.ensureClient();
    const { owner, repo: repoName } = this.parseRepo(repo);

    try {
      const { data } = await client.repos.getContent({
        owner,
        repo: repoName,
        path,
        ref,
      });

      if (Array.isArray(data)) {
        throw new Error(`${path} is a directory, not a file`);
      }

      if (data.type !== 'file') {
        throw new Error(`${path} is not a file`);
      }

      if ('content' in data && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      throw new Error(`No content found for ${path}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`File ${path} not found at ${ref}`);
      }
      throw new Error(`Failed to fetch file: ${error.message}`);
    }
  }

  async getPRCodeFiles(repo: string, prNumber: number): Promise<Array<{
    filename: string;
    language: string;
    code: string;
    patch?: string;
    status: string;
  }>> {
    const prInfo = await this.getPRInfo(repo, prNumber);
    const codeFiles: Array<{
      filename: string;
      language: string;
      code: string;
      patch?: string;
      status: string;
    }> = [];

    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs',
      '.cpp', '.c', '.cs', '.php', '.rb', '.swift', '.kt', '.vue',
      '.html', '.css', '.scss', '.less', '.json', '.yaml', '.yml',
    ];

    for (const file of prInfo.files as PRFile[]) {
      if (file.status === 'removed') continue;

      const ext = file.filename.substring(file.filename.lastIndexOf('.'));
      if (!codeExtensions.includes(ext.toLowerCase())) continue;

      try {
        const code = await this.getFileContent(repo, file.filename, prInfo.head.sha);
        
        const languageMap: Record<string, string> = {
          '.js': 'javascript', '.jsx': 'javascript',
          '.ts': 'typescript', '.tsx': 'typescript',
          '.py': 'python', '.java': 'java',
          '.go': 'go', '.rs': 'rust',
          '.cpp': 'cpp', '.c': 'c',
          '.cs': 'csharp', '.php': 'php',
          '.rb': 'ruby', '.swift': 'swift',
          '.kt': 'kotlin', '.vue': 'vue',
          '.html': 'html', '.css': 'css',
          '.scss': 'scss', '.less': 'less',
          '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml',
        };

        codeFiles.push({
          filename: file.filename,
          language: languageMap[ext.toLowerCase()] || 'text',
          code: code.substring(0, 50000),
          patch: file.patch,
          status: file.status,
        });
      } catch (error) {
        console.warn(`Failed to fetch file ${file.filename}:`, error);
      }
    }

    return codeFiles;
  }
}

export const githubService = new GitHubService();

