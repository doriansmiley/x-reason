import { MouseEventHandler } from "react";

export default function Success({ onClick }: {onClick: MouseEventHandler<HTMLButtonElement>}) {
    return(
        <div>
            <h1>Success</h1>
            <button onClick={onClick}></button>
        </div>
    );
}