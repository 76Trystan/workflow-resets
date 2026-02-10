import {
  proxyActivities,
  setHandler,
  continueAsNew,
  workflowInfo,
  sleep
} from "@temporalio/workflow";

import type * as acts from "../activities/activities";
import type * as storeActs from "../activities/activities_result";
import { resetSignal } from "./resetSignal";

const activities = proxyActivities<typeof acts>({
  startToCloseTimeout: "2 minutes"
});

const store = proxyActivities<typeof storeActs>({
  startToCloseTimeout: "1 minute"
});

export async function mainWorkflow(input: { startStep?: number } = {}) {

  const workflowId = workflowInfo().workflowId;
  const TOTAL_STEPS = 10;

  let startStep = input.startStep ?? 1;
  let resetRequested: number | null = null;

  setHandler(resetSignal, (step: number) => {
    console.log(`\nSignal Received -> reset is required at step ${step}\n`);
    resetRequested = step;
  });

  const steps = [
    activities.activity1,
    activities.activity2,
    activities.activity3,
    activities.activity4,
    activities.activity5,
    activities.activity6,
    activities.activity7,
    activities.activity8,
    activities.activity9,
    activities.activity10,
  ];

  console.log(`Workflow started -> ID: ${workflowId}`);

  for (let step = startStep; step <= TOTAL_STEPS; step++) {

    // Try load cached result
    const cached = await store.getStepResult(workflowId, step);

    if (cached) {
      console.log(`Skipping step ${step} -> using cached result`);
    } else {
      console.log(`Activity executing step ${step} -> Cached saves result`);
      const result = await steps[step - 1]();
      await store.saveStepResult(workflowId, step, result);
    }

    // Check for reset AFTER executing/skipping the step
    if (resetRequested !== null && resetRequested < step) {
      console.log(`\nReset Triggered! -> Going back to step ${resetRequested}\n`);
      
      // Clear cache from reset point onwards
      await store.clearStepResultsFrom(workflowId, resetRequested);
      
      // Restart workflow from reset step
      await continueAsNew<typeof mainWorkflow>({
        startStep: resetRequested
      });
    }

    // Allow signals to be processed between steps
    await sleep(100);
  }

  console.log(`Workflow finished`);
}