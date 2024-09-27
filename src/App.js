import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
    ChakraProvider,
    Box,
    VStack,
    HStack,
    Heading,
    Button,
    useColorMode,
    useColorModeValue,
    Container,
    Text,
    Flex,
    Spacer,
    useToast,
} from '@chakra-ui/react';
import * as Tone from 'tone';
import NotationEditor from './components/NotationEditor';
import InstrumentLibrary from './components/InstrumentLibrary';
import ChordProgression from './components/ChordProgression';
import MelodySuggestion from './components/MelodySuggestion';
import CollaborationSpace from './components/CollaborationSpace';

const AudioPlayback = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlayback = async () => {
        if (isPlaying) {
            Tone.Transport.stop();
        } else {
            await Tone.start();
            Tone.Transport.start();
        }
        setIsPlaying(!isPlaying);
    };

    return <Button onClick={togglePlayback}>{isPlaying ? 'Stop' : 'Play'}</Button>;
};

const ExportFunctionality = () => {
    const toast = useToast();

    const exportAudio = async () => {
        const recorder = new Tone.Recorder();
        const synth = new Tone.Synth().connect(recorder);

        await recorder.start();
        await Tone.start();

        synth.triggerAttackRelease('C4', '1n');
        await Tone.getTransport().sleep(2);

        const recording = await recorder.stop();
        const url = URL.createObjectURL(recording);
        const anchor = document.createElement('a');
        anchor.download = 'composition.webm';
        anchor.href = url;
        anchor.click();

        toast({
            title: 'Audio Exported',
            description: 'Your composition has been exported successfully.',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
    };

    return <Button onClick={exportAudio}>Export Audio</Button>;
};

function App() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const { colorMode, toggleColorMode } = useColorMode();
    const bgColor = useColorModeValue('gray.100', 'gray.900');
    const textColor = useColorModeValue('gray.900', 'gray.100');

    useEffect(() => {
        Tone.setContext(new Tone.Context({ latencyHint: 'interactive' }));

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <ChakraProvider>
            <Router>
                <Box bg={bgColor} color={textColor} minHeight="100vh">
                    <Container maxW="container.xl">
                        <VStack spacing={4} align="stretch">
                            <Box as="header" py={4}>
                                <Flex align="center">
                                    <Heading as="h1" size="xl">
                                        Music Hero
                                    </Heading>
                                    <Spacer />
                                    <Button onClick={toggleColorMode} size="sm">
                                        Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
                                    </Button>
                                </Flex>
                                <HStack as="nav" spacing={4} mt={4} overflowX="auto" py={2}>
                                    <Link to="/">Home</Link>
                                    <Link to="/editor">Notation Editor</Link>
                                    <Link to="/instruments">Instrument Library</Link>
                                    <Link to="/chord-progression">Chord Progression</Link>
                                    <Link to="/melody-suggestion">Melody Suggestion</Link>
                                    <Link to="/collaboration">Collaboration</Link>
                                </HStack>
                                {isOffline && (
                                    <Text color="orange.500" mt={2}>
                                        Offline Mode
                                    </Text>
                                )}
                            </Box>

                            <Box as="main" flex={1} py={4}>
                                <Routes>
                                    <Route
                                        path="/"
                                        element={
                                            <VStack spacing={4} align="start">
                                                <Heading as="h2" size="lg">
                                                    Welcome to Music Hero
                                                </Heading>
                                                <Text>
                                                    Start composing your next masterpiece with our
                                                    advanced tools and features.
                                                </Text>
                                            </VStack>
                                        }
                                    />
                                    <Route path="/editor" element={<NotationEditor />} />
                                    <Route path="/instruments" element={<InstrumentLibrary />} />
                                    <Route path="/chord-progression" element={<ChordProgression />} />
                                    <Route path="/melody-suggestion" element={<MelodySuggestion />} />
                                    <Route path="/collaboration" element={<CollaborationSpace />} />
                                </Routes>
                            </Box>

                            <Box as="footer" py={4}>
                                <HStack spacing={4} justify="center">
                                    <AudioPlayback />
                                    <ExportFunctionality />
                                </HStack>
                            </Box>
                        </VStack>
                    </Container>
                </Box>
            </Router>
        </ChakraProvider>
    );
}

export default App;