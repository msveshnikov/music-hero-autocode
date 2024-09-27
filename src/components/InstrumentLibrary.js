import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';

const InstrumentLibrary = () => {
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [, setCustomSamples] = useState({});

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

 

    const handleInstrumentSelect = useCallback((instrument) => {
        setSelectedInstrument(instrument);
    }, []);

    const playNote = useCallback(
        async (note) => {
            if (selectedInstrument) {
                await Tone.start();
                selectedInstrument.synth.triggerAttackRelease(note, '8n');
            }
        },
        [selectedInstrument]
    );

    const playChord = useCallback(
        async (chord) => {
            if (selectedInstrument) {
                await Tone.start();
                selectedInstrument.synth.triggerAttackRelease(chord, '4n');
            }
        },
        [selectedInstrument]
    );

    const toggleArpeggio = useCallback(async () => {
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
    }, [isPlaying, selectedInstrument]);

    const handleCustomSampleUpload = useCallback((event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const buffer = await Tone.context.decodeAudioData(e.target.result);
            const sampler = new Tone.Sampler({
                C4: buffer
            }).toDestination();
            setCustomSamples((prevSamples) => ({
                ...prevSamples,
                [file.name]: sampler
            }));
            setInstruments((prevInstruments) => [
                ...prevInstruments,
                { name: file.name, synth: sampler }
            ]);
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const exportMIDI = useCallback(() => {
        const midi = new Tone.Midi();
        const track = midi.addTrack();

        ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].forEach((note, index) => {
            track.addNote({
                midi: Tone.Midi.fromNote(note),
                time: index * 0.5,
                duration: 0.5
            });
        });

        const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'instrument-sample.mid';
        a.click();
        URL.revokeObjectURL(url);
    }, []);

 

    return (
        <div className={`instrument-library `}>
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
            <div className="custom-sample-upload">
                <h3>Upload Custom Sample</h3>
                <input type="file" accept="audio/*" onChange={handleCustomSampleUpload} />
            </div>
            <button onClick={exportMIDI}>Export MIDI</button>
        </div>
    );
};

export default InstrumentLibrary;
