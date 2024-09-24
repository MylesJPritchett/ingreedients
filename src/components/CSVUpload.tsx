'use client';

import { useState, ChangeEvent } from 'react';

export default function CSVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/import', {
      method: 'POST',
      body: formData,
    });

    const text = await res.text(); // Get the response as text first
    console.log("Response Status:", res.status);
    console.log("Response Text:", text);

    if (res.ok) {
      try {
        const result = JSON.parse(text); // Parse as JSON
        setMessage(`Successfully imported ${result.length} recipes.`);
      } catch (error) {
        setMessage('Error parsing response: ' + error);
      }
    } else {
      setMessage(`Error: ${text}`); // Show error message from server
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".csv" required />
        <button type="submit">Import CSV</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
