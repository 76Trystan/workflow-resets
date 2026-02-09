import { Worker } from "@temporalio/worker";

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows/workflow"),
    activities: require("./activities/stepActivities"),
    taskQueue: "reset-workflow-queue"
  });

  console.log("Worker started");
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
