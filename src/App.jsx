import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
    ChakraProvider,
    Box,
    VStack,
    HStack,
    Heading,
    Button,
    useColorModeValue,
    Container,
    Text,
    Flex,
    Spacer,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton
} from '@chakra-ui/react';
import * as Tone from 'tone';
import NotationEditor from './components/NotationEditor';
import InstrumentLibrary from './components/InstrumentLibrary';
import ChordProgression from './components/ChordProgression';
import MelodySuggestion from './components/MelodySuggestion';
import CollaborationSpace from './components/CollaborationSpace';

const AudioPlayback = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const toast = useToast();

    const togglePlayback = useCallback(async () => {
        try {
            if (isPlaying) {
                await Tone.Transport.stop();
                await Tone.Transport.cancel();
            } else {
                await Tone.start();
                await Tone.Transport.start();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error('Error toggling playback:', error);
            toast({
                title: 'Playback Error',
                description: 'An error occurred while toggling playback.',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    }, [isPlaying, toast]);

    return <Button onClick={togglePlayback}>{isPlaying ? 'Stop' : 'Play'}</Button>;
};

const ExportFunctionality = () => {
    const toast = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const exportAudio = useCallback(async () => {
        setIsExporting(true);
        try {
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
                isClosable: true
            });
        } catch (error) {
            console.error('Error exporting audio:', error);
            toast({
                title: 'Export Error',
                description: 'An error occurred while exporting the audio.',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsExporting(false);
        }
    }, [toast]);

    return (
        <Button onClick={exportAudio} isLoading={isExporting}>
            Export Audio
        </Button>
    );
};

function App() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const bgColor = useColorModeValue('gray.100', 'gray.900');
    const textColor = useColorModeValue('gray.900', 'gray.100');
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        Tone.setContext(new Tone.Context({ latencyHint: 'interactive' }));
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

                                    <Button onClick={onOpen}>Help</Button>
                                </Flex>
                                <HStack as="nav" spacing={4} mt={4} overflowX="auto" py={2}>
                                    <Link to="/">Notation Editor</Link>
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
                                    <Route path="/" element={<NotationEditor />} />
                                    <Route path="/instruments" element={<InstrumentLibrary />} />
                                    <Route
                                        path="/chord-progression"
                                        element={<ChordProgression />}
                                    />
                                    <Route
                                        path="/melody-suggestion"
                                        element={<MelodySuggestion />}
                                    />
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

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Music Hero Help</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            Welcome to Music Hero! This application provides tools for music
                            composition, including a notation editor, instrument library, chord
                            progression generator, melody suggestion tool, and collaboration space.
                            Use the navigation menu to explore different features. For more detailed
                            instructions, please refer to our documentation.
                        </Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </ChakraProvider>
    );
}

export default App;
