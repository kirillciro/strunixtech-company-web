# Next Stages Plan

## Current Baseline

The project is in early Phase 1.

What is already working:

- Next.js frontend routes for landing, auth, dashboard, messages, and templates
- Express backend with JWT auth endpoints
- PostgreSQL connection and a users table
- Protected frontend app shell using the stored JWT session

What is still placeholder-only:

- chat UI
- templates data
- template preview flow
- dashboard data
- project tracking
- scheduling
- payments
- uploads
- AI generation

## Recommended Build Order

### Stage 1: Finish MVP Foundation

Goal: make the existing screens real instead of mocked.

Build next:

1. Expand the database schema
2. Add backend APIs for templates and messages
3. Replace static frontend data with API data
4. Turn the dashboard into a real client workspace

Database tables to add first:

- templates
- template_assets or template_previews
- conversations
- messages
- projects
- project_status_history

Why this stage comes first:

- chat depends on persisted users and conversations
- templates depend on real records and detail pages
- dashboard depends on projects and message counts

### Stage 2: Real-Time Chat

Goal: make live chat the main trust feature of the product.

Build:

1. REST endpoints to load conversations and message history
2. Socket.io for real-time send/receive
3. Developer and client conversation states
4. Unread message tracking

Definition of done:

- landing/chat entry creates or attaches to a conversation
- logged-in users can continue the conversation in /messages
- messages persist after refresh

### Stage 3: Template Marketplace

Goal: make templates the first real product surface.

Build:

1. templates API
2. template detail API
3. preview/demo route per template
4. basic customization controls for colors, fonts, and layout presets

Definition of done:

- templates are loaded from the backend
- each template has a detail page
- Preview Demo opens a working preview state

### Stage 4: Demo Request Pipeline

Goal: turn template interest into qualified leads.

Build:

1. form for logo, company name, description, and images
2. Cloudinary uploads
3. demo request records in the database
4. generated preview variants placeholder flow

Important note:

The AI UI generation can start as a guided placeholder workflow first. Do not block the funnel on full AI generation quality.

### Stage 5: Scheduling

Goal: convert qualified leads into booked calls.

Build:

1. availability model in the database
2. schedule selection page
3. booking confirmation flow
4. notification hooks for developer and client

Definition of done:

- users can book a time slot
- bookings are saved and unavailable slots cannot be double-booked

### Stage 6: Payments

Goal: start the commercial workflow.

Build:

1. Mollie payment creation endpoint
2. deposit payment page
3. webhook handler
4. payment status tracking in PostgreSQL

Definition of done:

- 25% deposit link is generated
- webhook marks payment as successful
- user is moved into the next project stage after successful payment

### Stage 7: Project Tracking Workspace

Goal: keep clients informed during delivery.

Build:

1. project detail page
2. progress timeline
3. milestone updates
4. final approval and remaining 75% payment flow

### Stage 8: Advanced Systems

Build later:

- multi-language landing pages
- admin dashboard
- notifications
- mobile app for chat and progress
- full AI UI generation system

## Best Next Implementation

The strongest next move is:

1. Extend the schema
2. Build templates API
3. Build persisted chat API

That order is better than starting with payments or AI because it completes the core funnel first:

ads -> landing -> auth -> templates -> chat -> qualification

## Suggested Immediate Task List

If we continue now, this is the sequence I recommend implementing:

1. Create a new SQL migration for templates, conversations, messages, and projects
2. Add backend routes for templates list, template detail, conversations list, and send message
3. Refactor the frontend templates and messages pages to use the new APIs
4. Upgrade the dashboard to show real counts and recent activity
