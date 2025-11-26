# Architecture Overview

This project has been split into a traditional frontend/backend architecture while preserving all existing logic.

## Backend (Flask API)

**Location:** `backend/app.py`

The Flask backend provides REST API endpoints that encapsulate all the business logic from the original Streamlit app:

- **Session Management:** Each user session is tracked with a unique session ID
- **Plan Generation:** `/api/plan/generate` - Converts natural language to Bash commands
- **Command Execution:** `/api/command/execute` - Runs commands in Docker sandbox
- **State Management:** `/api/session/<id>/state` - Manages session state (chat history, working folder, etc.)

### Key Endpoints:

- `POST /api/session/init` - Initialize a new session
- `POST /api/plan/generate` - Generate a plan from user input
- `POST /api/command/execute` - Execute the command
- `POST /api/plan/cancel` - Cancel current plan
- `GET /api/session/<id>/state` - Get session state
- `POST /api/session/<id>/clear` - Clear agent memory
- `POST /api/session/<id>/folder` - Set working folder

## Frontend (React)

**Location:** `frontend/src/App.js`

The React frontend provides the same UI experience as the Streamlit version:

- Task input and plan generation
- Command verification with safety warnings
- Execution results display
- Sidebar with system status and settings
- Session state management via API calls

## Unchanged Modules

All core logic modules remain unchanged:

- `llm_engine.py` - LLM integration (unchanged)
- `sandbox.py` - Docker execution (unchanged)
- `security.py` - Security validation (unchanged)

## Data Flow

1. User enters task in React frontend
2. Frontend sends POST request to `/api/plan/generate`
3. Backend calls `security.sanitize_input()` and `llm_engine.get_bash_command()`
4. Backend validates command with `security.validate_command()`
5. Backend returns plan to frontend
6. User reviews and clicks execute
7. Frontend sends POST to `/api/command/execute`
8. Backend calls `sandbox.execute_in_sandbox()`
9. Backend returns result to frontend
10. Frontend displays execution result

## Session Management

Sessions are stored in-memory on the backend. Each session maintains:
- Chat history
- Current plan
- Last execution result
- Working folder path
- Risk status

**Note:** For production, consider using Redis or a database for session storage.

