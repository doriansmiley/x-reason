"use client";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Elevation, TextArea, Intent, Spinner, SpinnerSize, Collapse, Pre } from "@blueprintjs/core";

import { StateConfig, Context, MachineEvent, Task, engineV2 as engine } from "@/app/api/reasoning";
import { useMediator } from "@/app/utils";
import Interpreter from "@/app/api/reasoning/Interpreter.v2.headed";

function DefaultComponent({ message }: { message: string }) {
    return (
        <div>
            <Spinner aria-label="Loading..." intent={Intent.PRIMARY} size={SpinnerSize.STANDARD} />
            <p>{message}</p>
        </div>
    );
}

function useLogic({ ref, eventBoundaryRef }: { ref: RefObject<TextArea>; eventBoundaryRef: RefObject<any> }) {
    const [query, setQuery] = useState<string>();
    const [states, setStates] = useState<StateConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [componentToRender, setComponentToRender] = useState(() => (<div></div>));
    const [callback, setCallback] = useState(() => (event: MachineEvent) => console.log("default callback called"))
    //const callback = useRef((event: MachineEvent) => console.log("default callback called"));
    const solutionBank = new Map<string, string>([
        ['citrus shower gel', 'Would include the formula, marketing claims, and link to product image'],
        ['peppermint shower gel', 'Would include the formula, marketing claims, and link to product image'],
    ])

    const onSubmit = useCallback(async () => {
        setIsLoading(true);
        setStates([]);
        setQuery(ref.current?.textareaElement?.value || "");
        setComponentToRender(<DefaultComponent message="I am exploring the knowledge base to find a solution to your query." />);
        setCallback((event: MachineEvent) => console.log("default callback called"));
    }, [ref, setQuery, setIsLoading]);

    const onNext = useCallback(() => {
        callback({ type: "CONTINUE", payload: { RecallSolutions: false } });
    }, [callback]);

    const SampleComponent = useMemo(() => (<div>
        <h1>Rendering Component for the RecallSolutions State</h1>
        <p>This is an exmaple of how you can render components in response to state changes. Click the next button to proceed.</p>
        <Button disabled={isLoading} onClick={onNext}>
            Next
        </Button>
    </div>)
        , [isLoading, onNext]);

    const SuccessComponent = useMemo(() => (<div>
        <h1>Process Complete</h1>
        <p>TODO add logs</p>
    </div>)
        , []);

    // TODO figure out how to manage the available functions,I think these should be exposed via DI
    // TODO Add a conditional attribute and refactor the programmer to use it for conditions on transitions
    // This will allow for both standard algorithms and LLMs to determine if a state should transition
    // make sure to update the prompts/training data to remove cond attributes
    // transitions?: Map<"CONTINUE" | "ERROR", (context: Context, event: MachineEvent) => boolean>
    const sampleCatalog = useMemo(
        () =>
            new Map<string, Task>([
                [
                    "RecallSolutions",
                    {
                        description:
                            "Recalls a smilar solution to the user query. If a solution is found it will set the existingSolutionFound attribute of the event params to true: `event.payload?.params.existingSolutionFound`",
                        // this is an example of a visual state that requires user interaction
                        component: (context: Context, event: MachineEvent) => SampleComponent,
                        implementation: (context: Context, event: MachineEvent) => {
                            console.log('RecallSolutions implementation called');
                        },
                        transitions: new Map<"CONTINUE" | "ERROR", (context: Context, event: MachineEvent) => boolean>([
                            [
                                "CONTINUE",
                                // this is an example of a function that is invoked as part of evaluating transitions
                                // it can do whatever you like and take into account the current state of the world 
                                // found on the context. If can eben invoke an LLM for non deterministic workflows
                                // The results of the implementation function should be include included in the payload of the incoming event
                                // in this case payload.RecallSolutions which is passed via our UI's onNext function
                                (context: Context, event: MachineEvent) => {
                                    // TODO demonstrate a memory lookup using a JSON array of steps and an LLM
                                    return true;
                                }
                            ]
                        ]),
                    },
                ],
                [
                    "GenerateIngredientsList",
                    {
                        description: "Generates a list of ingredients for a product formula",
                        // this is an example of how you can render a component while the implementation function executes
                        component: (context: Context, event: MachineEvent) => DefaultComponent({ message: 'Getting the ingredients list...' }),
                        implementation: (context: Context, event: MachineEvent) => {
                            console.log('GenerateIngredientsList implementation called');
                            setTimeout(() => {
                                // TODO all real implementation
                                callback.current({
                                    type: "CONTINUE",
                                    payload: { GenerateIngredientsList: [] },
                                });
                            }, 5000);
                        },
                    },
                ],
                [
                    "IngredientDatabase",
                    {
                        description:
                            "Maintain a comprehensive database of cosmetic ingredients, their properties, potential combinations, and effects. This database includes natural and synthetic ingredients, their usual concentrations in products, and regulatory information.",
                        component: (context: Context, event: MachineEvent) => DefaultComponent({ message: 'Searching the ingredients database...' }),
                        implementation: (context: Context, event: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                callback.current({
                                    type: "CONTINUE",
                                    payload: { IngredientDatabase: [...context.GenerateIngredientsList, ["Bee Wax 1234 Special Proprietary", "30%", "A"]] },
                                });
                            }, 5000);
                        },
                        transitions: new Map<"CONTINUE" | "ERROR", (context: Context, event: MachineEvent) => boolean>([
                            [
                                "CONTINUE",
                                // this is an example of a function that is invoked as part of evaluating transitions
                                // it can do whatever you like and take into account the current state of the world found on the context
                                // The results of the implementation function should be include included in the payload of the incoming event
                                // in this case payload.IngredientDatabase
                                (context: Context, event: MachineEvent) => true
                            ]
                        ]),
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
                                callback.current({ type: "CONTINUE", payload: { RegulatoryCheck: "no regulatory issues were found" } });
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
                                callback.current({
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
                                callback.current({ type: "CONTINUE", payload: { FormulationSimulation: "no available simulations were found" } });
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
                                callback.current({ type: "CONTINUE", payload: { ExpertReview: "Certified by Dorian Smiley on 2/2/24" } });
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
                                callback.current({ type: "CONTINUE", payload: { LabTesting: "Certified by Dorian Smiley on 2/2/24" } });
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
                                callback.current({ type: "CONTINUE", payload: { Evaluation: 0.95 } });
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
                                callback.current({ type: "CONTINUE", payload: { MarketResearch: "You market is as follows..." } });
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
                                callback.current({ type: "CONTINUE", payload: { CreateMarketing: "Here is your marketing claims..." } });
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
                                callback.current({ type: "CONTINUE", payload: { GenerateProductImage: "https://someurl.com" } });
                            }, 1);
                        },
                    },
                ],
            ]),
        [callback, SampleComponent],
    );

    const mediator = useCallback((event: { type: string; payload: Record<string, any> }) => {
        if (event?.payload?.callback) {
            setCallback(event.payload.callback)
        }
        console.log(`mediator state: ${event?.payload?.state}`);
        const component = sampleCatalog.get(event?.payload?.state)?.component;
        console.log(`mediator component: ${component}`);
        if (component) {
            setComponentToRender(component(event?.payload?.context, event));
        } else if (event?.payload?.state === 'success') {
            setComponentToRender(SuccessComponent);
        }
    }, [sampleCatalog, SuccessComponent]);

    useMediator<["TRANSITION", Record<string, any>]>("TRANSITION", mediator, eventBoundaryRef);

    useEffect(() => {
        const macro = async () => {
            console.log(`query: ${query}`);
            if (!query || query.length === 0) {
                console.log('query is not defined, returning')
                return;
            }
            // prevent re-rendering. Submit needs to set state to an empty array
            if (states.length > 0) {
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
            const evaluationResult = await engine.evaluator.evaluate({ states, tools: sampleCatalog })
            if (evaluationResult.rating === 0) {
                // TODO, return a recursive call to program if max count has not been exceeded
                throw evaluationResult.error;
            }
            setStates(result);
            setIsLoading(false);
        };
        macro();
    }, [query, states, sampleCatalog]);

    return {
        query,
        states,
        onSubmit,
        isLoading,
        functions: sampleCatalog,
        onNext,
        componentToRender,
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

    const { states, onSubmit, isLoading, functions, componentToRender } = useLogic({ ref, eventBoundaryRef });
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
                        {componentToRender}
                    </Card>
                </div>
            </div>
        </Interpreter>
    );
}
