import {
  proxyActivities,
  setHandler,
  continueAsNew,
  sleep
} from "@temporalio/workflow";

import type * as activities from "../activities/stepActivities";
import { resetSignal } from "./resetSignal";

const activityProxy = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute"
});

export interface WorkflowInput {
  startStep?: number;
}

export async function mainWorkflow(input: WorkflowInput = {}) {

  const TOTAL_STEPS = 20;

  let startStep = input.startStep ?? 1;
  let resetRequested: number | null = null;

  // Signal handler
  setHandler(resetSignal, (step: number) => {
    if (step < 1 || step > TOTAL_STEPS) {
      throw new Error(`Invalid reset step ${step}`);
    }
    resetRequested = step;
  });

  for (let step = startStep; step <= TOTAL_STEPS; step++) {

    // Reset logic
    if (resetRequested !== null && resetRequested < step) {

      console.log(`Resetting workflow → step ${resetRequested}`);

      await continueAsNew<typeof mainWorkflow>({
        startStep: resetRequested
      });
    }

    console.log(`Workflow executing step ${step}`);

    await activityProxy.stepActivity(step);

    // Allow signals to process
    await sleep(1);
  }

  console.log("Workflow completed all steps");
}
