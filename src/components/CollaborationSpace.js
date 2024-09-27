import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Input, Button, VStack, HStack, useToast } from '@chakra-ui/react';
import * as Tone from 'tone';

const CollaborationSpace = () => {
    const [roomId, setRoomId] = useState('');
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const toast = useToast();

    useEffect(() => {
        const mockParticipants = ['User1', 'User2', 'User3'];
        setParticipants(mockParticipants);
    }, []);

    const joinRoom = () => {
        if (roomId) {
            toast({
                title: 'Joined Room',
                description: `You have joined room ${roomId}`,
                status: 'success',
                duration: 3000,
                isClosable: true
            });
        } else {
            toast({
                title: 'Error',
                description: 'Please enter a room ID',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const sendMessage = () => {
        if (newMessage) {
            setMessages([...messages, { sender: 'You', text: newMessage }]);
            setNewMessage('');
        }
    };

    const playCollaborativeComposition = async () => {
        await Tone.start();
        const synth = new Tone.Synth().toDestination();
        const now = Tone.now();
        synth.triggerAttackRelease('C4', '8n', now);
        synth.triggerAttackRelease('E4', '8n', now + 0.5);
        synth.triggerAttackRelease('G4', '8n', now + 1);
    };

    return (
        <Box>
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
                    {participants.map((participant, index) => (
                        <Text key={index}>{participant}</Text>
                    ))}
                </Box>
                <Box>
                    <Heading as="h3" size="md" mb={2}>
                        Chat
                    </Heading>
                    <VStack align="stretch" mb={2}>
                        {messages.map((message, index) => (
                            <Text key={index}>
                                <strong>{message.sender}:</strong> {message.text}
                            </Text>
                        ))}
                    </VStack>
                    <HStack>
                        <Input
                            placeholder="Type a message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button onClick={sendMessage}>Send</Button>
                    </HStack>
                </Box>
                <Button onClick={playCollaborativeComposition}>
                    Play Collaborative Composition
                </Button>
            </VStack>
        </Box>
    );
};

export default CollaborationSpace;
