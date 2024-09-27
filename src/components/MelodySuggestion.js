import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { Box, Heading, Select, Slider, Button, VStack, HStack, Text, Switch, List, ListItem } from '@chakra-ui/react';

const MelodySuggestion = () => {
    const [scale, setScale] = useState('C major');
    const [melody, setMelody] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(120);
    const [noteLength, setNoteLength] = useState('8n');
    const [complexity, setComplexity] = useState(1);
    const [synth, setSynth] = useState(null);
    const [aiAssistance, setAiAssistance] = useState(false);

    const scales = {
        'C major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        'A minor': ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
        'G major': ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'],
        'E minor': ['E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'],
        'F major': ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'],
        'D minor': ['D3', 'E3', 'F3', 'G3', 'A3', 'Bb3', 'C4', 'D4']
    };

    const noteLengths = ['16n', '8n', '4n', '2n', '1n'];

    useEffect(() => {
        const newSynth = new Tone.Synth().toDestination();
        setSynth(newSynth);
        return () => {
            newSynth.dispose();
        };
    }, []);

    const generateMelody = useCallback(() => {
        const currentScale = scales[scale];
        const newMelody = [];
        const melodyLength = 8 + complexity * 2;

        for (let i = 0; i < melodyLength; i++) {
            const randomIndex = Math.floor(Math.random() * currentScale.length);
            newMelody.push(currentScale[randomIndex]);
        }

        if (complexity > 1) {
            for (let i = 0; i < complexity - 1; i++) {
                const insertIndex = Math.floor(Math.random() * newMelody.length);
                const randomNote = currentScale[Math.floor(Math.random() * currentScale.length)];
                newMelody.splice(insertIndex, 0, randomNote);
            }
        }

        if (aiAssistance) {
            newMelody.sort((a, b) => {
                const aIndex = currentScale.indexOf(a);
                const bIndex = currentScale.indexOf(b);
                return aIndex - bIndex;
            });
        }

        setMelody(newMelody);
    }, [scale, complexity, aiAssistance]);

    const playMelody = useCallback(async () => {
        await Tone.start();
        setIsPlaying(true);
        const now = Tone.now();
        const duration = Tone.Time(noteLength).toSeconds();
        const interval = (60 / tempo) * 4 * duration;

        melody.forEach((note, index) => {
            synth.triggerAttackRelease(note, noteLength, now + index * interval);
        });

        setTimeout(() => setIsPlaying(false), melody.length * interval * 1000);
    }, [melody, noteLength, tempo, synth]);

    const exportMIDI = useCallback(() => {
        const midi = new Midi();
        const track = midi.addTrack();

        melody.forEach((note, index) => {
            track.addNote({
                midi: Tone.Frequency(note).toMidi(),
                time: index * Tone.Time(noteLength).toSeconds(),
                duration: Tone.Time(noteLength).toSeconds()
            });
        });

        const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'melody.mid';
        a.click();
        URL.revokeObjectURL(url);
    }, [melody, noteLength]);

    return (
        <Box className="melody-suggestion">
            <Heading as="h2" size="lg" mb={4}>
                Melody Suggestion Tool
            </Heading>
            <VStack spacing={4} align="stretch">
                <HStack>
                    <Text>Choose a scale:</Text>
                    <Select value={scale} onChange={(e) => setScale(e.target.value)}>
                        {Object.keys(scales).map((scaleName) => (
                            <option key={scaleName} value={scaleName}>
                                {scaleName}
                            </option>
                        ))}
                    </Select>
                </HStack>
                <HStack>
                    <Text>Tempo (BPM):</Text>
                    <Slider
                        value={tempo}
                        onChange={(value) => setTempo(value)}
                        min={40}
                        max={240}
                        step={1}
                    >
                        <Text>{tempo}</Text>
                    </Slider>
                </HStack>
                <HStack>
                    <Text>Note Length:</Text>
                    <Select value={noteLength} onChange={(e) => setNoteLength(e.target.value)}>
                        {noteLengths.map((length) => (
                            <option key={length} value={length}>
                                {length}
                            </option>
                        ))}
                    </Select>
                </HStack>
                <HStack>
                    <Text>Complexity:</Text>
                    <Slider
                        value={complexity}
                        onChange={(value) => setComplexity(value)}
                        min={1}
                        max={5}
                        step={1}
                    >
                        <Text>{complexity}</Text>
                    </Slider>
                </HStack>
                <HStack>
                    <Text>AI Assistance:</Text>
                    <Switch
                        isChecked={aiAssistance}
                        onChange={(e) => setAiAssistance(e.target.checked)}
                    />
                </HStack>
                <HStack spacing={4}>
                    <Button onClick={generateMelody}>Generate Melody</Button>
                    <Button onClick={playMelody} isDisabled={isPlaying || melody.length === 0}>
                        {isPlaying ? 'Playing...' : 'Play Melody'}
                    </Button>
                    <Button onClick={exportMIDI} isDisabled={melody.length === 0}>
                        Export MIDI
                    </Button>
                </HStack>
                <Box>
                    <Heading as="h3" size="md" mb={2}>
                        Generated Melody:
                    </Heading>
                    <List spacing={2}>
                        {melody.map((note, index) => (
                            <ListItem key={index}>{note}</ListItem>
                        ))}
                    </List>
                </Box>
            </VStack>
        </Box>
    );
};

export default MelodySuggestion;