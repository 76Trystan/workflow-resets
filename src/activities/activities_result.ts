const store: Record<string, Record<number, string>> = {};

export async function saveStepResult(
  workflowId: string,
  step: number,
  result: string
) {
  if (!store[workflowId]) store[workflowId] = {};
  store[workflowId][step] = result;

  console.log(`DB Saved result -> WF:${workflowId} Step:${step}`);
}

export async function getStepResult(
  workflowId: string,
  step: number
): Promise<string | null> {

  const result = store[workflowId]?.[step] ?? null;

  if (result) {
    console.log(`DB Loaded result -> WF:${workflowId} Step:${step}`);
  }

  return result;
}

export async function clearStepResultsFrom(
  workflowId: string,
  fromStep: number
): Promise<void> {
  if (!store[workflowId]) return;

  // Delete all cached results from the specified step onwards
  const stepsToDelete: number[] = [];
  for (const stepStr in store[workflowId]) {
    const step = parseInt(stepStr, 10);
    if (step >= fromStep) {
      stepsToDelete.push(step);
      delete store[workflowId][step];
    }
  }

  if (stepsToDelete.length > 0) {
    console.log(`DB Cleared results for steps: ${stepsToDelete.join(", ")}`);
  }
}