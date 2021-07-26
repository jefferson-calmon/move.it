import { createContext, useContext, useEffect, useState } from "react";
import Cookie from 'js-cookie';

import challenges from '../../challenges.json';
import { LevelUpModal } from "../components/LevelUpModal";

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengesContextProps {
    children: React.ReactNode;
    level: number;
    currentExperience: number;
    challengesCompleted: number;
}

interface ChallengesContextData {
    level: number;
    currentExperience: number;
    challengesCompleted: number;
    activeChallenge: Challenge;
    experienceToNextLevel: number;
    levelUp: () => void;
    closeLevelUpModal: () => void;
    startNewChallenge: () => void;
    completeChallenge: () => void;
    resetChallenge: () => void;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ children, ...rest }: ChallengesContextProps) {
    const [ level, setLevel ] = useState(rest.level ?? 1);
    const [ currentExperience, setCurrentExperience ] = useState(rest.currentExperience ?? 0);
    const [ challengesCompleted, setChallengesCompleted ] = useState(rest.challengesCompleted ?? 0);

    const [ activeChallenge, setActiveChallenge ] = useState(null);
    const [ isLevelUpModalOpen, setIsLevelUpModalOpen ] = useState(null);

    const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

    useEffect(() => {
        Notification.requestPermission();
    }, []);

    useEffect(() => {
        Cookie.set('level', String(level));
        Cookie.set('currentExperience', String(currentExperience));
        Cookie.set('challengesCompleted', String(challengesCompleted));
    }, [level, currentExperience, challengesCompleted]);

    function levelUp() {
        setLevel(level + 1);
        setIsLevelUpModalOpen(true)
    };

    function closeLevelUpModal() {
        setIsLevelUpModalOpen(false);
    }
    
    function startNewChallenge() {
        const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[randomChallengeIndex];

        setActiveChallenge(challenge);

        new Audio('/notification.mp3').play();

        if (Notification.permission === 'granted') {
            new Notification('Novo desafio ♞', {
                body: `Vamos lá, tá valendo ${challenge.amount}xp!`,
                icon: '/favicon.png',
            });
        }
    }

    function completeChallenge() {
        if (!activeChallenge) return;

        const { amount } = activeChallenge;
        let finalExperience = currentExperience + amount

        if (finalExperience >= experienceToNextLevel) {
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp()
        }

        setCurrentExperience(finalExperience);
        setChallengesCompleted(challengesCompleted + 1)
        resetChallenge()
    }

    function resetChallenge() {
        setActiveChallenge(null);
    }

    return (
        <ChallengesContext.Provider 
            value={{
                level, 
                currentExperience,
                challengesCompleted,
                activeChallenge,
                experienceToNextLevel,
                levelUp,
                closeLevelUpModal,
                startNewChallenge,
                completeChallenge,
                resetChallenge
            }}
        >
            {children}
            {  isLevelUpModalOpen && <LevelUpModal /> }
        </ChallengesContext.Provider>
    )
}