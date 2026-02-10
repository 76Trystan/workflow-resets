import { Client, Connection } from "@temporalio/client";

async function run() {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  const handle = await client.workflow.start("mainWorkflow", {
    taskQueue: "workflow-resets-queue",
    workflowId: "reset-demo",
    args: [{ startStep: 1 }]
  });

  console.log("Workflow started\n");

  // Send signal when workflow reaches step 10
  setTimeout(async () => {
    console.log("\nSending signal: RESET TO STEP 2\n");
    await handle.signal("resetToStep", 2);
  }, 10000);  // 10 seconds = when step 10 is executing
}

run().catch(console.error);