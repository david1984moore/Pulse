import { useState, useEffect } from "react";

interface TypeAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onCharacterTyped?: () => void;
}

export function TypeAnimation({ 
  text, 
  speed = 20, 
  onComplete, 
  onCharacterTyped 
}: TypeAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset animation when text changes
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        // Call the callback after each character is typed
        onCharacterTyped?.();
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete, onCharacterTyped]);

  return <>{displayedText}</>;
}