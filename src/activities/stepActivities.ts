export async function stepActivity(step: number): Promise<void> {
  console.log(`Activity: Executing step ${step}`);

  // simulate real work
  await new Promise((resolve) => setTimeout(resolve, 500));
}
