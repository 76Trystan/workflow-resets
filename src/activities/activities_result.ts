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
