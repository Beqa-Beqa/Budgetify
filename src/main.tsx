import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "./index.css";
import GeneralContextProvider from './Contexts/GeneralContextProvider.tsx';
import AuthContextProvider from './Contexts/AuthContextProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GeneralContextProvider>
    <AuthContextProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </AuthContextProvider>
  </GeneralContextProvider>
)
