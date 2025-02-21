# Nx Go Example

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

This is a full-stack application built with Next.js frontend and Go backend, using Nx for monorepo management.

## Prerequisites

- Node.js (v20 or later)
- Go (v1.24 or later)
- Docker and Docker Compose
- OpenAI API Key

## Project Structure

```
.
├── apps
│   ├── frontend/     # Next.js application
│   └── backend/      # Go server
├── docker-compose.yml
├── Dockerfile.frontend
└── Dockerfile.backend
```

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd nx-go-example
```

2. Create a `.env` file in the root directory:
```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

3. Build and run with Docker:
```bash
docker compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## API Endpoints

### Backend

- `POST /query`
  - Endpoint for querying OpenAI
  - Request body: `{ "query": "your question here" }`
  - Example:
    ```bash
    curl -X POST \
      http://localhost:8080/query \
      -H 'Content-Type: application/json' \
      -d '{"query": "hi, how are you?"}'
    ```

## Development

To run the dev server for your frontend app:
```bash
npx nx dev frontend
```

To create a production bundle:
```bash
npx nx build frontend
```

To see all available targets for a project:
```bash
npx nx show project frontend
```

## Adding New Projects

### Frontend

To generate a new Next.js application:
```bash
npx nx g @nx/next:app demo
```

To generate a new React library:
```bash
npx nx g @nx/react:lib mylib
```

### Backend

The backend is a Go application using:
- Standard net/http package for the server
- OpenAI Go SDK for AI integration

## Useful Links

- [Nx Documentation](https://nx.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Go Documentation](https://golang.org/doc/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
