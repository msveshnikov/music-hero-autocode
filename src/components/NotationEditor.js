import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Vex } from 'vexflow';

const NotationEditor = () => {
  const [notes, setNotes] = useState([]);
  const [currentOctave, setCurrentOctave] = useState(4);
  const [currentDuration, setCurrentDuration] = useState('q');
  const rendererRef = useRef(null);
  const contextRef = useRef(null);
  const staveRef = useRef(null);

  useEffect(() => {
    const div = document.getElementById('notation');
    const renderer = new Vex.Flow.Renderer(div, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(800, 200);
    const context = renderer.getContext();
    const stave = new Vex.Flow.Stave(10, 40, 780);
    stave.addClef('treble').addTimeSignature('4/4');
    stave.setContext(context).draw();

    rendererRef.current = renderer;
    contextRef.current = context;
    staveRef.current = stave;

    return () => {
      div.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    if (contextRef.current && staveRef.current) {
      contextRef.current.clear();
      staveRef.current.setContext(contextRef.current).draw();

      if (notes.length > 0) {
        const vexNotes = notes.map(
          (note) => new Vex.Flow.StaveNote({ keys: [note.pitch], duration: note.duration })
        );
        Vex.Flow.Formatter.FormatAndDraw(contextRef.current, staveRef.current, vexNotes);
      }
    }
  }, [notes]);

  const addNote = (noteName) => {
    const newNote = { pitch: `${noteName}/${currentOctave}`, duration: currentDuration };
    setNotes([...notes, newNote]);
  };

  const playNotes = async () => {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    const now = Tone.now();
    notes.forEach((note, index) => {
      synth.triggerAttackRelease(note.pitch, note.duration, now + index * 0.5);
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

  return (
    <div>
      <h2>Notation Editor</h2>
      <div id="notation"></div>
      <div>
        <button onClick={() => addNote('C')}>C</button>
        <button onClick={() => addNote('D')}>D</button>
        <button onClick={() => addNote('E')}>E</button>
        <button onClick={() => addNote('F')}>F</button>
        <button onClick={() => addNote('G')}>G</button>
        <button onClick={() => addNote('A')}>A</button>
        <button onClick={() => addNote('B')}>B</button>
      </div>
      <div>
        <label>
          Octave:
          <select value={currentOctave} onChange={handleOctaveChange}>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
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
      </div>
      <button onClick={playNotes}>Play Notes</button>
      <button onClick={clearNotes}>Clear Notes</button>
    </div>
  );
};

export default NotationEditor;