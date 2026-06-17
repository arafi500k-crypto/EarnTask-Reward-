/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, User, Wallet, Sparkles } from 'lucide-react';
import { playTapSound, playBalanceRevealSound } from '../utils/audio';

interface BkashBalanceProps {
  balance: number;
}

export default function BkashBalance({ balance }: BkashBalanceProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = () => {
    if (isRevealed) return; // already revealed
    
    // Play audio cues
    playTapSound();
    setTimeout(() => {
      playBalanceRevealSound();
    }, 150);

    setIsRevealed(true);

    // Auto-hide after 3.5 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsRevealed(false);
    }, 3800);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-[#c4155c] text-white rounded-2xl shadow-xl overflow-hidden border border-[#d61868] relative">
      {/* bKash Header Ribbon */}
      <div className="h-2 bg-[#9c0d48] w-full" />
      
      <div className="p-4 flex items-center justify-between gap-4">
        {/* Left Side: Mock Profile */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <User className="w-5 h-5 text-pink-100" />
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-tight text-white/95">সাজ্জাদুল হাসান</h4>
            <span className="text-[11px] text-pink-200 font-mono tracking-wide">01739-******</span>
          </div>
        </div>

        {/* Right Side: bKash Touch-to-Reveal Balance Bar */}
        <div className="flex flex-col items-end">
          <button
            id="balance-reveal-btn"
            onClick={handleTap}
            className="focus:outline-none select-none relative group"
            aria-label="Tap to view balance"
          >
            <motion.div
              layout
              className="bg-white text-[#e2136e] rounded-full pl-3 pr-4 py-1.5 flex items-center gap-2 cursor-pointer shadow-md border border-pink-50/10 min-w-[170px]"
              transition={{ type: 'spring', stiffness: 220, damping: 25 }}
            >
              {/* bKash Icon circle */}
              <div className="w-6 h-6 rounded-full bg-[#e2136e] flex items-center justify-center text-white shrink-0 shadow-inner">
                <Wallet className="w-3.5 h-3.5 text-white" />
              </div>

              <div className="overflow-hidden relative flex-1 text-center">
                <AnimatePresence mode="wait">
                  {!isRevealed ? (
                    <motion.span
                      key="collapsed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18 }}
                      className="text-xs font-bold whitespace-nowrap block select-none tracking-tight text-[#e2136e]"
                    >
                      ব্যালেন্স জানতে ট্যাপ করুন
                    </motion.span>
                  ) : (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex items-center justify-center gap-1 font-bold font-mono text-sm tracking-wide text-[#e2136e] select-none"
                    >
                      <span>৳</span>
                      <span>{balance.toFixed(2)}</span>
                      <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse ml-0.5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Sweep light animation for collapsed state */}
            {!isRevealed && (
              <span className="absolute inset-0 w-full h-full rounded-full overflow-hidden pointer-events-none">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite] block" />
              </span>
            )}
          </button>
          
          <span className="text-[10px] text-pink-200 mt-1 mr-2 tracking-wide font-sans">
            ব্যালেন্স দেখতে ক্লিক করুন
          </span>
        </div>
      </div>

      {/* Decorative details */}
      <div className="absolute right-3 bottom-0 opacity-10 pointer-events-none">
        <Coins className="w-16 h-16 text-white" />
      </div>
    </div>
  );
}
