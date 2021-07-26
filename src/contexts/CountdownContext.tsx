import { createContext, useContext, useEffect, useState } from "react";
import { ChallengesContext } from "./ChallengesContext";

interface CountdownContextProps {
    children: React.ReactNode;
}

interface CountdownContextData {
    time: number;
    minutes: number,
    seconds: number,
    isActive: boolean;
    hasFinished: boolean;
    startCountdown: () => void;
    resetCountdown: () => void;
}

export const CountdownContext = createContext({} as CountdownContextData);

let countdownTimeout: NodeJS.Timeout;

export function CountdownProvider({ children }: CountdownContextProps) {
    const { startNewChallenge } = useContext(ChallengesContext)

    const [ time, setTime ] = useState(2500 * 60);
    const [ isActive, setIsActive] = useState(false);
    const [ hasFinished, setHasFinished] = useState(false);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    useEffect(() => {
        if (isActive && time > 0) {
            countdownTimeout = setTimeout(() => setTime(time - 1), 1000);
        } else if (isActive && time === 0) {
            setHasFinished(true);
            setIsActive(false);
            startNewChallenge();
        }
    }, [isActive, time]);

    function startCountdown() {
        setIsActive(true);
    }

    function resetCountdown() {
        clearTimeout(countdownTimeout);
        setIsActive(false);
        setHasFinished(false);
        setTime(2500 * 60);
    }

    return (
        <CountdownContext.Provider 
            value={{
                time, 
                minutes,
                seconds,
                isActive,
                hasFinished,
                resetCountdown,
                startCountdown
            }}
        >
            {children}
        </CountdownContext.Provider>
    )
}