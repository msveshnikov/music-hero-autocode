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
    useColorModeValue
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
                    <VStack spacing={4} align="stretch">
                        <Box as="header" p={4} bg={bgColor}>
                            <Heading as="h1" size="xl">
                                Music Hero
                            </Heading>
                            <HStack as="nav" spacing={4} mt={4}>
                                <Link to="/">Home</Link>
                                <Link to="/editor">Notation Editor</Link>
                                <Link to="/instruments">Instrument Library</Link>
                                <Link to="/chord-progression">Chord Progression</Link>
                                <Link to="/melody-suggestion">Melody Suggestion</Link>
                                <Link to="/collaboration">Collaboration</Link>
                                <Button onClick={toggleColorMode}>
                                    Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
                                </Button>
                            </HStack>
                            {isOffline && <Box>Offline Mode</Box>}
                        </Box>

                        <Box as="main" p={4} flex={1}>
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <Heading as="h2" size="lg">
                                            Welcome to Music Hero
                                        </Heading>
                                    }
                                />
                                <Route path="/editor" element={<NotationEditor />} />
                                <Route path="/instruments" element={<InstrumentLibrary />} />
                                <Route path="/chord-progression" element={<ChordProgression />} />
                                <Route path="/melody-suggestion" element={<MelodySuggestion />} />
                                <Route path="/collaboration" element={<CollaborationSpace />} />
                            </Routes>
                        </Box>

                        <Box as="footer" p={4} bg={bgColor}>
                            <HStack spacing={4}>
                                <AudioPlayback />
                                <ExportFunctionality />
                            </HStack>
                        </Box>
                    </VStack>
                </Box>
            </Router>
        </ChakraProvider>
    );
}

export default App;
