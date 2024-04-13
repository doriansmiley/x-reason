import { dispatchMediatedEvent } from "@/app/utils";
import { programV2, MachineEvent, InterpreterInput, Context, StateConfig } from ".";
import { StateMachine, interpret, Interpreter } from "xstate";
import { ForwardedRef, MutableRefObject, useCallback, forwardRef, useEffect, useState } from "react";

// Type guard to check if target is a MutableRefObject
const isMutableRefObject = (ref: any): ref is MutableRefObject<EventTarget | null> => {
    return 'current' in ref;
};

function useLogic(input: InterpreterInput & { target: ForwardedRef<EventTarget | null> }) {
    const { functions, states, target, context } = input;
    const [currentStates, setCurrentStates] = useState<StateConfig[]>();
    const [interpreter, setInterpreter] = useState<Interpreter<Context, any, MachineEvent>>();
    const [event, setEvent] = useState<MachineEvent>();
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
                if (isMutableRefObject(target) && target.current) {
                    console.log(`onTransition called: machine: ${machine.id} state: ${state.value} dispatching TRANSITION target ${target.current}`);
                    dispatchMediatedEvent(target.current, [
                        "TRANSITION",
                        {
                            state: state.value,
                            context: state.context,
                        },
                    ]);
                }
                if (state.done) {
                    console.log("Final state reached, stopping the interpreter.");
                    instance.stop(); // Stop the interpreter when the final state is reached
                }
            });
            //@ts-ignore
            setInterpreter(instance);
            setCurrentStates(states);
        }

    }, [context, functions, setInterpreter, states, target, interpreter, event, currentStates]);


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
const InterpreterRef = forwardRef(({ functions, states, children }: InterpreterInput & { children: React.ReactNode }, ref: ForwardedRef<EventTarget>) => {
    const { callback, interpreter } = useLogic({ functions, states, target: ref });

    if (isMutableRefObject(ref) && ref.current && interpreter) {
        dispatchMediatedEvent(ref.current, [
            "TRANSITION",
            {
                state: 'default',
                context: interpreter?.machine.context,
                callback,
            },
        ]);
        if (!interpreter.initialized) {
            interpreter.start();
        }
    }
    // @ts-ignore
    return <div ref={ref}>{children}</div>;
});

// Set displayName for the component for better debugging
InterpreterRef.displayName = 'Interpreter';

export default InterpreterRef;
