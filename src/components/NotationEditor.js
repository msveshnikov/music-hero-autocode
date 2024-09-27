import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Vex } from 'vexflow';

const NotationEditor = () => {
  const [notes, setNotes] = useState([]);
  const rendererRef = useRef(null);
  const contextRef = useRef(null);
  const staveRef = useRef(null);

  useEffect(() => {
    const div = document.getElementById('notation');
    const renderer = new Vex.Flow.Renderer(div, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(500, 200);
    const context = renderer.getContext();
    const stave = new Vex.Flow.Stave(10, 40, 480);
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
          (note) => new Vex.Flow.StaveNote({ keys: [note], duration: 'q' })
        );
        Vex.Flow.Formatter.FormatAndDraw(contextRef.current, staveRef.current, vexNotes);
      }
    }
  }, [notes]);

  const addNote = (noteName) => {
    setNotes([...notes, noteName]);
  };

  const playNotes = async () => {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    const now = Tone.now();
    notes.forEach((note, index) => {
      synth.triggerAttackRelease(note, '4n', now + index * 0.5);
    });
  };

  return (
    <div>
      <h2>Notation Editor</h2>
      <div id="notation"></div>
      <div>
        <button onClick={() => addNote('C/4')}>Add C</button>
        <button onClick={() => addNote('D/4')}>Add D</button>
        <button onClick={() => addNote('E/4')}>Add E</button>
        <button onClick={() => addNote('F/4')}>Add F</button>
        <button onClick={() => addNote('G/4')}>Add G</button>
        <button onClick={() => addNote('A/4')}>Add A</button>
        <button onClick={() => addNote('B/4')}>Add B</button>
      </div>
      <button onClick={playNotes}>Play Notes</button>
    </div>
  );
};

export default NotationEditor;