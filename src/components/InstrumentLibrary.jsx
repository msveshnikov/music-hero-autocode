import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import {
    Box,
    Heading,
    Button,
    VStack,
    HStack,
    Input,
    Text,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Switch,
    useToast,
    Spinner
} from '@chakra-ui/react';
import useAIIntegration from '../hooks/useAIIntegration';

const InstrumentLibrary = () => {
    const [instruments, setInstruments] = useState([]);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [setCustomSamples] = useState({});
    const [tempo, setTempo] = useState(120);
    const [complexity, setComplexity] = useState(1);
    const [aiAssistance, setAiAssistance] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const { sendMessage, isLoading } = useAIIntegration();
    const toast = useToast();

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
            Tone.Transport.bpm.value = tempo;
            Tone.Transport.start();
            setIsPlaying(true);
        }
    }, [isPlaying, selectedInstrument, tempo]);

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
        setIsExporting(true);
        try {
            const midi = new Midi();
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
        } catch (error) {
            console.error('Error exporting MIDI:', error);
            toast({
                title: 'Export Failed',
                description: 'Unable to export MIDI file',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsExporting(false);
        }
    }, [toast]);

    const generateWithAI = useCallback(async () => {
        const prompt = `Generate a melody with 8 notes for ${selectedInstrument.name}, considering the current complexity level of ${complexity} (1-5). Return the melody as a comma-separated list of note names with octaves (e.g., C4,D4,E4).`;
        const aiResponse = await sendMessage(prompt);
        if (aiResponse) {
            const melody = aiResponse.split(',').map((note) => note.trim());
            const sequence = new Tone.Sequence(
                (time, note) => {
                    selectedInstrument.synth.triggerAttackRelease(note, '8n', time);
                },
                melody,
                '8n'
            );
            await Tone.start();
            sequence.start(0);
            Tone.Transport.bpm.value = tempo;
            Tone.Transport.start();
            setIsPlaying(true);
            Tone.Transport.scheduleOnce(() => {
                setIsPlaying(false);
                Tone.Transport.stop();
                sequence.stop();
            }, `${melody.length * 0.5}s`);
        } else {
            toast({
                title: 'AI Generation Failed',
                description: 'Unable to generate melody with AI',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    }, [selectedInstrument, complexity, tempo, sendMessage, toast]);

    return (
        <Box className="instrument-library">
            <Heading as="h2" size="lg" mb={4}>
                Virtual Instrument Library
            </Heading>
            <HStack spacing={4} mb={4} flexWrap="wrap">
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
                    <HStack spacing={2} mb={4} flexWrap="wrap">
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
                <HStack>
                    <Text>Tempo:</Text>
                    <Slider
                        value={tempo}
                        onChange={(value) => setTempo(value)}
                        min={40}
                        max={240}
                        step={1}
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    <Text>{tempo} BPM</Text>
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
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                    <Text>{complexity}</Text>
                </HStack>
                <HStack>
                    <Text>AI Assistance:</Text>
                    <Switch
                        isChecked={aiAssistance}
                        onChange={(e) => setAiAssistance(e.target.checked)}
                    />
                </HStack>
                <HStack>
                    <Button onClick={exportMIDI} isDisabled={isExporting}>
                        {isExporting ? <Spinner size="sm" /> : 'Export MIDI'}
                    </Button>
                    <Button
                        onClick={generateWithAI}
                        isDisabled={!aiAssistance || isLoading}
                        isLoading={isLoading}
                    >
                        Generate with AI
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
};

export default InstrumentLibrary;
