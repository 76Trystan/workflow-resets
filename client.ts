import { Client, Connection } from "@temporalio/client";

async function run() {

  const connection = await Connection.connect();
  const client = new Client({ connection });

  const workflowId = "workflow-resets-demo";

  // Start workflow
  const handle = await client.workflow.start("mainWorkflow", {
    taskQueue: "reset-workflow-queue",
    workflowId,
    args: [{ startStep: 1 }]
  });

  console.log(`Started workflow ${handle.workflowId}`);

  // reset after some time
  setTimeout(async () => {
    console.log("Sending reset -> step 10");
    await handle.signal("resetToStep", 10);
  }, 8000);
}

run().catch(console.error);
