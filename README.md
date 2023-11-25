This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started
Install all dependecnies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

Next create .ev.local and add your OpenAI API key
```bash
OPENAI_API_KEY=<YOUR_KEY>
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Video Demo
[![X-Reason Demo](http://img.youtube.com/vi/GqnSI1DDJe4/0.jpg)](http://www.youtube.com/watch?v=GqnSI1DDJe4 "X-Reason: Dynamic AI Generated Software Flows with X-State!")

## Explanation
This app demonstrates how GPT can dynamically assemble software from a task list. A macro is used to generate a state machine in x-state from the resulting task list generated by GPT. Individual states can be long-running and pause execution. This can facilitate user interaction (such as registration), waiting for callbacks from external systems, or performing async work such as persisting data or sending notifications.

This is just an early prototype, but one can imagine a future state where software can be composed from lists by non-technical users simply through describing the system in natural language. This approach also makes things like user registration, checkout, etc., a process which AI can perform adaptive problem solving based on the available information about the environment including the user and the available tasks it can perform. This reduces brittle if/then/else logic and allows AI to control the software experience. For example, the mock user registration process was assembled dynamically using this prompt:
```text
User
Using the following tools, create a user registration plan to register a user that will balance the user experience (ie the fewest steps and interactions) with business concerns like validating the user's age, upsell/cross-sell opportunities, etc.:
- Collect User Details (required collects information required for registrations)
- Age Confirmation (required for users who are under 16 in the US and Canada)
- Select Plan (required dependents on first collecting user details and age confirmation)
- TOS Acceptance (required must be performed before completing registration)
- Present Special Offers (optional special offers the user can select to save money)
- Select Partner Plugins (optionally select a plugin from the partner ecosystem)
- Persist User Details (required, saves the user's registration data including plan selection, TOS Acceptance, etc)
- Send Registration Event (notify downstream analytics systems a new user has been registered)

Let's take this step by step:
 First, determine which steps are required based on the user's location
Second, optimize your steps for user interaction and efficiency
Third, if the user is a frequent visitor, prioritize ways to help convert them to a paying customer. 

People who visit frequently are more likely to convert and put up with more steps in the registration process. New visitors or those who do not visit the site are more likely to bounce from the registration process.

You can only respond in JSON using the following template: [steps]

For example, if the user is not a resident of the US or Canada and not a request visitor:
["Collect User Details", "Select Plan", "TOS Acceptance", "Persist User Details", "Send Registration Event"]

This user is located in CA, USA, and has visited our site 165 times in the last 30 days.
```
The code then iterates over the returned list, assembling a map which is then passed to our macro to generate the state machine:
```TypeScript
taskList.forEach((state) => {
      map.set(state, steps.get(state));
    });

//setup the machine
const testMachine = machineMacro(map);

const machineExecution = interpret(withContext).onTransition((state) => {
      const type = machineExecution.machine.states[state.value as string]?.meta?.type;
      state.context.stack?.push(state.value as string);
      setState(map.get(state.value));
    });

    setMachine(machineExecution);

// start the machine
machineExecution.start(); 
```
And just like that you have an AI-generated user registration process customized to the user!

