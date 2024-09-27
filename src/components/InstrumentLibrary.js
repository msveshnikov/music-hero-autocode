import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const InstrumentLibrary = () => {
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState(null);

    useEffect(() => {
        const initialInstruments = [
            { name: 'Piano', synth: new Tone.Synth().toDestination() },
            { name: 'Violin', synth: new Tone.FMSynth().toDestination() },
            { name: 'Guitar', synth: new Tone.PluckSynth().toDestination() },
            { name: 'Drums', synth: new Tone.MembraneSynth().toDestination() }
        ];
        setInstruments(initialInstruments);
        setSelectedInstrument(initialInstruments[0]);
    }, []);

    const handleInstrumentSelect = (instrument) => {
        setSelectedInstrument(instrument);
    };

    const playNote = (note) => {
        if (selectedInstrument) {
            selectedInstrument.synth.triggerAttackRelease(note, '8n');
        }
    };

    return (
        <div className="instrument-library">
            <h2>Virtual Instrument Library</h2>
            <div className="instrument-list">
                {instruments.map((instrument) => (
                    <button
                        key={instrument.name}
                        onClick={() => handleInstrumentSelect(instrument)}
                        className={selectedInstrument === instrument ? 'selected' : ''}
                    >
                        {instrument.name}
                    </button>
                ))}
            </div>
            {selectedInstrument && (
                <div className="instrument-preview">
                    <h3>{selectedInstrument.name}</h3>
                    <div className="piano-keys">
                        {['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((note) => (
                            <button key={note} onClick={() => playNote(note)}>
                                {note}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstrumentLibrary;
