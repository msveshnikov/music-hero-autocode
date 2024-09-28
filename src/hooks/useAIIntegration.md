# useAIIntegration Hook Documentation

## Overview

The `useAIIntegration` hook is a custom React hook that provides AI-powered functionalities for
music composition assistance. It integrates with Google's Generative AI to offer features such as
generating chord progressions, suggesting melodies, providing composition tips, and analyzing
compositions.

This hook is a core part of the application, likely used across multiple components to provide
AI-assisted music composition features.

## Hook Details

### State Variables

-   `aiResponse`: Stores the latest response from the AI.
-   `error`: Holds any error messages that occur during AI communication.
-   `isLoading`: Boolean indicating whether an AI request is in progress.
-   `conversationHistory`: Array of message objects representing the conversation with the AI.
-   `sessions`: Array of saved conversation sessions.

### Main Functions

#### sendMessage

```javascript
const sendMessage = async (message, language = 'English') => { ... }
```

Sends a message to the AI and processes the response.

-   Parameters:
    -   `message`: String, the message to send to the AI.
    -   `language`: String, the language for the AI to respond in (default: 'English').
-   Returns: Promise resolving to the AI's response text.

#### generateChordProgression

```javascript
const generateChordProgression = async (key, genre) => { ... }
```

Generates a chord progression based on the given key and genre.

-   Parameters:
    -   `key`: String, the musical key.
    -   `genre`: String, the music genre.
-   Returns: Promise resolving to the AI's suggested chord progression.

#### suggestMelody

```javascript
const suggestMelody = async (chords, scale, complexity) => { ... }
```

Suggests a melody that fits with the given chord progression and scale.

-   Parameters:
    -   `chords`: String, the chord progression.
    -   `scale`: String, the musical scale.
    -   `complexity`: Number, the desired complexity level (1-5).
-   Returns: Promise resolving to the AI's suggested melody.

#### getCompositionTips

```javascript
const getCompositionTips = async (instrument, style) => { ... }
```

Provides composition tips for a specific instrument and style.

-   Parameters:
    -   `instrument`: String, the musical instrument.
    -   `style`: String, the musical style.
-   Returns: Promise resolving to the AI's composition tips.

#### analyzeComposition

```javascript
const analyzeComposition = async (composition) => { ... }
```

Analyzes a given musical composition and provides feedback.

-   Parameters:
    -   `composition`: String, the musical composition to analyze.
-   Returns: Promise resolving to the AI's analysis and feedback.

### Session Management Functions

#### clearConversationHistory

```javascript
const clearConversationHistory = () => { ... }
```

Clears the current conversation history and removes all saved sessions.

#### loadSession

```javascript
const loadSession = (sessionId) => { ... }
```

Loads a previously saved conversation session.

-   Parameters:
    -   `sessionId`: String, the ID of the session to load.

#### deleteSession

```javascript
const deleteSession = (sessionId) => { ... }
```

Deletes a saved conversation session.

-   Parameters:
    -   `sessionId`: String, the ID of the session to delete.

## Usage Example

```javascript
import React from 'react';
import useAIIntegration from '../hooks/useAIIntegration';

const MusicComposer = () => {
    const { sendMessage, generateChordProgression, suggestMelody, aiResponse, isLoading, error } =
        useAIIntegration();

    const handleChordGeneration = async () => {
        const chords = await generateChordProgression('C major', 'Jazz');
        console.log('Generated Chords:', chords);
    };

    const handleMelodySuggestion = async () => {
        const melody = await suggestMelody('Cm7 - F7 - Bbmaj7', 'C minor pentatonic', 3);
        console.log('Suggested Melody:', melody);
    };

    return (
        <div>
            <button onClick={handleChordGeneration}>Generate Chords</button>
            <button onClick={handleMelodySuggestion}>Suggest Melody</button>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <p>AI Response: {aiResponse}</p>
        </div>
    );
};

export default MusicComposer;
```

This example demonstrates how to use the `useAIIntegration` hook in a React component to generate
chord progressions and suggest melodies.

## Project Context

The `useAIIntegration` hook is located in `src/hooks/useAIIntegration.js`. It's likely used by
various components in the `src/components` directory, such as `ChordProgression.js`,
`MelodySuggestion.js`, and `NotationEditor.js`, to provide AI-assisted functionalities for music
composition.
