import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

const Controller: React.FC = () => {
    const [gameId] = useState(uuid());
    const [players, setPlayers] = useState<string[]>([]);

    useEffect(() => {
        const channel = new BroadcastChannel(gameId);

        channel.onmessage = (evt: MessageEvent) => {
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

        return () => {
            channel.close();
        };
    }, [gameId]);

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
        </div>
    );
};

export default Controller;
