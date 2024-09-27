import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Vex } from 'vexflow';

const NotationEditor = () => {
    const [notes, setNotes] = useState([]);
    const [currentOctave, setCurrentOctave] = useState(4);
    const [currentDuration, setCurrentDuration] = useState('q');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [timeSignature, setTimeSignature] = useState('4/4');
    const [bpm, setBpm] = useState(120);
    const rendererRef = useRef(null);
    const contextRef = useRef(null);
    const staveRef = useRef(null);

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

        return () => {
            div.innerHTML = '';
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

    const addNote = (noteName) => {
        const newNote = { pitch: `${noteName}/${currentOctave}`, duration: currentDuration };
        setNotes([...notes, newNote]);
    };

    const playNotes = async () => {
        await Tone.start();
        const synth = new Tone.Synth().toDestination();
        const now = Tone.now();
        notes.forEach((note, index) => {
            synth.triggerAttackRelease(
                note.pitch,
                Tone.Time(note.duration).toSeconds(),
                now + index * 0.5
            );
        });
    };

    const clearNotes = () => {
        setNotes([]);
    };

    const handleOctaveChange = (event) => {
        setCurrentOctave(parseInt(event.target.value));
    };

    const handleDurationChange = (event) => {
        setCurrentDuration(event.target.value);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const exportAudio = async () => {
        const recorder = new Tone.Recorder();
        const synth = new Tone.Synth().connect(recorder);

        await recorder.start();

        const now = Tone.now();
        notes.forEach((note, index) => {
            synth.triggerAttackRelease(
                note.pitch,
                Tone.Time(note.duration).toSeconds(),
                now + index * 0.5
            );
        });

        await Tone.getTransport().sleep(notes.length * 0.5 + 1);

        const recording = await recorder.stop();
        const url = URL.createObjectURL(recording);
        const anchor = document.createElement('a');
        anchor.download = 'composition.webm';
        anchor.href = url;
        anchor.click();
    };

    const handleTimeSignatureChange = (event) => {
        setTimeSignature(event.target.value);
    };

    const handleBpmChange = (event) => {
        setBpm(parseInt(event.target.value));
        Tone.Transport.bpm.value = parseInt(event.target.value);
    };

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
                <button onClick={playNotes}>Play Notes</button>
                <button onClick={clearNotes}>Clear Notes</button>
                <button onClick={exportAudio}>Export Audio</button>
                <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
            </div>
        </div>
    );
};

export default NotationEditor;
