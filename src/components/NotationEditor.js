import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Vex } from 'vexflow';
import { Midi } from '@tonejs/midi';

const NotationEditor = () => {
    const [notes, setNotes] = useState([]);
    const [currentOctave, setCurrentOctave] = useState(4);
    const [currentDuration, setCurrentDuration] = useState('q');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [timeSignature, setTimeSignature] = useState('4/4');
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const rendererRef = useRef(null);
    const contextRef = useRef(null);
    const staveRef = useRef(null);
    const synthRef = useRef(null);

    useEffect(() => {
        const div = document.getElementById('notation');
        const renderer = new Vex.Flow.Renderer(div, Vex.Flow.Renderer.Backends.SVG);
        renderer.resize(800, 200);
        const context = renderer.getContext();
        const stave = new Vex.Flow.Stave(10, 40, 780);
        stave.addClef('treble').addTimeSignature(timeSignature);
        stave.setContext(context).draw();

        rendererRef.current = renderer;
        contextRef.current = context;
        staveRef.current = stave;

        synthRef.current = new Tone.Synth().toDestination();

        return () => {
            div.innerHTML = '';
            synthRef.current.dispose();
        };
    }, [timeSignature]);

    useEffect(() => {
        if (contextRef.current && staveRef.current) {
            contextRef.current.clear();
            staveRef.current.setContext(contextRef.current).draw();

            if (notes.length > 0) {
                const vexNotes = notes.map(
                    (note) =>
                        new Vex.Flow.StaveNote({ keys: [note.pitch], duration: note.duration })
                );
                Vex.Flow.Formatter.FormatAndDraw(contextRef.current, staveRef.current, vexNotes);
            }
        }
    }, [notes]);

    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
    }, [isDarkMode]);

    const addNote = useCallback(
        (noteName) => {
            const newNote = { pitch: `${noteName}/${currentOctave}`, duration: currentDuration };
            setNotes((prevNotes) => [...prevNotes, newNote]);
        },
        [currentOctave, currentDuration]
    );

    const playNotes = useCallback(async () => {
        if (isPlaying) {
            Tone.Transport.stop();
            setIsPlaying(false);
            return;
        }

        await Tone.start();
        Tone.Transport.bpm.value = bpm;

        const sequence = new Tone.Sequence(
            (time, note) => {
                synthRef.current.triggerAttackRelease(
                    note.pitch,
                    Tone.Time(note.duration).toSeconds(),
                    time
                );
            },
            notes,
            '4n'
        );

        sequence.start(0);
        Tone.Transport.start();
        setIsPlaying(true);

        Tone.Transport.scheduleOnce(() => {
            setIsPlaying(false);
            Tone.Transport.stop();
            sequence.stop();
        }, `${notes.length}m`);
    }, [notes, bpm, isPlaying]);

    const clearNotes = useCallback(() => {
        setNotes([]);
    }, []);

    const handleOctaveChange = useCallback((event) => {
        setCurrentOctave(parseInt(event.target.value));
    }, []);

    const handleDurationChange = useCallback((event) => {
        setCurrentDuration(event.target.value);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode((prevMode) => !prevMode);
    }, []);

    const exportMIDI = useCallback(() => {
        const midi = new Midi();
        const track = midi.addTrack();

        notes.forEach((note, index) => {
            const time = index * Tone.Time(note.duration).toSeconds();
            track.addNote({
                midi: Tone.Frequency(note.pitch).toMidi(),
                time: time,
                duration: Tone.Time(note.duration).toSeconds()
            });
        });

        const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notation.mid';
        a.click();
        URL.revokeObjectURL(url);
    }, [notes]);

    const handleTimeSignatureChange = useCallback((event) => {
        setTimeSignature(event.target.value);
    }, []);

    const handleBpmChange = useCallback((event) => {
        setBpm(parseInt(event.target.value));
        Tone.Transport.bpm.value = parseInt(event.target.value);
    }, []);

    return (
        <div className={`notation-editor ${isDarkMode ? 'dark-mode' : ''}`}>
            <h2>Notation Editor</h2>
            <div id="notation"></div>
            <div className="note-buttons">
                {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
                    <button key={note} onClick={() => addNote(note)}>
                        {note}
                    </button>
                ))}
            </div>
            <div className="controls">
                <label>
                    Octave:
                    <select value={currentOctave} onChange={handleOctaveChange}>
                        {[3, 4, 5].map((octave) => (
                            <option key={octave} value={octave}>
                                {octave}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Duration:
                    <select value={currentDuration} onChange={handleDurationChange}>
                        <option value="w">Whole</option>
                        <option value="h">Half</option>
                        <option value="q">Quarter</option>
                        <option value="8">Eighth</option>
                        <option value="16">Sixteenth</option>
                    </select>
                </label>
                <label>
                    Time Signature:
                    <select value={timeSignature} onChange={handleTimeSignatureChange}>
                        <option value="4/4">4/4</option>
                        <option value="3/4">3/4</option>
                        <option value="6/8">6/8</option>
                    </select>
                </label>
                <label>
                    BPM:
                    <input
                        type="number"
                        value={bpm}
                        onChange={handleBpmChange}
                        min="40"
                        max="240"
                    />
                </label>
            </div>
            <div className="action-buttons">
                <button onClick={playNotes}>{isPlaying ? 'Stop' : 'Play Notes'}</button>
                <button onClick={clearNotes}>Clear Notes</button>
                <button onClick={exportMIDI}>Export MIDI</button>
                <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
            </div>
        </div>
    );
};

export default NotationEditor;
