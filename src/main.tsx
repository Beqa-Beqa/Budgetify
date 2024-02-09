import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "./index.css";
import GeneralContextProvider from './Contexts/GeneralContextProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GeneralContextProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GeneralContextProvider>
)
