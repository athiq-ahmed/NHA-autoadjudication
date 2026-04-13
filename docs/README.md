# Documentation

Complete documentation for the NHA Claims Auto-Adjudication System.

## Overview

- **[TECHNICAL.md](TECHNICAL.md)** - Complete technical architecture, design patterns, Azure services integration, and solution design. Start here for a deep dive into how the system works.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture diagrams, component interactions, data models, and API reference.
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guides for local development, staging, and production environments on Azure.
- **[INTEGRATION_TESTING.md](INTEGRATION_TESTING.md)** - Testing procedures, test sequences, and validation steps for all application features.
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command cheat sheet, development URLs, and build commands for quick lookup.
- **[ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)** - Visual system architecture and data flow diagrams.

## Quick Links

### Getting Started
1. Read [TECHNICAL.md](TECHNICAL.md) for system overview
2. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for setup
3. Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common commands

### For Developers
- **API Documentation**: `http://localhost:8000/docs` (when running)
- **Architecture Details**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Testing Guide**: [INTEGRATION_TESTING.md](INTEGRATION_TESTING.md)
- **Azure Integration**: Section in [TECHNICAL.md](TECHNICAL.md)

### For DevOps/Deployment
- **Deployment Options**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture Overview**: [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)
- **System Design**: [TECHNICAL.md](TECHNICAL.md) - Deployment Strategy section

## Document Structure

```
docs/
├── README.md                    # This file - documentation index
├── TECHNICAL.md                 # Deep dive into architecture & design
├── ARCHITECTURE.md              # System components & data models
├── DEPLOYMENT.md                # Setup & deployment guides
├── INTEGRATION_TESTING.md       # Testing procedures
├── QUICK_REFERENCE.md           # Command reference
└── ARCHITECTURE_DIAGRAMS.md     # Visual diagrams
```

## Key Sections in TECHNICAL.md

1. **System Architecture** - High-level overview, component responsibilities
2. **Technology Stack** - Frontend, backend, infrastructure, tools
3. **Core Design Patterns** - Agentic workflows, REST API, separation of concerns
4. **Data Models** - Core entities and schemas
5. **API Structure** - REST endpoints and response formats
6. **Azure Services Integration** - Storage, Form Recognizer, OpenAI, SQL DB, Notifications
7. **Deployment Strategy** - Dev, staging, production setups
8. **Security Design** - Auth, data protection, API security
9. **Scalability & Performance** - Optimization strategies
10. **Development Workflow** - Local setup, file structure, testing

## Technologies Covered

- **Backend**: FastAPI, Python 3.11+, Uvicorn
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Axios
- **Cloud**: Azure (Storage, Form Recognizer, OpenAI, SQL Database, App Service)
- **Infrastructure**: Docker, Docker Compose
- **Development**: Git, VS Code, pytest, npm

## Future Documentation

- Mobile app documentation
- Mobile app documentation
- Advanced analytics guide
- Custom rule engine documentation
- Federated learning architecture

---

**Last Updated**: April 13, 2026  
**Version**: 1.0
