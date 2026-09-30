# AI COMPANY OS

Bounded multi-agent company operating system. It plans, coordinates, records approvals, documents products, and prepares delivery artifacts. It does **not** autonomously execute shell commands, write production code, push repositories, or deploy infrastructure.

## Architecture

- **frontend**: Next.js Founder Command Center
- **backend**: FastAPI REST/WebSocket, SQLAlchemy, Alembic
- **agents**: CEO and employee identities, registry, communication bus, product builder
- **orchestrator**: execution planning, assignment, workflow states
- **deployment**: delivery planning/state only
- **memory**: relational memory/retrieval and future VectorStore interface

## Quick start

```bash
cp .env.example .env
docker compose up --build
# In another terminal:
docker compose exec backend alembic upgrade head
docker compose exec backend python /database/seeds/initial_data.py
```

Open `http://localhost:3000/dashboard` and backend docs at `http://localhost:8000/docs`. The virtual floor is `http://localhost:3000/virtual-office`. Floor state is `GET /api/v1/virtual-office/state` and still follows employee status from `/api/v1/company/employees` plus `/ws/company`.

## Step 11 — virtual office

The office visualizes the existing roster (Alexander, Marcus, Olivia, Sophia, David, Emma). It does not add employees or a new command system. Migration `009_virtual_office` adds `office_layout`, `employee_position`, and `office_preferences` only.

Create a development Founder from Python or use the seed helper. Set the resulting UUID in `NEXT_PUBLIC_FOUNDER_ID` before calling the command endpoint.

## Tests

```bash
docker compose exec backend pytest -q
cd frontend && npm install && npm test && npm run build
```

## Security boundary

The delivery engine records artifact plans and state. It intentionally cannot invoke a shell, access secrets, push Git, or deploy. Implement authenticated approvals and sandboxed capability-specific executors before adding those abilities.
