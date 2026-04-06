# Farmer Todo API

## Setup

```bash
npm install
npm run setup       # starts Docker, runs migrations, seeds DB
npm run dev         # starts dev server on http://localhost:3000
```

## Endpoints

| Method | Path                    | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| POST   | /api/auth/register      | No   | Register                 |
| POST   | /api/auth/login         | No   | Login, returns JWT       |
| GET    | /api/todos              | Yes  | List todos               |
| POST   | /api/todos              | Yes  | Create todo              |
| GET    | /api/todos/route        | Yes  | Optimised route (TSP)    |
| GET    | /api/todos/next-route   | Yes  | Next nearest stop        |
| GET    | /api/todos/:id          | Yes  | Get single todo          |
| PUT    | /api/todos/:id          | Yes  | Update todo              |
| DELETE | /api/todos/:id          | Yes  | Delete todo              |
| GET    | /health                 | No   | Health check             |

## Demo credentials (after seed)
- email: demo@example.com
- password: password123
