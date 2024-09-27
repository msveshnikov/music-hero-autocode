import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const chords = {
    major: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    minor: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'],
};

const ChordProgression = () => {
    const [progression, setProgression] = useState([]);
    const [key, setKey] = useState('major');
    const [playing, setPlaying] = useState(false);
    const [synth, setSynth] = useState(null);

    useEffect(() => {
        const newSynth = new Tone.PolySynth().toDestination();
        setSynth(newSynth);
        return () => {
            newSynth.dispose();
        };
    }, []);

    const generateProgression = () => {
        const newProgression = [];
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * chords[key].length);
            newProgression.push(chords[key][randomIndex]);
        }
        setProgression(newProgression);
    };

    const playProgression = async () => {
        if (playing) {
            Tone.Transport.stop();
            setPlaying(false);
            return;
        }

        await Tone.start();
        const now = Tone.now();

        progression.forEach((chord, index) => {
            synth.triggerAttackRelease([`${chord}4`, `${chord}3`], '1n', now + index);
        });

        setPlaying(true);
        Tone.Transport.start();

        setTimeout(() => {
            setPlaying(false);
            Tone.Transport.stop();
        }, progression.length * Tone.Time('1n').toSeconds() * 1000);
    };

    return (
        <div className="chord-progression">
            <h2>Chord Progression Generator</h2>
            <div>
                <label htmlFor="key-select">Key: </label>
                <select id="key-select" value={key} onChange={(e) => setKey(e.target.value)}>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                </select>
            </div>
            <button onClick={generateProgression}>Generate Progression</button>
            <button onClick={playProgression} disabled={progression.length === 0}>
                {playing ? 'Stop' : 'Play'}
            </button>
            <div className="progression-display">
                {progression.map((chord, index) => (
                    <span key={index} className="chord">
                        {chord}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ChordProgression;