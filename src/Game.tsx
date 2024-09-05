import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

interface UnoCard {
    number: number;
    color: string;
}

const colors = ["red", "blue", "green", "yellow"];
const numbers = Array.from({ length: 10 }, (_, index) => index); // 0 through 9

const generateRandomCard = (): UnoCard => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    return { number: randomNumber, color: randomColor };
};

const generateRandomCards = (count: number): UnoCard[] => {
    return Array.from({ length: count }, generateRandomCard);
};


const Game: React.FC = () => {
    const { gameId } = useParams();
    const [playerId, setPlayerId] = useState(uuid());
    const [broadcastChannel, setBroadcastChannel] = useState(new BroadcastChannel(gameId!));
    
    const [cards, setCards] = useState<UnoCard[]>([]);

    useEffect(() => {
        if (!gameId) return;

        broadcastChannel.postMessage({ type: "PLAYER_JOIN", playerId });

        setCards(generateRandomCards(7));
    }, [])
    
    console.log(cards);

    return (
        <h1>Hello Game!</h1>
    )
}

export default Game;