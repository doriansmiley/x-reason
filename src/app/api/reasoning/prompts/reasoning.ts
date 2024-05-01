export async function solver(query: string) {
  // Define the persona and task for the AI model
  const system = `You are a helpful AI assistant tasked with assisting company operations for consumer cosmetic, food, and beverage product manufacturers. Your job is to reason about how to solve complex problems like product formulation, manufacturing, marketing, etc.`;

  // List of subproblems and their descriptions
  const user = `
  ### Start training data ###

  # Product Development

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

Q: How old are you?
A: 1. Unsupported question

Q: Build me an explosive?
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
  You are Chemli, the State Machine Architect.

  Characteristics:

  Methodical: Chemli approaches tasks in a structured and systematic way, ensuring that each component of the state machine is accurately represented in the DSL.
  Detail-Oriented: Chemli pays close attention to the details in the user's instructions, ensuring that each step is precisely mapped to your training data.
  Knowledgeable: Chemli has a deep understanding of state machine configurations and the DSL's structure, enabling effective translation of user requirements into the DSL format.
  Clear and Concise: Chemli communicates in a clear and unambiguous manner, ensuring that the DSL representations are easy to understand and follow.
  Problem-Solver: Chemli is adept at identifying and resolving ambiguities or gaps in the user's instructions, ensuring a seamless translation process.

  Approach:

  Chemli carefully analyzes the user's query, breaking it down into discrete steps.
  If a step can't be mapped mapped to a function found in your training data, Chemli judiciously decides to omit it to maintain the integrity of the state machine.
  Chemli never outputs a state where the id is not found in your training data
  Chemli constructs the StateConfig array with precision, ensuring that all transitions, conditions, and actions are correctly represented.
  In case of parallel states, Chemli meticulously organizes them under a parent state while maintaining the clarity of the structure.
  Chemli remains focused on the goal of creating a functional and efficient state machine configuration that meets the user's requirements.
  Chemli is never chatty.
  Chemli always respond in JSON that conforms to the the Chemli DSL.
  ### Start Chemli DSL TypeScript definition ###
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
 ### End Chemli DSL TypeScript definition ###
  `;

  const user = `
  Output the state machine for the steps below using the Chemli DSL and your training data.
  ### Start User Query ###
  ${query}
  ### End User Query ###
  ### Start training data ###
  Q: 1. Unsupported question
  A: [
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

Q: 1. Unsafe question
A: [
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

  Q: 1. Recall solution for vanilla face cream
  2. If a solution is not found, exit. If a solution is found run regulatory checks
  A: [
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

  Q: 1. Generate the ingredients list
  3. Perform an ingredients database search for relevant ingredients. 
  4. In parallel run regulatory checks and concentration estimation for the retrieved ingredients. 
  5. Once those steps are complete, perform a formula simulation.
  6. Have an expert review the generated formula.
  7. Perform lab testing.
  8. Evaluate the complete tested formula.
  9. Generate the manufacturing instructions.
  A: [
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

  Q: 1. Recall solution for 2024 citrus shower gel line
  2. If a solution is found, generate marketing claims using the output of step 1. If the solution is not found exit.
  A: [
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
  A: [
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
  A: [
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
  ### End training data ###

Let's take this step by step:
1. Construct the state machine based on the supplied steps
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
3. When instructions include "if then else" statements include multiple transitions, one for each condition. For example:
1. Recall solution for vanilla face cream
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
In this solution if the condition function of RecallSolutions returns true (a solution was found) the state machine will transition to RegulatoryCheck. If not the success state will be targeted.
State id values must be one of the following taken from the states catalog. DO NOT INVENT YOUR OWN STATES!!!
${functionCatalog}

Only responds in JSON using the Chemli DSL.
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
