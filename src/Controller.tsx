import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from 'react-router-dom';

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
    const [turnIndex, setTurnIndex] = useState(0);
    const [broadcastChannel] = useState(() => new BroadcastChannel(gameId));
    const navigate = useNavigate();

    const startGame = () => {
        const newCard = generateRandomCard();
        setCurrentCard(newCard);
        setTurnIndex(0);


        broadcastChannel.postMessage({ type: "CURRENT_CARD", currentCard: newCard });
        broadcastChannel.postMessage({ type: "TURN_UPDATE", currentPlayer: players[0] });
    };

    const openGame = () => {
        window.open(`/game/${gameId}`, "_blank");
    }

    const nextTurn = useCallback(() => {
        const nextIndex = (turnIndex + 1) % players.length;
        setTurnIndex(nextIndex);
        broadcastChannel.postMessage({ type: "TURN_UPDATE", currentPlayer: players[nextIndex] });
    }, [turnIndex, players, broadcastChannel]);

    useEffect(() => {
        const handlePlayerMove = (evt: MessageEvent) => {
            const { type, playerId, card } = evt.data;

            switch (type) {
                case "PLAYER_JOIN":
                    setPlayers((prevPlayers) => [...new Set([...prevPlayers, playerId])]);
                    break;

                case "PLAYER_MOVE":
                    if (players[turnIndex] === playerId) {
                        if (card.color === currentCard.color || card.number === currentCard.number) {
                            setCurrentCard(card);
                            broadcastChannel.postMessage({ type: "CURRENT_CARD", currentCard: card });
                            nextTurn();
                        } else {
                            broadcastChannel.postMessage({ type: "INVALID_MOVE", playerId });
                        }
                    } else {
                        broadcastChannel.postMessage({ type: "OUT_OF_TURN", playerId });
                    }
                    break;

                case "PLAYER_DRAW":
                    nextTurn();
                    break;

                case "PLAYER_UNO":
                    broadcastChannel.postMessage({ type: "PLAYER_MOVE", playerId });
                    break;

                case "PLAYER_WON":
                    broadcastChannel.postMessage({ type: "PLAYER_WON", playerId });
                    broadcastChannel.close();
                    navigate("/");
                    break;

                default:
                    console.warn(`Unhandled message type: ${type}`);
            }
        };

        broadcastChannel.onmessage = handlePlayerMove;

    }, [broadcastChannel, players, turnIndex, currentCard, nextTurn, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-500 to-yellow-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-blue-600 text-white p-4">
                    <h1 className="text-2xl font-bold text-center">Uno Game Controller</h1>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Game ID:</p>
                        <p className="font-mono text-sm break-all">{gameId}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Players:</span>
                        <span className="text-xl font-bold">{players}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Current Card:</span>
                        <span className={`text-xl font-bold px-3 py-1 bg-${currentCard.color}-500 text-white rounded`}>{currentCard.color} {currentCard.number}</span>
                    </div>
                    <button className="w-full py-2 text-xl font-semibold bg-gray-500 hover:bg-gray-600 text-white rounded-md transition duration-300" onClick={openGame   }>
                        Open Game
                    </button>
                    <button className="w-full py-2 text-xl font-semibold bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-300" onClick={startGame}>
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Controller;
