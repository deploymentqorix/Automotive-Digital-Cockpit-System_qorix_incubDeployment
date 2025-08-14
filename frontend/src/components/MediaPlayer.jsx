import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaForward, FaBackward } from "react-icons/fa";
import { motion } from "framer-motion";
import mediaData from "../data/media.json";
import { socket, sendMediaUpdate } from "../socket";

export default function MediaPlayer() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const safeMediaData = Array.isArray(mediaData) ? mediaData : [];
  const track = safeMediaData[idx];

  // This effect CONTROLS the audio hardware based on the state
  useEffect(() => {
    if (!audioRef.current || !track) return;
    if (playing) {
      audioRef.current.play().catch(e => {
        console.error("Playback failed:", e);
        setPlaying(false); // Correct the state if browser blocks play
      });
    } else {
      audioRef.current.pause();
    }
  }, [playing, idx, track]);

  // This effect LISTENS for updates from the server
  useEffect(() => {
    const handleMediaUpdate = (state) => {
      if (state.idx !== idx) setIdx(state.idx);
      if (state.playing !== playing) setPlaying(state.playing);
    };
    socket.on('mediaControl', handleMediaUpdate);
    return () => socket.off('mediaControl', handleMediaUpdate);
  }, [idx, playing]);

  // If there is no valid track, display a loading message
  if (!track) {
    return (
      <div className="bg-media rounded-2xl p-4 text-center">
        <p className="font-semibold text-white">Loading Media or Playlist is Empty...</p>
      </div>
    );
  }

  // --- Click Handlers ---

  const handleNext = () => {
    const newIndex = (idx + 1) % safeMediaData.length;
    setIdx(newIndex);
    sendMediaUpdate({ idx: newIndex, playing });
  };
  
  const handlePrev = () => {
    const newIndex = (idx - 1 + safeMediaData.length) % safeMediaData.length;
    setIdx(newIndex);
    sendMediaUpdate({ idx: newIndex, playing });
  };
  
  // THIS IS THE CORRECTED FUNCTION
  const handleTogglePlay = () => {
    const newIsPlaying = !playing;
    setPlaying(newIsPlaying);
    sendMediaUpdate({ idx, playing: newIsPlaying });
  };

  return (
    <motion.div
      className="bg-media rounded-2xl p-4 flex items-center justify-between shadow-lg"
    >
      <audio ref={audioRef} src={track.src || ""} preload="metadata" />
      
      {/* Left: Album art & info */}
      <div className="flex items-center gap-4">
        <motion.img src={track.albumArt} alt="Album Art" className="w-14 h-14 rounded-lg object-cover shadow-md" />
        <div>
          <div className="font-semibold">{track.title}</div>
          <div className="text-xs text-gray-400">{track.artist}</div>
        </div>
      </div>

      {/* Center: Controls now call the correct handlers */}
      <div className="flex items-center gap-5">
        <motion.button onClick={handlePrev} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"><FaBackward /></motion.button>
        <motion.button onClick={handleTogglePlay} className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg">{playing ? <FaPause /> : <FaPlay />}</motion.button>
        <motion.button onClick={handleNext} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"><FaForward /></motion.button>
      </div>

      {/* Right: Progress Bar */}
      <div className="hidden md:flex flex-col w-32 text-xs text-gray-400">
        <div className="h-1 bg-gray-700 rounded overflow-hidden mt-1">
          <motion.div className="h-1 bg-indigo-500" animate={{ width: playing ? '100%' : '0%' }} transition={{ duration: track.duration || 180, ease: 'linear' }} />
        </div>
      </div>
    </motion.div>
  );
}