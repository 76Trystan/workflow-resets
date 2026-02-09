import { defineSignal } from "@temporalio/workflow";

export const resetSignal = defineSignal<[number]>("resetToStep");
