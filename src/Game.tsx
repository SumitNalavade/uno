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
    const [currentCard, setCurrentCard] = useState<UnoCard | null>(null);

    useEffect(() => {
        if (!gameId) return;

        broadcastChannel.postMessage({ type: "PLAYER_JOIN", playerId });

        setCards(generateRandomCards(7));

        broadcastChannel.onmessage = (evt: MessageEvent) => {
            if (evt.data.type === "CURRENT_CARD") {
                setCurrentCard(evt.data.currentCard);
            }
        };
    }, [gameId, playerId, broadcastChannel])

    console.log(currentCard);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold mb-8">Your Uno Cards</h1>
            {currentCard && (
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold">Current Card</h2>
                    <div
                        className={`w-24 h-36 rounded-lg flex items-center justify-center text-white font-bold text-2xl`}
                        style={{ backgroundColor: currentCard.color }}
                    >
                        {currentCard.number}
                    </div>
                </div>
            )}
            <div className="grid grid-cols-3 gap-4">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`w-24 h-36 rounded-lg flex items-center justify-center text-white font-bold text-2xl`}
                        style={{ backgroundColor: card.color }}
                    >
                        {card.number}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Game;