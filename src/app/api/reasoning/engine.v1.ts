import { interpret } from "xstate";
import {
  StateConfig,
  EvaluationInput,
  EvaluatorResult,
  ReasoningEngine,
  Context,
  MachineEvent,
  program as machineMacro,
  Task,
} from ".";
import { createThread, sendMessage } from "@/app/api/openai";
import { Thread } from "openai/resources/beta/index.mjs";
import { programmer, solver } from "./prompts";
import { MessageContentText } from "openai/resources/beta/threads/index.mjs";

async function getThread() {
  const { thread } = await createThread(
    "Chemli",
    "You are a helpful AI assistant tasked with helping reverse engineer cosmetic formulas from marketing claims.",
  );
  return thread;
}

async function solve(query: string, thread?: Thread): Promise<string> {
  // TODO get the prompts and send request to API
  if (!thread) {
    thread = await getThread();
  }
  const { user, system } = await solver(query);

  const result = await sendMessage(thread, user, system, process.env.CHEMLI_SOLVER_ASSISTANT);
  const value = (result?.content[0] as MessageContentText).text.value;
  return value;
}

async function program(query: string, functionCatalog: string, thread?: Thread): Promise<StateConfig[]> {
  // TODO get the prompts and send request to API, then parse the StateConfig[]
  // if we fail to parse add retry
  // TODO get the prompts and send request to API
  if (!thread) {
    thread = await getThread();
  }

  const { user, system } = await programmer(query, functionCatalog);
  // TODO consider creating a different assistant for the programmer, though it probably isn't useful without fine tuning
  const result = await sendMessage(thread, user, system, process.env.CHEMLI_SOLVER_ASSISTANT);
  const value = (result?.content[0] as MessageContentText).text.value;
  const unwrapped = value.match(/```json\s+([\s\S]*?)\s+```/)?.[1] || value;

  return JSON.parse(unwrapped) as StateConfig[];
}

async function evaluate(input: EvaluationInput): Promise<EvaluatorResult> {
  try {
    const tools = new Map<string, Task>(
      input.states.map((state) => [
        state.id,
        {
          description: state.id,
          implementation: (context: Context, event: MachineEvent) => console.log(event),
        },
      ]),
    );
    const machine = machineMacro(input.states, tools);

    const withContext = machine.withContext({
      status: 0,
      requestId: "test",
      stack: [],
    });

    const machineExecution = interpret(withContext);
  } catch (e) {
    return {
      rating: 0,
      error: e as Error,
    };
  }
  // TODO better evaluation. For now if it compiles we are good. When we have evaluator models we'll expand
  return {
    rating: 1,
  };
}

const implementation: ReasoningEngine = {
  solver: { solve },
  programmer: { program },
  evaluator: { evaluate },
};

export default implementation;
