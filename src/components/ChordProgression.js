import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const chords = {
    major: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    minor: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb']
};

const ChordProgression = () => {
    const [progression, setProgression] = useState([]);
    const [key, setKey] = useState('major');
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const synth = new Tone.PolySynth().toDestination();
        return () => {
            synth.dispose();
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
        const synth = new Tone.PolySynth().toDestination();
        const now = Tone.now();

        progression.forEach((chord, index) => {
            synth.triggerAttackRelease([`${chord}4`, `${chord}3`], '1n', now + index);
        });

        setPlaying(true);
        Tone.Transport.start();
    };

    return (
        <div>
            <h2>Chord Progression Generator</h2>
            <div>
                <label>
                    Key:
                    <select value={key} onChange={(e) => setKey(e.target.value)}>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                    </select>
                </label>
            </div>
            <button onClick={generateProgression}>Generate Progression</button>
            <button onClick={playProgression}>{playing ? 'Stop' : 'Play'}</button>
            <div>
                {progression.map((chord, index) => (
                    <span key={index}>{chord} </span>
                ))}
            </div>
        </div>
    );
};

export default ChordProgression;
