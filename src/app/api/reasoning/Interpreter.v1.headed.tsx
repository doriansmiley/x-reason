"use client";

import { StateMachine, interpret, Interpreter as IInterpreter } from "xstate";
import { MutableRefObject, useCallback, useEffect, useState } from "react";

import { useReasonDemoDispatch, ReasonDemoActionTypes, useReasonDemoStore } from "@/app/context/ReasoningDemoContext";
import { programV1, MachineEvent, InterpreterInput, Context, StateConfig, Task } from ".";


// Using forwardRef to wrap your component allows you to receive a ref from a parent component
export default function Interpreter({ children }: { children: React.ReactNode }) {
    const dispatch = useReasonDemoDispatch();
    const { context, states, event, functions } = useReasonDemoStore();
    const [currentStates, setCurrentStates] = useState<StateConfig[]>();
    const [interpreter, setInterpreter] = useState<IInterpreter<Context, any, MachineEvent>>();
    const [currentFunctions, setCurrentFunctions] = useState<Map<string, Task>>();
    const [currentEvent, setCurrentEvent] = useState<MachineEvent>()

    useEffect(() => {
        if (!states || states.length === 0 || !functions) {
            return;
        }

        if (currentStates !== states || functions !== currentFunctions) {
            const result: StateMachine<Context, any, MachineEvent> = programV1(states, functions);
            const initialContext = context || {
                status: 0,
                requestId: "test",
                stack: [],
            };
            const machine = result.withContext(initialContext);

            const instance = interpret(machine).onTransition((state) => {
                console.log(`onTransition called: machine: ${machine.id} state: ${state.value}`);
                dispatch({
                    type: ReasonDemoActionTypes.SET_STATE,
                    value: {
                        currentState: state.value,
                        context: state.context,
                    }
                });
                if (state.done) {
                    console.log("Final state reached, stopping the interpreter.");
                    instance.stop(); // Stop the interpreter when the final state is reached
                }
            });

            //@ts-ignore
            setInterpreter(instance);
            setCurrentStates(states);
            setCurrentFunctions(functions);

        } else if (event && interpreter?.initialized && !interpreter?.getSnapshot().done) {
            if (interpreter?.getSnapshot().done) {
                console.warn(`Attempted to send event "${event.type}" to a stopped service. The event was not sent.`);
            } else if (event !== currentEvent) {
                interpreter.send(event.type, { payload: event.payload });
                setCurrentEvent(event);
            }
        } else if (interpreter && !interpreter.initialized) {
            interpreter.start();
        }

    }, [context, functions, states, interpreter, currentFunctions, event, currentStates, dispatch]);

    // @ts-ignore
    return <div>{children}</div>;
};
