import { Context, MachineEvent, Task, } from "@/app/api/reasoning";
import { ActionType } from "@/app/utils";
import { regieProgrammer, regieSolver, regieEvaluate } from "@/app/api/reasoning/prompts/";

function getFunctionCatalog(dispatch: (action: ActionType) => void) {
    return new Map<string, Task>([
        [
            "AcceptTOS",
            {
                description:
                    "Required step that allows the user to accept or reject the terms of service",
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('AcceptTOS implementation called');
                    const payload = {
                        AcceptTOS: { accepted: true, acceptedOn: Date.now() },
                    };
                    dispatch({
                        type: 'CONTINUE',
                        payload,
                    });
                },
                transitions: new Map<"CONTINUE" | "ERROR", (context: Context, event: MachineEvent) => boolean>([
                    [
                        "CONTINUE",
                        // this is an example of a deterministic function that is invoked as part of evaluating transitions
                        // it can do whatever you like and take into account the current state of the world found on the context
                        // The results of the implementation function should be include included in the payload of the incoming event
                        // in this case we verify the user accepted the TOS
                        (context: Context, event: MachineEvent) => {
                            console.log(`AcceptTOS transitions called: ${JSON.stringify(event)}`);
                            return event.payload?.AcceptTOS?.accepted;
                        }
                    ]
                ]),
            },
        ],
        [
            "AgeConfirmation",
            {
                description: "Required step that allows the user to confirm they are at least 18 years of age",
                // this is an example of how you can render a component while the implementation function executes
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('AgeConfirmation implementation called');
                    const payload = {
                        AgeConfirmation: { confirmed: true, acceptedOn: Date.now() },
                    };
                    dispatch({
                        type: 'CONTINUE',
                        payload,
                    });
                },
                transitions: new Map<"CONTINUE" | "ERROR", (context: Context, event: MachineEvent) => boolean>([
                    [
                        "CONTINUE",
                        // this is an example of a deterministic function that is invoked as part of evaluating transitions
                        // it can do whatever you like and take into account the current state of the world found on the context
                        // The results of the implementation function should be include included in the payload of the incoming event
                        // in this case we verify the user is at least 18
                        (context: Context, event: MachineEvent) => event.payload?.AgeConfirmation?.confirmed
                    ]
                ]),
            },
        ],
        [
            "PartnerPlugins",
            {
                description:
                    "Optional step allows the user to select partner plugins they can sign up for",
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('PartnerPlugins implementation called');
                    dispatch({ type: 'CONTINUE' });
                },
            },
        ],
        [
            "RegisterUser",
            {
                description:
                    "Required step to collect the users personal information",
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('RegisterUser implementation called');
                    dispatch({ type: 'CONTINUE' });
                },
            },
        ],
        [
            "SelectPlan",
            {
                description:
                    "Required step that allows the user to select the subscription tier they would like",
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('SelectPlan implementation called');
                    dispatch({ type: 'CONTINUE' });
                },
            },
        ],
        [
            "SpecialOffers",
            {
                description: "Optional step that allows the user to select the special offers they would like",
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('SpecialOffers implementation called');
                    dispatch({ type: 'CONTINUE' });
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
                    dispatch({ type: 'CONTINUE' });
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
                    dispatch({ type: 'CONTINUE' });
                },
            },
        ]
    ]);
}

function getToolsCatalog() {
    return new Map<string, { description: string }>([
        [
            "AcceptTOS",
            {
                description:
                    "Required step that allows the user to accept or reject the terms of service",
            },
        ],
        [
            "AgeConfirmation",
            {
                description: "Required step that allows the user to confirm they are at least 18 years of age",
            },
        ],
        [
            "PartnerPlugins",
            {
                description:
                    "Optional step allows the user to select partner plugins they can sign up for",
            },
        ],
        [
            "RegisterUser",
            {
                description:
                    "Required step to collect the users personal information",
            },
        ],
        [
            "SelectPlan",
            {
                description:
                    "Required step that allows the user to select the subscription tier they would like",
            },
        ],
        [
            "SpecialOffers",
            {
                description: "Optional step that allows the user to select the special offers they would like",
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
        title: 'I am Regie, the AI powered user registration system.',
        description: 'Tell  me any special requests you have in the registration process and I\'ll taylor your experience if possible.',
    }
}

export {
    regieProgrammer,
    regieSolver,
    regieEvaluate,
    getFunctionCatalog as regieFunctionCatalog,
    getToolsCatalog as regieToolsCatalog,
    getMetaData as regieMetaData,
}