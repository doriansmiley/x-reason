import { interpret } from "xstate";
import 'openai/shims/node';

import { StateConfig, programV1, Context, MachineEvent, Task } from "./";

describe('Testing Programmer', () => {
  xtest("Test the programV1 function passing state nodes array", async () => {
    // TODO refactor this to use the headless interpreter when it's done
    return new Promise((resolve, reject) => {
      const stateConfigArray: StateConfig[] = [
        {
          id: "RecallSolutions",
          transitions: [
            { on: "CONTINUE", target: "GenerateIngredientsList" },
            { on: "ERROR", target: "failure" },
          ],
        },
        {
          id: "GenerateIngredientsList",
          transitions: [
            { on: "CONTINUE", target: "IngredientDatabase" },
            { on: "ERROR", target: "failure" },
          ],
        },
        {
          id: "IngredientDatabase",
          transitions: [
            { on: "CONTINUE", target: "parallelChecks" },
            { on: "ERROR", target: "failure" },
          ],
        },
        {
          id: "parallelChecks",
          type: "parallel",
          states: [
            {
              id: "RegulatoryCheck",
              transitions: [
                { on: "CONTINUE", target: "success" },
                { on: "ERROR", target: "failure" },
              ],
            },
            {
              id: "ConcentrationEstimation",
              transitions: [
                { on: "CONTINUE", target: "success" },
                { on: "ERROR", target: "failure" },
              ],
            },
          ],
          onDone: "FormulationGeneration",
        },
        {
          id: "FormulationGeneration",
          transitions: [
            { on: "CONTINUE", target: "success" },
            { on: "ERROR", target: "failure" },
          ],
        },
        {
          id: "success",
          type: "final",
        },
        {
          id: "failure",
          type: "final",
        },
      ];
      const sampleCatalog = new Map<string, Task>([
        [
          "RecallSolutions",
          {
            description:
              "Recalls a smilar solution to the user query. If a solution is found it will set the existingSolutionFound attribute of the event params to true: `event.payload?.params.existingSolutionFound`",
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
            implementation: (context: Context, event?: MachineEvent) => {
              setTimeout(() => {
                // TODO all real implementation
                if (callback) {
                  // depending on the path taken GenerateIngredientsList could be undefined
                  const currentList = context.GenerateIngredientsList || [];
                  callback({
                    type: "CONTINUE",
                    payload: { IngredientDatabase: [...currentList, ["Bee Wax 1234 Special Proprietary", "30%", "A"]] },
                  });
                }
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

      const result = programV1(stateConfigArray, sampleCatalog);

      const withContext = result.withContext({
        status: 0,
        requestId: "test",
        stack: [],
      });

      const machineExecution = interpret(withContext).onTransition((state) => {
        const type = machineExecution.machine.states[state.value as string]?.meta?.type;

        state.context.stack?.push(state.value as string);

        switch (state.value) {
          case "success":
            expect(JSON.stringify(state.context)).toBe(
              JSON.stringify({
                status: 0,
                requestId: "test",
                stack: [
                  "RecallSolutions",
                  "GenerateIngredientsList",
                  "IngredientDatabase",
                  {
                    parallelChecks: {
                      RegulatoryCheck: "pending",
                      ConcentrationEstimation: "pending",
                    },
                  },
                  "FormulationGeneration",
                  "success",
                ],
                RecallSolutions: false,
                GenerateIngredientsList: [
                  ["ingredient", "%", "phase"],
                  ["Bee Wax", "30%", "A"],
                  ["Coconut Oil", "40%", "A"],
                  ["Tree Resin", "20%", "B"],
                ],
                IngredientDatabase: [
                  ["ingredient", "%", "phase"],
                  ["Bee Wax", "30%", "A"],
                  ["Coconut Oil", "40%", "A"],
                  ["Tree Resin", "20%", "B"],
                  ["Bee Wax 1234 Special Proprietary", "30%", "A"],
                ],
                RegulatoryCheck: "no regulatory issues were found",
                ConcentrationEstimation: [
                  ["ingredient", "tolerance%"],
                  ["Bee Wax", "30-31%"],
                  ["Coconut Oil", "40-45%"],
                  ["Tree Resin", "20-21%%"],
                ],
              }),
            );
            expect(machineExecution.machine.context.stack?.length).toBe(6);
            resolve("success");
            break;
          case "failure":
            // TODO error reporting
            reject(state.context);
            break;
        }
      });

      machineExecution.start();
    });
  });
  // TODO add more tests including testing for conditionals
});


