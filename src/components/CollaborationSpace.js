import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Heading,
    Text,
    Input,
    Button,
    VStack,
    HStack,
    useToast,
    Textarea,
    Select,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Switch,
    FormControl,
    FormLabel,
    List,
    ListItem
} from '@chakra-ui/react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import useAIIntegration from '../hooks/useAIIntegration';

const CollaborationSpace = () => {
    const [roomId, setRoomId] = useState('');
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [composition, setComposition] = useState([]);
    const [instrument, setInstrument] = useState('piano');
    const [tempo, setTempo] = useState(120);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [synth, setSynth] = useState(null);
    const [aiAssistance, setAiAssistance] = useState(false);
    const toast = useToast();
    const { sendMessage: sendAIMessage, isLoading } = useAIIntegration();

    useEffect(() => {
        const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
        setSynth(newSynth);
        return () => {
            newSynth.dispose();
        };
    }, []);

    const joinRoom = useCallback(() => {
        if (roomId) {
            toast({
                title: 'Joined Room',
                description: `You have joined room ${roomId}`,
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            setParticipants(['You', 'User1', 'User2']);
        } else {
            toast({
                title: 'Error',
                description: 'Please enter a room ID',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    }, [roomId, toast]);

    const sendMessage = useCallback(() => {
        if (newMessage) {
            setMessages([...messages, { sender: 'You', text: newMessage }]);
            setNewMessage('');
        }
    }, [messages, newMessage]);

    const startRecording = useCallback(() => {
        setIsRecording(true);
        setComposition([]);
    }, []);

    const stopRecording = useCallback(() => {
        setIsRecording(false);
    }, []);

    const addNote = useCallback(
        (note) => {
            if (isRecording) {
                setComposition([...composition, { note, time: Tone.now() }]);
                synth.triggerAttackRelease(note, '8n');
            }
        },
        [isRecording, composition, synth]
    );

    const playComposition = useCallback(async () => {
        if (isPlaying) {
            Tone.Transport.stop();
            setIsPlaying(false);
            return;
        }

        await Tone.start();
        Tone.Transport.bpm.value = tempo;

        const sequence = new Tone.Sequence(
            (time, note) => {
                synth.triggerAttackRelease(note, '8n', time);
            },
            composition.map((item) => item.note),
            '8n'
        );

        sequence.start(0);
        Tone.Transport.start();
        setIsPlaying(true);

        Tone.Transport.scheduleOnce(() => {
            setIsPlaying(false);
            Tone.Transport.stop();
            sequence.stop();
        }, `${composition.length * 0.5}m`);
    }, [isPlaying, tempo, composition, synth]);

    const exportMIDI = useCallback(() => {
        const midi = new Midi();
        const track = midi.addTrack();

        composition.forEach((item, index) => {
            track.addNote({
                midi: Tone.Frequency(item.note).toMidi(),
                time: index * 0.5,
                duration: 0.5
            });
        });

        const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'collaborative-composition.mid';
        a.click();
        URL.revokeObjectURL(url);
    }, [composition]);

    const generateWithAI = useCallback(async () => {
        const prompt = `Generate a melody with ${
            composition.length + 4
        } notes, considering the current tempo of ${tempo} BPM. Return the melody as a comma-separated list of note names with octaves (e.g., C4,D4,E4).`;
        const aiResponse = await sendAIMessage(prompt, 'English');
        if (aiResponse) {
            const newNotes = aiResponse.split(',').map((note) => ({
                note: note.trim(),
                time: Tone.now()
            }));
            setComposition((prevComposition) => [...prevComposition, ...newNotes]);
        }
    }, [composition, tempo, sendAIMessage]);

    return (
        <Box p={4}>
            <Heading as="h2" size="lg" mb={4}>
                Collaboration Space
            </Heading>
            <VStack spacing={4} align="stretch">
                <HStack>
                    <Input
                        placeholder="Enter room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <Button onClick={joinRoom}>Join Room</Button>
                </HStack>
                <Box>
                    <Heading as="h3" size="md" mb={2}>
                        Participants
                    </Heading>
                    <List>
                        {participants.map((participant, index) => (
                            <ListItem key={index}>{participant}</ListItem>
                        ))}
                    </List>
                </Box>
                <Box>
                    <Heading as="h3" size="md" mb={2}>
                        Chat
                    </Heading>
                    <VStack align="stretch" mb={2} maxHeight="200px" overflowY="auto">
                        {messages.map((message, index) => (
                            <Text key={index}>
                                <strong>{message.sender}:</strong> {message.text}
                            </Text>
                        ))}
                    </VStack>
                    <HStack>
                        <Textarea
                            placeholder="Type a message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button onClick={sendMessage}>Send</Button>
                    </HStack>
                </Box>
                <Box>
                    <Heading as="h3" size="md" mb={2}>
                        Collaborative Composition
                    </Heading>
                    <HStack mb={2}>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="recording-switch" mb="0">
                                Recording
                            </FormLabel>
                            <Switch
                                id="recording-switch"
                                isChecked={isRecording}
                                onChange={(e) =>
                                    e.target.checked ? startRecording() : stopRecording()
                                }
                            />
                        </FormControl>
                        <Select
                            value={instrument}
                            onChange={(e) => setInstrument(e.target.value)}
                            width="150px"
                        >
                            <option value="piano">Piano</option>
                            <option value="guitar">Guitar</option>
                            <option value="bass">Bass</option>
                        </Select>
                        <FormControl width="200px">
                            <FormLabel htmlFor="tempo-slider">Tempo: {tempo} BPM</FormLabel>
                            <Slider
                                id="tempo-slider"
                                min={60}
                                max={240}
                                step={1}
                                value={tempo}
                                onChange={(value) => setTempo(value)}
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                        </FormControl>
                    </HStack>
                    <HStack mb={2}>
                        {['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((note) => (
                            <Button key={note} onClick={() => addNote(note)}>
                                {note}
                            </Button>
                        ))}
                    </HStack>
                    <HStack mb={2}>
                        <Button onClick={playComposition} isDisabled={composition.length === 0}>
                            {isPlaying ? 'Stop' : 'Play'}
                        </Button>
                        <Button onClick={exportMIDI} isDisabled={composition.length === 0}>
                            Export MIDI
                        </Button>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="ai-switch" mb="0">
                                AI Assistance
                            </FormLabel>
                            <Switch
                                id="ai-switch"
                                isChecked={aiAssistance}
                                onChange={(e) => setAiAssistance(e.target.checked)}
                            />
                        </FormControl>
                        <Button
                            onClick={generateWithAI}
                            isDisabled={!aiAssistance}
                            isLoading={isLoading}
                        >
                            Generate with AI
                        </Button>
                    </HStack>
                    <Text>Composition: {composition.map((item) => item.note).join(', ')}</Text>
                </Box>
            </VStack>
        </Box>
    );
};

export default CollaborationSpace;