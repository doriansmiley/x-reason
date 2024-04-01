import 'openai/shims/node';

import engine from "./engine.v1";
import { chatCompletion } from "@/app/api/openai";
import { ChatCompletionCreateParams } from "openai/resources/index.mjs";
import { StateConfig, program, Context, MachineEvent, Task } from ".";

describe('Testing Engineer', () => {
  test("Test Create a new peppermint lip balm product", async () => {
    const query = "Create a new peppermint lip balm product.";
    const solution = await engine.solver.solve(query);
    console.log(solution);
    // evaluation
    const messages = [
      { role: "system", content: "You are helpful AI assistant tasked with evaluating the solutions generated by task models." },
      {
        role: "user",
        content: `
        Rate the solutions to the following user query on a scale of 1-5
        Query: ${query}
        Solution:
        ${solution}
        You can only respond in JSON using this template:
        {rating: YOUR RATING} 
        Do not be chatty, your response will be sent to JSON.parse
        `,
      },
    ];
    const value = await chatCompletion({ messages, model: "gpt-4" } as ChatCompletionCreateParams);
    const unwrapped = value!.match(/```json\s+([\s\S]*?)\s+```/)?.[1] || value;
    const rate = JSON.parse(unwrapped!);

    expect(rate.rating).toBeGreaterThan(3);

    // generate the program
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
    const states = await engine.programmer.program(solution, JSON.stringify(Array.from(toolsCatalog.entries())));

    // Evaluate the program
    const evaluation = await engine.evaluator.evaluate({
      query,
      instructions: "",
      states,
    });

    if (evaluation.error) {
      console.log(evaluation.error.message);
      console.log(evaluation.error.stack);
    }
    expect(evaluation.rating).toBe(1);
  });
});