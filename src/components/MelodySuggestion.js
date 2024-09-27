import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const MelodySuggestion = () => {
    const [scale, setScale] = useState('C major');
    const [melody, setMelody] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(120);
    const [noteLength, setNoteLength] = useState('8n');

    const scales = {
        'C major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        'A minor': ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
        'G major': ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'],
        'E minor': ['E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'],
        'F major': ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'],
        'D minor': ['D3', 'E3', 'F3', 'G3', 'A3', 'Bb3', 'C4', 'D4']
    };

    const noteLengths = ['16n', '8n', '4n', '2n', '1n'];

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
        const duration = Tone.Time(noteLength).toSeconds();
        const interval = (60 / tempo) * 4 * duration;

        melody.forEach((note, index) => {
            synth.triggerAttackRelease(note, noteLength, now + index * interval);
        });

        setTimeout(() => setIsPlaying(false), melody.length * interval * 1000);
    };

    return (
        <div className="melody-suggestion">
            <h2>Melody Suggestion Tool</h2>
            <div className="controls">
                <label htmlFor="scale-select">Choose a scale: </label>
                <select id="scale-select" value={scale} onChange={(e) => setScale(e.target.value)}>
                    {Object.keys(scales).map((scaleName) => (
                        <option key={scaleName} value={scaleName}>
                            {scaleName}
                        </option>
                    ))}
                </select>
                <label htmlFor="tempo-input">Tempo (BPM): </label>
                <input
                    id="tempo-input"
                    type="number"
                    value={tempo}
                    onChange={(e) => setTempo(parseInt(e.target.value))}
                    min="40"
                    max="240"
                />
                <label htmlFor="note-length-select">Note Length: </label>
                <select
                    id="note-length-select"
                    value={noteLength}
                    onChange={(e) => setNoteLength(e.target.value)}
                >
                    {noteLengths.map((length) => (
                        <option key={length} value={length}>
                            {length}
                        </option>
                    ))}
                </select>
            </div>
            <div className="actions">
                <button onClick={generateMelody}>Generate Melody</button>
                <button onClick={playMelody} disabled={isPlaying || melody.length === 0}>
                    {isPlaying ? 'Playing...' : 'Play Melody'}
                </button>
            </div>
            <div className="melody-display">
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