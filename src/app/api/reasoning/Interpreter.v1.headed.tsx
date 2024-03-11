import { dispatchMediatedEvent } from "@/app/utils";
import { program, MachineEvent, InterpreterInput, Context } from ".";
import { StateMachine, interpret } from "xstate";
import { ForwardedRef, MutableRefObject, useCallback, forwardRef, useEffect, useState } from "react";

// Type guard to check if target is a MutableRefObject
const isMutableRefObject = (ref: any): ref is MutableRefObject<EventTarget | null> => {
    return 'current' in ref;
};

function useLogic(input: InterpreterInput & { target: ForwardedRef<EventTarget | null> }) {
    const { functions, states, target, context } = input;
    const [result] = useState<StateMachine<Context, any, MachineEvent>>(program(states, functions));
    const [machine, setMachine] = useState<any>();
    const [initialContext, setContext] = useState<Context>(context || {
        status: 0,
        requestId: "test",
        stack: [],
    });
    const [stateMachine] = useState(result.withContext(initialContext));

    const callback = useCallback((event: MachineEvent) => {
        if (!event) {
            return;
        }
        console.log(`calling machineExecution.send type: ${event.type} payload: ${event.payload}`);
        machine?.send(event.type, event.payload);
    }, [machine]);

    const t = interpret(stateMachine).onTransition((state) => {
        if (isMutableRefObject(target) && target.current) {
            console.log(`onTransition called: state: ${state.value} dispatching TRANSITION target ${target.current}`);
            dispatchMediatedEvent(target.current, [
                "TRANSITION",
                {
                    state: state.value,
                    context: state.context,
                    callback,
                },
            ]);
        }
    })

    const [interpreter] = useState<typeof t>(t);

    return { stateMachine, initialContext, callback, setMachine, interpreter };
}
// Using forwardRef to wrap your component allows you to receive a ref from a parent component
const InterpreterRef = forwardRef(({ functions, states, children }: InterpreterInput & { children: React.ReactNode }, ref: ForwardedRef<EventTarget>) => {
    const { stateMachine, initialContext, callback, setMachine, interpreter } = useLogic({ functions, states, target: ref });
    useEffect(() => {
        const machine = interpreter.start();
        setMachine(interpreter.start());
        if (isMutableRefObject(ref) && ref.current) {
            dispatchMediatedEvent(ref.current, [
                "TRANSITION",
                {
                    state: 'default',
                    context: initialContext,
                    callback,
                },
            ]);
        }
    }, [ref, initialContext, callback, stateMachine, setMachine, interpreter])
    // @ts-ignore
    return <div ref={ref}>{children}</div>;
});

// Set displayName for the component for better debugging
InterpreterRef.displayName = 'Interpreter';

export default InterpreterRef;
