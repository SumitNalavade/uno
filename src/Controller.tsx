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
