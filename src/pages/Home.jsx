import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `linear-gradient(
            180deg,
            #7A8B99 0%,
            #9A9A8E 15%,
            #C9B896 30%,
            #E8C078 45%,
            #F5A623 60%,
            #E88A1D 75%,
            #C4A35A 90%,
            #D4B896 100%
          )`
        }}
      />
      
      {/* Scrollable Transparent Foreground */}
      <div className="relative z-10 min-h-[200vh]">
        {/* Empty scrollable area */}
      </div>
    </div>
  );
}