import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Vex } from 'vexflow';
import { Midi } from '@tonejs/midi';
import {
    Box,
    Button,
    Select,
    HStack,
    VStack,
    Input,
    useColorModeValue,
    Text
} from '@chakra-ui/react';

const NotationEditor = () => {
    const [notes, setNotes] = useState([]);
    const [currentOctave, setCurrentOctave] = useState(4);
    const [currentDuration, setCurrentDuration] = useState('q');
    const [timeSignature, setTimeSignature] = useState('4/4');
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const rendererRef = useRef(null);
    const contextRef = useRef(null);
    const staveRef = useRef(null);
    const synthRef = useRef(null);

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');

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

    return (
        <Box bg={bgColor} color={textColor} p={4} borderRadius="md" boxShadow="md">
            <Text fontSize="2xl" fontWeight="bold" mb={4}>
                Notation Editor
            </Text>
            <Box id="notation" mb={4}></Box>
            <HStack spacing={2} mb={4}>
                {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
                    <Button key={note} onClick={() => addNote(note)}>
                        {note}
                    </Button>
                ))}
            </HStack>
            <VStack spacing={4} align="stretch">
                <HStack>
                    <Select
                        value={currentOctave}
                        onChange={(e) => setCurrentOctave(parseInt(e.target.value))}
                    >
                        {[3, 4, 5].map((octave) => (
                            <option key={octave} value={octave}>
                                Octave {octave}
                            </option>
                        ))}
                    </Select>
                    <Select
                        value={currentDuration}
                        onChange={(e) => setCurrentDuration(e.target.value)}
                    >
                        <option value="w">Whole</option>
                        <option value="h">Half</option>
                        <option value="q">Quarter</option>
                        <option value="8">Eighth</option>
                        <option value="16">Sixteenth</option>
                    </Select>
                    <Select
                        value={timeSignature}
                        onChange={(e) => setTimeSignature(e.target.value)}
                    >
                        <option value="4/4">4/4</option>
                        <option value="3/4">3/4</option>
                        <option value="6/8">6/8</option>
                    </Select>
                    <Input
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        min="40"
                        max="240"
                        placeholder="BPM"
                    />
                </HStack>
                <HStack>
                    <Button onClick={playNotes}>{isPlaying ? 'Stop' : 'Play Notes'}</Button>
                    <Button onClick={clearNotes}>Clear Notes</Button>
                    <Button onClick={exportMIDI}>Export MIDI</Button>
                </HStack>
            </VStack>
        </Box>
    );
};

export default NotationEditor;