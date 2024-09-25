
// components/DeleteAllButton.tsx
'use client';

import { useState } from 'react';

export default function DeleteAllButton() {
  const [message, setMessage] = useState<string>('');

  const handleDeleteAll = async () => {
    const confirmation = confirm('Are you sure you want to delete all records? This action cannot be undone.');

    if (confirmation) {
      const res = await fetch('/api/delete-all', {
        method: 'DELETE',
      });

      const text = await res.text();
      if (res.ok) {
        setMessage('All records deleted successfully.');
        // Optionally, you can refresh the page or update the UI as needed.
      } else {
        setMessage('Error deleting records: ' + text);
      }
    }
  };

  return (
    <div>
      <button onClick={handleDeleteAll} className="bg-red-500 text-white p-2 rounded">
        Delete All Records
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
