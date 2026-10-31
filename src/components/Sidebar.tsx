import React from 'react';

export default function Sidebar({ discovered }: { discovered: string[] }) {
  return (
    <div className="w-64 bg-neutral-800 p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Discovered</h2>
      <ul>
        {discovered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
