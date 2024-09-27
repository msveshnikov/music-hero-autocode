import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import * as Tone from 'tone';
import NotationEditor from './components/NotationEditor';
import InstrumentLibrary from './components/InstrumentLibrary';
import ChordProgression from './components/ChordProgression';
import MelodySuggestion from './components/MelodySuggestion';

const CollaborationSpace = () => <div>Real-time collaboration for ensemble compositions</div>;

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

    return <button onClick={togglePlayback}>{isPlaying ? 'Stop' : 'Play'}</button>;
};

const ExportFunctionality = () => {
    const exportAudio = () => {
        // Implement audio export logic here
    };

    return <button onClick={exportAudio}>Export Audio</button>;
};

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => (
    <button onClick={toggleDarkMode}>{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
);

function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

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

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
    };

    return (
        <Router>
            <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
                <header>
                    <h1>Music Composition Site</h1>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/editor">Notation Editor</Link>
                            </li>
                            <li>
                                <Link to="/instruments">Instrument Library</Link>
                            </li>
                            <li>
                                <Link to="/chord-progression">Chord Progression</Link>
                            </li>
                            <li>
                                <Link to="/melody-suggestion">Melody Suggestion</Link>
                            </li>
                            <li>
                                <Link to="/collaboration">Collaboration</Link>
                            </li>
                        </ul>
                    </nav>
                    <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    {isOffline && <div>Offline Mode</div>}
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<h2>Welcome to Music Composition Site</h2>} />
                        <Route path="/editor" element={<NotationEditor />} />
                        <Route path="/instruments" element={<InstrumentLibrary />} />
                        <Route path="/chord-progression" element={<ChordProgression />} />
                        <Route path="/melody-suggestion" element={<MelodySuggestion />} />
                        <Route path="/collaboration" element={<CollaborationSpace />} />
                    </Routes>
                </main>

                <footer>
                    <AudioPlayback />
                    <ExportFunctionality />
                </footer>
            </div>
        </Router>
    );
}

export default App;