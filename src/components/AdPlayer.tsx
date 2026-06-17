/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Volume2, ShieldCheck, RefreshCw, X, Coins, Sparkles } from 'lucide-react';
import { Ad } from '../types';
import { MOCK_ADS } from '../data/ads';
import { playTapSound, playSuccessChime } from '../utils/audio';

interface AdPlayerProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function AdPlayer({ onComplete, onCancel }: AdPlayerProps) {
  // Pick a random ad when mounted
  const [ad] = useState<Ad>(() => {
    const randomIndex = Math.floor(Math.random() * MOCK_ADS.length);
    return MOCK_ADS[randomIndex];
  });

  const [secondsLeft, setSecondsLeft] = useState(ad.duration);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start countdown
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsCompleted(true);
          playSuccessChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ad]);

  const handleClaimReward = () => {
    playTapSound();
    setIsClaimed(true);
    // Add small delay for nice animation experience
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  const progressPercentage = ((ad.duration - secondsLeft) / ad.duration) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative"
      >
        {/* Top bar with Sponsor & Countdown Timer */}
        <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-yellow-500 text-black font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
              SPONSORED AD
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono truncate max-w-[150px]">
              {ad.sponsor}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Indicator Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/50">
              <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
              <span className="text-xs font-bold font-mono min-w-[32px] text-center">
                {isCompleted ? 'Finished' : `${secondsLeft}s left`}
              </span>
            </div>

            {/* Close Button or Quit Button */}
            <button
              onClick={() => {
                playTapSound();
                onCancel();
              }}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close Ad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ad Video container wrapper */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
          {/* Mock Video Placeholder / Image Banner */}
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Glowing overlays */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent h-20 pointer-events-none" />

          {/* Sound simulation indicators */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-medium">
            <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>সিনেমাটিক প্রমোশনাল সাউন্ড এক্টিভ</span>
          </div>
        </div>

        {/* Interactive Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-500"
            style={{ width: `${progressPercentage}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        {/* Editorial Title & Rewards Call */}
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-pink-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>১০০% বিশ্বস্ত বিজ্ঞাপন মাধ্যম</span>
            </div>
            <h3 className="text-lg font-black text-white leading-snug tracking-tight">{ad.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">{ad.description}</p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500">সম্পূর্ণ দেখলে পাবেন</span>
              <span className="text-lg font-black text-green-400 flex items-center gap-1 font-mono">
                ৳১৯.০০ <Coins className="w-4 h-4 text-yellow-500" />
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!isCompleted ? (
                <motion.div
                  key="timer-active"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-800/80 border border-slate-700/50 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-400"
                >
                  <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
                  <span>উপভোগ করুন... ({secondsLeft} সে.)</span>
                </motion.div>
              ) : (
                <motion.button
                  key="reward-claim"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-xs text-slate-950 font-black tracking-wide px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                  onClick={handleClaimReward}
                  disabled={isClaimed}
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>১৯ টাকা ব্যালেন্সে যোগ করুন</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic cautionary ticker */}
        <div className="bg-slate-950/70 p-2 text-center border-t border-slate-800/40">
          <p className="text-[10px] text-slate-500">
            বিজ্ঞাপনটি বন্ধ করতে চাইলে উপরের ডান কোণায় <strong className="text-slate-400">X</strong> বাটনে ক্লিক করতে পারেন
          </p>
        </div>
      </motion.div>
    </div>
  );
}
