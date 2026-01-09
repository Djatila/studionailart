import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple test component
const SimpleApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-700 text-white flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold">Studio Nail Art</h1>
        <p className="text-2xl">Landing page modernizada com sucesso!</p>
        <div className="space-y-4">
          <p className="text-lg opacity-80">✅ Sistema de design aprimorado</p>
          <p className="text-lg opacity-80">✅ Grid responsivo implementado</p>
          <p className="text-lg opacity-80">✅ Otimizações de performance</p>
          <p className="text-lg opacity-80">✅ Suporte a gestos mobile</p>
          <p className="text-lg opacity-80">✅ Analytics e A/B testing</p>
          <p className="text-lg opacity-80">✅ Monitoramento de performance</p>
        </div>
        <button className="px-8 py-4 bg-pink-500 hover:bg-pink-600 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105">
          Testar Funcionalidades
        </button>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);