# Code Intelligence AI - Backend

AI-Powered Code Intelligence Platform Backend API built with Node.js, TypeScript, Express, and OpenAI API.

## Features

- 🔍 **Code Analysis**: Analyze code for security issues, performance problems, and code smells
- 📚 **Documentation Generation**: Auto-generate comprehensive documentation
- 🧪 **Test Generation**: Generate unit and integration tests
- 🏗️ **Architecture Analysis**: Analyze codebase architecture and suggest refactoring
- 📊 **Codebase Analysis**: Full codebase scanning and quality metrics

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Create a `.env` file in the backend directory:
```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

3. **Run in development mode**:
```bash
npm run dev
```

4. **Build for production**:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Code Analysis
- `POST /api/analyze/code` - Analyze a single code snippet
  ```json
  {
    "code": "function test() { return true; }",
    "language": "javascript",
    "context": "optional context"
  }
  ```

- `POST /api/analyze/codebase` - Analyze entire codebase
  ```json
  {
    "directoryPath": "/path/to/codebase",
    "generateDocs": false,
    "maxFiles": 50
  }
  ```

- `POST /api/analyze/architecture` - Analyze codebase architecture
  ```json
  {
    "directoryPath": "/path/to/codebase",
    "maxFiles": 20
  }
  ```

### Documentation
- `POST /api/documentation/generate` - Generate documentation
  ```json
  {
    "code": "function example() {}",
    "language": "javascript",
    "filePath": "optional/path"
  }
  ```

### Tests
- `POST /api/tests/generate` - Generate test cases
  ```json
  {
    "code": "function example() {}",
    "language": "javascript",
    "framework": "jest"
  }
  ```

## Supported Languages

- JavaScript/TypeScript (.js, .jsx, .ts, .tsx)
- Python (.py)
- Java (.java)
- Go (.go)
- Rust (.rs)
- C/C++ (.c, .cpp)
- C# (.cs)
- PHP (.php)
- Ruby (.rb)
- Swift (.swift)
- Kotlin (.kt)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── services/        # Business logic services
│   │   ├── openaiService.ts
│   │   └── codeAnalyzer.ts
│   ├── routes/          # API routes
│   └── index.ts         # Entry point
├── dist/                # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Development

The project uses:
- **TypeScript** for type safety
- **Express** for the web framework
- **OpenAI API** for AI-powered analysis
- **Zod** for request validation
- **tsx** for development with hot reload

## License

MIT

