# 🖥️ Server Monitoring Dashboard

A simple, production-ready server monitoring dashboard built with **Node.js**, **Express**, and **vanilla JavaScript**. Provides real-time system metrics and activity logs via a sleek dark-themed UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16-green.svg)
![Tests](https://img.shields.io/badge/tests-jest-brightgreen.svg)

---

## ✨ Features

- **Real-time System Metrics** — CPU load, memory usage, uptime, and server status
- **Activity Logs** — Paginated, filterable log viewer with color-coded severity levels
- **Auto-Refresh** — Status updates every 5 seconds, logs every 10 seconds
- **Responsive UI** — Tailwind CSS dark theme optimized for desktop and mobile
- **RESTful API** — Clean JSON endpoints for status and logs
- **Comprehensive Testing** — Unit and integration tests with 80%+ coverage
- **CI/CD Ready** — GitHub Actions workflow for multi-version Node.js testing
- **Zero Database** — In-memory storage with realistic dummy data generator

---

## 📋 Prerequisites

- **Node.js** >= 16.x
- **npm** >= 8.x

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/server-monitoring-dashboard.git

# Navigate to the project directory
cd server-monitoring-dashboard

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

---

## ⚙️ Environment Setup

Edit the `.env` file to customize settings:

| Variable          | Default       | Description                    |
|-------------------|---------------|--------------------------------|
| `PORT`            | `3000`        | Server port                    |
| `NODE_ENV`        | `development` | Environment mode               |
| `LOG_LEVEL`       | `info`        | Logging level (info/warn/error)|
| `UPDATE_INTERVAL` | `5000`        | Frontend refresh interval (ms) |

---

## 🏃 Running Locally

```bash
# Development mode (with hot reload via nodemon)
npm run dev

# Production mode
npm start
```

Open your browser at **http://localhost:3000** to view the dashboard.

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run linter
npm run lint
```

---

## 📡 API Documentation

### Endpoints

| Method | Path          | Description                           |
|--------|---------------|---------------------------------------|
| GET    | `/api/status` | Returns current server metrics        |
| GET    | `/api/logs`   | Returns paginated & filtered logs     |
| POST   | `/api/logs`   | Creates a new log entry (simulation)  |

### GET /api/status

**Response:**

```json
{
  "success": true,
  "data": {
    "serverStatus": "online",
    "uptime": 1234567,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "memoryUsage": {
      "used": 123456789,
      "total": 987654321,
      "percentage": 12.5
    },
    "cpuLoad": 0.45,
    "version": "1.0.0"
  }
}
```

### GET /api/logs

**Query Parameters:**

| Param   | Default | Description                        |
|---------|---------|------------------------------------|
| `limit` | `10`    | Max entries to return (max 100)    |
| `level` | —       | Filter: `info`, `warn`, or `error` |
| `offset`| `0`     | Pagination offset                  |

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid-v4",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "level": "info",
        "message": "Server health check passed",
        "source": "system"
      }
    ],
    "total": 50,
    "pagination": { "limit": 10, "offset": 0 }
  }
}
```

### POST /api/logs

**Request Body:**

```json
{
  "level": "info",
  "message": "Custom log message",
  "source": "user"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "level": "info",
    "message": "Custom log message",
    "source": "user"
  }
}
```

---

## 📁 Project Structure

```
server-monitoring-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI/CD
├── public/
│   ├── index.html                  # Dashboard UI
│   ├── css/
│   │   └── styles.css              # Custom CSS
│   └── js/
│       └── dashboard.js            # Frontend logic
├── src/
│   ├── server.js                   # Express server entry point
│   ├── routes/
│   │   ├── status.js               # /api/status endpoint
│   │   └── logs.js                 # /api/logs endpoint
│   ├── services/
│   │   └── monitorService.js       # Business logic
│   └── utils/
│       └── logger.js               # Logging utility
├── tests/
│   ├── unit/
│   │   ├── server.test.js
│   │   ├── routes/
│   │   │   ├── status.test.js
│   │   │   └── logs.test.js
│   │   └── services/
│   │       └── monitorService.test.js
│   └── integration/
│       └── api.integration.test.js
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── jest.config.js
├── package.json
└── README.md
```

---

## 🔄 GitHub Actions

The CI/CD pipeline automatically runs on every push and pull request:

1. **Matrix Testing** — Tests against Node.js 16.x, 18.x, and 20.x
2. **Linting** — Enforces code style with ESLint
3. **Unit & Integration Tests** — Full test suite with Jest
4. **Coverage Report** — Uploaded to Codecov

---

## 📝 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 👤 Author

Built with ❤️ for server monitoring made simple.
