import { LabTesting, ExpertReview, Success, RecallSolution, UnsafeQuestion, UnsupportedQuestion, DefaultComponent } from "@/app/components/chemli";
import { Context, MachineEvent, Task, engineV1 as engine } from "@/app/api/reasoning";
import { ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";
import { ActionType } from "@/app/utils";
import { programmer, solver, evaluate } from "@/app/api/reasoning/prompts";

function getFunctionCatalog(dispatch: (action: ActionType) => void) {
    return new Map<string, Task>([
        [
            "RecallSolutions",
            {
                description:
                    "Recalls a similar solution to the user query. If a solution is found it will set the existingSolutionFound attribute of the event params to true: `event.payload?.params.existingSolutionFound`",
                // this is an example of a visual state that requires user interaction
                component: (context: Context, event?: MachineEvent) => <RecallSolution />,
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('RecallSolutions implementation called');
                },
            },
        ],
        [
            "GenerateIngredientsList",
            {
                description: "Generates a list of ingredients for a product formula",
                // this is an example of how you can render a component while the implementation function executes
                component: (context: Context, event?: MachineEvent) => <DefaultComponent message="Getting the ingredients list..." />,
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('GenerateIngredientsList implementation called');
                    setTimeout(() => {
                        // TODO all real implementation
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: {
                                    type: "CONTINUE",
                                    payload: { GenerateIngredientsList: [] },
                                },
                            }
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
                component: (context: Context, event?: MachineEvent) => <DefaultComponent message="Searching the ingredients database..." />,
                implementation: (context: Context, event?: MachineEvent) => {
                    setTimeout(() => {
                        // TODO all real implementation
                        const currentList = context.GenerateIngredientsList || [];
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: {
                                    type: "CONTINUE",
                                    payload: { IngredientDatabase: [...currentList, ["Bee Wax 1234 Special Proprietary", "30%", "A"]] },
                                },
                            }
                        });
                    }, 5000);
                },
                transitions: new Map<"CONTINUE" | "ERROR", (context: Context, event: MachineEvent) => boolean>([
                    [
                        "CONTINUE",
                        // this is an example of a deterministic function that is invoked as part of evaluating transitions
                        // it can do whatever you like and take into account the current state of the world found on the context
                        // The results of the implementation function should be include included in the payload of the incoming event
                        // in this case payload.IngredientDatabase
                        (context: Context, event: MachineEvent) => event.payload?.IngredientDatabase?.length > 0
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
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: {
                                    type: "CONTINUE",
                                    payload: { RegulatoryCheck: "no regulatory issues were found" }
                                },
                            }
                        });
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
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: {
                                    type: "CONTINUE",
                                    payload: {
                                        ConcentrationEstimation: [
                                            ["ingredient", "tolerance%"],
                                            ["Bee Wax", "30-31%"],
                                            ["Coconut Oil", "40-45%"],
                                            ["Tree Resin", "20-21%%"],
                                        ],
                                    },
                                },
                            }
                        });
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
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: { type: "CONTINUE", payload: { FormulationSimulation: "no available simulations were found" } },
                            }
                        });
                    }, 1);
                },
            },
        ],
        [
            "ExpertReview",
            {
                description: "Have cosmetic chemists review the proposed formula for feasibility and safety.",
                component: (context: Context, event?: MachineEvent) => <ExpertReview />,
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('ExpertReview Invoked');
                },
            },
        ],
        [
            "LabTesting",
            {
                description: "Test the proposed formula in a laboratory setting to verify its properties and efficacy.",
                component: (context: Context, event?: MachineEvent) => <LabTesting />,
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('LabTesting Invoked');
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
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: { type: "CONTINUE", payload: { Evaluation: 0.95 } },
                            }
                        });
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
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: { type: "CONTINUE", payload: { ManufacturingInstructions: "The steps are..." } },
                            }
                        });
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
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: { type: "CONTINUE", payload: { MarketResearch: "You market is as follows..." } },
                            }
                        });
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
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: { type: "CONTINUE", payload: { CreateMarketing: "Here is your marketing claims..." } },
                            }
                        });
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
                        dispatch({
                            type: ReasonDemoActionTypes.SET_STATE,
                            value: {
                                event: { type: "CONTINUE", payload: { GenerateProductImage: "https://someurl.com" } },
                            }
                        });
                    }, 1);
                },
            },
        ],
        [
            "UnsupportedQuestion",
            {
                description:
                    "Default state to display for unsupported questions",
                component: (context: Context, event?: MachineEvent) => <UnsupportedQuestion />,
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
                component: (context: Context, event?: MachineEvent) => <UnsafeQuestion />,
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('UnsafeQuestion implementation called');
                },
            },
        ]
    ]);
}

function getToolsCatalog() {
    return new Map<string, { description: string }>([
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
}

function getMetaData() {
    return {
        title: 'I am Chemli, the AI Chemical Product Engineer',
        description: 'Please enter a questions regarding a new cosmetic product, changes to an existing product, or any other chemical product development questions I can answer. Don\'t worry, I will let You know if you ask an unsupported question.',
    }
}

export {
    programmer as chemliProgrammer,
    solver as chemliSolver,
    evaluate as chemliEvaluate,
    getFunctionCatalog as chemliFunctionCatalog,
    getToolsCatalog as chemliToolsCatalog,
    getMetaData as chemliMetaData,
}