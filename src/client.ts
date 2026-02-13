import { Client, Connection } from "@temporalio/client";
import { invokeResetAgent } from "./agents/resetAgent";

async function run() {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  const handle = await client.workflow.start("mainWorkflow", {
    taskQueue: "workflow-resets-queue",
    workflowId: "reset-demo",
    args: [{ startStep: 1 }],
  });

  console.log("Workflow started\n");

  const minSignal = 6000;
  const maxSignal = 8000;
  const randomSignal =
    Math.floor(Math.random() * (maxSignal - minSignal + 1)) + minSignal;

  setTimeout(async () => {
    const event =
      "Workflow was almost complete. Step 'X' has a problem. Should the workflow reset?";

    console.log(`\nAgent analyzing event: "${event}"\n`);

    const decision = await invokeResetAgent(event);

    console.log(`Agent reasoning: ${decision.reasoning}\n`);

    if (decision.shouldReset && decision.resetStep) {
      console.log(
        `Agent decision: RESET TO STEP ${decision.resetStep}\n`
      );
      await handle.signal("resetToStep", decision.resetStep);
    } else {
      console.log(`Agent decision: CONTINUE WITHOUT RESET\n`);
    }
  }, randomSignal);
}

run().catch(console.error);