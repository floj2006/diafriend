import type { ComponentType } from 'react';

// The source of truth for the app lives in GameApp.jsx.
// This wrapper keeps TypeScript-based tests/imports working without duplicating logic.
// @ts-ignore JSX module is consumed through Vite/bundler resolution.
import AppJsx from './GameApp.jsx';

const App = AppJsx as ComponentType;

export default App;
