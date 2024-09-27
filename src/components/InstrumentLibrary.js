import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Box, Heading, Button, VStack, HStack, Input } from '@chakra-ui/react';

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
                midi: Tone.Frequency(note).toMidi(),
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
        <Box className="instrument-library">
            <Heading as="h2" size="lg" mb={4}>
                Virtual Instrument Library
            </Heading>
            <HStack spacing={4} mb={4}>
                {instruments.map((instrument) => (
                    <Button
                        key={instrument.name}
                        onClick={() => handleInstrumentSelect(instrument)}
                        colorScheme={selectedInstrument === instrument ? 'blue' : 'gray'}
                    >
                        {instrument.name}
                    </Button>
                ))}
            </HStack>
            {selectedInstrument && (
                <Box className="instrument-preview" mb={4}>
                    <Heading as="h3" size="md" mb={2}>
                        {selectedInstrument.name}
                    </Heading>
                    <HStack spacing={2} mb={4}>
                        {['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((note) => (
                            <Button key={note} onClick={() => playNote(note)}>
                                {note}
                            </Button>
                        ))}
                    </HStack>
                    <HStack spacing={4} mb={4}>
                        <Button onClick={() => playChord(['C4', 'E4', 'G4'])}>C Major</Button>
                        <Button onClick={() => playChord(['D4', 'F4', 'A4'])}>D Minor</Button>
                        <Button onClick={() => playChord(['G4', 'B4', 'D5'])}>G Major</Button>
                    </HStack>
                    <Button onClick={toggleArpeggio} colorScheme={isPlaying ? 'red' : 'green'}>
                        {isPlaying ? 'Stop Arpeggio' : 'Play Arpeggio'}
                    </Button>
                </Box>
            )}
            <VStack spacing={4} align="stretch">
                <Heading as="h3" size="md">
                    Upload Custom Sample
                </Heading>
                <Input type="file" accept="audio/*" onChange={handleCustomSampleUpload} />
                <Button onClick={exportMIDI}>Export MIDI</Button>
            </VStack>
        </Box>
    );
};

export default InstrumentLibrary;