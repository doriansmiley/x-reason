"use client";

import { StateMachine, interpret, Interpreter } from "xstate";
import { MutableRefObject, useCallback, useEffect, useState } from "react";

import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";
import { programV2, MachineEvent, InterpreterInput, Context, StateConfig } from ".";

// Type guard to check if target is a MutableRefObject
const isMutableRefObject = (ref: any): ref is MutableRefObject<EventTarget | null> => {
    return 'current' in ref;
};

function useLogic(input: InterpreterInput) {
    const { functions, states, context } = input;
    const [currentStates, setCurrentStates] = useState<StateConfig[]>();
    const [interpreter, setInterpreter] = useState<Interpreter<Context, any, MachineEvent>>();
    const [event, setEvent] = useState<MachineEvent>();
    const dispatch = useReasonDemoDispatch();

    useEffect(() => {
        if (states.length === 0) {
            return;
        }

        if (interpreter?.initialized && !interpreter?.getSnapshot().done) {
            if (event) {
                interpreter.send(event.type, { payload: event.payload });
            }
        } else if (currentStates !== states) {
            const result: StateMachine<Context, any, MachineEvent> = programV2(states, functions);
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
        }

    }, [context, functions, setInterpreter, states, interpreter, event, currentStates, dispatch]);


    const callback = useCallback((event: MachineEvent) => {
        if (!event || !event.type || !event.payload) {
            return;
        }

        if (interpreter?.getSnapshot().done) {
            console.warn(`Attempted to send event "${event.type}" to a stopped service. The event was not sent.`);
            return;
        }

        console.log(`calling machineExecution.send type: ${event.type} payload: ${event.payload}`);
        setEvent(event);
    }, [interpreter]);

    return { callback, interpreter };
}
// Using forwardRef to wrap your component allows you to receive a ref from a parent component
const InterpreterV2 = ({ functions, states, children }: InterpreterInput & { children: React.ReactNode }) => {
    const { callback, interpreter } = useLogic({ functions, states });
    const dispatch = useReasonDemoDispatch();

    useEffect(() => {
        dispatch({
            type: ReasonDemoActionTypes.SET_STATE,
            value: {
                callback,
            }
        });
        if (!interpreter?.initialized) {
            interpreter?.start();
        }
    }, [dispatch, callback, interpreter]);

    // @ts-ignore
    return <div>{children}</div>;
};

export default InterpreterV2;
