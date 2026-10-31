import React from 'react';

interface Props {
  temp: number;
  setTemp: (temp: number) => void;
  initExpansion: () => void;
}

export default function Controls({ temp, setTemp, initExpansion }: Props) {
  return (
    <div className="bg-neutral-800 p-4 text-white flex gap-4">
      <button onClick={initExpansion} className="bg-blue-600 px-4 py-2 rounded">Initiate Expansion</button>
      <div className="flex items-center gap-2">
        <label>Temperature:</label>
        <input type="range" min="0" max="1000" value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
      </div>
    </div>
  );
}
