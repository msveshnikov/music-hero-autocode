# ChordProgression Component Documentation

## Overview

The `ChordProgression` component is part of a larger music composition application. It provides a user interface for generating, playing, and exporting chord progressions. This component is located in `src/components/ChordProgression.js` and is likely used within the main `App.js` as one of the core features of the application.

## Key Features

- Generate chord progressions based on selected musical key
- Adjust tempo, progression length, and complexity
- Play generated chord progressions using Tone.js
- Export chord progressions as MIDI files

## Dependencies

- React
- Tone.js
- @tonejs/midi
- Chakra UI

## Component Structure

The component is a functional React component that uses various hooks for state management and side effects.

## State Variables

- `progression`: Array of chord symbols in the current progression
- `key`: Selected musical key (e.g., 'major', 'minor', 'jazz', 'blues')
- `playing`: Boolean indicating if the progression is currently playing
- `synth`: Tone.js PolySynth instance
- `tempo`: Playback tempo in BPM
- `progressionLength`: Number of chords in the progression
- `complexity`: Complexity level of the progression (1-3)

## Main Functions

### generateProgression

```javascript
const generateProgression = useCallback(() => { ... }, [key, progressionLength, complexity]);
```

Generates a new chord progression based on the current settings.

**Parameters:** None
**Returns:** None (updates `progression` state)

### playProgression

```javascript
const playProgression = useCallback(async () => { ... }, [playing, tempo, progression, synth]);
```

Starts or stops playback of the current chord progression.

**Parameters:** None
**Returns:** None (controls audio playback)

### exportMIDI

```javascript
const exportMIDI = useCallback(() => { ... }, [progression]);
```

Exports the current chord progression as a MIDI file.

**Parameters:** None
**Returns:** None (triggers file download)

## UI Components

The component renders a form with the following elements:

- Key selection dropdown
- Tempo input
- Progression length input
- Complexity slider
- Generate, Play/Stop, and Export MIDI buttons
- Display of the generated chord progression

## Usage Example

To use this component in another part of the application:

```jsx
import ChordProgression from './components/ChordProgression';

function App() {
  return (
    <div>
      <h1>Music Composition App</h1>
      <ChordProgression />
    </div>
  );
}
```

## Notes

- The component initializes a Tone.js PolySynth on mount and disposes of it on unmount.
- The chord progression generation takes into account the selected complexity level, avoiding repetition for higher complexity settings.
- The component uses Chakra UI for styling and layout.

## Future Improvements

- Add more customization options for the synth sound
- Implement saving and loading of favorite progressions
- Integrate with other components like NotationEditor for visual representation of chords

This component plays a crucial role in the music composition application, providing an interactive way for users to experiment with chord progressions and potentially use them in their compositions.