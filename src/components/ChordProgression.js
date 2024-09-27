import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Midi, Chord } from '@tonejs/midi';

const chords = {
    major: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    minor: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'],
    jazz: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'],
    blues: ['C7', 'F7', 'G7', 'Cm7', 'F7', 'Bb7']
};

const ChordProgression = () => {
    const [progression, setProgression] = useState([]);
    const [key, setKey] = useState('major');
    const [playing, setPlaying] = useState(false);
    const [synth, setSynth] = useState(null);
    const [tempo, setTempo] = useState(120);
    const [progressionLength, setProgressionLength] = useState(4);
    const [complexity, setComplexity] = useState(1);

    useEffect(() => {
        const newSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();
        setSynth(newSynth);
        return () => {
            newSynth.dispose();
        };
    }, []);

    const generateProgression = useCallback(() => {
        const newProgression = [];
        const availableChords = [...chords[key]];
        for (let i = 0; i < progressionLength; i++) {
            const randomIndex = Math.floor(Math.random() * availableChords.length);
            newProgression.push(availableChords[randomIndex]);
            if (complexity > 1) {
                availableChords.splice(randomIndex, 1);
                if (availableChords.length === 0) {
                    availableChords.push(...chords[key]);
                }
            }
        }
        setProgression(newProgression);
    }, [key, progressionLength, complexity]);

    const playProgression = useCallback(async () => {
        if (playing) {
            Tone.Transport.stop();
            setPlaying(false);
            return;
        }

        await Tone.start();
        Tone.Transport.bpm.value = tempo;

        const chordDuration = '2n';
        const sequence = new Tone.Sequence(
            (time, chord) => {
                synth.triggerAttackRelease([`${chord}4`, `${chord}3`], chordDuration, time);
            },
            progression,
            chordDuration
        );

        sequence.start(0);
        Tone.Transport.start();
        setPlaying(true);

        Tone.Transport.scheduleOnce(() => {
            setPlaying(false);
            Tone.Transport.stop();
            sequence.stop();
        }, `${progression.length}m`);
    }, [playing, tempo, progression, synth]);

    const exportMIDI = useCallback(() => {
        const midi = new Midi();
        const track = midi.addTrack();

        progression.forEach((chord, index) => {
            const time = index * 2;
            const notes = Chord.get(chord).notes.map((note) => note + '4');
            notes.forEach((note) => {
                track.addNote({
                    midi: Midi.fromNote(note),
                    time: time,
                    duration: 2
                });
            });
        });

        const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chord-progression.mid';
        a.click();
        URL.revokeObjectURL(url);
    }, [progression]);

  
    return (
        <div className={`chord-progression`}>
            <h2>Chord Progression Generator</h2>
            <div>
                <label htmlFor="key-select">Key: </label>
                <select id="key-select" value={key} onChange={(e) => setKey(e.target.value)}>
                    {Object.keys(chords).map((chordKey) => (
                        <option key={chordKey} value={chordKey}>
                            {chordKey.charAt(0).toUpperCase() + chordKey.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="tempo-input">Tempo: </label>
                <input
                    id="tempo-input"
                    type="number"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    min="40"
                    max="240"
                />
            </div>
            <div>
                <label htmlFor="length-input">Progression Length: </label>
                <input
                    id="length-input"
                    type="number"
                    value={progressionLength}
                    onChange={(e) => setProgressionLength(Number(e.target.value))}
                    min="2"
                    max="8"
                />
            </div>
            <div>
                <label htmlFor="complexity-input">Complexity: </label>
                <input
                    id="complexity-input"
                    type="range"
                    min="1"
                    max="3"
                    value={complexity}
                    onChange={(e) => setComplexity(Number(e.target.value))}
                />
            </div>
            <button onClick={generateProgression}>Generate Progression</button>
            <button onClick={playProgression} disabled={progression.length === 0}>
                {playing ? 'Stop' : 'Play'}
            </button>
            <button onClick={exportMIDI} disabled={progression.length === 0}>
                Export MIDI
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
