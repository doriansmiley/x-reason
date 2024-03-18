import { dispatchMediatedEvent } from "@/app/utils";
import { program, MachineEvent, InterpreterInput, Context } from ".";
import { StateMachine, interpret, Interpreter } from "xstate";
import { ForwardedRef, MutableRefObject, useCallback, forwardRef, useEffect, useState } from "react";

// Type guard to check if target is a MutableRefObject
const isMutableRefObject = (ref: any): ref is MutableRefObject<EventTarget | null> => {
    return 'current' in ref;
};

function useLogic(input: InterpreterInput & { target: ForwardedRef<EventTarget | null> }) {
    const { functions, states, target, context } = input;
    const [interpreter, setInterpreter] = useState<Interpreter<Context, any, MachineEvent>>();
    useEffect(() => {
        if (states.length === 0) {
            return;
        }

        if (interpreter?.machine.states) {
            const keys = Object.keys(interpreter.machine.states);
            const ids = states.map(state => state.id);
            const allKeysFound = keys.every(key => ids.includes(key));
            if (allKeysFound) {
                // we've already generated this machine
                return;
            }
        }

        const result: StateMachine<Context, any, MachineEvent> = program(states, functions);
        const initialContext = context || {
            status: 0,
            requestId: "test",
            stack: [],
        };
        const machine = result.withContext(initialContext);

        const instance = interpret(machine).onTransition((state) => {
            if (isMutableRefObject(target) && target.current) {
                console.log(`onTransition called: state: ${state.value} dispatching TRANSITION target ${target.current}`);
                dispatchMediatedEvent(target.current, [
                    "TRANSITION",
                    {
                        state: state.value,
                        context: state.context,
                    },
                ]);
            }
        });
        //@ts-ignore
        setInterpreter(instance);
    }, [context, functions, setInterpreter, states, target, interpreter]);


    const callback = useCallback((event: MachineEvent) => {
        if (!event || !event.type || !event.payload) {
            return;
        }
        console.log(`calling machineExecution.send type: ${event.type} payload: ${event.payload}`);
        //@ts-ignore
        interpreter?.send(event.type, { payload: event.payload });
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
        interpreter.start();
    }
    // @ts-ignore
    return <div ref={ref}>{children}</div>;
});

// Set displayName for the component for better debugging
InterpreterRef.displayName = 'Interpreter';

export default InterpreterRef;
