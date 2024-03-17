"use client";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Elevation, TextArea, Intent, Spinner, SpinnerSize, Collapse, Pre } from "@blueprintjs/core";

import { StateConfig, program, Context, MachineEvent, Task, engine } from "@/app/api/reasoning";
import { useMediator } from "@/app/utils";
import Interpreter from "@/app/api/reasoning/Interpreter.v1.headed";

function useLogic({ ref, eventBoundaryRef }: { ref: RefObject<TextArea>; eventBoundaryRef: RefObject<any> }) {
    const [query, setQuery] = useState<string>();
    const [states, setStates] = useState<StateConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    let callback = useCallback((event: MachineEvent) => console.log("default callback called"), []);

    const mediator = useCallback(
        (event: { type: string; payload: Record<string, any> }) => {
            if (event?.payload?.callback) {
                callback = event.payload.callback;
            }
        },
        [],
    );

    useMediator<["TRANSITION", Record<string, any>]>("TRANSITION", mediator, eventBoundaryRef);

    const onSubmit = useCallback(async () => {
        setIsLoading(true);
        setQuery(ref.current?.textareaElement?.value || "");
    }, [ref, setQuery, setIsLoading]);

    const onNext = useCallback(() => {
        callback({ type: "CONTINUE", payload: { RecallSolutions: false } });
    }, [callback]);

    // TODO figure out how to manage the available functions,I think these should be exposed via DI
    // TODO, I'd like all states to render a component, to do this set a state variable to the component to render
    // the implementation functions below can call something like setComponent(<Component ...props/>)
    const sampleCatalog = useMemo(
        () =>
            new Map<string, Task>([
                [
                    "RecallSolutions",
                    {
                        description:
                            "Recalls a smilar solution to the user query. If a solution is found it will set the existingSolutionFound attribute of the event params to true: `event.payload?.params.existingSolutionFound`",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                console.log('RecallSolutions implementation called');
                                /*callback({
                                    type: "CONTINUE",
                                    payload: { RecallSolutions: 'no solution found' },
                                });*/
                            }, 1);
                        },
                    },
                ],
                [
                    "GenerateIngredientsList",
                    {
                        description: "Generates a list of ingredients for a product formula",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                console.log('GenerateIngredientsList implementation called');
                                callback({
                                    type: "CONTINUE",
                                    payload: { GenerateIngredientsList: [] },
                                });
                            }, 1);
                        },
                    },
                ],
                [
                    "IngredientDatabase",
                    {
                        description:
                            "Maintain a comprehensive database of cosmetic ingredients, their properties, potential combinations, and effects. This database includes natural and synthetic ingredients, their usual concentrations in products, and regulatory information.",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({
                                    type: "CONTINUE",
                                    payload: { IngredientDatabase: [...context.GenerateIngredientsList, ["Bee Wax 1234 Special Proprietary", "30%", "A"]] },
                                });
                            }, 1);
                        },
                    },
                ],
                [
                    "RegulatoryCheck",
                    {
                        description:
                            "Ensure that the predicted formula adheres to relevant cosmetic regulations and standards. If this function has an error it will set `context.regulatoryChecksSuccess` to false.",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({ type: "CONTINUE", payload: { RegulatoryCheck: "no regulatory issues were found" } });
                            }, 1);
                        },
                    },
                ],
                [
                    "ConcentrationEstimation",
                    {
                        description:
                            "Estimate the concentration of each ingredient based on standard industry practices, known effects, and regulatory limits. If this function has an error it will set `context.concentrationEstimationSuccess` to false.",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({
                                    type: "CONTINUE",
                                    payload: {
                                        ConcentrationEstimation: [
                                            ["ingredient", "tolerance%"],
                                            ["Bee Wax", "30-31%"],
                                            ["Coconut Oil", "40-45%"],
                                            ["Tree Resin", "20-21%%"],
                                        ],
                                    },
                                });
                            }, 1);
                        },
                    },
                ],
                [
                    "FormulationSimulation",
                    {
                        description: "Use simulation models to predict how different ingredients interact. This includes stability, texture, and efficacy simulations.",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({ type: "CONTINUE", payload: { FormulationSimulation: "no available simulations were found" } });
                            }, 1);
                        },
                    },
                ],
                [
                    "ExpertReview",
                    {
                        description: "Have cosmetic chemists review the proposed formula for feasibility and safety.",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({ type: "CONTINUE", payload: { ExpertReview: "Certified by Dorian Smiley on 2/2/24" } });
                            }, 1);
                        },
                    },
                ],
                [
                    "LabTesting",
                    {
                        description: "Test the proposed formula in a laboratory setting to verify its properties and efficacy.",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({ type: "CONTINUE", payload: { LabTesting: "Certified by Dorian Smiley on 2/2/24" } });
                            }, 1);
                        },
                    },
                ],
                [
                    "Evaluation",
                    {
                        description: "Evaluates a generated product formula and rates the result",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({ type: "CONTINUE", payload: { Evaluation: 0.95 } });
                            }, 1);
                        },
                    },
                ],
                [
                    "MarketResearch",
                    {
                        description: "Performs market research for the new product",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({ type: "CONTINUE", payload: { MarketResearch: "You market is as follows..." } });
                            }, 1);
                        },
                    },
                ],
                [
                    "CreateMarketing",
                    {
                        description: "Generates a product description for target customers",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({ type: "CONTINUE", payload: { CreateMarketing: "Here is your marketing claims..." } });
                            }, 1);
                        },
                    },
                ],
                [
                    "GenerateProductImage",
                    {
                        description: "generates a product image using the generated product description",
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback({ type: "CONTINUE", payload: { GenerateProductImage: "https://someurl.com" } });
                            }, 1);
                        },
                    },
                ],
            ]),
        [callback],
    );

    useEffect(() => {
        const macro = async () => {
            console.log(`query: ${query}`);
            if (!query || query.length === 0) {
                console.log('query is not defined, returning')
                return;
            }
            console.log(`calling programmer`);
            const toolsCatalog = new Map<string, { description: string }>([
                [
                    "RecallSolutions",
                    {
                        description:
                            "Recalls a smilar solution to the user query. If a solution is found it will set the existingSolutionFound attribute of the event params to true: `event.payload?.params.existingSolutionFound`",
                    },
                ],
                [
                    "GenerateIngredientsList",
                    {
                        description: "Generates a list of ingredients for a product formula",
                    },
                ],
                [
                    "IngredientDatabase",
                    {
                        description:
                            "Maintain a comprehensive database of cosmetic ingredients, their properties, potential combinations, and effects. This database includes natural and synthetic ingredients, their usual concentrations in products, and regulatory information.",
                    },
                ],
                [
                    "RegulatoryCheck",
                    {
                        description:
                            "Ensure that the predicted formula adheres to relevant cosmetic regulations and standards. If this function has an error it will set `context.regulatoryChecksSuccess` to false.",
                    },
                ],
                [
                    "ConcentrationEstimation",
                    {
                        description:
                            "Estimate the concentration of each ingredient based on standard industry practices, known effects, and regulatory limits. If this function has an error it will set `context.concentrationEstimationSuccess` to false.",
                    },
                ],
                [
                    "FormulationSimulation",
                    {
                        description: "Use simulation models to predict how different ingredients interact. This includes stability, texture, and efficacy simulations.",
                    },
                ],
                [
                    "ExpertReview",
                    {
                        description: "Have cosmetic chemists review the proposed formula for feasibility and safety.",
                    },
                ],
                [
                    "LabTesting",
                    {
                        description: "Test the proposed formula in a laboratory setting to verify its properties and efficacy.",
                    },
                ],
                [
                    "Evaluation",
                    {
                        description: "Evaluates a generated product formula and rates the result",
                    },
                ],
                [
                    "MarketResearch",
                    {
                        description: "Performs market research for the new product",
                    },
                ],
                [
                    "CreateMarketing",
                    {
                        description: "Generates a product description for target customers",
                    },
                ],
                [
                    "GenerateProductImage",
                    {
                        description: "generates a product image using the generated product description",
                    },
                ],
            ]);
            const solution = await engine.solver.solve(query!);
            // generate the program
            const result = await engine.programmer.program(solution, JSON.stringify(Array.from(toolsCatalog.entries())));
            console.log(`programmer returned: ${result}`);
            setStates(result);
            setIsLoading(false);
        };
        macro();
    }, [query, setStates, setIsLoading]);

    return {
        query,
        states,
        onSubmit,
        isLoading,
        functions: sampleCatalog,
        onNext,
    };
}

export default function ReasonDemo() {
    // Loading Component
    const LoadingSpinner = () => (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <Spinner aria-label="Loading..." intent={Intent.PRIMARY} size={SpinnerSize.STANDARD} />
        </div>
    );

    const eventBoundaryRef = useRef<any>(null);
    const ref = useRef<TextArea>(null);

    const { query, states, onSubmit, isLoading, functions, onNext } = useLogic({ ref, eventBoundaryRef });
    const props = { functions, states: states! }

    return (
        <Interpreter {...props} ref={eventBoundaryRef}>
            <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
                <div style={{ flex: 1, marginRight: "20px" }}>
                    {" "}
                    {/* Flex cell for input and button */}
                    <Card interactive={true} elevation={Elevation.TWO}>
                        <h2>Marketing Claims</h2>
                        {isLoading ? <LoadingSpinner /> : <></>}
                        <p>
                            <TextArea disabled={isLoading} ref={ref} autoResize={true} intent={Intent.PRIMARY} large={true} />
                        </p>
                        <Button disabled={isLoading} onClick={onSubmit}>
                            Submit
                        </Button>
                        <Button disabled={isLoading} onClick={onNext}>
                            Next
                        </Button>
                    </Card>
                </div>
            </div>
        </Interpreter>
    );
}
