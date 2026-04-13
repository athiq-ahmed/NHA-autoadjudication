# Documentation

Complete project documentation for the NHA Claims Auto-Adjudication System.

## Overview

- **[TECHNICAL.md](TECHNICAL.md)** - Complete technical architecture, design patterns, Azure services integration, and solution design. Start here for a deep dive into how the system works.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Solution architecture, system diagrams, components, data models, and interactions.
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guides for local development, staging, and production environments on Azure.
- **[INTEGRATION_TESTING.md](INTEGRATION_TESTING.md)** - Testing procedures, test sequences, and validation steps for all application features.
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command cheat sheet, development URLs, and build commands for quick lookup.

## Quick Links

### Getting Started
1. Read [TECHNICAL.md](TECHNICAL.md) for system overview
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for setup
4. Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common commands

### For Developers
- **API Documentation**: `http://localhost:8000/docs` (when running)
- **Architecture Details**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **System Design**: [TECHNICAL.md](TECHNICAL.md)
- **Testing Guide**: [INTEGRATION_TESTING.md](INTEGRATION_TESTING.md)
- **Azure Integration**: Section in [TECHNICAL.md](TECHNICAL.md)

### For DevOps/Deployment
- **Deployment Options**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture Overview**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **System Design**: [TECHNICAL.md](TECHNICAL.md) - Deployment Strategy section

## Document Structure

```
docs/
├── README.md                    # This file - documentation index
├── TECHNICAL.md                 # Deep dive into architecture & design
├── ARCHITECTURE.md              # System architecture & components
├── DEPLOYMENT.md                # Setup & deployment guides
├── INTEGRATION_TESTING.md       # Testing procedures
└── QUICK_REFERENCE.md           # Command reference
```

## Key Sections

### TECHNICAL.md
- System Architecture overview
- Technology Stack
- Core Design Patterns (Agentic patterns)
- Data Models
- API Structure
- Azure Services Integration (Storage, Form Recognizer, OpenAI, SQL DB, Notifications)
- Deployment Strategy
- Security Design
- Scalability & Performance
- Development Workflow

### ARCHITECTURE.md
- System Overview & three-tier design
- High-level architecture diagrams
- Component Architecture
- Processing Pipeline
- Data Models & entities
- Component Interaction Flows
- Database Schema
- Deployment Architecture
- Technology Stack

## Technologies Covered

- **Backend**: FastAPI, Python 3.11+, Uvicorn
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Axios
- **Cloud**: Azure (Storage, Form Recognizer, OpenAI, SQL Database, App Service)
- **Infrastructure**: Docker, Docker Compose
- **Development**: Git, VS Code, pytest, npm

---

**Last Updated**: April 13, 2026  
**Version**: 1.0
