import { Ollama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";

interface ResetDecision {
  shouldReset: boolean;
  resetStep?: number;
  reasoning: string;
}

const resetTool = tool(
  async (input: { step: number }) => {
    return `Reset decision made: Will reset to step ${input.step}`;
  },
  {
    name: "reset_workflow",
    description:
      "Resets the workflow to a specific step. Use this when you determine that the workflow should be reset to a previous step.",
    schema: z.object({
      step: z
        .number()
        .describe("The step number to reset the workflow to (must be >= 1)"),
    }),
  }
);

const noResetTool = tool(
  async () => {
    return "Decision made: Continue workflow without reset";
  },
  {
    name: "no_reset",
    description:
      "Continues the workflow without resetting. Use this when you determine the workflow should proceed normally.",
    schema: z.object({}),
  }
);

export async function invokeResetAgent(
  event: string
): Promise<ResetDecision> {
  const llm = new Ollama({
    model: "llama3.1:8b",
    baseUrl: "http://localhost:11434",
    temperature: 0.3,
  });

  const systemPrompt = `You are a workflow orchestration agent responsible for making intelligent decisions about workflow execution.

When you receive a workflow event, analyze it and decide whether the workflow should be reset to a previous step or continue normally.

Consider these factors:
- The current step number
- Any error or issue reported
- Whether resetting makes logical sense
- The pattern of execution so far

Respond with ONLY one of these:
1. "RESET_TO_STEP_X" (where X is the step number) if you think the workflow should reset
2. "CONTINUE_WITHOUT_RESET" if the workflow should proceed normally`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", event],
  ]);

const chain = prompt.pipe(llm);
const response = await chain.invoke({});

const content = String(response);

  if (content.includes("RESET_TO_STEP")) {
    const stepMatch = content.match(/RESET_TO_STEP_(\d+)/);
    const step = stepMatch ? parseInt(stepMatch[1], 10) : 3;

    return {
      shouldReset: true,
      resetStep: step,
      reasoning: content,
    };
  }

  return {
    shouldReset: false,
    reasoning: content,
  };
}