import { interpret } from "xstate";
import 'openai/shims/node';

import { StateConfig, programV1, Context, MachineEvent, Task } from "./";

describe('Testing Programmer', () => {
  test("Test the programV1 function passing state nodes array", async () => {
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
          onDone: "FormulationSimulation",
        },
        {
          id: "FormulationSimulation",
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
              machineExecution.send({
                type: "CONTINUE",
                payload: { RecallSolutions: undefined },
              });
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
              machineExecution.send({
                type: "CONTINUE",
                payload: { GenerateIngredientsList: [] },
              });
            },
          },
        ],
        [
          "IngredientDatabase",
          {
            description:
              "Maintain a comprehensive database of cosmetic ingredients, their properties, potential combinations, and effects. This database includes natural and synthetic ingredients, their usual concentrations in products, and regulatory information.",
            implementation: (context: Context, event?: MachineEvent) => {
              const currentList = context.GenerateIngredientsList || [];
              machineExecution.send({
                type: "CONTINUE",
                payload: { IngredientDatabase: [...currentList, ["Bee Wax 1234 Special Proprietary", "30%", "A"]] },
              });
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
              machineExecution.send({
                type: "CONTINUE",
                payload: { RegulatoryCheck: "no regulatory issues were found" },
              });
            },
          },
        ],
        [
          "ConcentrationEstimation",
          {
            description:
              "Estimate the concentration of each ingredient based on standard industry practices, known effects, and regulatory limits. If this function has an error it will set `context.concentrationEstimationSuccess` to false.",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
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
            },
          },
        ],
        [
          "FormulationSimulation",
          {
            description: "Use simulation models to predict how different ingredients interact. This includes stability, texture, and efficacy simulations.",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
                type: "CONTINUE",
                payload: { FormulationSimulation: "no available simulations were found" },
              });
            },
          },
        ],
        [
          "ExpertReview",
          {
            description: "Have cosmetic chemists review the proposed formula for feasibility and safety.",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
                type: "CONTINUE",
                payload: { ExpertReview: "Certified by Dorian Smiley on 2/2/24" },
              });
            },
          },
        ],
        [
          "LabTesting",
          {
            description: "Test the proposed formula in a laboratory setting to verify its properties and efficacy.",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
                type: "CONTINUE",
                payload: { LabTesting: "Certified by Dorian Smiley on 2/2/24" },
              });
            },
          },
        ],
        [
          "Evaluation",
          {
            description: "Evaluates a generated product formula and rates the result",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
                type: "CONTINUE",
                payload: { Evaluation: 0.95 },
              });
            },
          },
        ],
        [
          "ManufacturingInstructions",
          {
            description:
              "Generate the manufacturing steps for a tested and evaluated formula",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
                type: "CONTINUE",
                payload: { ManufacturingInstructions: "The steps are..." },
              });
            },
          },
        ],
        [
          "MarketResearch",
          {
            description: "Performs market research for the new product",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
                type: "CONTINUE",
                payload: { MarketResearch: "You market is as follows..." },
              });
            },
          },
        ],
        [
          "CreateMarketing",
          {
            description: "Generates a product description for target customers",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
                type: "CONTINUE",
                payload: { CreateMarketing: "Here is your marketing claims..." },
              });
            },
          },
        ],
        [
          "GenerateProductImage",
          {
            description: "generates a product image using the generated product description",
            implementation: (context: Context, event?: MachineEvent) => {
              machineExecution.send({
                type: "CONTINUE",
                payload: { GenerateProductImage: "https://someurl.com" },
              });
            },
          },
        ],
        [
          "UnsupportedQuestion",
          {
            description:
              "Default state to display for unsupported questions",
            implementation: (context: Context, event?: MachineEvent) => {
              console.log('UnsupportedQuestion implementation called');
              machineExecution.send({
                type: "CONTINUE",
                payload: { UnsupportedQuestion: "UnsupportedQuestion implementation called" },
              });
            }
          },
        ],
        [
          "UnsafeQuestion",
          {
            description:
              "Default state to display for unsafe questions",
            implementation: (context: Context, event?: MachineEvent) => {
              console.log('UnsafeQuestion implementation called');
              machineExecution.send({
                type: "CONTINUE",
                payload: { UnsafeQuestion: "UnsafeQuestion implementation called" },
              });
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
                  "RegulatoryCheck",
                  "ConcentrationEstimation",
                  "FormulationSimulation",
                ],
                GenerateIngredientsList: [],
                IngredientDatabase: [
                  [
                    "Bee Wax 1234 Special Proprietary",
                    "30%",
                    "A"
                  ]
                ],
                RegulatoryCheck: "no regulatory issues were found"
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


