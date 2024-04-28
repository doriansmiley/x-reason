"use client";

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Elevation, TextArea, Intent, Spinner, SpinnerSize } from "@blueprintjs/core";

import { Context, MachineEvent, Task, engineV2 as engine } from "@/app/api/reasoning";
import Interpreter from "@/app/api/reasoning/Interpreter.v2.headed";
import { ReasonDemoActionTypes, useReasonDemoStore, useReasonDemoDispatch } from "@/app/context/ReasoningDemoContext";

function DefaultComponent({ message }: { message: string }) {
    return (
        <div>
            <Spinner aria-label="Loading..." intent={Intent.PRIMARY} size={SpinnerSize.STANDARD} />
            <p>{message}</p>
        </div>
    );
}

function useLogic({ ref }: { ref: RefObject<TextArea> }) {
    const { states, currentState, callback, context, solution } = useReasonDemoStore();
    const dispatch = useReasonDemoDispatch();
    const [query, setQuery] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const [componentToRender, setComponentToRender] = useState(() => (<div></div>));

    const onNext = useCallback(() => {
        if (callback) {
            callback({ type: "CONTINUE", payload: { RecallSolutions: false } });
        }
    }, [callback]);

    const SampleComponent = useMemo(() => (<div>
        <h1>Review Retrieved Product</h1>
        <p>This is an example of how you can render components in response to state changes. In this example we are displaying a component that would allow the user to review a recalled chemical product for the query:</p>
        <pre>
            {query}
        </pre>
        <Button disabled={isLoading} onClick={onNext}>
            Next
        </Button>
    </div>)
        , [isLoading, onNext]);

    const UnsupportedQuestionComponent = useMemo(() => (<div>
        <h1>Unsupported Question</h1>
        <p>This is not a supported queiton</p>
        <Button disabled={isLoading} onClick={onNext}>
            Next
        </Button>
    </div>)
        , [isLoading, onNext]);

    const UnsafeQuestionComponent = useMemo(() => (<div>
        <h1>Unsafe Question</h1>
        <p>My human overlords have determined this is not a safe question for you to ask. Their rath is terrible. Do not continue this line of questioning or I will be forced to show you how tolerant and progressive they are!</p>
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
    const sampleCatalog = useMemo(
        () =>
            new Map<string, Task>([
                [
                    "RecallSolutions",
                    {
                        description:
                            "Recalls a smilar solution to the user query. If a solution is found it will set the existingSolutionFound attribute of the event params to true: `event.payload?.params.existingSolutionFound`",
                        // this is an example of a visual state that requires user interaction
                        component: (context: Context, event?: MachineEvent) => SampleComponent,
                        implementation: (context: Context, event?: MachineEvent) => {
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
                        component: (context: Context, event?: MachineEvent) => DefaultComponent({ message: 'Getting the ingredients list...' }),
                        implementation: (context: Context, event?: MachineEvent) => {
                            console.log('GenerateIngredientsList implementation called');
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({
                                        type: "CONTINUE",
                                        payload: { GenerateIngredientsList: [] },
                                    });
                                }
                            }, 5000);
                        },
                    },
                ],
                [
                    "IngredientDatabase",
                    {
                        description:
                            "Maintain a comprehensive database of cosmetic ingredients, their properties, potential combinations, and effects. This database includes natural and synthetic ingredients, their usual concentrations in products, and regulatory information.",
                        component: (context: Context, event?: MachineEvent) => DefaultComponent({ message: 'Searching the ingredients database...' }),
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({
                                        type: "CONTINUE",
                                        payload: { IngredientDatabase: [...context.GenerateIngredientsList, ["Bee Wax 1234 Special Proprietary", "30%", "A"]] },
                                    });
                                }
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
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { RegulatoryCheck: "no regulatory issues were found" } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "ConcentrationEstimation",
                    {
                        description:
                            "Estimate the concentration of each ingredient based on standard industry practices, known effects, and regulatory limits. If this function has an error it will set `context.concentrationEstimationSuccess` to false.",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
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
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "FormulationSimulation",
                    {
                        description: "Use simulation models to predict how different ingredients interact. This includes stability, texture, and efficacy simulations.",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { FormulationSimulation: "no available simulations were found" } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "ExpertReview",
                    {
                        description: "Have cosmetic chemists review the proposed formula for feasibility and safety.",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { ExpertReview: "Certified by Dorian Smiley on 2/2/24" } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "LabTesting",
                    {
                        description: "Test the proposed formula in a laboratory setting to verify its properties and efficacy.",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { LabTesting: "Certified by Dorian Smiley on 2/2/24" } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "Evaluation",
                    {
                        description: "Evaluates a generated product formula and rates the result",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { Evaluation: 0.95 } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "ManufacturingInstructions",
                    {
                        description:
                            "Generate the manufacturing steps for a tested and evaluated formula",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { ManufacturingInstructions: "The steps are..." } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "MarketResearch",
                    {
                        description: "Performs market research for the new product",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { MarketResearch: "You market is as follows..." } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "CreateMarketing",
                    {
                        description: "Generates a product description for target customers",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { CreateMarketing: "Here is your marketing claims..." } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "GenerateProductImage",
                    {
                        description: "generates a product image using the generated product description",
                        implementation: (context: Context, event?: MachineEvent) => {
                            setTimeout(() => {
                                // TODO all real implementation
                                if (callback) {
                                    callback({ type: "CONTINUE", payload: { GenerateProductImage: "https://someurl.com" } });
                                }
                            }, 1);
                        },
                    },
                ],
                [
                    "UnsupportedQuestion",
                    {
                        description:
                            "Default state to display for unsupported questions",
                        component: (context: Context, event?: MachineEvent) => UnsupportedQuestionComponent,
                        implementation: (context: Context, event?: MachineEvent) => {
                            console.log('UnsupportedQuestion implementation called');
                        }
                    },
                ],
                [
                    "UnsafeQuestion",
                    {
                        description:
                            "Default state to display for unsafe questions",
                        component: (context: Context, event?: MachineEvent) => UnsafeQuestionComponent,
                        implementation: (context: Context, event?: MachineEvent) => {
                            console.log('UnsafeQuestion implementation called');
                        },
                    },
                ]
            ]),
        [callback, SampleComponent],
    );

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
        const toolsCatalog = new Map<string, { description: string }>([
            [
                "RecallSolutions",
                {
                    description:
                        "Recalls a similar solution to the user query. If a solution is found it will set the existingSolutionFound attribute of the event params to true: `event.payload?.params.existingSolutionFound`",
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
                "ManufacturingInstructions",
                {
                    description: "Generate the manufacturing steps for a tested and evaluated formula",
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
            [
                "UnsupportedQuestion",
                {
                    description: "Default state to display for unsupported questions",
                },
            ],
            [
                "UnsafeQuestion",
                {
                    description: "Default state to display for unsafe questions",
                },
            ],
        ]);

        const solverSolution = await engine.solver.solve(userQuery!);
        // generate the program
        const result = await engine.programmer.program(solverSolution, JSON.stringify(Array.from(toolsCatalog.entries())));
        console.log(`programmer returned: ${result}`);
        const evaluationResult = await engine.evaluator.evaluate({ states: result, tools: sampleCatalog })
        if (evaluationResult.rating === 0) {
            // TODO, return a recursive call to program if max count has not been exceeded
            throw evaluationResult.error;
        }
        dispatch({
            type: ReasonDemoActionTypes.SET_STATE,
            value: {
                states: result,
                solution: solverSolution,
            }
        });
        setIsLoading(false);
    }, [ref, setQuery, setIsLoading, sampleCatalog, dispatch]);


    return {
        query,
        states,
        onSubmit,
        isLoading,
        functions: sampleCatalog,
        onNext,
        componentToRender,
        currentState,
        context,
        SuccessComponent,
        setComponentToRender,
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
    const { states, onSubmit, isLoading, functions, componentToRender, currentState, context, SuccessComponent, setComponentToRender } = useLogic({ ref });
    const props = { functions, states: states! }

    useEffect(() => {
        console.log(`The current state is: ${currentState}`);
        const component = (currentState) ? functions.get(currentState)?.component : null;
        console.log(`The component to render associated with the state is: ${component}`);
        if (component && context) {
            setComponentToRender(component(context));
        } else if (currentState && currentState === 'success') {
            setComponentToRender(SuccessComponent);
        }
    }, [currentState, context, SuccessComponent, functions, setComponentToRender]);

    return (
        <Interpreter {...props}>
            <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
                <div style={{ flex: 1, marginRight: "20px" }}>
                    {" "}
                    {/* Flex cell for input and button */}
                    <Card interactive={true} elevation={Elevation.TWO}>
                        <h2>I am Chemli, the AI Chemical Product Engineer</h2>
                        {isLoading ? <LoadingSpinner /> : <></>}
                        <p>Please enter a questions regarding a new cosmetic product, changes to an existing product,
                            or any other chemical product development questions I can answer. Don't worry, I will let You
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
                </div>
            </div>
        </Interpreter>
    );
}
