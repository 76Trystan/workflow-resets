# Workflow Resets with Temporal

A demonstration of how to implement workflow resets and checkpoints in [Temporal](https://temporal.io) using TypeScript. This project shows how to pause a long-running workflow, reset it to an earlier step upon receiving a signal, and resume execution from that checkpoint without re-executing completed steps.

## Overview

This project implements a workflow that:
- Executes 20 sequential steps (activities)
- Caches the results of completed steps externally
- Listens for reset signals from external clients
- Performs a `continueAsNew` operation to resume from a specified earlier step
- Skips already-completed steps by loading cached results

This pattern is useful for workflows that need to be resilient to failures, allow manual intervention, or need to backtrack and re-execute a portion of work based on changed conditions.

## Architecture

### Key Components

**Workflow** (`src/workflows/workflow.ts`)
- Main orchestration logic that runs the 20 steps sequentially
- Handles reset signals via `setHandler(resetSignal, ...)`
- Implements caching logic to skip completed steps
- Uses `continueAsNew` to restart from a specified step

**Activities** (`src/activities/activities.ts`)
- 20 simple async activities that simulate work (1-second sleep each)
- Returns a result string like `"result-1"`, `"result-2"`, etc.

**Result Store** (`src/activities/activities_result.ts`)
- In-memory key-value store for caching step results
- `saveStepResult()` - persists a step's output
- `getStepResult()` - retrieves cached results to avoid re-execution

**Signal Definition** (`src/workflows/resetSignal.ts`)
- Defines the `resetToStep` signal that can be sent from clients
- Carries a number indicating which step to reset to

**Worker** (`src/worker.ts`)
- Registers the workflow and all activities
- Connects to the Temporal server
- Processes tasks from the `workflow-resets-queue` task queue

**Client** (`src/client.ts`)
- Starts a new workflow instance
- Sends a reset signal after 15 seconds to restart from step 10
- Demonstrates how external systems can trigger resets

## How It Works

### Normal Execution Flow

1. Workflow starts at `startStep: 1`
2. For each step 1-20:
   - Check if a reset was requested
   - If no cached result exists, execute the activity
   - Save the result to the external store
   - Continue to the next step
3. Workflow completes

### Reset Flow

1. Workflow is executing (let's say it's on step 15)
2. Client sends `resetToStep(10)` signal
3. Workflow receives the signal and sets `resetRequested = 10`
4. At the next iteration, workflow detects that reset was requested
5. Workflow calls `continueAsNew()` with `startStep: 10`
6. New execution of the workflow begins, starting from step 10
7. Steps 1-9 are skipped (cached results are loaded)
8. Steps 10-20 are re-executed from scratch
9. New results overwrite the cached values for steps 10-20

### Key Pattern: Checkpointing with ContinueAsNew

The `continueAsNew` operation is Temporal's way to reset workflow state while maintaining the same Workflow ID. This is powerful because:
- It creates a clean slate for workflow variables
- It preserves the logical identity of the workflow (same workflow ID)
- It allows passing parameters to control where execution resumes
- It appears as a single logical workflow to external observers

## Prerequisites

- Node.js 18+
- Temporal Server running locally (or Docker)
- npm or yarn

## Installation

```bash
npm install
```

## Running the Demo

### 1. Start Temporal Server

Using Docker (recommended):

```bash
docker run --name temporal -d \
  -p 7233:7233 \
  -p 8233:8233 \
  temporalio/auto-setup:latest
```

Or if you have Temporal installed locally:

```bash
temporal server start-dev
```

### 2. Start the Worker

In one terminal:

```bash
npx ts-node src/worker.ts
```

You should see the worker waiting for tasks on `workflow-resets-queue`.

### 3. Run the Client

In another terminal:

```bash
npx ts-node src/client.ts
```

This will:
- Start the workflow at step 1
- Execute steps 1-9 (approximately 9 seconds)
- Send a reset signal at the 15-second mark to restart from step 10
- Resume from step 10 and execute steps 10-20
- Complete the entire workflow

### Sample Output

```
Workflow started
Activity: Executing step 1
DB Saved result -> WF:reset-demo Step:1
Activity: Executing step 2
DB Saved result -> WF:reset-demo Step:2
...
Sending RESET signal to step 10
Reset requested -> 10
ContinueAsNew -> step 10
DB Loaded result -> WF:reset-demo Step:1
Skipping step 1 -> using cached result
...
DB Loaded result -> WF:reset-demo Step:9
Skipping step 9 -> using cached result
Activity: Executing step 10
DB Saved result -> WF:reset-demo Step:10
...
Activity: Executing step 20
DB Saved result -> WF:reset-demo Step:20
Workflow finished
```

## Code Walkthrough

### Reset Signal Handler

```typescript
setHandler(resetSignal, (step: number) => {
  console.log("Reset requested ->", step);
  resetRequested = step;
});
```

The workflow listens for the `resetToStep` signal and stores the target step.

### Reset Detection

```typescript
if (resetRequested !== null && resetRequested < step) {
  console.log(`ContinueAsNew -> step ${resetRequested}`);
  await continueAsNew<typeof mainWorkflow>({
    startStep: resetRequested
  });
}
```

When a reset is detected at a step beyond the target, the workflow restarts via `continueAsNew`.

### Result Caching

```typescript
const cached = await store.getStepResult(workflowId, step);
if (cached) {
  console.log(`Skipping step ${step} -> using cached result`);
  continue;
}
```

Before executing a step, the workflow checks if it has already been completed and cached.

## Use Cases

- **Failure Recovery**: Workflows that need to resume from a checkpoint after transient failures
- **Manual Correction**: Allow operators to pause a workflow, correct data, and restart from a specific step
- **Dynamic Workflows**: Change workflow logic and restart from an earlier point to apply new logic
- **Long-Running Processes**: Break up multi-day workflows into logical checkpoints
- **A/B Testing**: Test different execution paths by resetting and rerunning portions of workflows

## Advanced Variations

### Partial Step Re-execution

Instead of resetting the entire workflow, you could:
- Mark specific steps as "dirty"
- Only re-execute affected steps
- Preserve results from unaffected steps

### Persistent Caching

Replace the in-memory store with a database:
- PostgreSQL, DynamoDB, or your preferred database
- Provides durability across worker restarts
- Enables sharing state across multiple workflow instances

### Conditional Resets

Instead of manual signals, trigger resets based on:
- Temporal queries
- Timer events
- External system state changes

### Branching Logic

Use reset targets to implement branching:
- Step 5 might have multiple outcomes
- Reset to step 6a or step 6b based on conditions
- Maintain separate execution paths

## Cleanup

To stop everything:

```bash
# Stop the worker (Ctrl+C in terminal)
# Stop the client
# Stop Temporal Server
docker stop temporal && docker rm temporal
```

## Key Concepts

- **Signal**: A way to send messages to running workflows
- **ContinueAsNew**: A workflow method that restarts the workflow with new inputs
- **Activity**: A unit of work (task) executed by workers
- **Workflow ID**: Unique identifier for a workflow instance
- **Task Queue**: Named channel that workers subscribe to for tasks

## References

- [Temporal TypeScript SDK Documentation](https://docs.temporal.io/typescript)
- [Temporal Signals Guide](https://docs.temporal.io/concepts/what-is-a-signal)
- [Continue As New Pattern](https://docs.temporal.io/concepts/what-is-continue-as-new)
- [Temporal Workflow Patterns](https://docs.temporal.io/concepts/what-is-a-workflow)

## License

MIT

## Contributing

Feel free to extend this example with additional features or use cases!