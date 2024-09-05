import React, { useEffect, useState } from "react";
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

const Controller: React.FC = () => {
    const [gameId] = useState(uuid());
    const [players, setPlayers] = useState<string[]>([]);
    const [currentCard, setCurrentCard] = useState<UnoCard>(generateRandomCard());
    const [broadcastChannel, setBroadcastChannel] = useState(() => new BroadcastChannel(gameId));

    const startGame = () => {
        const newCard = generateRandomCard();
        setCurrentCard(newCard);

        broadcastChannel.postMessage({ type: "CURRENT_CARD", currentCard: newCard });
    }

    useEffect(() => {
        broadcastChannel.onmessage = (evt: MessageEvent) => {
            if (evt.data.type === "PLAYER_JOIN") {
                const playerId = evt.data.playerId;

                setPlayers((prevPlayers) => {
                    // Prevent duplicate players
                    if (!prevPlayers.includes(playerId)) {
                        return [...prevPlayers, playerId];
                    }
                    return prevPlayers;
                });
            }
        };

        // return () => {
        //     broadcastChannel.close();
        // };
    }, [broadcastChannel, gameId]);

    return (
        <div>
            <h1>Controller</h1>
            <p>Game ID: {gameId}</p>
            <div>
                <p>Players:</p>
                {players.map((playerId, index) => (
                    <p key={index}>{playerId}</p>
                ))}
            </div>
            <p>Current Card: {currentCard.color} {currentCard.number}</p>

            <button onClick={startGame}>Start Game</button>
        </div>
    );
};

export default Controller;
