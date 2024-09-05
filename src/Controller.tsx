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
    const [turnIndex, setTurnIndex] = useState(0); // Index to track whose turn it is
    const [broadcastChannel, setBroadcastChannel] = useState(() => new BroadcastChannel(gameId));

    const navigate = useNavigate();

    const startGame = () => {
        const newCard = generateRandomCard();
        setCurrentCard(newCard);

        setTurnIndex(0);

        broadcastChannel.postMessage({ type: "CURRENT_CARD", currentCard: newCard });
        broadcastChannel.postMessage({ type: "TURN_UPDATE", currentPlayer: players[turnIndex] });
    }

    const nextTurn = useCallback(() => {
        const nextIndex = (turnIndex + 1) % players.length;
        setTurnIndex(nextIndex);
        broadcastChannel.postMessage({ type: "TURN_UPDATE", currentPlayer: players[nextIndex] });
    }, [turnIndex, players, broadcastChannel]);

    useEffect(() => {
        const handlePlayerMove = (evt: MessageEvent) => {
            if (evt.data.type === "PLAYER_JOIN") {
                const playerId = evt.data.playerId;

                setPlayers((prevPlayers) => {
                    if (!prevPlayers.includes(playerId)) {
                        return [...prevPlayers, playerId];
                    }
                    return prevPlayers;
                });
            }

            if (evt.data.type === "PLAYER_MOVE") {
                const { playerId, card } = evt.data;

                // Check if it is the player's turn
                if (players[turnIndex] === playerId) {
                    // Validate card against current card (simplified for this example)
                    if (card.color === currentCard.color || card.number === currentCard.number) {
                        setCurrentCard(card);
                        broadcastChannel.postMessage({ type: "CURRENT_CARD", currentCard: card });
                        nextTurn(); // Move to the next player's turn
                    } else {
                        // Invalid move message
                        broadcastChannel.postMessage({ type: "INVALID_MOVE", playerId });
                    }
                } else {
                    // Player made a move out of turn message
                    broadcastChannel.postMessage({ type: "OUT_OF_TURN", playerId });
                }
            }

            if(evt.data.type === "PLAYER_DRAW") {
                nextTurn(); // Move to the next player's turn
            }

            if(evt.data.type === "PLAYER_UNO") {
                const playerId = evt.data.playerId

                broadcastChannel.postMessage({ type: "PLAYER_MOVE", playerId });
            }

            if(evt.data.type === "PLAYER_WON") {
                const playerId = evt.data.playerId

                broadcastChannel.postMessage({ type: "PLAYER_WON", playerId });

                broadcastChannel.close();
                navigate("/");
            }
        };

        broadcastChannel.onmessage = handlePlayerMove;

    }, [broadcastChannel, gameId, players, turnIndex, currentCard, nextTurn, navigate]);

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
