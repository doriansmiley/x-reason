import { interpret } from "xstate";
import {
    StateConfig,
    EvaluationInput,
    EvaluatorResult,
    ReasoningEngine,
    Context,
    MachineEvent,
    programV2 as machineMacro,
    Task,
} from ".";
import { chatCompletion } from "@/app/api/openai";
import { Thread } from "openai/resources/beta/index.mjs";
import { programmer, solver } from "./prompts";
import { MessageContentText } from "openai/resources/beta/threads/index.mjs";
import { extractJsonFromBackticks } from "@/app/utils";

async function solve(query: string, thread?: Thread): Promise<string> {
    // TODO remove the use of the threads API and go with completions
    const { user, system } = await solver(query);

    const result = await chatCompletion({
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
        ],
        model: "gpt-4-0125-preview"
    });
    const value = result;
    return value || '';
}

async function program(query: string, functionCatalog: string, thread?: Thread): Promise<StateConfig[]> {
    // TODO remove the use of the threads API and go with completions
    const { user, system } = await programmer(query, functionCatalog);
    // TODO consider creating a different assistant for the programmer, though it probably isn't useful without fine tuning
    const result = await chatCompletion({
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
        ],
        model: "gpt-4",
        //response_format: { type: "json_object" }
    });
    const value = result || '';
    const unwrapped = extractJsonFromBackticks(value) || value;
    // TODO iterate over the states defined in JSON.parse(unwrapped) and see if a corresponding ID is found in the functionCatalog
    // if any of the id's are not found ask GPT to correct the errors passing the state machine and the functionCatalog
    // I'll need a new prompt for this
    // add a completion to check that the state ID's match the function catalog. Either the state matches or it is dropped
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
