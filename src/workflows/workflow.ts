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
  const TOTAL_STEPS = 20;

  let startStep = input.startStep ?? 1;
  let resetRequested: number | null = null;

  setHandler(resetSignal, (step: number) => {
    console.log("Reset requested ->", step);
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
    activities.activity11,
    activities.activity12,
    activities.activity13,
    activities.activity14,
    activities.activity15,
    activities.activity16,
    activities.activity17,
    activities.activity18,
    activities.activity19,
    activities.activity20,
  ];

  for (let step = startStep; step <= TOTAL_STEPS; step++) {

    // Reset logic
    if (resetRequested !== null && resetRequested < step) {
      console.log(`ContinueAsNew -> step ${resetRequested}`);

      await continueAsNew<typeof mainWorkflow>({
        startStep: resetRequested
      });
    }

    // Try load cached result
    const cached = await store.getStepResult(workflowId, step);

    if (cached) {
      console.log(`Skipping step ${step} -> using cached result`);
      continue;
    }

    console.log(`Executing step ${step}`);

    const result = await steps[step - 1]();

    // Save result externally
    await store.saveStepResult(workflowId, step, result);

    await sleep(1);
  }

  console.log("Workflow finished");
}
