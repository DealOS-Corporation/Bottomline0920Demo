# DealOS Deal Workspace

A production-like 3-column deal workspace UI built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **10-Step Workflow Bar**: Full Bottomline workflow with status chips and owner badges
- **3-Column Layout**: 
  - Left: Step Inputs + System Status
  - Center: Deal Header + Artifacts Timeline + Preview Panel
  - Right: Agent Chat with suggested actions
- **Schema-Driven UI**: All steps defined in `stepsSchema.ts`
- **Mock Data**: 3 sample deals with artifacts
- **ROC Step Special Treatment**: Locked badge + progress animation
- **Interactive Chat**: Simulated agent responses with action queuing

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React Icons

## Project Structure

```
deal-workspace/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                    # Home - Deal list
│   └── deals/
│       └── [dealId]/
│           ├── page.tsx            # Deal Workspace
│           └── not-found.tsx
├── components/
│   ├── StepBar.tsx                 # Top step navigation
│   ├── StepInputsPanel.tsx         # Left column - form inputs
│   ├── SystemStatusStrip.tsx       # Left column - system status
│   ├── DealHeader.tsx              # Center - deal info header
│   ├── ArtifactTimeline.tsx        # Center - artifact list
│   ├── PreviewPanel.tsx            # Center - file preview
│   └── AgentChatPanel.tsx          # Right - chat interface
├── lib/
│   ├── stepsSchema.ts              # Step definitions
│   └── mockDeals.ts                # Mock deal data
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Run Instructions

1. **Install dependencies**:
   ```bash
   cd deal-workspace
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Available Routes**:
   - `/` - Home page with deal list
   - `/deals/deal-001` - Enterprise Cloud Migration workspace
   - `/deals/deal-002` - Data Analytics Platform workspace
   - `/deals/deal-003` - Security Suite Upgrade workspace

## Usage

1. Click on any deal from the home page to open the workspace
2. Click steps in the top bar to navigate between workflow stages
3. View and modify step inputs in the left panel
4. Click artifacts to preview them in the bottom center panel
5. Use suggested actions in the chat panel to simulate step execution
6. The ROC step (Step 4) shows special locked treatment with progress animation

## Mock Data

- **3 Deals**: Different customers and stages
- **11 Artifacts**: Various file types (PDF, CSV, Excel, JSON)
- **4 System Statuses**: ROC Engine, Alteryx Server, Salesforce API, Data Lake

## Notes

- No real integrations - all data is mocked
- Actions simulate status changes with timeouts
- Chat responses are simulated
- ROC progress bar animates slowly when viewing ROC step
