import {
  proxyActivities,
  setHandler,
  continueAsNew,
  sleep
} from "@temporalio/workflow";

import type * as acts from "../activities/activities";
import { resetSignal } from "./resetSignal";

const activities = proxyActivities<typeof acts>({
  startToCloseTimeout: "2 minutes"
});

export interface WorkflowInput {
  startStep?: number;
}

export async function mainWorkflow(input: WorkflowInput = {}) {

  const TOTAL_STEPS = 20;

  let startStep = input.startStep ?? 1;
  let resetRequested: number | null = null;

  setHandler(resetSignal, (step: number) => {
    console.log("Reset signal received →", step);
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

    if (resetRequested !== null && resetRequested < step) {

      console.log(`ContinueAsNew -> restarting at step ${resetRequested}`);

      await continueAsNew<typeof mainWorkflow>({
        startStep: resetRequested
      });
    }

    console.log("Running step", step);

    await steps[step - 1]();

    await sleep(1);
  }

  console.log("Workflow finished all steps");
}
