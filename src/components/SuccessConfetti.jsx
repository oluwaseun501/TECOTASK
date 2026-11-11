import { useEffect, useState } from "react";

export default function SuccessConfetti() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    // Generate 60 random confetti pieces
    const newPieces = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="confetti-wrapper">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.animationDelay,
            animationDuration: piece.animationDuration,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}