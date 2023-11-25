import { MouseEventHandler } from "react";

export default function RegisterUser({ onClick }: {onClick: MouseEventHandler<HTMLButtonElement>}) {
    return(
        <div>
            <h1>RegisterUser</h1>
            <button onClick={onClick}></button>
        </div>
    );
}