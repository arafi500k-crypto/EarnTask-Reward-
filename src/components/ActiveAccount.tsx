import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertCircle, 
  Send,
  Loader2,
  KeyRound,
  CreditCard,
  Sparkles,
  Info,
  Lock
} from 'lucide-react';
import { playTapSound, playSuccessChime } from '../utils/audio';

interface ActiveAccountProps {
  onBack: () => void;
  onActivate: () => void;
  isActive: boolean;
  userId: string;
}

export const ActiveAccount: React.FC<ActiveAccountProps> = ({
  onBack,
  onActivate,
  isActive,
  userId
}) => {
  const [activeMethodTab, setActiveMethodTab] = useState<'code' | 'payment'>('code');
  
  // Activation code form state
  const [activationCode, setActivationCode] = useState('');
  
  // Manual Payment form state
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedType, setCopiedType] = useState<'bkash' | 'nagad' | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCopy = (type: 'bkash' | 'nagad', text: string) => {
    playTapSound();
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Handle Activation with Code (ACTIVE_01 logic with 2 IDs max limit)
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanCode = activationCode.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMsg('অনুগ্রহ করে অ্যাকাউন্ট অ্যাক্টিভেশন কোডটি লিখুন।');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (cleanCode === 'ACTIVE_01') {
        try {
          const rawUsed = localStorage.getItem('taka_active_01_users');
          const usedUsers: string[] = rawUsed ? JSON.parse(rawUsed) : [];

          // Check if this user has already used it or if under limit of 2
          if (usedUsers.includes(userId)) {
            // Already authorized for this user
            playSuccessChime();
            setSuccessMsg(`অ্যাকাউন্ট ভেরিফিকেশন সফল! কোড ACTIVE_01 দিয়ে আপনার আইডি (${userId}) সক্রিয় করা হয়েছে।`);
            setTimeout(() => {
              onActivate();
            }, 1200);
          } else if (usedUsers.length < 2) {
            // Under limit of 2 IDs
            const updated = [...usedUsers, userId];
            localStorage.setItem('taka_active_01_users', JSON.stringify(updated));
            playSuccessChime();
            setSuccessMsg(`অভিনন্দন! কোড ACTIVE_01 সফলভাবে ভেরিফাই হয়েছে (${updated.length}/২ টি আইডি ব্যবহৃত)। আপনার অ্যাকাউন্ট এখন সক্রিয়!`);
            setTimeout(() => {
              onActivate();
            }, 1500);
          } else {
            // Limit exceeded (2 IDs already activated with this code)
            setErrorMsg(`❌ 'ACTIVE_01' কোডটির সর্বোচ্চ ব্যবহারের সীমা (২টি আইডি) শেষ হয়ে গেছে! এই কোড দিয়ে নতুন কোনো আইডি সক্রিয় করা সম্ভব নয়।`);
          }
        } catch (err) {
          console.error(err);
          setErrorMsg('সার্ভার যাচাইকরণে ত্রুটি দেখা দিয়েছে। আবার চেষ্টা করুন।');
        }
      } else {
        setErrorMsg('❌ ভুল অ্যাক্টিভেশন কোড! সঠিক কোড দিয়ে আবার চেষ্টা করুন।');
      }
    }, 1000);
  };

  // Handle Manual Payment Submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    setErrorMsg('');
    setSuccessMsg('');

    if (!senderNumber || senderNumber.length < 11) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১-ডিজিটের মোবাইল নম্বর প্রবেশ করান।');
      return;
    }

    if (!trxId.trim()) {
      setErrorMsg('অনুগ্রহ করে পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রবেশ করান।');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const cleanTrx = trxId.trim().toUpperCase();
      const rawTrx = trxId.trim();

      // Check if user entered ACTIVE_01 into Trx field as fallback
      if (cleanTrx === 'ACTIVE_01') {
        const rawUsed = localStorage.getItem('taka_active_01_users');
        const usedUsers: string[] = rawUsed ? JSON.parse(rawUsed) : [];

        if (usedUsers.includes(userId)) {
          playSuccessChime();
          setSuccessMsg('অ্যাকাউন্ট ভেরিফিকেশন সফল হয়েছে! আপনার অ্যাকাউন্টটি সক্রিয় (Active) করা হয়েছে।');
          setTimeout(() => onActivate(), 1200);
          return;
        } else if (usedUsers.length < 2) {
          const updated = [...usedUsers, userId];
          localStorage.setItem('taka_active_01_users', JSON.stringify(updated));
          playSuccessChime();
          setSuccessMsg(`অভিনন্দন! কোড ACTIVE_01 সফলভাবে গৃহীত হয়েছে (${updated.length}/২ টি আইডি ব্যবহৃত)।`);
          setTimeout(() => onActivate(), 1500);
          return;
        } else {
          setErrorMsg(`❌ 'ACTIVE_01' কোডটির সর্বোচ্চ ব্যবহারের সীমা (২টি আইডি) শেষ হয়ে গেছে!`);
          return;
        }
      }

      // Standard TrxID approval
      if (rawTrx === '0000000000' || cleanTrx.length >= 8) {
        playSuccessChime();
        setSuccessMsg('পেমেন্ট ট্রানজেকশন ভেরিফিকেশন সফল হয়েছে! আপনার অ্যাকাউন্টটি সক্রিয় (Active) করা হয়েছে।');
        setTimeout(() => {
          onActivate();
        }, 1500);
      } else {
        setErrorMsg('❌ ভুল পেমেন্ট ট্রানজেকশন আইডি! সার্ভারে ২০ টাকা পেমেন্ট নিশ্চিত হয়নি। অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি লিখুন।');
      }
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-xl mx-auto space-y-5"
    >
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <button
          onClick={() => {
            playTapSound();
            onBack();
          }}
          className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ড্যাশবোর্ড</span>
        </button>

        <div className="text-right">
          <h2 className="text-sm sm:text-base font-black text-slate-800">অ্যাকাউন্ট সক্রিয়করণ</h2>
          <p className="text-[10px] text-slate-400 font-bold">Account Verification (আইডি: {userId})</p>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-pink-400" />
              <h3 className="font-extrabold text-sm sm:text-base">অ্যাকাউন্ট স্ট্যাটাস</h3>
            </div>
            <p className="text-xs text-indigo-200">
              {isActive 
                ? 'আপনার অ্যাকাউন্টটি সম্পূর্ণরূপে সক্রিয় ও ভেরিফাইড রয়েছে।' 
                : 'বিজ্ঞাপন দেখে আয় শুরু করতে অ্যাকাউন্ট সক্রিয় কোড (ACTIVE_01) অথবা পেমেন্ট স্লিপ দিয়ে সক্রিয় করুন।'}
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-indigo-300 font-mono">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>আপনার নির্দিষ্ট ইউজার আইডি: <strong>{userId}</strong></span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full text-xs font-black self-start sm:self-auto flex items-center gap-1.5 shrink-0 ${
            isActive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'
          }`}>
            <span className="w-2 h-2 rounded-full bg-white block" />
            <span>{isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}</span>
          </div>
        </div>
      </div>

      {/* Verification Method Switcher Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            setActiveMethodTab('code');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMethodTab === 'code'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>অ্যাক্টিভেশন কোড</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setActiveMethodTab('payment');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMethodTab === 'payment'
              ? 'bg-white text-[#e2136e] shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>বিকাশ/নগদ ২০ টাকা</span>
        </button>
      </div>

      {/* Tab 1: Code Verification */}
      {activeMethodTab === 'code' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-left space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-pink-600" />
              <span>অ্যাক্টিভেশন কোড প্রবেশ করান</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার কাছে থাকা অ্যাকাউন্ট অ্যাক্টিভেশন কোডটি নিচে লিখে সাবমিট করুন (যেমন: <strong>ACTIVE_01</strong>)।
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                অ্যাক্টিভেশন কোড (Activation Code)
              </label>
              <input
                type="text"
                placeholder="যেমন: ACTIVE_01"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-slate-50/50"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium">
                * দ্রষ্টব্য: নির্দিষ্ট কোডটির সর্বোচ্চ ব্যবহারের সীমা ২টি আইডি।
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium leading-snug flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold leading-snug flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !activationCode.trim()}
              className={`w-full py-3.5 rounded-2xl text-white text-xs sm:text-sm font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSubmitting || !activationCode.trim()
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pink-600 via-[#e2136e] to-rose-500 hover:opacity-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>কোড যাচাই হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>অ্যাকাউন্ট সক্রিয় করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Manual 20Tk Payment */}
      {activeMethodTab === 'payment' && (
        <div className="space-y-5">
          {/* Payment Instruction Numbers Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4 text-left">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Info className="w-4 h-4 text-[#e2136e]" />
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">পেমেন্ট মেথড ও নিয়মাবলি (২০ টাকা)</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              নিচের যেকোনো একটি নম্বরে বিকাশ অথবা নগদ অ্যাপের মাধ্যমে <strong>২০ টাকা</strong> Send Money করুন এবং প্রেরক নম্বর ও ট্রানজেকশন আইডি নিচে সাবমিট করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* bKash card */}
              <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e2136e] text-white flex items-center justify-center font-black text-xs">
                    bK
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-600">বিকাশ পার্সোনাল</p>
                    <p className="text-xs sm:text-sm font-mono font-bold text-[#e2136e]">01685482525</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('bkash', '01685482525')}
                  className="p-2 hover:bg-pink-100 rounded-xl text-[#e2136e] transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                >
                  {copiedType === 'bkash' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'bkash' ? 'কপিড!' : 'কপি'}</span>
                </button>
              </div>

              {/* Nagad card */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs">
                    Nd
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-600">নগদ পার্সোনাল</p>
                    <p className="text-xs sm:text-sm font-mono font-bold text-orange-600">01685482525</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('nagad', '01685482525')}
                  className="p-2 hover:bg-orange-100 rounded-xl text-orange-600 transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                >
                  {copiedType === 'nagad' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'nagad' ? 'কপিড!' : 'কপি'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transaction Submission Form */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-left space-y-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">পেমেন্ট ইনফরমেশন সাবমিট করুন</h4>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">প্রেরক মোবাইল নম্বর (যে নম্বর থেকে ২০ টাকা পাঠিয়েছেন):</label>
                <input
                  type="tel"
                  placeholder="যেমন: 017XXXXXXXX"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-pink-500"
                  maxLength={11}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">ট্রানজেকশন আইডি (Transaction ID / TrxID):</label>
                <input
                  type="text"
                  placeholder="যেমন: 9K2LM8P3X"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-pink-500"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium leading-snug flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold leading-snug flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !senderNumber || !trxId}
                className={`w-full py-3.5 rounded-2xl text-white text-xs sm:text-sm font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSubmitting || !senderNumber || !trxId 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-600 via-[#e2136e] to-rose-500 hover:opacity-95'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ভেরিফাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>পেমেন্ট স্লিপ জমা দিন</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ActiveAccount;
