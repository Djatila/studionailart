// Componente de teste para verificar a função deleteAvailability
import React from 'react';

interface TestDeleteButtonProps {
  onDelete: (id: string) => void;
  testId: string;
}

export default function TestDeleteButton({ onDelete, testId }: TestDeleteButtonProps) {
  const handleClick = () => {
    console.log('=== TestDeleteButton clicado ===');
    console.log('ID a ser excluído:', testId);
    onDelete(testId);
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      Testar Exclusão ({testId})
    </button>
  );
}