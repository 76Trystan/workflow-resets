import { Worker } from "@temporalio/worker";

async function run() {

  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows/mainWorkflow"),
    activities: require("./activities/activities"),
    taskQueue: "workflow-resets-queue"
  });

  console.log("Worker running...");
  await worker.run();
}

run().catch(console.error);
