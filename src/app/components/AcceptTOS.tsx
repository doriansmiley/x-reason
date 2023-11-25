import { MouseEventHandler } from "react";

export default function AcceptTOS({ onClick }: {onClick: MouseEventHandler<HTMLButtonElement>}) {
    return(
        <div>
            <h1>AcceptTOS</h1>
            <button onClick={onClick}>Next</button>
        </div>
    );
}