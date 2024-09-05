import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {    
    const navigate = useNavigate();
    
    const [gameIdInput, setgameIdInput] = useState("");
    
    const handleCreateNewGame = () => {
        navigate("/controller");
    }

    const handleJoinExistingGame = () => {
        navigate(`/game/${gameIdInput}`);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
        <h1 className="text-7xl font-bold mb-12">Uno Game</h1>
        <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-6">
                <input
                    type="text"
                    placeholder="Enter Game ID"
                    value={gameIdInput}
                    onChange={(evt) => setgameIdInput(evt.target.value)}
                    className="px-6 py-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                    className="px-8 py-4 text-2xl font-semibold text-white bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition"
                    onClick={handleJoinExistingGame}
                >
                    Join Existing Game
                </button>

                <button className="text-blue-500 font-semibold" onClick={handleCreateNewGame}>Create a New Game</button>
            </div>
        </div>
    </div>
    )
}

export default Home;