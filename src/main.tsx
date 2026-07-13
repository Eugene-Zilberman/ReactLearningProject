import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useState } from 'react';
async function enableMocking(): Promise<void> {
  const { worker } = await import('./mocks/browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

function AppWrapper() {
  const [appKey, setAppKey] =
    useState(0);

  function restartApp(): void {
    setAppKey(currentKey =>
      currentKey + 1
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={restartApp}
      >
        Обновить список
      </button>

      <App key={appKey} />
    </>
  );
}
await enableMocking();
ReactDOM.createRoot(document.getElementById('root')!).render(

    <AppWrapper/>
  
);