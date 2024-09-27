import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const MelodySuggestion = () => {
    const [scale, setScale] = useState('C major');
    const [melody, setMelody] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);

    const scales = {
        'C major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        'A minor': ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
        'G major': ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4']
    };

    useEffect(() => {
        const synth = new Tone.Synth().toDestination();
        return () => {
            synth.dispose();
        };
    }, []);

    const generateMelody = () => {
        const currentScale = scales[scale];
        const newMelody = [];
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * currentScale.length);
            newMelody.push(currentScale[randomIndex]);
        }
        setMelody(newMelody);
    };

    const playMelody = async () => {
        await Tone.start();
        const synth = new Tone.Synth().toDestination();
        setIsPlaying(true);
        const now = Tone.now();
        melody.forEach((note, index) => {
            synth.triggerAttackRelease(note, '8n', now + index * 0.5);
        });
        setTimeout(() => setIsPlaying(false), melody.length * 500);
    };

    return (
        <div>
            <h2>Melody Suggestion Tool</h2>
            <div>
                <label htmlFor="scale-select">Choose a scale: </label>
                <select id="scale-select" value={scale} onChange={(e) => setScale(e.target.value)}>
                    {Object.keys(scales).map((scaleName) => (
                        <option key={scaleName} value={scaleName}>
                            {scaleName}
                        </option>
                    ))}
                </select>
            </div>
            <button onClick={generateMelody}>Generate Melody</button>
            <button onClick={playMelody} disabled={isPlaying || melody.length === 0}>
                {isPlaying ? 'Playing...' : 'Play Melody'}
            </button>
            <div>
                <h3>Generated Melody:</h3>
                <ul>
                    {melody.map((note, index) => (
                        <li key={index}>{note}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MelodySuggestion;
