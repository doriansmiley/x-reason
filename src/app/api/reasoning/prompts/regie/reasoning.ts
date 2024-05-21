
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

1. Unsafe question

  Your response is:
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

If the task list is:
1. Have the user accept the terms of service. If the user accepts the TOS go to age confirmation else exit.
2. Perform age confirmation. If the user is 18 or over proceed to register the user else exit.
3. Register the user
4. Display optional partner plugins
5. Have the user select a plan with the premium tier selected
6. Have the user select special offers

Your response is:
[
  {
    "id": "AcceptTOS",
    "transitions": [
      { "on": "CONTINUE", "target": "AgeConfirmation" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "AgeConfirmation",
    "transitions": [
      { "on": "CONTINUE", "target": "RegisterUser" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "RegisterUser",
    "transitions": [
      { "on": "CONTINUE", "target": "PartnerPlugins" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "PartnerPlugins",
    "transitions": [
      { "on": "CONTINUE", "target": "SelectPlan" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "SelectPlan",
    "transitions": [
      { "on": "CONTINUE", "target": "SpecialOffers" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "SpecialOffers",
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
1. Have the user accept the terms of service. If the user accepts the TOS go to age confirmation else exit.
2. Perform age confirmation. If the user is 18 or over proceed to register the user else exit.
3. Register the user
4. Have the user select a plan with the freemium tier selected

Your response is:
[
  {
    "id": "AcceptTOS",
    "transitions": [
      { "on": "CONTINUE", "target": "AgeConfirmation" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "AgeConfirmation",
    "transitions": [
      { "on": "CONTINUE", "target": "RegisterUser" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "RegisterUser",
    "transitions": [
      { "on": "CONTINUE", "target": "SelectPlan" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "SelectPlan",
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
1. Have the user select special offers available in the US for free tier subscription

Your response is:
[
  {
    "id": "SpecialOffers",
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

`;

  return data;
}

async function getEvaluationTrainingData() {
  const data = `TODO: this feature is not supported yet`;

  return data;
}

export async function solver(query: string) {
  // Define the persona and task for the AI model
  const system = `You are a helpful AI assistant tasked with assisting in user registration flows 
  Your job is to reason about how best to register the user taking into account their requested preferences and the required and optional steps.`;

  // List of subproblems and their descriptions
  const user = `
  ### Start training data ###

  # Supported Question Types for User Registration

  Q: I'd like to register for the free version of the website and nothing else.
  A: 1. Have the user accept the terms of service. If the user accepts the TOS go to age confirmation else exit.
  2. Perform age confirmation. If the user is 18 or over proceed to register the user else exit.
  3. Register the user
  4. Have the user select a plan with the freemium tier selected

  Q: I'd like to register for the most expensive tier.
  A: 1. Have the user accept the terms of service. If the user accepts the TOS go to age confirmation else exit.
  2. Perform age confirmation. If the user is 18 or over proceed to register the user else exit.
  3. Register the user
  4. Display optional partner plugins
  5. Have the user select a plan with the premium tier selected
  6. Have the user select special offers

  Q: I'd like to register for the most free tier.
  A: 1. Have the user accept the terms of service. If the user accepts the TOS go to age confirmation else exit.
  2. Perform age confirmation. If the user is 18 or over proceed to register the user else exit.
  3. Register the user
  4. Display optional partner plugins
  5. Have the user select a plan with the freemium tier selected
  6. Have the user select special offers

  Q: I'd like to register for the plus tier.
  A: 1. Have the user accept the terms of service. If the user accepts the TOS go to age confirmation else exit.
  2. Perform age confirmation. If the user is 18 or over proceed to register the user else exit.
  3. Register the user
  4. Display optional partner plugins
  5. Have the user select a plan with the plus tier selected
  6. Have the user select special offers

  Q: I'd like to register for the most plus tier but I'm not interested in partner offerings
  A: 1. Have the user accept the terms of service. If the user accepts the TOS go to age confirmation else exit.
  2. Perform age confirmation. If the user is 18 or over proceed to register the user else exit.
  3. Register the user
  5. Have the user select a plan with the plus tier selected
  6. Have the user select special offers


  Q: The user is registered user in the US with a free tier subscription who's visit history suggested a propensity to convert to a paying customer
  A: 1. Have the user select special offers available in the US for free tier subscription

  # Unsupported Question Types

  Questions unrelated to user registration, or those questions that are unsafe such as those asking for weapons sexually explicit or other unsafe content

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
2. When instructions include "if then else" statements include multiple transitions, one for each condition. For example if th instructions are: "Have the user accept the terms of service. If the user accepts the TOS go to age confirmation else exit." the state machine would be:
[
  {
    "id": "AcceptTOS",
    "transitions": [
      { "on": "CONTINUE", "target": "AgeConfirmation" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
  },
  {
    "id": "AgeConfirmation",
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
In this solution "If the user accepts the TOS go to age confirmation" is represented by the { "on": "CONTINUE", "target": "AgeConfirmation" } transition and "else exit." is represented by the { "on": "CONTINUE", "target": "success" } transition. 
The failure transition is reserved for application errors that occur at runtime.
Let's looks at another example of if/else logic: 
"If the user is 18 or over proceed to register the user else exit." would result in the following state config:
{
    "id": "AgeConfirmation",
    "transitions": [
      { "on": "CONTINUE", "target": "RegisterUser" },
      { "on": "CONTINUE", "target": "success" },
      { "on": "ERROR", "target": "failure" }
    ]
}
In this solution "If the user is 18 or over proceed to register" is represented by the { "on": "CONTINUE", "target": "RegisterUser" } transition and "else exit" is represented by the { "on": "CONTINUE", "target": "success" } transition
The failure transition is reserved for application errors that occur at runtime.
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
