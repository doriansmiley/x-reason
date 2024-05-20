"use client";

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Elevation, TextArea, Intent, Spinner, SpinnerSize } from "@blueprintjs/core";

import { engineV1 as engine } from "@/app/api/reasoning";
import Interpreter from "@/app/api/reasoning/Interpreter.v1.headed";
import { EngineTypes, ReasonDemoActionTypes, useReasonDemoStore, useReasonDemoDispatch } from "@/app/context/ReasoningDemoContext";
import { DefaultComponent, Success } from ".";
import LocalStorage from "../storage/LocalStorage";


function useLogic({ ref, stateRef }: { ref: RefObject<TextArea>, stateRef: RefObject<TextArea> }) {
    const { states, currentState, context, solution, functions, factory } = useReasonDemoStore();
    const dispatch = useReasonDemoDispatch();
    const [query, setQuery] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [componentToRender, setComponentToRender] = useState(() => (<div></div>));
    const { programmer, solver, evaluate, getFunctionCatalog, getToolsCatalog } = useMemo(() => factory(EngineTypes.CHEMLI)(context!), [factory, context]);

    // TODO figure out how to manage the available functions,I think these should be exposed via DI
    const sampleCatalog = useMemo(
        () => getFunctionCatalog(dispatch),
        [dispatch, getFunctionCatalog],
    );
    const toolsCatalog = useMemo(() => getToolsCatalog(), [getToolsCatalog]);

    const onSubmit = useCallback(async () => {
        setIsLoading(true);
        setQuery(ref.current?.textareaElement?.value || "");
        setComponentToRender(<DefaultComponent message="I am exploring the knowledge base to find a solution to your query." />);

        const userQuery = ref.current?.textareaElement?.value;
        console.log(`userQuery: ${userQuery}`);
        if (!userQuery || userQuery.length === 0) {
            console.log('userQuery is not defined, returning')
            return;
        }

        console.log(`calling programmer`);
        const solverSolution = await engine.solver.solve(userQuery!, solver);
        // generate the program
        const result = await engine.programmer.program(solverSolution, JSON.stringify(Array.from(toolsCatalog.entries())), programmer);
        const evaluationResult = await engine.evaluator.evaluate({ query: `${solverSolution}\n${result}`, states: result, tools: sampleCatalog }, evaluate)
        if (!evaluationResult.correct) {
            // TODO, use the revised solutions provided by the evaluator once that functionality has been added
            throw evaluationResult.error || new Error('The provided solution failed evaluation');
        }
        dispatch({
            type: ReasonDemoActionTypes.SET_STATE,
            value: {
                states: result,
                solution: solverSolution,
                functions: sampleCatalog,
                currentState: undefined,
                context: undefined,
                event: undefined,
            }
        });
        setIsLoading(false);
    }, [ref, setQuery, setIsLoading, sampleCatalog, dispatch]);

    const onStateChanges = useCallback<() => void>(() => {
        const states = JSON.parse(stateRef.current?.textareaElement?.value || "").states;
        if (states) {
            dispatch({
                type: ReasonDemoActionTypes.SET_STATE,
                value: {
                    states,
                    currentState: undefined,
                    context: undefined,
                    event: undefined,
                }
            });
        }
    }, [dispatch, stateRef]);


    return {
        query,
        states,
        onSubmit,
        isLoading,
        componentToRender,
        currentState,
        context,
        setComponentToRender,
        functions,
        solution,
        onStateChanges,
    };
}

export default function ReasonDemo() {
    // Loading Component
    const LoadingSpinner = () => (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <Spinner aria-label="Loading..." intent={Intent.PRIMARY} size={SpinnerSize.STANDARD} />
        </div>
    );

    const ref = useRef<TextArea>(null);
    const stateRef = useRef<TextArea>(null);

    const { query, solution, states, functions, onSubmit, isLoading, componentToRender, currentState, context, setComponentToRender, onStateChanges } = useLogic({ ref, stateRef });

    useEffect(() => {
        console.log(`The current state is: ${currentState}`);
        const component = (currentState) ? functions?.get(currentState)?.component : null;
        console.log(`The component to render associated with the state is: ${component}`);
        if (component && context) {
            setComponentToRender(component(context));
        } else if (currentState && currentState === 'success') {
            setComponentToRender(Success);
        }
    }, [currentState, context, functions, setComponentToRender]);

    return (
        <Interpreter>
            <div style={{ display: "flex", flexDirection: "row" }}>
                {/* Flex cell for input and button */}
                <Card interactive={true} elevation={Elevation.TWO} style={{ flex: 2 }}>
                    <h2>I am Chemli, the AI Chemical Product Engineer</h2>
                    {isLoading ? <LoadingSpinner /> : <></>}
                    <p>Please enter a questions regarding a new cosmetic product, changes to an existing product,
                        or any other chemical product development questions I can answer. Dont worry, I will let You
                        know if you ask an unsupported question.
                    </p>
                    <p>
                        <TextArea disabled={isLoading} ref={ref} autoResize={true} intent={Intent.PRIMARY} large={true} />
                    </p>
                    <Button disabled={isLoading} onClick={onSubmit}>
                        Submit
                    </Button>
                    {componentToRender}
                </Card>
                <Card interactive={true} elevation={Elevation.TWO} style={{ flex: 1, minWidth: 400 }}>
                    <h2>Solution Controls</h2>
                    <h4>Saved Solutions</h4>
                    <LocalStorage />
                    <h4>States</h4>
                    <TextArea style={{ width: '100%' }} ref={stateRef} value={JSON.stringify({ states }, null, 2)} disabled={isLoading} autoResize={true} intent={Intent.PRIMARY} large={true} />
                    <Button disabled={isLoading} onClick={onStateChanges}>
                        Update and Rerun
                    </Button>
                    <h4>Context</h4>
                    <TextArea style={{ width: '100%' }} value={JSON.stringify({ context }, null, 2)} disabled={isLoading} autoResize={true} intent={Intent.PRIMARY} large={true} />
                    <h4>Solution</h4>
                    <TextArea style={{ width: '100%' }} value={JSON.stringify({ solution }, null, 2)} disabled={isLoading} autoResize={true} intent={Intent.PRIMARY} large={true} />
                </Card>
            </div>
        </Interpreter>
    );
}
