import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
/* 
Este código crea la raiz de la aplicación React y renderiza el componente App. 
El componente App es el componente principal de la aplicación y contiene todos los demás componentes.
La aplicación está envuelta en un StrictMode, que ayuda a detectar problemas en la aplicación.
La aplicación está envuelta en un BrowserRouter, que permite la navegación entre las diferentes páginas de la aplicación.
La aplicación está envuelta en un AppProvider, que proporciona el contexto de la aplicación a los componentes hijos.
La aplicación está envuelta en un ModalProvider, que proporciona el contexto de los modales a los componentes hijos.
EN RESUMEN es el enchufe que conecta la app a la corriente (el navegador).
*/
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
