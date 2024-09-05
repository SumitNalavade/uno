import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";



const Game: React.FC = () => {
    const { gameId } = useParams();
    const [playerId, setPlayerId] = useState(uuid());
    const [broadcastChannel, setBroadcastChannel] = useState(new BroadcastChannel(gameId!));
    

    useEffect(() => {
        if (!gameId) return;

        broadcastChannel.postMessage({ type: "PLAYER_JOIN", playerId });

    }, [])
    

    return (
        <h1>Hello Game!</h1>
    )
}

export default Game;