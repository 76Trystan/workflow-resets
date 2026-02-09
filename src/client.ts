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

  // Reset after ~12 seconds (around step 12)
  setTimeout(async () => {
    console.log("Sending RESET signal to step 5");
    await handle.signal("resetToStep", 5);
  }, 12000);
}

run().catch(console.error);
