import { StateMachine, interpret, State } from "xstate";

import { programV1, MachineEvent, Context, StateConfig, Task } from ".";
import { ActionType } from "@/app/utils";
import { ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function headlessInterpreter(
    states: StateConfig[],
    functions: Map<string, Task>,
    // callback function to revieve notifications on state change
    dispatch: (action: ActionType) => void,
    context?: Context,
    state?: State<Context, MachineEvent>) {
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
                currentState: state,
                context: state.context,
            }
        });
        if (state.done) {
            console.log("Final state reached, stopping the interpreter.");
            instance.stop(); // Stop the interpreter when the final state is reached
        }
    });
    // if state is defined the machine will hydrate from where it left off as defined by the supplied state
    // for more an persisting state visit: https://xstate.js.org/docs/guides/states.html#persisting-state
    instance.start(state);
    const done = () => {
        return instance?.getSnapshot().done;
    }
    const serialize = (state: State<Context, MachineEvent>) => JSON.stringify(state);
    const stop = () => instance.stop();
    const send = (event: MachineEvent) => instance.send(event);

    // TODO define an actual interface and think about what to expose
    return { done, serialize, stop, send };
}