import { MouseEventHandler } from "react";

export default function AgeConfirmation({ onClick }: {onClick: MouseEventHandler<HTMLButtonElement>}) {
    return(
        <div>
            <h1>AgeConfirmation</h1>
            <button onClick={onClick}>Next</button>
        </div>
    );
}