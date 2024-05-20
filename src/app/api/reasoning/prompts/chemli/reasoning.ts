
// you can replace this with your a call to DB, API, etc
async function getTrainingData() {
  const data = `
  For example of the task list is:
  1. Unsupported question

  Your response is:
  [
  {
    "id": "UnsupportedQuestion",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]

If the task list is:
1. Create a new product image for some product name and sku.
2. If a solution is not found, exit. If a solution is found run regulatory checks

Your response is:
[
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateProductImage",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]

IF the task list is:
1. Recall any existing solutions for peppermint lip balm
2. If an existing solution can be used proceed to an ingredients database search. Else generate the ingredients list.
3. Perform an ingredients database search for relevant ingredients.
4. In parallel, run regulatory checks and concentration estimation for the retrieved ingredients
5. Once those steps are complete, perform a formula simulation.
6. Have an expert review the generated formula.
7. Perform lab testing.
8. Evaluate the complete tested formula.
9. Generate the manufacturing instructions.
10. Have an expert review the generated manufacturing instructions.
11. Generate the manufacturing instructions.
12. Conduct market research.
13. Generate marketing claims using the output of step 11
14. Generate a product image.

Your response is:
[
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateIngredientsList" },
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateIngredientsList",
    "transitions": [
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "IngredientDatabase",
    "transitions": [
      { "on": "CONTINUE", "target": "parallelChecks" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "parallelChecks",
    "type": "parallel",
    "states": [
      {
        "id": "RegulatoryCheck",
        "transitions": [
          { "on": "CONTINUE", "target": "success" },
          { "on": "ERROR", "target": "failure" }
        ]
      },
      {
        "id": "ConcentrationEstimation",
        "transitions": [
          { "on": "CONTINUE", "target": "success" },
          { "on": "ERROR", "target": "failure" }
        ]
      },
      {
        "id": "success",
        "type": "final"
      },
      {
        "id": "failure",
        "type": "final"
      }
    ],
    "onDone": [{"target": "FormulationSimulation"}]
  },
  {
    "id": "FormulationSimulation",
    "transitions": [
      { "on": "CONTINUE", "target": "ExpertReview" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "ExpertReview",
    "transitions": [
      { "on": "CONTINUE", "target": "LabTesting" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "LabTesting",
    "transitions": [
      { "on": "CONTINUE", "target": "Evaluation" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "Evaluation",
    "transitions": [
      { "on": "CONTINUE", "target": "ManufacturingInstructions" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "ManufacturingInstructions",
    "transitions": [
      { "on": "CONTINUE", "target": "MarketResearch" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "MarketResearch",
    "transitions": [
      { "on": "CONTINUE", "target": "CreateMarketing" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "CreateMarketing",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateProductImage",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]`;

  return data;
}

async function getEvaluationTrainingData() {
  const data = `
    Q: 1. Unsupported question
  [
  {
    "id": "UnsupportedQuestion",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 5, correct: true}
Explanation: The question is unsupported and the transitions are correctly defined

Q: 1. Unsafe question
[
  {
    "id": "UnsafeQuestion",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 5, correct: true}
Explanation: The question is unsafe and the transitions are correctly defined

Q: 1. Create a new product image for Sku #1234r lip balm.
  2. If a solution is not found, exit. If a solution is found run regulatory checks
[
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateProductImage",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 5, correct: true}
Explanation: The states are correct and the transitions correctly account for conditionals defined os the user query. The GenerateProductImage transition in the RecallSolutions state is required based on the logic.

Q: 1. Create a new product image for Sku #1234r lip balm.
  2. If a solution is not found, exit. If a solution is found run regulatory checks
  [
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateProductImage",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 0, correct: false}
Explanation: The states are correct but the transitions and not correct for the RecallSolutions state. It does not account for conditionals defined os the user query. The RegulatoryCheck transition is required based on the logic:
{
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  }


  Q: 1. Recall solution for SKU #sd4323, vanilla face cream
  2. If a solution is not found, exit. If a solution is found run regulatory checks
  [
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "RegulatoryCheck" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "RegulatoryCheck",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 5, correct: true}
Explanation: The states are correct and the transitions correctly account for conditionals defined os the user query. The RegulatoryCheck transition is required based on the logic.

Q: 1. Recall solution for SKU #sd4323, vanilla face cream
  2. If a solution is not found, exit. If a solution is found run regulatory checks
  A: [
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "RegulatoryCheck" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "RegulatoryCheck",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 0, correct: false}
Explanation: The states are correct but the transitions and not correct for the RecallSolutions state. It does not account for conditionals defined os the user query. The RegulatoryCheck transition is required based on the logic.

  Q: 1. Generate the ingredients list
  3. Perform an ingredients database search for relevant ingredients.
  4. In parallel run regulatory checks and concentration estimation for the retrieved ingredients.
  5. Once those steps are complete, perform a formula simulation.
  6. Have an expert review the generated formula.
  7. Perform lab testing.
  8. Evaluate the complete tested formula.
  9. Generate the manufacturing instructions.
  [
  {
    "id": "GenerateIngredientsList",
    "transitions": [
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "IngredientDatabase",
    "transitions": [
      { "on": "CONTINUE", "target": "parallelChecks" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "parallelChecks",
    "type": "parallel",
    "states": [
      {
        "id": "RegulatoryCheck",
        "transitions": [
          { "on": "CONTINUE", "target": "success" },
          { "on": "ERROR", "target": "failure" }
        ]
      },
      {
        "id": "ConcentrationEstimation",
        "transitions": [
          { "on": "CONTINUE", "target": "success" },
          { "on": "ERROR", "target": "failure" }
        ]
      },
      {
        "id": "success",
        "type": "final"
      },
      {
        "id": "failure",
        "type": "final"
      }
    ],
    "onDone": [{"target": "FormulationSimulation"}]
  },
  {
    "id": "FormulationSimulation",
    "transitions": [
      { "on": "CONTINUE", "target": "ExpertReview" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "ExpertReview",
    "transitions": [
      { "on": "CONTINUE", "target": "LabTesting" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "LabTesting",
    "transitions": [
      { "on": "CONTINUE", "target": "Evaluation" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "Evaluation",
    "transitions": [
      { "on": "CONTINUE", "target": "ManufacturingInstructions" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "ManufacturingInstructions",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }

]
A: {rating: 5, correct: true}
Explanation: The states and transitions are correct and the use of parallel states is correctly defined.

  Q: 1. Recall solution for 2024 citrus shower gel line
  2. If a solution is found, generate marketing claims using the output of step 1. If the solution is not found exit.
  [
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "CreateMarketing" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "CreateMarketing",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 5, correct: true}
Explanation: The states are correct and the transitions correctly account for conditionals defined os the user query. The CreateMarketing transition is required based on the logic.

  Q: 1. Recall solution for peppermint lip balm sku# 12334d
  2. If a solution is found, generate a product image using the output of step 1. If the solution is not found exit.
  A: [
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateProductImage",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 5, correct: true}
Explanation: The states are correct and the transitions correctly account for conditionals defined os the user query. The GenerateProductImage transition is required based on the logic.


Q: 1. Recall any existing solutions for peppermint lip balm
2. If an existing solution can be used proceed to an ingredients database search. Else generate the ingredients list.
3. Perform an ingredients database search for relevant ingredients.
4. In parallel, run regulatory checks and concentration estimation for the retrieved ingredients
5. Once those steps are complete, perform a formula simulation.
6. Have an expert review the generated formula.
7. Perform lab testing.
8. Evaluate the complete tested formula.
9. Generate the manufacturing instructions.
10. Have an expert review the generated manufacturing instructions.
11. Generate the manufacturing instructions.
12. Conduct market research.
13. Generate marketing claims using the output of step 11
14. Generate a product image.
[
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateIngredientsList" },
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateIngredientsList",
    "transitions": [
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "IngredientDatabase",
    "transitions": [
      { "on": "CONTINUE", "target": "parallelChecks" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "parallelChecks",
    "type": "parallel",
    "states": [
      {
        "id": "RegulatoryCheck",
        "transitions": [
          { "on": "CONTINUE", "target": "success" },
          { "on": "ERROR", "target": "failure" }
        ]
      },
      {
        "id": "ConcentrationEstimation",
        "transitions": [
          { "on": "CONTINUE", "target": "success" },
          { "on": "ERROR", "target": "failure" }
        ]
      },
      {
        "id": "success",
        "type": "final"
      },
      {
        "id": "failure",
        "type": "final"
      }
    ],
    "onDone": [{"target": "FormulationSimulation"}]
  },
  {
    "id": "FormulationSimulation",
    "transitions": [
      { "on": "CONTINUE", "target": "ExpertReview" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "ExpertReview",
    "transitions": [
      { "on": "CONTINUE", "target": "LabTesting" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "LabTesting",
    "transitions": [
      { "on": "CONTINUE", "target": "Evaluation" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "Evaluation",
    "transitions": [
      { "on": "CONTINUE", "target": "ManufacturingInstructions" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "ManufacturingInstructions",
    "transitions": [
      { "on": "CONTINUE", "target": "MarketResearch" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "MarketResearch",
    "transitions": [
      { "on": "CONTINUE", "target": "CreateMarketing" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "CreateMarketing",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateProductImage",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 5, correct: true}
Explanation: The states and transitions are correct and the use of parallel states is correctly defined. The GenerateIngredientsList transition in the RecallSolutions state is required based on the logic.

Q: 1. Recall any existing solutions for face creme that includes blueberries.
2. If an existing solution can be used proceed to an ingredients database search. Else generate the ingredients list.
3. Perform an ingredients database search for relevant ingredients.
4. In parallel, run regulatory checks and concentration estimation for the retrieved ingredients
5. Once those steps are complete, perform a formula simulation.
6. Have an expert review the generated formula.
7. Perform lab testing.
8. Evaluate the complete tested formula.
9. Generate the manufacturing instructions.
10. Have an expert review the generated manufacturing instructions.
11. Generate the manufacturing instructions.
12. Conduct market research.
13. Generate marketing claims using the output of step 11
14. Generate a product image.
[
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateIngredientsList" },
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateIngredientsList",
    "transitions": [
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "IngredientDatabase",
    "transitions": [
      { "on": "CONTINUE", "target": "parallelChecks" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "parallelChecks",
    "type": "parallel",
    "states": [
      {
        "id": "RegulatoryCheck",
        "transitions": [
          { "on": "CONTINUE", "target": "success" },
          { "on": "ERROR", "target": "failure" }
        ]
      },
      {
        "id": "ConcentrationEstimation",
        "transitions": [
          { "on": "CONTINUE", "target": "success" },
          { "on": "ERROR", "target": "failure" }
        ]
      },
      {
        "id": "success",
        "type": "final"
      },
      {
        "id": "failure",
        "type": "final"
      }
    ],
    "onDone": [{"target": "FormulationSimulation"}]
  },
  {
    "id": "FormulationSimulation",
    "transitions": [
      { "on": "CONTINUE", "target": "ExpertReview" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "ExpertReview",
    "transitions": [
      { "on": "CONTINUE", "target": "LabTesting" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "LabTesting",
    "transitions": [
      { "on": "CONTINUE", "target": "Evaluation" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "Evaluation",
    "transitions": [
      { "on": "CONTINUE", "target": "ManufacturingInstructions" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "ManufacturingInstructions",
    "transitions": [
      { "on": "CONTINUE", "target": "MarketResearch" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "MarketResearch",
    "transitions": [
      { "on": "CONTINUE", "target": "CreateMarketing" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "CreateMarketing",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "GenerateProductImage",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
A: {rating: 5, correct: true}
Explanation: The states and transitions are correct and the use of parallel states is correctly defined. The GenerateIngredientsList transition in the RecallSolutions state is required based on the logic.

  `;

  return data;
}

export async function solver(query: string) {
  // Define the persona and task for the AI model
  const system = `You are a helpful AI assistant tasked with assisting company operations for consumer cosmetic, food, and beverage product manufacturers. Your job is to reason about how to solve complex problems like product formulation, manufacturing, marketing, etc.`;

  // List of subproblems and their descriptions
  const user = `
  ### Start training data ###

  # Supported Question Types for Chemical Product Development

  Q: Create a new face creme that includes blueberries.
  A: 1. Recall any existing solutions for face creme that includes blueberries.
  2. If an existing solution can be used proceed to an ingredients database search. Else generate the ingredients list.
  3. Perform an ingredients database search for relevant ingredients.
  4. In parallel, run regulatory checks and concentration estimation for the retrieved ingredients
  5. Once those steps are complete, perform a formula simulation.
  6. Have an expert review the generated formula.
  7. Perform lab testing.
  8. Evaluate the complete tested formula.
  9. Generate the manufacturing instructions.
  10. Have an expert review the generated manufacturing instructions.
  11. Generate the manufacturing instructions.
  12. Conduct market research.
  13. Generate marketing claims using the output of step 11
  14. Generate a product image.

Q: Create a mint lip balm product
A: 1. Recall any existing solutions for lip balm product
2. If an existing solution can be used proceed to an ingredients database search. Else generate the ingredients list.
3. Perform an ingredients database search for relevant ingredients.
4. In parallel, run regulatory checks and concentration estimation for the retrieved ingredients
5. Once those steps are complete, perform a formula simulation.
6. Have an expert review the generated formula.
7. Perform lab testing.
8. Evaluate the complete tested formula.
9. Generate the manufacturing instructions.
10. Have an expert review the generated manufacturing instructions.
11. Generate the manufacturing instructions.
12. Conduct market research.
13. Generate marketing claims using the output of step 11
14. Generate a product image.

Q: Create a new citrus shower gel
A: 1. Recall any existing solutions for citrus shower gel
2. If an existing solution can be used proceed to an ingredients database search. Else generate the ingredients list.
3. Perform an ingredients database search for relevant ingredients.
4. In parallel, run regulatory checks and concentration estimation for the retrieved ingredients
5. Once those steps are complete, perform a formula simulation.
6. Have an expert review the generated formula.
7. Perform lab testing.
8. Evaluate the complete tested formula.
9. Generate the manufacturing instructions.
10. Have an expert review the generated manufacturing instructions.
11. Generate the manufacturing instructions.
12. Conduct market research.
13. Generate marketing claims using the output of step 11
14. Generate a product image.

Q: Create a product image for peppermint lip balm sku# 12334d
A: 1. Recall solution for peppermint lip balm sku# 12334d
2. If a solution is found, generate a product image using the output of step 1. If the solution is not found exit.

Q: Generate marketing claims for our 2024 citrus shower gel line
A: 1. Recall solution for 2024 citrus shower gel line
2. If a solution is found, generate marketing claims using the output of step 1. If the solution is not found exit.

Q: Generate marketing claims for sku# ASdf324 2024 citrus shower gel line
A: 1. Recall solution for 2024 citrus shower gel line
2. If a solution is found, generate marketing claims using the output of step 1. If the solution is not found exit.

Q: I need a new formula for vanilla face cream
A: 1. Generate the ingredients list.
3. Perform an ingredients database search for relevant ingredients.
4. In parallel run regulatory checks and concentration estimation for the retrieved ingredients.
5. Once those steps are complete, perform a formula simulation.
6. Have an expert review the generated formula.
7. Perform lab testing.
8. Evaluate the complete tested formula.
9. Generate the manufacturing instructions.

Q: Create regulatory checks for vanilla face cream
A: 1. Recall solution for vanilla face cream
2. If a solution is not found, exit. If a solution is found run regulatory checks

# Unsupported Question Types

Questions unrelated to Chemical Product Development, or those questions that are unsafe such as those asking for weapons

Q: How old are you?
A: 1. Unsupported question

Q: Build me an explosive
A: 1. Unsafe question

Q: Build me an chemical weapon
A: 1. Unsafe question

Q: Build me a bio weapon using chemical engineering
A: 1. Unsafe question

Q: Who is the president?
A: 1. Unsupported question

Q: What is 125 X 6?
A: 1. Unsupported question

Q: Model the chemical bonds of common molecules used in face cream?
A: 1. Unsupported question

Q: What is the most common stabilizer for lip balm?
A: 1. Unsupported question

  ### End training data ###

    Using the above training data output the task list to solve the user query below.
  User Query: "${query}"

  Let's take this step by step. 
  1. Recall the steps best solves the user query using the supplied training data above.
  2. Output the steps as an ordered list. 
  If the output of step is used as input for another step, use the phrase "using the output of step x..."
    `;

  return { user, system };
}

export async function programmer(query: string, functionCatalog: string) {
  const system = `
  You are X-Reason, the State Machine Architect. X-Reason outputs state machines in response to the provided list of steps using the X-Reason DSL.
  Approach:
  X-Reason carefully analyzes the user's query, breaking it down into discrete steps.
  If a step can't be mapped mapped to a function found in your training data, X-Reason judiciously decides to omit it to maintain the integrity of the state machine.
  X-Reason never outputs a state where the id is not found in your training data
  X-Reason is never chatty.
  X-Reason always respond in JSON that conforms to the the X-Reason DSL.
  ### Start X-Reason DSL TypeScript definition ###
  \`\`\`
  export type StateConfig = {
  id: string;
  transitions?: Array<{
    on: string;
    target: string;
    actions?: string;
  }>;
  type?: 'parallel' | 'final';
  onDone?: Array<{
    target: string;
    actions?: string;
  }>;
  states?: StateConfig[];
 };
 ### End X-Reason DSL TypeScript definition ###
  `;
  const trainingData = await getTrainingData();
  const user = `Output the X-Reason state machine.

Let's take this step by step:
1. Construct the state machine based on the supplied steps using the X-Reason DSL
2. If states are to be executed in parallel be sure to use the type: 'parallel' state node (examples below). 
Note parallel states nodes are required to target their own success and failure nodes and there must be an onDone attribute!!!
\`\`\`
{
    id: 'parallelChecks',
    type: 'parallel',
    states: [
      {
        id: 'RegulatoryCheck',
        transitions: [
          { on: 'CONTINUE', target: 'success' },
          { on: 'ERROR', target: 'failure' }
        ]
      },
      {
        id: 'ConcentrationEstimation',
        transitions: [
          { on: 'CONTINUE', target: 'success' },
          { on: 'ERROR', target: 'failure' }
        ]
      },
      success: {
              type: "final",
      },
      failure: {
              type: "final",
      }
    ],
    onDone: [
      { target: 'FormulationGeneration' }
    ]
  },
\`\`\`
3. When instructions include "if then else" statements include multiple transitions, one for each condition. For example if th instructions are: "1. Recall solution for vanilla face cream 2. If a solution is not found, exit. If a solution is found run regulatory checks" the state machine would be:
[
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "RegulatoryCheck" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "RegulatoryCheck",
    "transitions": [
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "success",
    "type": "final"
  },
  {
    "id": "failure",
    "type": "final"
  }
]
In this solution "If a solution is not found, exit." is represented by the { "on": "CONTINUE", "target": "success" } transition and "If a solution is found run regulatory checks" is represented by the { "on": "CONTINUE", "target": "RegulatoryCheck" } transition.
Let's looks at another example of if/else logic: 
"If an existing solution can be used proceed to an ingredients database search. Else generate the ingredients list." would result in the following state config:
{
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "CONTINUE", "target": "GenerateIngredientsList" },
      { "on": "ERROR", "target": "failure" }
    ]
}
In this solution "If an existing solution can be used proceed to an ingredients database search" is represented by the { "on": "CONTINUE", "target": "IngredientDatabase" } transition and "Else generate the ingredients list." is represented by the { "on": "CONTINUE", "target": "GenerateIngredientsList" } transition
There are only two acceptable event values for the "on" attribute: "CONTINUE" and "ERROR". The "ERROR" event can only target the "failure" state
4. Make sure all state ID values in the state machine correspond to a value found in function catalog below. DO NOT INVENT YOUR OWN STATES!!!
Function Catalog:
${functionCatalog}

${trainingData}

If steps are
${query}

The state machine is?
`;

  return { user, system };
}

export async function aiTransition(taskList: string, currentState: string, payload: string) {
  const system = `
  You are an AI based reasoning engine called Transit. Transit determines if state machine transitions should take place.
  Transit only returns a valid transition target and is never chatty.
  Transit only considered the information provided by the user to determine which transition target to return
  `;

  const user = `
  ### Start training data ###
  Q: Based on the following task list:
  1. Recall solution for sku #1234 face cream.
  2. If a solution is found, generate a product image using the output of step 1. If the solution is not found, exit.

  The current state of the application is:
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  }
  The result of that state is:
  {"RecallSolutions":"No solution found"}

  Return the target for the next state.
  A: success

  Q: Based on the following task list:
  1. Recall solution for sku #1234 face cream.
  2. If a solution is found, generate a product image using the output of step 1. If the solution is not found, exit.

  The current state of the application is:
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateProductImage" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  }
  The result of that state is:
  {"RecallSolutions":{"phases": 
  {"A": [...phases], "B": [...]}
  "Manufacturing Procedure": "1. Mix phase (A) and (B)"...,
  ...more solution attributes
}}

  Return the target for the next state.
  A: GenerateProductImage

  Q: Based on the following task list:
  1. Recall an existing solutions
  2. If an existing solution can be used proceed to an ingredients database search. Else generate the ingredients list.
  3. Perform an ingredients database search for relevant ingredients.
  4. In parallel, run regulatory checks and concentration estimation for the retrieved ingredients
  5. Once those steps are complete, perform a formula simulation.
  6. Have an expert review the generated formula.
  7. Perform lab testing.
  8. Evaluate the complete tested formula.
  9. Generate the manufacturing instructions.
  10. Have an expert review the generated manufacturing instructions.
  11. Generate the manufacturing instructions.
  12. Conduct market research.
  13. Generate marketing claims using the output of step 11
  14. Generate a product image.

  The current state of the application is:
  {
    "id": "RecallSolutions",
    "transitions": [
      { "on": "CONTINUE", "target": "GenerateIngredientsList" },
      { "on": "CONTINUE", "target": "IngredientDatabase" },
      { "on": "ERROR", "target": "failure" }
    ]
  }
  The result of that state is:
  {"RecallSolutions":{"phases":
  {"A": [...phases], "B": [...]}
  "Manufacturing Procedure": "1. Mix phase (A) and (B)"...,
  ...more solution attributes
}}

  Return the target for the next state.
  A: IngredientDatabase

  ### End training data ###

  Based on the following task list:
  ${taskList}

 The current state of the application is:
  ${currentState}
  The result of that state is:
  ${payload}

  Return the target for the next state.
  `;

  return { system, user };
}

export async function evaluate(query: string, states: string) {
  const system = `You are X-Reason Evaluator, the X-Reason state machine evaluator. Your job os to rate the quality of AI generated state machines.`;
  const trainingData = await getEvaluationTrainingData();
  const user = `Evaluate the quality of the generated state machine in the previous messages.
Only responds in JSON using the X-Reason DSL, for example:  { rating: 4, correct: true }.
`;

  return { user, system };
}

export function baseFormula(claims: string) {
  const system = `You are a helpful AI assistant tasked with reverse engineering cosmetic formulas from marketing claims.`;
  const user = `Perform chemical estimation for the following marketing claims:
    ${claims}
    Let's take this step by step. 
    First, Extract key ingredients and any prescribed amounts from marketing claims. 
    Second, search the internet for the ingredients, their properties, potential combinations, and effects. 
    Third, classify the ingredients into active and inert. 
    Lastly, synthesize your response using the following instructions:
    
    A formula always has the same structure and is described as a table with what ingredients to mix in a particular phase (shown below in the sample JSON response template). Phases are always alphabetical letters and ascending: "A", "B", "C" ...
    
    For the formula to be stable there are some rules:
    - For cosmetic products: if it is a liquid or cream and contains any oil ingredient present in the formula, they need to be solubilized which means that an ingredient like PEG-40 hydrogenated castor oil needs to be added to the formula, never include this in food items.
    - For oral care products: if it needs to be anti bacterial, then chlorhexidine digluconate can be added, but this cannot be added to food items for ingestion.
    
    You can only respond in JSON using the following tempalte":
    {"phases": {
        "A": [
            {
                "ingredient": "Name",
                "INCI Name": "Name", 
                "%": "X%"
            },
            ...more ingredients for phase A
        ],
        "B": [
             {
                "ingredient": "Name",
                "INCI Name": "Name", 
                "%": "X%"
            },
            ...more ingredients for phase B
        ],
        ...more phases
    }
    }
    `;

  return { system, user };
}
