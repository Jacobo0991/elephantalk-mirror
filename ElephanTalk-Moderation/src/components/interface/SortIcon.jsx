import { useState } from "react";
import { motion } from "framer-motion";

export function SortIcon({ eventClick }) {
  const [clickState, setClickState] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  const handleClick = () => {
    setIsRotated(!isRotated);
    setClickState(!clickState);
    sendClick();
  };

  const sendClick = () => {
    eventClick(clickState);
  };

  return (
    <div className="flex justify-center items-center h-6 w-6">
      <motion.svg
        onClick={handleClick}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-12 h-12 cursor-pointer"
        animate={{ rotate: isRotated ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </motion.svg>
    </div>
  );
}
