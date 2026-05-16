import React from 'react';

const ClassroomHeatmap = ({ imgRef, imgDims, results, gridRows = 5, gridCols = 8 }) => {
  if (!imgRef.current || imgDims.width === 0) return null;

  const displayWidth = imgRef.current.clientWidth;
  const displayHeight = imgRef.current.clientHeight;
  
  const cellWidth = displayWidth / gridCols;
  const cellHeight = displayHeight / gridRows;

  // Map results to grid cells
  const grid = Array(gridRows).fill().map(() => Array(gridCols).fill(false));
  
  if (results && results.recognized) {
    const scaleX = displayWidth / imgDims.width;
    const scaleY = displayHeight / imgDims.height;

    results.recognized.forEach(item => {
      const [top, right, bottom, left] = item.location;
      const centerX = ((left + right) / 2) * scaleX;
      const centerY = ((top + bottom) / 2) * scaleY;

      const col = Math.floor(centerX / cellWidth);
      const row = Math.floor(centerY / cellHeight);

      if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
        grid[row][col] = true;
      }
    });
  }

  return (
    <svg 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 4
      }}
    >
      {grid.map((row, r) => 
        row.map((occupied, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * cellWidth}
            y={r * cellHeight}
            width={cellWidth}
            height={cellHeight}
            fill={occupied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.1)'}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
        ))
      )}
      
      {/* Legend or Title Overlay */}
      <rect x="10" y="10" width="120" height="60" rx="4" fill="rgba(0,0,0,0.6)" />
      <circle cx="25" cy="25" r="5" fill="#22c55e" />
      <text x="40" y="30" fill="white" fontSize="10">Occupied</text>
      <circle cx="25" cy="45" r="5" fill="#ef4444" />
      <text x="40" y="50" fill="white" fontSize="10">Empty Seat</text>
    </svg>
  );
};

export default ClassroomHeatmap;
