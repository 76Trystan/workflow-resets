# Workflow Resets

A Temporal sample application demonstrating how to build step-based workflows with caching and the ability to reset execution to a previous step using signals.

## What This Project Does

**Workflow Resets** is a TypeScript sample project built on [Temporal](https://temporal.io) that showcases a practical workflow pattern: executing a multi-step process with intelligent caching and signal-driven reset capabilities.

### Key Features

- **Step-based Workflow Execution**: Executes a workflow across 10 sequential steps
- **Result Caching**: Automatically caches step results to avoid re-execution
- **Signal-driven Resets**: Use Temporal signals to pause workflow execution and reset back to any previous step
- **Smart Cache Invalidation**: When a workflow resets, cached results from the reset point onwards are automatically cleared
- **Workflow Continuation**: Uses Temporal's `continueAsNew` pattern to efficiently restart from a specific step without duplicating history

## Why This Project Is Useful

This sample demonstrates real-world workflow patterns:

- **Resilience**: Shows how to recover from failed steps by resetting to a known good state
- **Efficiency**: Demonstrates caching to avoid redundant work while maintaining auditability
- **Control**: Illustrates how to inject dynamic control into running workflows via signals
- **Best Practices**: Uses Temporal SDK patterns effectively (signals, activities, caching, `continueAsNew`)

Perfect for teams building workflows that need recovery capabilities or dynamic execution control.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v14 or later)
- [Temporal CLI](https://docs.temporal.io/cli/) - for running the Temporal server
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/76Trystan/workflow-resets.git
   cd workflow-resets
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Project

This project requires two terminal sessions:

#### Terminal 1: Start the Temporal Server and Worker

```bash
npm run dev
```

This command:
- Starts a local Temporal development server
- Runs the worker that executes activities and workflows
- Listens on the task queue `workflow-resets-queue`

You should see output indicating the server and worker are running.

#### Terminal 2: Execute a Workflow

In a separate terminal, run:

```bash
npm run client
```

This:
1. Starts the `mainWorkflow` with 10 steps
2. Waits n seconds, then sends a `resetToStep` signal with value `3`
3. The workflow pauses, clears cached results from step 3 onwards, and resumes from step 3

### Example Output

```
Workflow started -> ID: reset-demo
Activity executing step 1 -> Cached saves result
Activity executing step 2 -> Cached saves result
Activity executing step 3 -> Cached saves result
Activity executing step 4 -> Cached saves result
Activity executing step 5 -> Cached saves result
...
Sending signal: RESET TO STEP 3
...
Signal Received -> reset is required at step 3
Reset Triggered! -> Going back to step 3
...
Activity executing step 3 -> Cached saves result
Activity executing step 4 -> Cached saves result
.
.
Activity executing step n -> Cached saves result
Workflow finished
```

### How It Works

1. **Workflows Definition** ([src/workflows/workflow.ts](src/workflows/workflow.ts)):
   - The main workflow defines execution steps and caching logic
   - Sets up a signal handler for `resetToStep`
   - Clears cache and restarts using `continueAsNew` when reset is triggered

2. **Activities** ([src/activities/activities.ts](src/activities/activities.ts)):
   - Simple activities that simulate work (10 steps, ~1 second each)

3. **Caching Layer** ([src/activities/activities_result.ts](src/activities/activities_result.ts)):
   - In-memory cache for step results (in production, use a database)
   - Saves and retrieves results per workflow ID and step number
   - Clears results when a reset occurs

4. **Signals** ([src/workflows/resetSignal.ts](src/workflows/resetSignal.ts)):
   - Defines the `resetToStep` signal that the client can send to control execution

## Project Structure

```
src/
├── client.ts              # Client that starts workflows and sends signals
├── worker.ts              # Worker that executes activities and workflows
├── activities/
│   ├── activities.ts      # Activity definitions (step 1-10)
│   └── activities_result.ts  # Caching logic for step results
└── workflows/
    ├── workflow.ts        # Main workflow definition with reset logic
    └── resetSignal.ts     # Signal definition
```

## Customization

### Change the Reset Timing

Edit [src/client.ts](src/client.ts) to change when the reset signal is sent:

```typescript
setTimeout(async () => {
  console.log("\nSending signal: RESET TO STEP 3\n");
  await handle.signal("resetToStep", 3);
}, 11000); // Change this value
```

Note: This can also be swapped out for a more complex trigger. (E.g, Workflow at step 10 -> workflow detects a corrupt result from step 4 -> reset trigger sent -> workflow resets to step 4)

### Add More Steps

1. Add activities to [src/activities/activities.ts](src/activities/activities.ts)
2. Update the `TOTAL_STEPS` constant in [src/workflows/workflow.ts](src/workflows/workflow.ts)
3. Add the new activity to the `steps` array in the workflow

Note: Activities can be swapped out to whatever is needed, whether thats a large calculation or a simple return "string" as shown in this demonstration.

### Use Persistent Storage

Replace the in-memory cache in [src/activities/activities_result.ts](src/activities/activities_result.ts) with a database calls in future.

## Resources

- [Temporal Documentation](https://docs.temporal.io/)
- [Temporal TypeScript SDK](https://docs.temporal.io/typescript)
- [Signals Guide](https://docs.temporal.io/concepts/what-is-a-signal)
- [Activities Guide](https://docs.temporal.io/concepts/what-is-an-activity)
- [Workflow Concepts](https://docs.temporal.io/concepts/what-is-a-workflow-definition)
- [Continue-As-New Documentation](https://docs.temporal.io/workflow-execution/continue-as-new)



## Contributing

All contributions are welcome, Please feel free to:

- Report issues and bugs
- Suggest improvements and new features
- Submit pull requests with enhancements

## License

This project is open source and available under the MIT License. See the LICENSE file for details.
