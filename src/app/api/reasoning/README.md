# Chemli Reasoning Engine

Today's LLMs are not capable of complex reasoning tasks. Models do not "think". They are statical algorithms limited to the information encoded into their neural nets as part fo training, and contained within their context window. This doesn't allow for the recall of of previous solutions, or the application of the principles of dynamic programming which break down complex solutions into memoized subproblems. The goal of the reasoning engine is to provide a temporary solution to these limitations until things like [analog processors](https://www.techopedia.com/analog-computing-for-ai-how-it-could-make-us-re-think-the-future), [ReRAM](https://en.wikipedia.org/wiki/Resistive_random-access_memory) ([video](https://www.youtube.com/watch?v=P9kcbGvToFU)), and [Neuromorphic Computing](https://www.techtarget.com/searchenterpriseai/definition/neuromorphic-computing) mature.

### Business Value

1. Reuse of existing solutions for similar domains decreases costs and increases performance. This can also help alleviate rate limiting.
1. Users expect the model to understand ingredient tolerances, quality of ingredients, chemical concentrations, etc. Long term memory of related problems and sub problems will also help the model synthesize **new** solutions to similar problems. While RAG and fine tuning help in recall and synthesis, it's much harder to use these methods for efficient fine grained problem solving, especially when applied to the problem/subproblem paradigm.

### Current Proposal

You can view an early draft of the reasoning architecture [here](https://medium.com/@dorians/applying-dynamic-programming-principles-to-llm-reasoning-tasks-763587dc9891). This article mainly focuses on the application of the principles of dynamic programming and the use of state machines as an execution engine for AI generated solutions to problems. This proposal does not contain a solution for memory which is still an area of ongoing research.

### WIP

I'm currently experimenting with the combination of a semantic search in Postgres engine and an ontology created in Neo4J to solve long term memory for problem/subproblem solutions. The basic idea is we can execute a semantic search in Postgres to retrieve solutions to a user query such as marketing claims or products. For example "foamy Satsuma Shower Gel". The retrieved records will contain a mixture of solution types.

We'll be using [Prisma](https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-models) as it provides both and ORM solution and the ability to execute direct SQL commands. Prisma makes modeling the data much easier and our persistance layer will be easily portable. The current schema is defined as follows:

```
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  image     String
  createdAt DateTime @default(now())
}

enum SubproblemType {
  object // this type corresponds to a generic object serialized as JSON
  string // string solutions, such as conversational solutions
  cypher // solutions that are @cypher statements in @neo4j/graphql such { showerGelIngredients: [Ingredient] @cypher(statement: "MATCH (i:Ingredient)-[:PART_OF]->(p:Phase {name: 'Shower Gel'}) RETURN i") subproblemSolution(id: ID!): Subproblem @cypher(statement: "MATCH (s:Subproblem {id: $id}) RETURN s")}
  state  // state machines serialized as JSON using the x-state format
}

model Embedding {
  id             String       @id @default(cuid())
  embeddings     Unsupported("vector(1536)")? // the embeddings which are a concatenation of problem and subproblem

}

model Subproblem {
  id             String       @id @default(cuid())
  problem        String // the prompt used to generate the subproblem solution
  subproblem     String // the model generated description of the subproblem
  solution       String // the serialized solution, format depends on the value of type
  createdAt      DateTime     @default(now())
  type           SubproblemType
  rating         Float
  embeddings     Embedding @relation(fields: [embeddings], references: [id]) // the embeddings which are a concatenation of problem and subproblem
  created_by     User @relation(fields: [createdById], references: [id])
}


```

The `embeddings` column is a FK to the `Embedding` table. The Embedding table's `embeddings` column is used as part of semantic search. Additional columns can be used for filtering such as `rating`. To filter for distance we'll be computing the dot product for the matrices.

The retrieved `Subproblem` instance of type `cypher` can be used to retrieve the serialized Neo4J query (in cypher syntax) to get the subgraph starting at that node. This type will primarily be used to persist formulas. We'll be using [Neo4j-GraphQL](https://www.npmjs.com/package/@neo4j/graphql) which will be used when we configure our GraphQL server.

```TypeScript
const { gql } = require('apollo-server');
const { Neo4jGraphQL } = require('@neo4j/graphql');

const typeDefs = gql`
  type Ingredient {
    name: String!
    concentration: Float
    tolerance: String
    isPartOfPhase: Phase @relation(name: "PART_OF", direction: OUT)
  }

  type Phase {
    name: String!
    phaseOrder: Int
    manufacturingSteps: [ManufacturingStep] @relation(name: "HAS_STEP", direction: OUT)
  }

  type ManufacturingStep {
    name: String!
    conditions: [Condition] @relation(name: "HAS_CONDITION", direction: OUT)
  }

  type Condition {
    temperature: Float
    duration: Float
  }
`;

// define the server
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
const { ApolloServer } = require('apollo-server');

neoSchema.getSchema().then((schema) => {
  const server = new ApolloServer({ schema });
  server.listen().then(({ url }) => {
    console.log(`GraphQL server ready at ${url}`);
  });
});

```

Subproblem solutions of type cypher can them be serialized as JSON like the following:

```JSON
{
    showerGelIngredients: [Ingredient] @cypher(statement: "MATCH (i:Ingredient)-[:PART_OF]->(p:Phase {name: 'Shower Gel'}) RETURN i")
    subproblemSolution(id: ID!): Subproblem @cypher(statement: "MATCH (s:Subproblem {id: $id}) RETURN s")
}
```

We can then execute the query to obtain the subgraph as follows:

```TypeScript
const { ApolloClient, InMemoryCache, gql, HttpLink } = require('@apollo/client');
const fetch = require('cross-fetch');

// This is just a generic placeholder to represent a query
const Subproblem = await prisma.queryStore.findUnique({
  where: { id: 'your_query_id' } // replace with an actual query
});

const deserializedQuery = JSON.parse(Subproblem.solution);

// Configure Apollo Client
const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000', fetch }),
  cache: new InMemoryCache()
});

async function executeQuery(deserializedQuery) {
  // because our server is initialized with Neo4jGraphQL, these queries will be parsed and executed
  const query = gql`${deserializedQuery.showerGelIngredients}`;
  const response = await client.query({ query });
  return response.data;
}

const result = await executeQuery(deserializedQuery);
console.log(result);
```

Subproblem solutions of type `state` are serialized x-state machine instances in the following format:

```JSON
{
    machineId: "id used to retrieve the machine code using a dynamic import",
    state: "The serialized state machine"
}
```

Machines can be serialized/deserialized in x-state as follows:

```TypeScript
// change to a dynamic import based on the machineId attribute
import { feedbackMachine } from './someMachine';

const feedbackActor = createActor(feedbackMachine).start();

// Persist state
const persistedState = feedbackActor.getPersistedSnapshot();
localStorage.setItem('feedback', JSON.stringify(persistedState));

//  ...

// Restore state
const restoredState = JSON.parse(localStorage.getItem('feedback'));

const restoredFeedbackActor = createActor(feedbackMachine, {
  snapshot: restoredState,
}).start();
// Will restore both the feedbackActor and the invoked form actor at
// their persisted states
```

For more info refer to the [official docs](https://stately.ai/docs/persistence#persisting-state-machine-values).

For `object` type Subproblem just call `JSON.parse`. For `string` types just return the string.

With this scheme semantic search allows us to retrieve the similar problem/subproblem solutions via vector search, then use our ontology to traverse the graph of subproblem. The graph can also provide additional information to supported recommendation engines (such as recommended ingredients) and finding additional relationships in our graph data.

### Ontology Proposal

The Ontology will be used to store information about formulas including ingredients and phases. This information is useful for finding suggested ingredients and formulas outside of semantic search use cases.

I plan to create an Ontology using ttl (Turtle) format applying schema.org entities where applicable. We'll use NeoSemantics from Neo4J to parse the RDF data into a Cypher and populate the resulting graph. Formula instances can then be saved to the Ontology and Neo4J will automatically populate the graph relationships. Research data can be found at:

- https://github.com/neo4j-labs/neosemantics
- https://neo4j.com/blog/ontologies-in-neo4j-semantics-and-knowledge-graphs/
- https://neo4j.com/labs//neosemantics/4.3/introduction/
- Going meta Ep 5: https://www.youtube.com/watch?v=05Wkg1p34ek
- Going metaEp 6: https://www.youtube.com/watch?v=fpt-OsGOzmo

Below is the current proposed Ontology:

```rdf
# Namespace Declarations
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix cos: <http://example.org/cosmetics/> .

# Base class for Ingredients
sg:Ingredient rdf:type rdfs:Class ;
    rdfs:label "Ingredient" .

# Subclasses for specific types of ingredients
sg:Surfactant rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Emollient rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Humectant rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Preservative rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Colorant rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Fragrance rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:pHAdjuster rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Antioxidant rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Exfoliant rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:UVFilter rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Vitamin rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:BotanicalExtract rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .
sg:Moisturizer rdf:type rdfs:Class ;
    rdfs:subClassOf sg:Ingredient .

# Phase of formulation
sg:Phase rdf:type rdfs:Class ;
    rdfs:label "Phase" .

# Manufacturing Step and Condition
sg:ManufacturingStep rdf:type rdfs:Class ;
    rdfs:label "Manufacturing Step" .

sg:Condition rdf:type rdfs:Class ;
    rdfs:label "Condition" .

# Properties for Ingredients (concentration, tolerance)
sg:hasConcentration rdf:type rdf:Property ;
    rdfs:domain sg:Ingredient ;
    rdfs:range xsd:decimal ;
    rdfs:label "has concentration" .

sg:hasTolerance rdf:type rdf:Property ;
    rdfs:domain sg:Ingredient ;
    rdfs:range xsd:string ;
    rdfs:label "has tolerance" .

# Relation of ingredients to phases
sg:isPartOfPhase rdf:type rdf:Property ;
    rdfs:domain sg:Ingredient ;
    rdfs:range sg:Phase ;
    rdfs:label "is part of phase" .

# Properties for Phase (order)
sg:phaseOrder rdf:type rdf:Property ;
    rdfs:domain sg:Phase ;
    rdfs:range xsd:string ;
    rdfs:label "phase order" .

# Properties for Manufacturing Steps and Conditions
sg:hasManufacturingStep rdf:type rdf:Property ;
    rdfs:domain sg:Phase ;
    rdfs:range sg:ManufacturingStep ;
    rdfs:label "has manufacturing step" .

sg:hasCondition rdf:type rdf:Property ;
    rdfs:domain sg:ManufacturingStep ;
    rdfs:range sg:Condition ;
    rdfs:label "has condition" .

sg:temperature rdf:type rdf:Property ;
    rdfs:domain sg:Condition ;
    rdfs:range xsd:decimal ;
    rdfs:label "temperature" .

sg:duration rdf:type rdf:Property ;
    rdfs:domain sg:Condition ;
    rdfs:range xsd:decimal ;
    rdfs:label "duration" .

```

Below is a sample instance of the ontology for shower gel:

```rdf
@prefix sg: <http://example.org/showergel/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# Ingredients
sg:SodiumLaurethSulfate a sg:Surfactant ;
    sg:hasConcentration "16.0"^^xsd:decimal ;
    sg:isPartOfPhase sg:PhaseA .

sg:CocamidopropylBetaine a sg:Surfactant ;
    sg:hasConcentration "3.0"^^xsd:decimal ;
    sg:isPartOfPhase sg:PhaseA .

sg:Glycerin a sg:Emollient ;
    sg:hasConcentration "10.0"^^xsd:decimal ;
    sg:isPartOfPhase sg:PhaseB .

sg:Fragrance a sg:Fragrance ;
    sg:hasConcentration "0.5"^^xsd:decimal ;
    sg:isPartOfPhase sg:PhaseC .

sg:CitricAcid a sg:Acid ;
    sg:hasConcentration "0.2"^^xsd:decimal ;
    sg:isPartOfPhase sg:PhaseC .

sg:Water a sg:Base ;
    sg:hasConcentration "70.3"^^xsd:decimal ;
    sg:isPartOfPhase sg:PhaseA .

# Phases
sg:PhaseA a sg:Phase ;
    sg:phaseOrder "A" .

sg:PhaseB a sg:Phase ;
    sg:phaseOrder "B" .

sg:PhaseC a sg:Phase ;
    sg:phaseOrder "C" .

# Manufacturing Steps
sg:MixingA a sg:ManufacturingStep ;
    sg:hasCondition sg:MixingConditionA .

sg:MixingConditionA a sg:Condition ;
    sg:temperature "40.0"^^xsd:decimal ;
    sg:duration "15.0"^^xsd:decimal .

sg:MixingB a sg:ManufacturingStep ;
    sg:hasCondition sg:MixingConditionB .

sg:MixingConditionB a sg:Condition ;
    sg:temperature "50.0"^^xsd:decimal ;
    sg:duration "20.0"^^xsd:decimal .

sg:MixingC a sg:ManufacturingStep ;
    sg:hasCondition sg:MixingConditionC .

sg:MixingConditionC a sg:Condition ;
    sg:temperature "25.0"^^xsd:decimal ;
    sg:duration "10.0"^^xsd:decimal .

```

### Importing the Ontology using NeoSemantics

Documentation on NeoSemantics can be found [here](https://github.com/neo4j-labs/neosemantics)

```cypher
// Initialize Graph Configuration
CALL n10s.graphconfig.init();

// Import RDF Schema and Data
CALL n10s.rdf.import.fetch('file:///path/to/chemicalFormulations.rdf', 'Turtle');

// Query to verify ChemicalSubstance nodes
MATCH (cs:ChemicalSubstance) RETURN cs LIMIT 10;

// Query to verify relationships, e.g., concentration
MATCH (cs:ChemicalSubstance)-[r:concentration]->() RETURN cs.name, r LIMIT 10;

// Additional queries can be written based on the specific structure and needs of your data.
```

### Parsing the RDF

Basic

```TypeScript
type Condition = {
    temperature: number;
    duration: number;
};

type PhaseData = {
    phase: string;
    conditions: Condition[];
};

function generateRDF(ingredientData: IngredientData[], phaseData: PhaseData[]): string {
    let rdf = "@prefix sg: <http://example.org/cosmetics/> .\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n";

    // Generating RDF for ingredients
    ingredientData.forEach(data => {
        const ingredientName = data.ingredient.replace(/\s+/g, '');
        rdf += `sg:${ingredientName} a sg:Ingredient ;\n`;
        rdf += `    sg:hasConcentration "${data.composition}"^^xsd:string ;\n`;
        rdf += `    sg:isPartOfPhase sg:Phase${data.phase} .\n\n`;
    });

    // Generating RDF for phases and their multiple conditions
    phaseData.forEach(data => {
        rdf += `sg:Phase${data.phase} a sg:Phase ;\n`;
        rdf += `    sg:phaseOrder "${data.phase}" .\n\n`;

        data.conditions.forEach((condition, index) => {
            const conditionName = `Condition${data.phase}_${index}`;
            rdf += `sg:${conditionName} a sg:Condition ;\n`;
            rdf += `    sg:temperature "${condition.temperature}"^^xsd:decimal ;\n`;
            rdf += `    sg:duration "${condition.duration}"^^xsd:decimal .\n\n`;
            rdf += `sg:Phase${data.phase} sg:hasCondition sg:${conditionName} .\n\n`;
        });
    });

    return rdf;
}

// Sample data
const formulaData: IngredientData[] = [ /* ... */ ];
const phaseData: PhaseData[] = [ /* ... */ ];

console.log(generateRDF(formulaData, phaseData));
```

More efficient using a flatter data structure:

```TypeScript
type IngredientData = {
    ingredient: string;
    composition: string;
    phase: string;
};

type ConditionData = {
    phase: string;
    phaseConditionKey: string;
    temperature: number;
    duration: number;
};

function generateRDF(ingredientData: IngredientData[], conditionData: ConditionData[]): string {
    let rdf = "@prefix sg: <http://example.org/cosmetics/> .\n@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n";

    // Generate RDF for ingredients
    ingredientData.forEach(data => {
        const ingredientName = data.ingredient.replace(/\s+/g, '');
        rdf += `sg:${ingredientName} a sg:Ingredient ;\n`;
        rdf += `    sg:hasConcentration "${data.composition}"^^xsd:string ;\n`;
        rdf += `    sg:isPartOfPhase sg:Phase${data.phase} .\n\n`;
    });

    // Create a map to store distinct phases and their conditions
    const phaseMap = new Map<string, string[]>();
    conditionData.forEach(data => {
        if (!phaseMap.has(data.phase)) {
            phaseMap.set(data.phase, []);
        }
        phaseMap.get(data.phase)?.push(data.phaseConditionKey);

        // Generate RDF for each condition
        rdf += `sg:${data.phaseConditionKey} a sg:Condition ;\n`;
        rdf += `    sg:temperature "${data.temperature}"^^xsd:decimal ;\n`;
        rdf += `    sg:duration "${data.duration}"^^xsd:decimal .\n\n`;
    });

    // Generate RDF for phases with their respective conditions
    phaseMap.forEach((conditions, phase) => {
        rdf += `sg:Phase${phase} a sg:Phase ;\n`;
        conditions.forEach(conditionKey => {
            rdf += `    sg:hasCondition sg:${conditionKey} .\n`;
        });
        rdf += '\n';
    });

    return rdf;
}

// Sample data
const formulaData: IngredientData[] = [ /* ... */ ];
const conditionData: ConditionData[] = [ /* ... */ ];

console.log(generateRDF(formulaData, conditionData));
```

### Saving the RDF file in GitLab

I'm proposing a new method on `GitLabRequests.ts`:

```TypeScript
import { v4 as uuidv4 } from 'uuid';
import { commitFormula, createRepoAndCommit } from "@/app/api/gitlab/GitLabRequests";
import { GitLabUser } from "@/app/api/gitlab/GitLabUser";
import { PersonalAccessTokenSchema, ProjectSchema } from "@gitbeaker/rest";

async function publishRDFToGitLab(rdf: string, formulaTitle: string, token: PersonalAccessTokenSchema): Promise<string> {
    const glUser = new GitLabUser(token);
    const repositoryName = formulaTitle.toLowerCase().replaceAll(" ", "-");
    const uniqueFileName = `formula-${uuidv4()}.rdf`; // Generate unique file name
    const repository = await glUser.createRepository({
        name: repositoryName,
        visibility: "public",
    });

    // Committing the RDF file with a unique file name
    await glUser.commitFiles(
        repository as ProjectSchema,
        [{
            filePath: uniqueFileName,
            content: rdf,
        }],
        `Commit RDF for ${formulaTitle}`
    );

    // Constructing the URL to the file in GitLab
    const repoUrl = process.env.GITLAB_HOST + '/' + repositoryName + '/-/blob/master/' + uniqueFileName;
    return repoUrl;
}

// Example usage
const rdf = generateRDF(formulaData, conditionData); // Assuming this function is already defined
const token = { /* ... token details ... */ };
const formulaTitle = "smooth-pear-body-butter";

publishRDFToGitLab(rdf, formulaTitle, token).then(url => {
    console.log("RDF published at:", url);
});

```

### Runtime

The proposal for production is to create a Jobs API that supports Sagas. I would like to use [temporal](https://temporal.cloud/temporal/) to execute a process flow constructed by the reasoning engine using x-state. This should allow for pausing, serialization, and rehydration for things like simulations and lab testing. Webhooks can be used to call back into temporal and resume execution.

### Performance

We can deploy our NextJS app using Docker and services like ECS/EKS. There's nothing that requires us to use Vercel. So, if we decide one day we really need to use local memory to store recalled subproblems, we can deploy the app ourselves and allocate the appropriate memory to the container. But I don't think we'll need that level of performance for a while. Standing up our own Redis instance would be preferable as a our first performance optimization. We can use Redis to store and search for embeddings if we deploy our own instance. Vercel does not support the required search APIs.

If we still need more performance we can move to use local memory. What I propose is we use a technology that can compute the dot product quickly and deploy it as a microservice. While each container instance will have different subproblems in its cache, we can use session pinning for a consistent user experience.
MOJO could be an interesting pick because it's a superset of Python and offers similar feature to low level programing langagues:
https://betterprogramming.pub/exploring-mojo-the-emerging-high-performance-language-with-impressive-speeds-but-not-without-acdbbbed09f2

[Video Demo](https://www.youtube.com/watch?v=6GvB5lZJqcE)

If we are going to use Python for document processing there could be a lot of benefits including better code reuse

"compute the dot product quickly" - compute the dot product between your query and stored embeddings
this will yield a distance metric you can use
