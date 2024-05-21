import { useCallback, useRef, useState } from "react";
import { Button, FormGroup, InputGroup } from "@blueprintjs/core";
import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function RegisterUser() {
    const dispatch = useReasonDemoDispatch();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const onNext = useCallback(() => {
        const payload = {
            RegisterUser: {
                firstName,
                lastName,
                email,
                registeredOn: Date.now()
            },
        };
        dispatch({
            type: ReasonDemoActionTypes.SET_STATE,
            value: {
                event: {
                    type: "CONTINUE",
                    payload,
                },
            }
        });
    }, [dispatch, firstName, lastName, email]);

    return (
        <div>
            <h1>User Registration</h1>
            <FormGroup
                label="First Name"
                labelFor="first-name-input"
                labelInfo="(required)"
            >
                <InputGroup
                    id="first-name-input"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </FormGroup>
            <FormGroup
                label="Last Name"
                labelFor="last-name-input"
                labelInfo="(required)"
            >
                <InputGroup
                    id="last-name-input"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </FormGroup>
            <FormGroup
                label="Email"
                labelFor="email-input"
                labelInfo="(required)"
            >
                <InputGroup
                    id="email-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormGroup>
            <Button onClick={onNext} intent="primary">
                Register
            </Button>
        </div>
    );
}
