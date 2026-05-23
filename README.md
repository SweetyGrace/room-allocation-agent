# Room Allocation Agent

This agent is built on the existing repo and provides room allocation functionality using a retrieval-augmented generation (RAG) approach with PydanticAI.

## What is included

- FastAPI-based agent backend
- RAG over project docs and code to ground responses
- Typed tool definitions and payload validation using PydanticAI
- SSE / streaming support for frontend progress updates
- Integration points for room allocation endpoints and frontend callbacks

## What I used

- Existing repository source and task definitions
- Room allocation business rules from product docs
- Frontend integration code for room allocation
- PydanticAI for structured tools, typed dependencies, and model output validation

## RAG

- Uses repository docs and code snippets as retrieval sources
- Helps enforce rules and produce explainable allocation decisions
- Keeps agent output grounded in the existing project context

## PydanticAI features used

- Typed tools with Pydantic input/output schemas
- Dependency injection for API clients and config values
- Validation on tool inputs and outputs
- Structured run results for deterministic parsing
- Streaming capability for real-time UI feedback
- Provider adapters for LLM integration

## Start

- Run the room allocation agent from the `room-allocation-agent` directory:
  - `uvicorn main:app --reload`
- Or use the repo-specific start script if available:
  - `npm run start:room-allocation`
  - `yarn start:room-allocation`

## Notes

- This README is added to the `room-allocation-agent` folder
- The agent is designed to work with the existing frontend allocation flow
