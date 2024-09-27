import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const InstrumentLibrary = () => {
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const initialInstruments = [
            { name: 'Piano', synth: new Tone.Synth().toDestination() },
            { name: 'Violin', synth: new Tone.FMSynth().toDestination() },
            { name: 'Guitar', synth: new Tone.PluckSynth().toDestination() },
            { name: 'Drums', synth: new Tone.MembraneSynth().toDestination() },
            { name: 'Bass', synth: new Tone.MonoSynth().toDestination() },
            { name: 'Flute', synth: new Tone.AMSynth().toDestination() }
        ];
        setInstruments(initialInstruments);
        setSelectedInstrument(initialInstruments[0]);
    }, []);

    const handleInstrumentSelect = (instrument) => {
        setSelectedInstrument(instrument);
    };

    const playNote = async (note) => {
        if (selectedInstrument) {
            await Tone.start();
            selectedInstrument.synth.triggerAttackRelease(note, '8n');
        }
    };

    const playChord = async (chord) => {
        if (selectedInstrument) {
            await Tone.start();
            selectedInstrument.synth.triggerAttackRelease(chord, '4n');
        }
    };

    const toggleArpeggio = async () => {
        if (isPlaying) {
            Tone.Transport.stop();
            setIsPlaying(false);
        } else {
            await Tone.start();
            const arpeggio = ['C4', 'E4', 'G4', 'B4'];
            const sequence = new Tone.Sequence(
                (time, note) => {
                    selectedInstrument.synth.triggerAttackRelease(note, '8n', time);
                },
                arpeggio,
                '8n'
            );
            sequence.start(0);
            Tone.Transport.start();
            setIsPlaying(true);
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
                    <div className="chord-buttons">
                        <button onClick={() => playChord(['C4', 'E4', 'G4'])}>C Major</button>
                        <button onClick={() => playChord(['D4', 'F4', 'A4'])}>D Minor</button>
                        <button onClick={() => playChord(['G4', 'B4', 'D5'])}>G Major</button>
                    </div>
                    <button onClick={toggleArpeggio}>
                        {isPlaying ? 'Stop Arpeggio' : 'Play Arpeggio'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default InstrumentLibrary;