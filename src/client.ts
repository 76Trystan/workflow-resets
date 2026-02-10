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

  // Send signal when workflow reaches whatever step is at 10 seconds.
  setTimeout(async () => {
    console.log("\nSending signal: RESET TO STEP 5\n");
    await handle.signal("resetToStep", 4);
  }, 10000); // signal after 10 seconds, adjust as needed to hit the desired step or change completely to different type of trigger
}

run().catch(console.error);