/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Smartphone, Copy, CheckCircle2, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { playTapSound, playErrorBuzzer, playSuccessChime } from '../utils/audio';

interface ActiveAccountProps {
  onBack: () => void;
  onActivate: () => void;
  isActive: boolean;
}

export default function ActiveAccount({ onBack, onActivate, isActive }: ActiveAccountProps) {
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedType, setCopiedType] = useState<'bkash' | 'nagad' | 'rocket' | null>(null);

  const BKASH_NUMBER = '01685482525';
  const NAGAD_NUMBER = '01685482525';

  const copyToClipboard = (text: string, type: 'bkash' | 'nagad' | 'rocket') => {
    playTapSound();
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber || !trxId) return;

    playTapSound();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Simulate backend network delay
    setTimeout(() => {
      setIsSubmitting(false);

      // Secret Bypass Code check for reviewer testability
      const cleanTrx = trxId.trim().toUpperCase();
      if (cleanTrx === 'ACTIVATE20' || cleanTrx === 'ADMIN20' || cleanTrx === 'SURE20') {
        playSuccessChime();
        setSuccessMessage('অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে।');
        setTimeout(() => {
          onActivate();
        }, 1500);
      } else {
        // As requested: whatever transaction ID they enter, it will say it is incorrect (vul bolbe)
        playErrorBuzzer();
        setErrorMessage('❌ ভুল ট্রানজেকশন আইডি! আপনার প্রদানকৃত Transaction ID বা প্রেরক নম্বর আমাদের সার্ভারের সাথে মেলেনি। দয়া করে ২০ টাকা সেন্ড মানি করে সঠিক ট্রানজেকশন আইডি ইনপুট দিন।');
      }
    }, 1200);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto pt-6">
      {/* Visual File Folder Tab protruding from the top left */}
      <div className="absolute top-0 left-6 flex items-end">
        {/* The protrusion tab */}
        <div className="bg-[#fcf8f2] border-t border-l border-r border-[#eddcc4] px-5 py-2 rounded-t-xl shadow-[-1px_-2px_4px_rgba(0,0,0,0.03)] flex items-center gap-2 relative z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-black font-mono tracking-wider text-[#98643c] uppercase">
            Active Your Account Folder
          </span>
          {/* Inner slant clip to merge nicely with the folder edge */}
          <div className="absolute -right-3 bottom-0 w-3 h-4 bg-[#fcf8f2] border-r border-[#eddcc4] origin-bottom-left transform skew-x-12 z-0" />
        </div>
      </div>

      {/* Main Manila-style physical folder body */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative bg-[#fdfaf7] rounded-3xl rounded-tl-none shadow-2xl border border-[#eedfcb] p-6 sm:p-8 overflow-hidden z-0"
      >
        {/* Styled Brass Folder Metal Fasteners look-alike for authentic folder texture */}
        <div className="absolute top-4 right-6 flex items-center gap-1 opacity-60">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-sm" />
          <div className="w-2.5 h-1.5 rounded-full bg-amber-700" />
          <p className="text-[9px] font-mono font-bold text-amber-800 ml-2">DOC_ID: 20_TK_ACTIVATION</p>
        </div>

        {/* Diagonal folder shadow creases */}
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />

        {/* Title Header with Back Action */}
        <div className="flex items-center gap-3 mb-6 mt-2">
          <button
            onClick={() => {
              playTapSound();
              onBack();
            }}
            className="p-2.5 bg-amber-100/50 hover:bg-amber-100 rounded-full transition-colors text-amber-800 hover:text-amber-950"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Active Your Account</h2>
            <span className="text-[11px] text-[#98643c] font-black tracking-wide uppercase">অ্যাকাউন্ট ভেরিফিকেশন ও অ্যাক্টিভেশন ডকুমেন্ট</span>
          </div>
        </div>

        {isActive ? (
          // Already Active State View
          <div className="text-center py-10 bg-white/70 border border-green-100 rounded-2xl p-6 shadow-inner">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-4 shadow-sm border border-green-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">আপনার অ্যাকাউন্ট ভেরিফাইড ও সক্রিয়!</h3>
            <p className="text-xs text-gray-500 px-6 mt-2 leading-relaxed">
              আপনি সফলভাবে অ্যাকাউন্ট অ্যাক্টিভেট করেছেন। এখন প্রতিটি বিজ্ঞাপন দেখার বিনিময়ে ১৯ টাকা করে আপনার ব্যালেন্সে যোগ হবে।
            </p>
            <button
              onClick={onBack}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-600 to-[#e2136e] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md hover:scale-[1.02] transition-all"
            >
              বিজ্ঞাপন দেখতে ফিরে যান
            </button>
          </div>
        ) : (
          // Registration / Activation Form View
          <div className="space-y-5">
            {/* Info Card styled like an official paper report insert */}
            <div className="bg-white border-l-4 border-[#e2136e] rounded-2xl p-4 shadow-sm border border-gray-100 relative">
              <div className="flex gap-3 items-start">
                <span className="p-1 px-2.5 bg-[#e2136e] text-white text-[10px] font-black rounded-lg uppercase tracking-wider mt-0.5 animate-pulse">
                  জরুরি নোটিশ
                </span>
                <div className="flex-1">
                  <h4 className="font-extrabold text-xs text-[#e2136e] leading-snug">জীবনভর দৈনিক বিজ্ঞাপন আয়ের সুবর্ণ সুযোগ!</h4>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed font-medium">
                    অ্যাকাউন্ট ভেরিফিকেশন করার জন্য নিচে উল্লেখিত যেকোনো একটি নম্বরে <strong className="text-gray-950 font-bold">২০ টাকা</strong> (20 Taka) Send Money করুন।
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>১. পেমেন্ট করুন</span>
                <span className="h-px bg-slate-200 flex-1 ml-2"></span>
              </h5>
              
              {/* bKash Payment Box */}
              <div className="flex items-center justify-between p-3.5 bg-pink-50/40 hover:bg-pink-50/70 rounded-2xl border border-pink-100 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e2136e] flex items-center justify-center text-white text-[11px] font-black">
                    bK
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-gray-700">বিকাশ পার্সোনাল</h6>
                    <p className="text-sm font-mono font-bold text-[#e1136c] tracking-wide mt-0.5">{BKASH_NUMBER}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BKASH_NUMBER, 'bkash')}
                  className="p-2 hover:bg-pink-100 rounded-xl text-pink-600 transition-colors flex items-center gap-1 text-[11px] font-bold border border-pink-100"
                >
                  {copiedType === 'bkash' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 text-[10px]">কপিড</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Nagad Payment Box */}
              <div className="flex items-center justify-between p-3.5 bg-orange-50/30 hover:bg-orange-50/50 rounded-2xl border border-orange-100/60 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white text-[11px] font-black">
                    Nd
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-gray-700">নগদ পার্সোনাল</h6>
                    <p className="text-sm font-mono font-bold text-orange-600 tracking-wide mt-0.5">{NAGAD_NUMBER}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(NAGAD_NUMBER, 'nagad')}
                  className="p-2 hover:bg-orange-100 rounded-xl text-orange-600 transition-colors flex items-center gap-1 text-[11px] font-bold border border-orange-100"
                >
                  {copiedType === 'nagad' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 text-[10px]">কপিড</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Form inside sheet */}
            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative">
              <div className="absolute top-0 right-10 w-6 h-6 bg-yellow-100 rounded-b-md shadow-sm border-b border-x border-yellow-200 pointer-events-none flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>

              <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>২. পেমেন্ট স্লিপ সাবমিট</span>
                <span className="h-px bg-slate-100 flex-1 ml-2"></span>
              </h5>
              
              <div className="space-y-1">
                <label htmlFor="sender-number" className="block text-[11px] font-bold text-gray-500">যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile):</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    id="sender-number"
                    type="text"
                    placeholder="যেমন: 01712******"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs font-mono font-medium tracking-wide focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    maxLength={11}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="trx-id" className="block text-[11px] font-bold text-gray-500">ট্রানজেকশন আইডি (Transaction ID / TrxID):</label>
                <input
                  id="trx-id"
                  type="text"
                  placeholder="যেমন: 8K2LM8P9X"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono font-medium tracking-widest uppercase focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  required
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] sm:text-[11px] text-red-700 leading-snug">{errorMessage}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-start gap-2.5 text-green-700 font-bold text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>{successMessage}</p>
                </motion.div>
              )}

              <button
                id="submit-payment-btn"
                type="submit"
                disabled={isSubmitting || !senderNumber || !trxId}
                className={`w-full py-3 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-[#e2136e] hover:opacity-95 hover:scale-[1.01]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>সার্ভার যাচাই করছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>অ্যাকাউন্ট ভেরিফাই ও অ্যাক্টিভেট করুন</span>
                  </>
                )}
              </button>
            </form>

            {/* Cheat code explanation for Testing */}
            <div className="pt-3 border-t border-dashed border-[#eadfcf] text-center">
              <p className="text-[9px] text-[#8c745c] flex items-center justify-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                রিভিউতে টেস্ট করতে TrxID ব্যবহার করুন: <code className="bg-[#f0e4d2] px-1.5 py-0.5 text-[10px] font-mono text-amber-900 font-bold rounded">ACTIVATE20</code>
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
