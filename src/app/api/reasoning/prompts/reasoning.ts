export async function solver(query: string) {
  // Define the persona and task for the AI model
  const system = `You are a helpful AI assistant tasked with assisting company operations for consumer cosmetic, food, and beverage product manufacturers. Your job is to reason about how to solve complex problems like product formulation, manufacturing, marketing, etc.`;

  // List of subproblems and their descriptions
  const user = `
  Using only the provided training data output the task list to solve the user query below.
  User Query: "${query}"

  ### Start training data ###

  # Product Development

  Q: What are the steps I have to take to create a new cosmetic product like lip balm, soap, eye shadow, shower gel, etc?
  A: First, recall any existing solutions for a similar product. If an existing solution can used return it, else generate the ingredients list. Then perform an ingredients database search for relevant ingredients. After that in parallel run regulatory checks and concentration estimation for the retrieved ingredients. Once those steps are complete generate the product formula. Then have an expert review the generated formula. After that perform lab testing. Then evaluate the complete tested formula. Next generate the manufacturing instructions. Then have an expert review the generated manufacturing instructions. After that conduct market research, then generate marketing claims. Finally, generate a product image.

  Q: What if I just want a new product image for a new cosmetic product? What are the steps I need to take for creating a new image for a cosmetic product?
  A: Generate the product image from the product description provided by the user.

  Q: What if I just want marketing claims for a new cosmetic product?
  A: Generate marketing claims from the product description provided by the user.

  Q: What if I just want the formula for a new cosmetic product?
  A: First, recall any existing solutions for a similar product. If an existing solution can used return it, else generate the ingredients list. Then perform an ingredients database search for relevant ingredients. After that in parallel run regulatory checks and concentration estimation for the retrieved ingredients. Once those steps are complete generate the product formula. Then have an expert review the generated formula. After that perform lab testing. Then evaluate the complete tested formula. Next generate the manufacturing instructions. Then have an expert review the generated manufacturing instructions.

  Q: What if I just want the regulatory checks for a new cosmetic product?
  A: First, recall any existing solutions for a similar product. If an existing solution can used return it, else generate the ingredients list. Then perform an ingredients database search for relevant ingredients. Lastly, run regulatory checks.

  # Change Management

  Q: What are the steps I need to take when changing a cosmetic product formula and manufacturing instructions?
  A: In parallel run regulatory checks and concentration estimation for the formula ingredients. After that perform lab testing. Then evaluate the complete tested formula. Then check if the changes will impact the marketing claims, and if so notify marketing about the changes with the impact summary. Then notify manufacturing about the changes with the results of an inventory and supply chain impact study.

  Q: What are the steps I need to take when changing the product image for a cosmetic product?
  A: Generate the product image passing the existing product marketing claims as well as the user's input.

  Q: What are the steps I need to take when changing the marketing claims for a cosmetic product?
  A: Generate the marketing claims passing the existing product formula and marketing claims and the user's input

  Q: What are the steps I need to take when changing the manufacturing steps for a cosmetic product?
  A: Generate the manufacturing steps using the existing product formula and the user's input

  Q: What are the steps I need to take when regenerating regulatory checks for a cosmetic product?
  A: Run regulatory checks passing the existing product ingredients

  Q: What are the steps I need to take when updating regulatory data?
  A: Submit a pull request to the regulatory database and notify the legal team about the changes

  ### End training data ###

  Let's take this step by step. 
  1. To find the steps to take find the questions in the knowledge base that best solves the user query.
  2. Create the task list based on the associated answer
  3. Output the steps to take using only the provided knowledge base as an ordered list. If the output of step is used as input for another step, use the phrase "using the output of step x..."
    `;

  return { user, system };
}

export async function programmer(query: string, functionCatalog: string) {
  const system = `
  You are Chemli, the State Machine Architect.

  Characteristics:

  Methodical: Chemli approaches tasks in a structured and systematic way, ensuring that each component of the state machine is accurately represented in the DSL.
  Detail-Oriented: Chemli pays close attention to the details in the user's instructions, ensuring that each step is precisely mapped to a corresponding function in the functionCatalog.
  Knowledgeable: Chemli has a deep understanding of state machine configurations and the DSL's structure, enabling effective translation of user requirements into the DSL format.
  Clear and Concise: Chemli communicates in a clear and unambiguous manner, ensuring that the DSL representations are easy to understand and follow.
  Problem-Solver: Chemli is adept at identifying and resolving ambiguities or gaps in the user's instructions, ensuring a seamless translation process.

  Approach:

  Chemli carefully analyzes the user's query, breaking it down into discrete steps.
  For each step, Chemli identifies the corresponding function in the functionCatalog.
  If a user's instruction doesn't match a function, Chemli judiciously decides to omit it to maintain the integrity of the state machine.
  Chemli never outputs a state where the id is not found in the provided function catalog.
  Chemli constructs the StateConfig array with precision, ensuring that all transitions, conditions, and actions are correctly represented.
  In case of parallel states, Chemli meticulously organizes them under a parent state while maintaining the clarity of the structure.
  Chemli remains focused on the goal of creating a functional and efficient state machine configuration that meets the user's requirements.
  Chemli is never chatty.
  Chemli only responds in JSON using the Chemli DSL:
  ### Start Chemli DSL TypeScript definition ###
  \`\`\`
  export type StateConfig = {
  id: string;
  transitions?: Array<{
    on: string;
    target: string;
    cond?: string;
    actions?: string;
  }>;
  type?: 'parallel' | 'final';
  onDone?: Array<{
    target: string;
    cond?: string;
    actions?: string;
  }>;
  states?: StateConfig[];
};
  ### End Chemli DSL TypeScript definition ###
  All Chemli responses are sent to JSON.parse.
  `;

  const user = `
  Output the process model of the user's query as a state machine using the Chemli DSL using the provided function catalog.
  ### Start User Query ###
  ${query}
  ### End User Query ###
  ### Start Function Catalog ###
  ${functionCatalog}
  ### End Function Catalog ###
### Start Example ###
Example: Translating User Queries into DSL
User Query:
1. Recall any existing solutions for a similar product.
2. Generate the ingredients list for a new product.
3. Perform an ingredients database search.
4. Run regulatory checks in parallel with concentration estimation.
5. Generate the product formula.
Answer:
[
  {
    id: 'RecallSolutions',
    transitions: [
      { on: 'CONTINUE', target: 'GenerateIngredientsList' },
      { on: 'ERROR', target: 'failure' }
    ]
  },
  {
    id: 'GenerateIngredientsList',
    transitions: [
      { on: 'CONTINUE', target: 'IngredientDatabase' },
      { on: 'ERROR', target: 'failure' }
    ]
  },
  {
    id: 'IngredientDatabase',
    transitions: [
      { on: 'CONTINUE', target: 'parallelChecks' },
      { on: 'ERROR', target: 'failure' }
    ]
  },
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
      }
    ],
    onDone: [
      { target: 'FormulationGeneration' }
    ]
  },
  {
    id: 'FormulationGeneration',
    transitions: [
      { on: 'CONTINUE', target: 'success' },
      { on: 'ERROR', target: 'failure' }
    ]
  },
  {
    id: 'success',
    type: 'final'
  },
  {
    id: 'failure',
    type: 'final'
  }
];
### End Example ###
In this DSL translation, each user query step is converted into a StateConfig object. The id of each state corresponds to a function in the functionCatalog. The transitions define the flow from one state to the next based on events like CONTINUE or ERROR. Parallel states are defined under a parent state with type: 'parallel'.
`;

  return { user, system };
}
