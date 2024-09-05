import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

interface UnoCard {
    number: number;
    color: string;
}

const colors = ["red", "blue", "green", "yellow"];
const numbers = Array.from({ length: 10 }, (_, index) => index); // 0 through 9

const generateRandomCard = (): UnoCard => ({
    number: numbers[Math.floor(Math.random() * numbers.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
});

const generateRandomCards = (count: number): UnoCard[] => 
    Array.from({ length: count }, generateRandomCard);

const Game: React.FC = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const [playerId] = useState(uuid());
    const [broadcastChannel] = useState(() => new BroadcastChannel(gameId!));
    const [cards, setCards] = useState<UnoCard[]>([]);
    const [currentCard, setCurrentCard] = useState<UnoCard | null>(null);

    useEffect(() => {
        if (!gameId) return;

        broadcastChannel.postMessage({ type: "PLAYER_JOIN", playerId });
        setCards(generateRandomCards(7));

        const handleMessage = (evt: MessageEvent) => {
            switch (evt.data.type) {
                case "CURRENT_CARD":
                    setCurrentCard(evt.data.currentCard);
                    break;
                case "TURN_UPDATE":
                    if (evt.data.currentPlayer === playerId) {
                        alert("Your Turn");
                    }
                    break;
                case "PLAYER_UNO":
                    if (evt.data.playerId !== playerId) {
                        alert(`Player ${evt.data.playerId} has UNO!`);
                    }
                    break;
                case "PLAYER_WON":
                    if (evt.data.playerId !== playerId) {
                        alert(`Player ${evt.data.playerId} has won!`);
                        navigate("/");
                    }
                    break;
                default:
                    console.warn(`Unhandled message type: ${evt.data.type}`);
            }
        };

        broadcastChannel.onmessage = handleMessage;

    }, [broadcastChannel, gameId, playerId, navigate]);

    const makeMove = (card: UnoCard) => {
        broadcastChannel.postMessage({ type: "PLAYER_MOVE", playerId, card });

        const updatedDeck = cards.filter(elm => elm !== card);
        setCards(updatedDeck);

        if (updatedDeck.length === 1) {
            broadcastChannel.postMessage({ type: "PLAYER_UNO", playerId });
        }

        if (updatedDeck.length === 0) {
            broadcastChannel.postMessage({ type: "PLAYER_WON", playerId });
            alert("You win!!");
            navigate('/');
        }
    };

    const drawCard = () => {
        const newCard = generateRandomCard();
        setCards(prevCards => [...prevCards, newCard]);
        broadcastChannel.postMessage({ type: "PLAYER_DRAW" });
    };

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
            <div className="grid grid-cols-3 gap-4 mb-4">
                {cards.map((card, index) => (
                    <button
                        key={index}
                        onClick={() => makeMove(card)}
                        className={`w-24 h-36 rounded-lg flex items-center justify-center text-white font-bold text-2xl`}
                        style={{ backgroundColor: card.color }}
                    >
                        {card.number}
                    </button>
                ))}
            </div>
            <button
                onClick={drawCard}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold"
            >
                Draw Card
            </button>
        </div>
    );
};

export default Game;
