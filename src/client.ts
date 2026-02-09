import { Client, Connection } from "@temporalio/client";

async function run() {

  const connection = await Connection.connect();
  const client = new Client({ connection });

  const handle = await client.workflow.start("mainWorkflow", {
    taskQueue: "workflow-resets-queue",
    workflowId: "reset-demo",
    args: [{ startStep: 1 }]
  });

  console.log("Workflow started");

  // Reset at step
  setTimeout(async () => {
    console.log("Sending RESET signal to step 10");
    await handle.signal("resetToStep", 10);
  }, 15000);
}

run().catch(console.error);
