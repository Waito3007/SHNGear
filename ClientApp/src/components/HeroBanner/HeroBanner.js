import React, { useState, useEffect } from "react";

const HeroBanner = ({ data }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState("ONLINE");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <section className="relative h-screen bg-black text-white overflow-hidden font-mono">
      {/* Tech Background Layer */}
      <div className="absolute inset-0 bg-black">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Original Background with overlay */}
        {data.background_type === "video" ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
            src={data.background_url}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${data.background_url})` }}
          ></div>
        )}
      </div>

      {/* Tech Header */}
      <div className="absolute top-0 left-0 right-0 p-6 border-b border-white border-opacity-20">
        <div className="flex justify-between items-center text-xs uppercase tracking-wider">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>STATUS: {systemStatus}</span>
            </div>
            <div className="text-white text-opacity-60">
              SHN GEAR SYSTEM V2.0
            </div>
          </div>
          <div className="text-white">{formatTime(currentTime)}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center h-full px-4 text-center">
        {/* System Indicator */}
        <div className="mb-8 text-xs uppercase tracking-widest text-white text-opacity-60 border border-white border-opacity-20 px-4 py-2">
          [[ BẮT ĐẦU MUA SẮM ]]
        </div>

        {/* Main Title */}
        <div className="mb-6 relative">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold uppercase tracking-wider text-white leading-none">
            <span className="relative inline-block">
              {data.headline || "SHN GEAR"}
              {/* Glitch effect overlay */}
              <span className="absolute inset-0 opacity-20 text-blue-400 transform translate-x-1 translate-y-1">
                {data.headline || "SHN GEAR"}
              </span>
            </span>
          </h1>

          {/* Tech decorations */}
          <div className="absolute -top-2 -left-4 text-xs text-white text-opacity-40">
            [01]
          </div>
          <div className="absolute -bottom-2 -right-4 text-xs text-white text-opacity-40">
            [END]
          </div>
        </div>

        {/* Subtitle */}
        <div className="mb-8 max-w-3xl">
          {/* <div className="text-xs uppercase tracking-widest text-white text-opacity-60 mb-2">
            --- MO TA HE THONG ---
          </div> */}
          <p className="text-lg md:text-xl text-white text-opacity-80 leading-relaxed">
            {data.slogan || "CONG NGHE TIEN TIEN - CHAT LUONG VUOT TROI"}
          </p>
        </div>

        {/* Tech Stats Bar */}
        {/* <div className="mb-8 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wider">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400"></div>
            <span>CPU: 99.9%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400"></div>
            <span>RAM: 8GB</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400"></div>
            <span>NET: 1GB/S</span>
          </div>
        </div> */}

        {/* CTA Button */}
        <div className="relative group">
          <a
            href={data.cta_link || "#"}
            className="inline-block px-8 py-4 border-2 border-white text-white bg-transparent uppercase tracking-widest text-sm font-semibold transition-all duration-300 hover:bg-white hover:text-black focus:outline-none relative overflow-hidden"
          >
            <span className="relative">
              {data.cta_text || "TRUY CAP HE THONG"}
            </span>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </a>

          {/* Button decorations */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-l border-t border-white opacity-60"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r border-b border-white opacity-60"></div>
        </div>
      </div>

      {/* Bottom Tech Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white border-opacity-20">
        <div className="flex justify-between items-center text-xs uppercase tracking-wider text-white text-opacity-60">
          <div>SHN GEAR TECHNOLOGY CORPORATION</div>
          <div className="flex items-center space-x-4">
            <span>PHIEN BAN: 2.0.1</span>
            <span>|</span>
            <span>
              BUILD: #{new Date().getFullYear()}.
              {String(new Date().getMonth() + 1).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Scanning line animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
    </section>
  );
};

export default HeroBanner;
