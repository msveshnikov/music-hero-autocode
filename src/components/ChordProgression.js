import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Midi, Chord } from '@tonejs/midi';
import {
    Box,
    Heading,
    Select,
    Input,
    Button,
    VStack,
    HStack,
    Text,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb
} from '@chakra-ui/react';

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
        <Box>
            <Heading as="h2" size="lg" mb={4}>
                Chord Progression Generator
            </Heading>
            <VStack spacing={4} align="stretch">
                <HStack>
                    <Text>Key:</Text>
                    <Select value={key} onChange={(e) => setKey(e.target.value)}>
                        {Object.keys(chords).map((chordKey) => (
                            <option key={chordKey} value={chordKey}>
                                {chordKey.charAt(0).toUpperCase() + chordKey.slice(1)}
                            </option>
                        ))}
                    </Select>
                </HStack>
                <HStack>
                    <Text>Tempo:</Text>
                    <Input
                        type="number"
                        value={tempo}
                        onChange={(e) => setTempo(Number(e.target.value))}
                        min={40}
                        max={240}
                    />
                </HStack>
                <HStack>
                    <Text>Progression Length:</Text>
                    <Input
                        type="number"
                        value={progressionLength}
                        onChange={(e) => setProgressionLength(Number(e.target.value))}
                        min={2}
                        max={8}
                    />
                </HStack>
                <Box>
                    <Text>Complexity:</Text>
                    <Slider
                        min={1}
                        max={3}
                        step={1}
                        value={complexity}
                        onChange={(value) => setComplexity(value)}
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                </Box>
                <HStack>
                    <Button onClick={generateProgression}>Generate Progression</Button>
                    <Button onClick={playProgression} isDisabled={progression.length === 0}>
                        {playing ? 'Stop' : 'Play'}
                    </Button>
                    <Button onClick={exportMIDI} isDisabled={progression.length === 0}>
                        Export MIDI
                    </Button>
                </HStack>
                <Box>
                    <Text fontWeight="bold">Generated Progression:</Text>
                    <HStack spacing={2}>
                        {progression.map((chord, index) => (
                            <Text key={index}>{chord}</Text>
                        ))}
                    </HStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default ChordProgression;
