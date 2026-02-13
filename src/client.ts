import { Client, Connection } from "@temporalio/client";


const minSignal = 6000;
const maxSignal = 8000
const randomSignal = Math.floor(Math.random() * (maxSignal - minSignal + 1)) + minSignal;

const minStep = 1;
const maxStep = 4;
const randomStep = Math.floor(Math.random() * (maxStep - minStep + 1)) + minStep;



async function run() {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  const handle = await client.workflow.start("mainWorkflow", {
    taskQueue: "workflow-resets-queue",
    workflowId: "reset-demo",
    args: [{ startStep: 1 }]
  });

  console.log("Workflow started\n");

  // Send random during workflow.
  setTimeout(async () => {
    console.log(`\nSending signal: RESET TO STEP ${randomStep}\n`);
    await handle.signal("resetToStep", randomStep);
  }, randomSignal); // signal at random
}

run().catch(console.error);