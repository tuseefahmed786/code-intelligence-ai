import OpenAI from 'openai';
import { config } from '../config/env';

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    if (config.openaiApiKey) {
      this.client = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY in environment variables.');
    }
    return this.client;
  }

  async analyzeCode(code: string, language: string, context?: string): Promise<{
    issues: Array<{
      severity: 'critical' | 'warning' | 'info';
      type: string;
      message: string;
      line?: number;
      suggestion?: string;
    }>;
    qualityScore: number;
    summary: string;
    improvements: string[];
  }> {
    const client = this.ensureClient();
    
    const prompt = `You are an expert code reviewer analyzing ${language} code. Analyze the following code and provide:
1. Security vulnerabilities
2. Performance issues
3. Code smells and anti-patterns
4. Best practice violations
5. Overall quality score (0-100)
6. Specific improvement suggestions

${context ? `Context: ${context}\n` : ''}
Code:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format:
{
  "issues": [
    {
      "severity": "critical|warning|info",
      "type": "security|performance|code-smell|best-practice",
      "message": "description",
      "line": number,
      "suggestion": "how to fix"
    }
  ],
  "qualityScore": number,
  "summary": "overall assessment",
  "improvements": ["suggestion1", "suggestion2"]
}`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateDocumentation(code: string, language: string, filePath?: string): Promise<{
    description: string;
    parameters?: Array<{ name: string; type: string; description: string }>;
    returns?: string;
    examples?: string[];
    comments: string;
  }> {
    const client = this.ensureClient();

    const prompt = `Generate comprehensive documentation for this ${language} code${filePath ? ` from ${filePath}` : ''}.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Clear description of what the code does
2. Parameters (if function/method)
3. Return value (if applicable)
4. Usage examples
5. Inline comments version

Respond in JSON:
{
  "description": "what it does",
  "parameters": [{"name": "...", "type": "...", "description": "..."}],
  "returns": "return value description",
  "examples": ["example1", "example2"],
  "comments": "code with inline comments"
}`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a technical documentation expert. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate documentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateTests(code: string, language: string, framework?: string): Promise<{
    testCases: Array<{
      name: string;
      description: string;
      testCode: string;
      expectedResult: string;
    }>;
    coverage: {
      unit: number;
      integration: number;
      edgeCases: number;
    };
  }> {
    const client = this.ensureClient();

    const prompt = `Generate comprehensive test cases for this ${language} code${framework ? ` using ${framework}` : ''}.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Unit tests covering all functions/methods
2. Integration tests
3. Edge cases and boundary conditions
4. Test code ready to use

Respond in JSON:
{
  "testCases": [
    {
      "name": "test name",
      "description": "what it tests",
      "testCode": "actual test code",
      "expectedResult": "expected outcome"
    }
  ],
  "coverage": {
    "unit": percentage,
    "integration": percentage,
    "edgeCases": number
  }
}`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a testing expert. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeArchitecture(files: Array<{ path: string; code: string }>, language: string): Promise<{
    dependencies: Array<{ from: string; to: string; type: string }>;
    antiPatterns: Array<{ file: string; pattern: string; severity: string; suggestion: string }>;
    refactoringSuggestions: Array<{ file: string; issue: string; solution: string }>;
    architectureScore: number;
    summary: string;
  }> {
    const client = this.ensureClient();

    const fileList = files.map(f => `File: ${f.path}\n\`\`\`${language}\n${f.code}\n\`\`\``).join('\n\n');

    const prompt = `Analyze the architecture of this ${language} codebase. Identify:
1. Dependencies between files/modules
2. Anti-patterns and code smells
3. Refactoring opportunities
4. Overall architecture quality

${fileList}

Respond in JSON:
{
  "dependencies": [{"from": "file1", "to": "file2", "type": "import|dependency"}],
  "antiPatterns": [{"file": "...", "pattern": "...", "severity": "high|medium|low", "suggestion": "..."}],
  "refactoringSuggestions": [{"file": "...", "issue": "...", "solution": "..."}],
  "architectureScore": number,
  "summary": "overall assessment"
}`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a software architecture expert. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to analyze architecture: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openAIService = new OpenAIService();

