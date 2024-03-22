import { createMachine, sendTo, assign, StateNode, MachineConfig } from "xstate";
import { v4 as uuidv4 } from "uuid";

import { Context, MachineEvent, StateConfig, Task } from "./types"; // Import your types

function getTransition(transition: { target: string; cond?: string; actions?: string }) {
    let transitionConfig: any = {
        target: transition.target,
        actions: transition.actions || "saveResult",
    };
    if (transition.cond) {
        transitionConfig.cond = (context: Context, event: MachineEvent) => {
            // TODO improve this by using a function supplied by the function catalog which can either be
            // a classical algorithm or a call to an LLM that returns true or false
            return eval(transition.cond!);
        };
    }
    return transitionConfig;
}

function generateStateConfig(state: StateConfig, functionCatalog: Map<string, Task>): Partial<StateNode<Context, any, MachineEvent>> {
    if (state.type === "final") {
        return {
            type: state.type,
        };
    }

    let stateConfig: any = {
        assign: {
            stack: (context: Context, event: MachineEvent) => [...context.stack!, state.id],
        },
        entry: (context: Context, event: MachineEvent) => {
            console.log("Received Event:", event);
            const retrievedFunction = functionCatalog.get(state.id);
            if (retrievedFunction) {
                console.log("Executing Function:", state.id);
                // if the function is async, we ignore the promise as this is fire and forget.
                // it's up to the function to dispatch the CONTINUE event on the machine to capture results
                // in the vent payload and continue execution
                retrievedFunction.implementation(context, event);
            }
        },
    };
    // TODO augment with retrievedFunction.transitions.
    if (state.transitions) {
        stateConfig.on = {
            CONTINUE: state.transitions.filter((transition) => transition.on === "CONTINUE").map((transition) => getTransition(transition)),
            ERROR: state.transitions.filter((transition) => transition.on === "ERROR").map((transition) => getTransition(transition)),
        };
    }

    if (state.type === "parallel") {
        stateConfig.type = "parallel";
        stateConfig.states = {};
        stateConfig.onDone = state.onDone;
        state.states?.forEach((state) => {
            stateConfig.states[state.id] = {
                initial: "pending",
                states: {
                    pending: generateStateConfig(state, functionCatalog),
                    success: { type: "final" },
                    failure: { type: "final" },
                },
            };
        });
    }

    return stateConfig;
}

function generateStateMachineConfig(statesArray: StateConfig[], functionCatalog: Map<string, Task>) {
    let states: { [key: string]: Partial<StateNode<Context, any, MachineEvent>> } = {};
    statesArray.forEach((state) => {
        states[state.id] = generateStateConfig(state, functionCatalog);
    });

    return {
        id: uuidv4(),
        predictableActionArguments: true,
        initial: statesArray[0]?.id,
        context: {
            requestId: uuidv4(), // Replace with actual uniqueId function
            status: 0,
            // ... other context properties
        },
        states,
    };
}

function program(statesArray: StateConfig[], functionCatalog: Map<string, Task>) {
    return createMachine<Context, MachineEvent>(generateStateMachineConfig(statesArray, functionCatalog) as MachineConfig<Context, any, MachineEvent>, {
        actions: {
            saveResult: assign((context, event) => {
                // IMPORTANT: it's up to the caller to set status to -1 to trigger errors
                // we can work on improving this in the future
                return {
                    ...context,
                    ...event.payload,
                };
            }),
        },
    });
}

export default program;
