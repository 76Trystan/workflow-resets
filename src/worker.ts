import { Worker } from "@temporalio/worker";

async function run() {

  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows/workflow"),
    activities: {
      ...require("./activities/activities"),
      ...require("./activities/activities_result")
    },
    taskQueue: "workflow-resets-queue"
  });

  await worker.run();
}

run().catch(console.error);
