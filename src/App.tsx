/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Smartphone, 
  Tv, 
  Coins, 
  Award, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  Bell,
  RefreshCw,
  User,
  PenSquare,
  Edit3,
  Save,
  CreditCard,
  ArrowRight,
  Lock,
  Check,
  Loader2,
  Briefcase,
  History
} from 'lucide-react';

import { ViewState } from './types';
import BkashBalance from './components/BkashBalance';
import ActiveAccount from './components/ActiveAccount';
import AdPlayer from './components/AdPlayer';
import { playTapSound, playSuccessChime } from './utils/audio';

export default function App() {
  // Load state from local storage so progress is saved
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('taka_earnings_balance');
    return saved ? parseFloat(saved) : 0;
  });

  const [isActive, setIsActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('taka_active_status');
    return saved === 'true';
  });

  const [adsWatched, setAdsWatched] = useState<number>(() => {
    const saved = localStorage.getItem('taka_ads_watched_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [view, setView] = useState<ViewState>('dashboard');
  const [showCelebration, setShowCelebration] = useState(false);
  const [recentEarning, setRecentEarning] = useState(0);
  
  // Custom states added for tabs, editable username, and withdrawal option
  const [activeTab, setActiveTab] = useState<'work' | 'profile'>('work');
  
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('taka_user_name') || 'সাজ্জাদুল হাসান আরাফি';
  });

  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem('taka_user_id') || 'BD982525';
  });

  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(() => {
    const saved = localStorage.getItem('taka_ads_watched_today');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [yesterdayIncome, setYesterdayIncome] = useState<number>(() => {
    const saved = localStorage.getItem('taka_yesterday_income');
    const adCount = localStorage.getItem('taka_ads_watched_count');
    const watched = adCount ? parseInt(adCount, 10) : 0;
    // For general cleanups or if it has the mock 380 value, fallback to 0
    if (watched === 0 || !saved || parseFloat(saved) === 380) {
      localStorage.setItem('taka_yesterday_income', '0');
      return 0;
    }
    return parseFloat(saved);
  });

  const [withdrawHistory, setWithdrawHistory] = useState<Array<{
    id: string;
    amount: number;
    method: 'bkash' | 'nagad';
    number: string;
    date: string;
    status: 'Pending' | 'Succeeded';
  }>>(() => {
    const saved = localStorage.getItem('taka_withdraw_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate dynamic total income accurately in sync with balance and withdrawals
  const totalWithdrawn = withdrawHistory.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = balance + totalWithdrawn;

  // Profile View form states and withdrawal configuration
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNameField, setEditNameField] = useState(userName);
  const [editIdField, setEditIdField] = useState(userId);

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNumber, setWithdrawNumber] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState('');
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState('');

  // Confetti canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('taka_earnings_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('taka_active_status', isActive.toString());
  }, [isActive]);

  useEffect(() => {
    localStorage.setItem('taka_ads_watched_count', adsWatched.toString());
  }, [adsWatched]);

  useEffect(() => {
    localStorage.setItem('taka_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('taka_user_id', userId);
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('taka_ads_watched_today', adsWatchedToday.toString());
  }, [adsWatchedToday]);

  useEffect(() => {
    localStorage.setItem('taka_yesterday_income', yesterdayIncome.toString());
  }, [yesterdayIncome]);

  useEffect(() => {
    localStorage.setItem('taka_withdraw_history', JSON.stringify(withdrawHistory));
  }, [withdrawHistory]);

  // Handle Watch Ad Button Click
  const handleWatchAdClick = () => {
    playTapSound();
    if (!isActive) {
      // If account not active, show premium required activation page
      setView('active-account');
    } else {
      // Start watching ad
      setView('ad-watching');
    }
  };

  // Handle successful ad completion
  const handleAdComplete = () => {
    const reward = 19;
    setBalance(prev => prev + reward);
    setAdsWatched(prev => prev + 1);
    setAdsWatchedToday(prev => prev + 1); // Increments today's counter dynamically
    setRecentEarning(reward);
    setView('dashboard');
    setShowCelebration(true);
    
    // Play success chime
    playSuccessChime();

    // Trigger canvas micro-confetti burst
    setTimeout(() => {
      triggerConfetti();
    }, 100);

    // Close announcement after 4.5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 4500);
  };

  // Handle Profile information edit and save
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    if (!editNameField.trim()) return;
    setUserName(editNameField.trim());
    if (editIdField.trim()) {
      setUserId(editIdField.trim());
    }
    setIsEditingProfile(false);
    playSuccessChime();
  };

  // Handle cash withdraw form submission
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount)) {
      setWithdrawErrorMsg('অনুগ্রহ করে কাঙ্ক্ষিত টাকার সংখ্যা সঠিকভাবে লিখুন।');
      return;
    }
    
    if (amount < 450) {
      setWithdrawErrorMsg('দুঃখিত! আপনি ৪৫০ টাকার নিচে উইথড্র করতে পারবেন না।');
      return;
    }
    
    if (amount > balance) {
      setWithdrawErrorMsg(`দুঃখিত! আপনার ব্যালেন্সে পর্যাপ্ত টাকা নেই। আপনার মোট ব্যালেন্স: ৳${balance.toFixed(2)}।`);
      return;
    }
    
    if (!withdrawNumber.trim() || withdrawNumber.trim().length < 11) {
      setWithdrawErrorMsg('অনুগ্রহ করে সঠিক ১১-ডিজিটের বিকাশ বা নগদ নম্বর লিখুন।');
      return;
    }

    // Pass validates!
    setWithdrawErrorMsg('');
    setWithdrawSuccessMsg('');
    setSubmittingWithdraw(true);

    setTimeout(() => {
      // Deduct balance and construct transaction
      setBalance(prev => prev - amount);
      const newTx = {
        id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        amount: amount,
        method: withdrawMethod,
        number: withdrawNumber,
        date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        status: 'Pending' as const
      };
      
      setWithdrawHistory(prev => [newTx, ...prev]);
      setSubmittingWithdraw(false);
      playSuccessChime();
      setWithdrawSuccessMsg(`ধন্যবাদ! আপনার উইথড্র রিকোয়েস্ট সফলভাবে গ্রহণ করা হয়েছে। ৳${amount.toFixed(2)} আপনার ${withdrawMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} নম্বরে (${withdrawNumber}) আগামী ১২ ঘণ্টার মধ্যে পাঠানো হবে।`);
      
      // Reset input fields
      setWithdrawAmount('');
      setWithdrawNumber('');
    }, 2000);
  };

  // Confetti Physics engine
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const colors = ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Spawn 70 confetti particles
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height - 20,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.98; // wind resistance
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height && p.y > -50 && p.x > -50 && p.x < canvas.width + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-100 to-zinc-50 text-slate-800 flex flex-col justify-start selection:bg-pink-100 font-sans pb-28">
      {/* Absolute top particle canvas for reward popups */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Dynamic Canvas Celebration Notification banner */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ y: -60, scale: 0.95, opacity: 0 }}
            animate={{ y: 24, scale: 1, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-full px-4"
          >
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-4 rounded-2xl shadow-2xl text-white text-center flex flex-col items-center gap-1.5 border border-emerald-400">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>বিজ্ঞাপন আয়ের টাকা যোগ হয়েছে</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base">
                আপনার ব্যালেন্সে সফলভাবে <strong className="text-yellow-200 text-lg">৳ ১৯.০০</strong> যুক্ত হয়েছে!
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                ব্যালেন্স জানতে উপরে পিন করা বিকাশ ব্যালেন্স ওভারে ক্লিক বা ট্যাপ করুন।
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern High-Fidelity Website Top Navigation Bar */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-40 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e2136e] to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/10">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black text-[#e2136e] tracking-tight flex items-center gap-1">
                  <span>অ্যাড-ইনকাম</span>
                  <span className="text-[10px] bg-pink-100 text-[#e2136e] font-black px-1.5 py-0.5 rounded-md uppercase">PRO</span>
                </h1>
                
                {/* Account Active / Inactive Status Badge next to title */}
                {isActive ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-805 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 self-start sm:self-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    সক্রিয়
                  </span>
                ) : (
                  <span className="text-[10px] bg-rose-50 text-[#e2136e] border border-rose-100 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 self-start sm:self-auto animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e2136e]"></span>
                    নিষ্ক্রিয়
                  </span>
                )}
              </div>
              <p className="text-[9px] text-gray-400 font-bold tracking-wider -mt-0.5 uppercase">Bangladesh's Premier Ad Portal</p>
            </div>
          </div>

          {/* Desktop Nav tags */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
            <a href="#" className="text-[#e2136e] transition-colors">হোমপেজ</a>
            <a href="#rules" className="hover:text-[#e2136e] transition-colors">নিয়ম কানুন</a>
            <a href="#stats" className="hover:text-[#e2136e] transition-colors">রেকর্ড খাতা</a>
            <a href="#support" className="hover:text-[#e2136e] transition-colors">সাপোর্ট ফোরাম</a>
          </nav>

          {/* User Section & Compact Balance Display */}
          <div className="flex items-center gap-2">
            <div className="bg-[#e2136e]/10 border border-[#e2136e]/20 text-[#e2136e] px-4 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-extrabold shadow-sm select-none">
              <Coins className="w-4 h-4 text-[#e2136e] shrink-0" />
              <span>সহজ লভ্যাংশ: ৳{balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Welcome Hero Grid Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#e2136e]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-pink-500/20">
                বিজ্ঞাপন আয়ের ডিজিটাল মঞ্চ
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                ঘরে বসে ভিডিও বিজ্ঞাপন দেখুন এবং <span className="text-pink-400">সহজে টাকা আয় করুন!</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                প্রতিটি বিজ্ঞাপন সফলভাবে দেখার সাথে সাথে আপনার একাউন্টে যোগ হবে নিশ্চিত ১৯ টাকা। কোন লিমিট ছাড়াই দিনে যতখুশি কাজ করুন। টাকা সরাসরি আপনার বিকাশ বা নগদ ওয়ালেটে ক্যাশআউট করুন।
              </p>
            </div>

            {/* Quick overview metric box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 shrink-0 min-w-0 md:min-w-[280px] grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">রিয়েল-টাইম স্ট্যাটাস</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-emerald-400 font-mono">লাইভ সার্ভার</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">আজকের তারিখ</p>
                <p className="text-xs font-bold text-slate-200 mt-1 font-mono tracking-wide">
                  {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Layout Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDEBAR (Span 1) */}
          <div className="space-y-6 lg:col-span-1">

            {/* Interactive bKash Pocket Personal Wallet */}
            <BkashBalance balance={balance} />
            
            {/* Account Information Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-pink-600">ইউজার প্রোফাইল</span>
                  <h3 className="font-extrabold text-sm text-slate-800">{userName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wide">UID: {userId}</p>
                </div>

                {isActive ? (
                  <div className="px-2.5 py-1 bg-green-50 border border-green-100 text-green-600 text-[10px] font-black rounded-lg flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ভেরিফাইড সক্রিয়</span>
                  </div>
                ) : (
                  <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-black rounded-lg flex items-center gap-1 shrink-0 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>নিষ্ক্রিয় (Inactive)</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-slate-100 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[10px] text-slate-500 font-medium">বিজ্ঞাপন দেখা</p>
                  <p className="text-base font-extrabold font-mono tracking-wide text-slate-800 mt-0.5">{adsWatched} বার</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[10px] text-slate-500 font-medium">আজকের আয়</p>
                  <p className="text-base font-extrabold font-mono tracking-wide text-green-600 mt-0.5">৳ {(adsWatched * 19).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Platform rules / Step-by-Step Instructions card */}
            <div id="rules" className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-black text-gray-800 uppercase tracking-wide text-xs flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
                <TrendingUp className="w-4 h-4 text-pink-600" />
                কিভাবে টাকা আয় করবেন?
              </h4>
              
              <div className="space-y-4 text-gray-600 leading-relaxed text-[11px] sm:text-xs">
                <div className="flex gap-3">
                  <span className="w-5 h-5 bg-pink-100 text-[#e2136e] rounded-full flex items-center justify-center font-extrabold text-[11px] shrink-0">১</span>
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-slate-800">অ্যাকাউন্ট ভেরিফিকেশন করুন</h5>
                    <p className="text-slate-500 mt-0.5">নিষ্ক্রিয় আইডি সক্রিয় করতে প্রথমে <strong>Active Your Account</strong> ফোল্ডারে বিকাশ/নগদে ২০ টাকা অ্যাক্টিভেশন ফি প্রদান করুন।</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-5 h-5 bg-pink-100 text-[#e2136e] rounded-full flex items-center justify-center font-extrabold text-[11px] shrink-0">২</span>
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-slate-800">বিজ্ঞাপন দেখুন</h5>
                    <p className="text-slate-500 mt-0.5">অ্যাকাউন্ট সক্রিয় করার পর <strong>"এড দেখুন"</strong> বাটনে ক্লিক করে আকর্ষণীয় এবং মজাদার বিজ্ঞাপনের পেজ ওপেন করুন।</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-5 h-5 bg-pink-100 text-[#e2136e] rounded-full flex items-center justify-center font-extrabold text-[11px] shrink-0">৩</span>
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-slate-800">ব্যালেন্স বোনাস গ্রহন করুন</h5>
                    <p className="text-slate-500 mt-0.5">বিজ্ঞাপন সম্পূর্ণ দেখা হলে সাথে সাথে ১৯ টাকা ক্যাশ সরাসরি আপনার মেইন ব্যালেন্সে যুক্ত করা হবে।</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Live Logs */}
            <div className="bg-slate-900 text-slate-300 rounded-3xl p-5 shadow-sm font-mono text-[10px] space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-pink-400">LIVE WORK FEED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-2 text-slate-400 leading-tight">
                <p><span className="text-emerald-400">✓</span> UID: BD9024 - Active Success</p>
                <p><span className="text-emerald-400">✓</span> UID: BD5128 - Watched 14 Ads</p>
                <p><span className="text-[#e2136e]">⚠</span> UID: BD4120 - Wrong TrxID submitted (Rejected)</p>
                <p><span className="text-emerald-400">✓</span> UID: BD2941 - Watched Ad reward 19Tk credited</p>
              </div>
            </div>

          </div>

          {/* MAIN CONTENT AREA (Span 2) */}
          <div className="lg:col-span-2 space-y-6 bg-white border border-slate-250/80 rounded-3xl p-6 shadow-sm min-h-[500px] flex flex-col justify-start">
            
            {view === 'dashboard' && (
              activeTab === 'work' ? (
                <motion.div
                  key="work-tab animate-fade-in"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 flex flex-col flex-1"
                >
                  {/* Active/Inactive visual warning card */}
                  {!isActive && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-3 items-start sm:items-center">
                        <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">আপনার অ্যাকাউন্ট বর্তমানে নিষ্ক্রিয় অবস্থায় রয়েছে</h4>
                          <p className="text-xs text-slate-600 mt-0.5 leading-normal">বিজ্ঞাপন দেখে টাকা আয় শুরু করার জন্য প্রথমে ২০ টাকা দিয়ে অ্যাকাউন্ট একটিভ করুন।</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          playTapSound();
                          setView('active-account');
                        }}
                        className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Active Your Account</span>
                      </button>
                    </div>
                  )}

                  {/* Dashboard Center Statistics Block */}
                  <div id="stats" className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#e2136e] flex items-center justify-center shrink-0">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">চলতি ব্যালেন্স</p>
                        <p className="text-sm font-extrabold text-slate-800 font-mono tracking-wide">৳ {balance.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Huge interactive action segment with "এড দেখুন" button */}
                  <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 bg-slate-50 border border-slate-100 rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-[#e2136e] shadow-sm animate-bounce">
                      <Tv className="w-8 h-8" />
                    </div>
                    
                    <div className="max-w-md space-y-1.5">
                      <h3 className="font-extrabold text-lg text-slate-800">বিজ্ঞাপন দেখার ও আয় বৃদ্ধির কনসোল</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        নিচের বড় বোতামটিতে ক্লিক করলে একটি র্যান্ডম প্রিমিয়াম বিজ্ঞাপন চালু হবে। বিজ্ঞাপনটি সম্পূর্ণ দেখার শেষ মুহূর্ত পর্যন্ত অপেক্ষা করুন। বিজ্ঞাপন শেষে ১৯ টাকা আপনার ব্যালেন্সে যোগ হবে!
                      </p>
                    </div>

                    <button
                      id="watch-ad-main-btn"
                      onClick={handleWatchAdClick}
                      className={`px-12 py-5 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-2.5 transition-all hover:opacity-95 transform hover:scale-[1.02] cursor-pointer text-base uppercase tracking-wider ${
                        isActive 
                          ? 'bg-gradient-to-r from-pink-600 via-[#e2136e] to-rose-500 shadow-pink-500/10' 
                          : 'bg-[#e2136e] shadow-pink-500/10'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current text-white stroke-none" />
                      <span className="font-sans">এড দেখুন</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="profile-tab anim"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 flex flex-col flex-1"
                >
                  {/* Dynamic User Profile Card */}
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/55 rounded-3xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      {/* Name / ID Profile Information View and Edit Form */}
                      <div className="w-full">
                        {!isEditingProfile ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#e2136e] flex items-center justify-center font-black text-lg shadow-sm border border-pink-200/50">
                                {userName.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                                  <span>{userName}</span>
                                </h3>
                                <p className="text-xs text-slate-400 font-mono font-bold">আইডি নম্বর: {userId}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                onClick={() => {
                                  playTapSound();
                                  setEditNameField(userName);
                                  setEditIdField(userId);
                                  setIsEditingProfile(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-pink-500 hover:text-pink-600 rounded-xl text-[10.5px] font-black text-slate-500 transition-all cursor-pointer shadow-xs"
                              >
                                <PenSquare className="w-3.5 h-3.5" />
                                <span>প্রোফাইল সংশোধন করুন</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm('আপনি কি নিশ্চিত যে আপনি সমস্ত ইনকাম ও হিস্ট্রি রিসেট করতে চান?')) {
                                    playTapSound();
                                    localStorage.clear();
                                    window.location.reload();
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100/50 hover:bg-rose-100 hover:text-rose-700 rounded-xl text-[10.5px] font-black text-rose-600 transition-all cursor-pointer shadow-xs"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>ডাটা রিসেট করুন</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleProfileSave} className="space-y-3 max-w-md bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                            <h4 className="text-xs font-black text-pink-600 uppercase tracking-wider">তথ্য সংশোধন ফর্ম</h4>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold uppercase">ইউজার নাম (Name)</label>
                              <input
                                type="text"
                                value={editNameField}
                                onChange={(e) => setEditNameField(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                required
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-bold uppercase">আইডি নম্বর (ID Code)</label>
                              <input
                                type="text"
                                value={editIdField}
                                onChange={(e) => setEditIdField(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                required
                              />
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>সংরক্ষণ করুন</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playTapSound();
                                  setIsEditingProfile(false);
                                }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all cursor-pointer"
                              >
                                <span>বাতিল</span>
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* High Quality Bengali Stats Matrix Grid */}
                  <div className="grid grid-cols-2 gap-3.5">
                    
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-pink-100 text-[#e2136e] flex items-center justify-center shrink-0">
                          <Coins className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">আজকের ইনকাম</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-800 font-mono tracking-wide">৳ {(adsWatchedToday * 19).toFixed(2)}</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">গতকালের ইনকাম</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-800 font-mono tracking-wide">৳ {yesterdayIncome.toFixed(2)}</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">মোট ইনকাম</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-800 font-mono tracking-wide">৳ {totalIncome.toFixed(2)}</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <Tv className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">আজকের অ্যাড দেখা</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-800 font-mono tracking-wide">{adsWatchedToday} বার</p>
                    </div>

                  </div>

                  {/* Elegant "Withdraw" list option style exactly matching your photo */}
                  <div className="border border-slate-200/50 rounded-3xl overflow-hidden bg-white shadow-xs">
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50/50 to-indigo-50/10 flex items-center justify-between border-b border-slate-100">
                      
                      {/* Left: Custom photo design mockup with light-blue credit icon */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-2xl bg-[#e0f1fe] text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 relative">
                          {/* Inner ticket cash icon */}
                          <CreditCard className="w-5 h-5 text-sky-600" />
                          <div className="absolute -bottom-0.5 -right-0.5 bg-sky-500 text-white rounded-full p-0.5 border border-sky-100">
                            <PenSquare className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-[#1e293b] tracking-wider uppercase font-mono">Withdraw</h4>
                          <p className="text-[10px] text-slate-400 font-bold -mt-0.5">সহজে বিকাশ ও নগদে টাকা উত্তোলন করুন</p>
                        </div>
                      </div>

                      {/* Cashout toggle trigger button */}
                      <button
                        onClick={() => {
                          playTapSound();
                          setShowWithdrawForm(prev => !prev);
                          setWithdrawSuccessMsg('');
                          setWithdrawErrorMsg('');
                        }}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white hover:text-white rounded-xl text-xs font-black transition-all shadow-md shadow-sky-600/10 shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{showWithdrawForm ? 'বন্ধ করুন' : 'উত্তোলন করুন'}</span>
                        <ArrowRight className={`w-3.5 h-3.5 transform transition-transform ${showWithdrawForm ? 'rotate-90' : 'rotate-0'}`} />
                      </button>

                    </div>

                    {/* Expandable cashout drawer element */}
                    {showWithdrawForm && (
                      <div className="p-5 bg-slate-50/80 border-t border-slate-100 space-y-4">
                        
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] text-blue-700 leading-normal font-medium">
                          <strong>নিয়মাবলি:</strong> আপনার অ্যাকাউন্টে সর্বনিম্ন <strong>৳ ৪৫০.০০</strong> থাকলে টাকা উত্তোলন করতে পারবেন। সকল উইথড্র পেন্ডিং রিকোয়েস্ট ১২ ঘণ্টার মধ্যে ভেরিফাই করে সফলভাবে পাঠিয়ে দেওয়া হয়।
                        </div>

                        {withdrawSuccessMsg && (
                          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>উইথড্র রিকোয়েস্ট সফল হয়েছে!</span>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed">{withdrawSuccessMsg}</p>
                          </div>
                        )}

                        {withdrawErrorMsg && (
                          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                            <p className="font-bold">{withdrawErrorMsg}</p>
                          </div>
                        )}

                        {/* Interactive Withdrawal submission form */}
                        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                          
                          {/* Method Selector Option */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider">উইথড্র মেথড সিলেক্ট করুন (Method)</label>
                            <div className="grid grid-cols-2 gap-3">
                              
                              <button
                                type="button"
                                onClick={() => { playTapSound(); setWithdrawMethod('bkash'); }}
                                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all border cursor-pointer ${
                                  withdrawMethod === 'bkash'
                                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-500 shadow-md shadow-pink-500/10'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-white block" />
                                <span>বিকাশ (bKash)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => { playTapSound(); setWithdrawMethod('nagad'); }}
                                className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all border cursor-pointer ${
                                  withdrawMethod === 'nagad'
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-md shadow-orange-500/10'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-white block" />
                                <span>নগদ (Nagad)</span>
                              </button>

                            </div>
                          </div>

                          {/* Inputs field block */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 font-black uppercase">উত্তোলনের পরিমাণ (টাকা)</label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                                <input
                                  type="number"
                                  min="450"
                                  step="1"
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                  placeholder="যেমন: ৪৫০"
                                  className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-250/90 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 font-black uppercase">টাকা পাওয়ার ব্যক্তিগত নম্বর</label>
                              <input
                                type="tel"
                                value={withdrawNumber}
                                onChange={(e) => setWithdrawNumber(e.target.value)}
                                placeholder="যেমন: ০১৭XXXXXXXX"
                                className="w-full px-3 py-2.5 bg-white border border-slate-250/90 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                                required
                              />
                            </div>

                          </div>

                          {/* Submit withdraw trigger button */}
                          <button
                            type="submit"
                            disabled={submittingWithdraw || balance < 450}
                            className={`w-full py-3.5 rounded-xl font-sans font-black text-xs text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              balance >= 450
                                ? 'bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/10'
                                : 'bg-slate-300 cursor-not-allowed'
                            }`}
                          >
                            {submittingWithdraw ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                <span>সার্ভার প্রসেস করছে...</span>
                              </>
                            ) : (
                              <>
                                <span>উইথড্র রিকোয়েস্ট সাবমিট করুন</span>
                              </>
                            )}
                          </button>

                        </form>
                      </div>
                    )}

                  </div>

                  {/* Withdraw History Section logs */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-[#334155] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <History className="w-4 h-4 text-slate-500" />
                      <span>উইথড্র রেকর্ড ও ক্যাশআউট হিস্ট্রি</span>
                    </h4>

                    {withdrawHistory.length === 0 ? (
                      <div className="p-5 text-center text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl font-medium">
                        কোনো সক্রিয় উইথড্র হিস্ট্রি পাওয়া যায়নি। সর্বনিম্ন ৪৫০ টাকা হলে প্রথম উইথড্র রিকোয়েস্ট করতে পারবেন।
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {withdrawHistory.map((tx) => (
                          <div key={tx.id} className="p-3 bg-white border border-slate-205/85 rounded-xl flex items-center justify-between shadow-xs">
                            <div className="space-y-0.5">
                              <p className="text-xs font-black text-slate-800">
                                {tx.method === 'bkash' ? 'বিকাশ' : 'নগদ'} উইথড্র রিকোয়েস্ট
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {tx.date} | নম্বর: {tx.number}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black font-mono text-rose-500 shrink-0">
                                - ৳ {tx.amount.toFixed(2)}
                              </p>
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mt-0.5 animate-pulse">
                                {tx.status === 'Pending' ? 'পেন্ডিং' : 'সফল'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </motion.div>
              )
            )}

            {view === 'active-account' && (
              <AnimatePresence mode="wait">
                <ActiveAccount
                  onBack={() => setView('dashboard')}
                  onActivate={() => {
                    setIsActive(true);
                    setView('dashboard');
                  }}
                  isActive={isActive}
                />
              </AnimatePresence>
            )}

            {view === 'ad-watching' && (
              <AnimatePresence mode="wait">
                <AdPlayer
                  onComplete={handleAdComplete}
                  onCancel={() => {
                    playTapSound();
                    setView('dashboard');
                  }}
                />
              </AnimatePresence>
            )}

          </div>

        </div>

      </main>

      {/* Website Footer block */}
      <footer id="support" className="bg-white border-t border-slate-200 mt-16 py-6 text-center text-xs text-slate-400 font-medium pb-12">
        <p>© {new Date().getFullYear()} অ্যাড-ইনকাম বাংলাদেশ প্রো এলটিডি। সর্বস্বত্ব সংরক্ষিত।</p>
        <p className="mt-1">কোনো সমস্যা বা সাহায্যের জন্য দয়া করে আমাদের ভেরিফাইড সাপোর্ট লাইনে মেইল বা যোগাযোগ করুন।</p>
      </footer>

      {/* Persistent Premium Sticky Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 z-40 flex justify-center gap-16 sm:gap-24 shadow-[0_-5px_20px_rgba(0,0,0,0.06)]">
        
        <button
          onClick={() => {
            playTapSound();
            setActiveTab('work');
            // If they are inside active/ad views, return to dashboard gracefully
            if (view !== 'dashboard') setView('dashboard');
          }}
          className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 group ${
            activeTab === 'work' 
              ? 'text-[#e2136e] scale-105 font-sans font-black' 
              : 'text-slate-400 hover:text-slate-600 font-bold'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-200 ${
            activeTab === 'work' ? 'bg-pink-50' : 'group-hover:bg-slate-50'
          }`}>
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-wide">Work</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            setActiveTab('profile');
            if (view !== 'dashboard') setView('dashboard');
          }}
          className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 group ${
            activeTab === 'profile' 
              ? 'text-[#e2136e] scale-105 font-sans font-black' 
              : 'text-slate-400 hover:text-slate-600 font-bold'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all duration-250 ${
            activeTab === 'profile' ? 'bg-pink-50' : 'group-hover:bg-slate-50'
          }`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[11px] tracking-wide">My Profile</span>
        </button>

      </div>
    </div>
  );
}
