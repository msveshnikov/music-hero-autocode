import { useState, useCallback, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const useAIIntegration = () => {
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const savedSessions = localStorage.getItem('conversationSessions');
        if (savedSessions) {
            setSessions(JSON.parse(savedSessions));
        }
    }, []);

    const saveSessionToLocalStorage = useCallback(
        (sessionData) => {
            const updatedSessions = [...sessions, sessionData];
            localStorage.setItem('conversationSessions', JSON.stringify(updatedSessions));
            setSessions(updatedSessions);
        },
        [sessions]
    );

    const sendMessage = useCallback(
        async (message, language = 'English') => {
            setIsLoading(true);
            setError(null);

            try {
                const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

                const prompt = `You are a helpful AI assistant for music composition. Please respond in ${language}. Context: ${conversationHistory
                    .map((msg) => `${msg.role}: ${msg.content}`)
                    .join('\n')}\n\nUser: ${message}\nAssistant:`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const aiReply = response.text();

                setAiResponse(aiReply);
                const updatedConversation = [
                    ...conversationHistory,
                    { role: 'user', content: message },
                    { role: 'assistant', content: aiReply }
                ];
                setConversationHistory(updatedConversation);
                saveSessionToLocalStorage({
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    conversation: updatedConversation
                });
                return aiReply;
            } catch (err) {
                setError(`Error communicating with AI: ${err.message}`);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [conversationHistory, saveSessionToLocalStorage]
    );

    const generateChordProgression = useCallback(
        async (key, genre) => {
            const message = `Generate a chord progression in the key of ${key} for ${genre} music.`;
            return sendMessage(message);
        },
        [sendMessage]
    );

    const suggestMelody = useCallback(
        async (chords, scale, complexity) => {
            const message = `Suggest a melody that fits with the chord progression ${chords}, using the ${scale} scale. The complexity level is ${complexity} out of 5.`;
            return sendMessage(message);
        },
        [sendMessage]
    );

    const getCompositionTips = useCallback(
        async (instrument, style) => {
            const message = `Provide composition tips for ${instrument} in the ${style} style.`;
            return sendMessage(message);
        },
        [sendMessage]
    );

    const analyzeComposition = useCallback(
        async (composition) => {
            const message = `Analyze the following musical composition and provide feedback: ${composition}`;
            return sendMessage(message);
        },
        [sendMessage]
    );

    const clearConversationHistory = useCallback(() => {
        setConversationHistory([]);
        localStorage.removeItem('conversationSessions');
        setSessions([]);
    }, []);

    const loadSession = useCallback(
        (sessionId) => {
            const session = sessions.find((s) => s.id === sessionId);
            if (session) {
                setConversationHistory(session.conversation);
            }
        },
        [sessions]
    );

    const deleteSession = useCallback(
        (sessionId) => {
            const updatedSessions = sessions.filter((s) => s.id !== sessionId);
            localStorage.setItem('conversationSessions', JSON.stringify(updatedSessions));
            setSessions(updatedSessions);
        },
        [sessions]
    );

    return {
        aiResponse,
        error,
        isLoading,
        sendMessage,
        conversationHistory,
        clearConversationHistory,
        sessions,
        loadSession,
        deleteSession,
        generateChordProgression,
        suggestMelody,
        getCompositionTips,
        analyzeComposition
    };
};

export default useAIIntegration;
