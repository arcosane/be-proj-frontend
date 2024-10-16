import React, { useState, useEffect } from 'react';

function Navbar(props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const username = props.username

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-10 py-4 px-8 flex items-center justify-between border-b border-b-[#161616] ${isScrolled ? 'backdrop-blur-sm' : ''}`}>
      <div className="text-white">{username}</div>
      <div className="flex gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Button 1</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded-md">Button 2</button>
      </div>
    </nav>
  );
}

export default Navbar;
