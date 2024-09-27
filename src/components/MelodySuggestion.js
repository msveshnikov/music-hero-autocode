import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const MelodySuggestion = () => {
    const [scale, setScale] = useState('C major');
    const [melody, setMelody] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(120);
    const [noteLength, setNoteLength] = useState('8n');
    const [complexity, setComplexity] = useState(1);
    const [synth, setSynth] = useState(null);

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
        const newSynth = new Tone.Synth().toDestination();
        setSynth(newSynth);
        return () => {
            newSynth.dispose();
        };
    }, []);

    const generateMelody = () => {
        const currentScale = scales[scale];
        const newMelody = [];
        const melodyLength = 8 + complexity * 2;

        for (let i = 0; i < melodyLength; i++) {
            const randomIndex = Math.floor(Math.random() * currentScale.length);
            newMelody.push(currentScale[randomIndex]);
        }

        if (complexity > 1) {
            for (let i = 0; i < complexity - 1; i++) {
                const insertIndex = Math.floor(Math.random() * newMelody.length);
                const randomNote = currentScale[Math.floor(Math.random() * currentScale.length)];
                newMelody.splice(insertIndex, 0, randomNote);
            }
        }

        setMelody(newMelody);
    };

    const playMelody = async () => {
        await Tone.start();
        setIsPlaying(true);
        const now = Tone.now();
        const duration = Tone.Time(noteLength).toSeconds();
        const interval = (60 / tempo) * 4 * duration;

        melody.forEach((note, index) => {
            synth.triggerAttackRelease(note, noteLength, now + index * interval);
        });

        setTimeout(() => setIsPlaying(false), melody.length * interval * 1000);
    };

    const exportMelody = () => {
        const midiNotes = melody.map((note) => {
            const [noteName, octave] = note.split(/(\d+)/);
            const noteIndex = [
                'C',
                'C#',
                'D',
                'D#',
                'E',
                'F',
                'F#',
                'G',
                'G#',
                'A',
                'A#',
                'B'
            ].indexOf(noteName);
            return noteIndex + (parseInt(octave) + 1) * 12;
        });

        const midiData = [
            0x4d,
            0x54,
            0x68,
            0x64,
            0x00,
            0x00,
            0x00,
            0x06,
            0x00,
            0x00,
            0x00,
            0x01,
            0x00,
            0x60,
            0x4d,
            0x54,
            0x72,
            0x6b,
            0x00,
            0x00,
            0x00,
            0x3b,
            0x00,
            0xff,
            0x58,
            0x04,
            0x04,
            0x02,
            0x18,
            0x08,
            0x00,
            0xff,
            0x51,
            0x03,
            0x07,
            0xa1,
            0x20,
            0x00,
            0xc0,
            0x00,
            ...midiNotes.flatMap((note, index) => [
                0x00,
                0x90,
                note,
                0x64,
                0x83,
                0x60,
                0x80,
                note,
                0x00
            ]),
            0x00,
            0xff,
            0x2f,
            0x00
        ];

        const blob = new Blob([new Uint8Array(midiData)], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'melody.mid';
        a.click();
        URL.revokeObjectURL(url);
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
                <label htmlFor="complexity-input">Complexity: </label>
                <input
                    id="complexity-input"
                    type="range"
                    min="1"
                    max="5"
                    value={complexity}
                    onChange={(e) => setComplexity(parseInt(e.target.value))}
                />
            </div>
            <div className="actions">
                <button onClick={generateMelody}>Generate Melody</button>
                <button onClick={playMelody} disabled={isPlaying || melody.length === 0}>
                    {isPlaying ? 'Playing...' : 'Play Melody'}
                </button>
                <button onClick={exportMelody} disabled={melody.length === 0}>
                    Export MIDI
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
