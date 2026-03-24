import React, { useEffect, useRef, useState } from 'react';
import { Tile } from './Tile';

const InteractiveTileGrid = ({ rows, columns }) => {
    const [tiles, setTiles] = useState([]);
    const [sceneReady, setSceneReady] = useState(false);

    const initializeTiles = () => {
        const newTiles = [];
        for (let row = 0; row < rows; row++) {
            const tileRow = [];
            for (let col = 0; col < columns; col++) {
                tileRow.push(<Tile key={`${row}-${col}`} />);
            }
            newTiles.push(tileRow);
        }
        setTiles(newTiles);
    };

    useEffect(() => {
        initializeTiles();
        setSceneReady(false);
        // Other side effects here
        setSceneReady(true);
    }, [rows, columns]);

    return <div>{tiles.map((row, index) => <div key={index}>{row}</div>)}</div>;
};

export default InteractiveTileGrid;