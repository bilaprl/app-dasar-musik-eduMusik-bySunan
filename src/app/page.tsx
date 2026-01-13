"use client";

import React, { useState, useEffect, useRef } from "react";

// Definisi Tipe untuk State Management
type Step =
  | "splash"
  | "menu"
  | "pengenalan"
  | "unsur"
  | "alat"
  | "notasi"
  | "irama"
  | "teknik"
  | "studio"
  | "galeri"
  | "kuis"
  | "penutup";

export default function MusicApp() {
  const [step, setStep] = useState<Step>("splash");
  const [bpm, setBpm] = useState(120);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const metronomeRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const [activeModal, setActiveModal] = useState<"tentang" | "bantuan" | null>(
    null
  );
  // State untuk feedback instan kuis
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingRhythm, setIsPlayingRhythm] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);

  // Logika detak irama (4/4)
  useEffect(() => {
    let interval: any;
    if (isPlayingRhythm) {
      interval = setInterval(() => {
        setActiveBeat((prev) => (prev + 1) % 4);
      }, 500); // Kecepatan 120 BPM
    } else {
      setActiveBeat(-1);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlayingRhythm]);

  // Helper untuk kembali ke menu
  const BackButton = () => (
    <button
      onClick={() => setStep("menu")}
      className="mb-6 flex items-center gap-2 text-primary font-bold hover:opacity-70 transition-all"
    >
      <span className="material-icons">arrow_back</span> Kembali ke Menu
    </button>
  );

  // Fungsi untuk membunyikan suara "klik"
  const playClick = () => {
    if (!audioCtx.current)
      audioCtx.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    const osc = audioCtx.current.createOscillator();
    const envelope = audioCtx.current.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.current.currentTime); // Nada tinggi untuk klik
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.current.currentTime + 0.1
    );

    osc.connect(envelope);
    envelope.connect(audioCtx.current.destination);

    osc.start();
    osc.stop(audioCtx.current.currentTime + 0.1);
  };

  // Logika interval metronom
  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / bpm) * 1000;
      metronomeRef.current = setInterval(() => {
        playClick();
      }, interval);
    } else {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
    }
    return () => {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
    };
  }, [isPlaying, bpm]);

  // Penamaan label tempo otomatis
  const getTempoLabel = (b: number) => {
    if (b < 60) return "Largo";
    if (b < 76) return "Adagio";
    if (b < 108) return "Andante";
    if (b < 120) return "Moderato";
    if (b < 156) return "Allegro";
    return "Presto";
  };

  // State khusus untuk Kuis Evaluasi (Nama diganti agar tidak bentrok)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0); // Ganti dari score ke quizScore
  const [showResult, setShowResult] = useState(false);

  // Data Soal Kuis
  const quizData = [
    {
      question: "Manakah di bawah ini yang termasuk alat musik tiup?",
      options: ["Gitar", "Seruling", "Drum", "Piano"],
      correct: 1, // Seruling
    },
    {
      question:
        "Tangga nada Do-Re-Mi-Fa-Sol-La-Si-Do disebut juga tangga nada...",
      options: ["Diatonis", "Pentatonis", "Tradisional", "Modern"],
      correct: 0, // Diatonis
    },
    {
      question: "Alat musik Angklung berasal dari daerah...",
      options: ["Jawa Tengah", "Bali", "Jawa Barat", "Sumatera"],
      correct: 2, // Jawa Barat
    },
    {
      question: "Lagu 'Indonesia Pusaka' termasuk ke dalam jenis lagu...",
      options: ["Lagu Pop", "Lagu Rock", "Lagu Nasional", "Lagu Dangdut"],
      correct: 2, // Lagu Nasional
    },
    {
      question:
        "Jika nada dimainkan dengan sangat cepat, maka disebut tempo...",
      options: [
        "Lento (Lambat)",
        "Allegro (Cepat)",
        "Adagio (Pelan)",
        "Andante (Sedang)",
      ],
      correct: 1, // Allegro
    },
    {
      question: "Alat musik yang dimainkan dengan cara digesek adalah...",
      options: ["Biola", "Kecapi", "Suling", "Kendang"],
      correct: 0, // Biola
    },
    {
      question: "Berapakah jumlah nada dalam tangga nada Pentatonis?",
      options: ["7 Nada", "5 Nada", "12 Nada", "3 Nada"],
      correct: 1, // 5 Nada
    },
    {
      question: "Apa fungsi utama dari alat musik Kendang?",
      options: [
        "Mengatur Melodi",
        "Mengatur Irama/Tempo",
        "Hiasan",
        "Hanya Pengiring",
      ],
      correct: 1, // Mengatur Irama/Tempo
    },
  ];

  // Fungsi suara Piano & Nada
  const playNote = (freq: number) => {
    if (!audioCtx.current)
      audioCtx.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle"; // Suara lebih lembut seperti piano/keyboard
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  };

  // Fungsi suara Drum (Kick & Snare)
  const playDrum = (type: "kick" | "snare") => {
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "kick") {
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  // State untuk Galeri Musik (YouTube)
  const [currentVideo, setCurrentVideo] = useState({
    id: "8KQwWBAq8JQ?si", // Default: Indonesia Pusaka
    title: "Indonesia Pusaka",
    artist: "Lagu Nasional",
    desc: "Lagu wajib nasional yang diciptakan oleh Ismail Marzuki.",
  });

  // State untuk Fitur Tebak Nada (Step 07)
  const [quizFreq, setQuizFreq] = useState(261.63); // Frekuensi default (Nada C)
  const [quizFeedback, setQuizFeedback] = useState<
    "idle" | "correct" | "wrong"
  >("idle");

  // Fungsi untuk mengecek jawaban tebak nada
  const checkGuess = (freq: number) => {
    if (Math.abs(freq - quizFreq) < 0.1) {
      setQuizFeedback("correct");
      setTimeout(() => {
        // Ganti ke nada baru secara acak (C, E, atau G)
        const tones = [261.63, 329.63, 392.0];
        const newTone = tones[Math.floor(Math.random() * tones.length)];
        setQuizFreq(newTone);
        setQuizFeedback("idle");
      }, 1500);
    } else {
      setQuizFeedback("wrong");
      setTimeout(() => setQuizFeedback("idle"), 1000);
    }
  };

  return (
    <main className="w-full bg-slate-50 text-slate-900 font-sans min-h-screen">
      {/* 1. SPLASH SCREEN */}
      {step === "splash" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#00AEEF] via-[#0088cc] to-[#00AEEF] p-6 text-white text-center overflow-hidden touch-none">
          {/* Latar Belakang Animasi (Partikel Musik) */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="material-icons absolute top-[15%] left-[10%] text-white/20 text-[180px] -rotate-12 animate-pulse">
              music_note
            </span>
            <span className="material-icons absolute bottom-[5%] right-[-5%] text-white/10 text-[250px] rotate-45 animate-bounce">
              album
            </span>
            <span className="material-icons absolute top-1/2 right-[5%] text-white/10 text-[120px] animate-pulse">
              piano
            </span>
          </div>

          {/* Konten Utama */}
          <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
            {/* Logo Wrapper - Gambar & Card Menyatu Bulat Sempurna */}
            <div className="relative mb-10 group">
              {/* Efek Glow Kuning di Belakang */}
              <div className="absolute inset-0 bg-yellow-400 blur-[50px] opacity-40 rounded-full animate-pulse"></div>

              {/* Outer Circle (Bingkai Luar) */}
              <div className="relative p-1.5 rounded-full bg-gradient-to-b from-white/60 to-white/20 border-2 border-white/50 shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                {/* Inner Circle (Tempat Gambar) */}
                <div className="relative w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-4 border-white shadow-inner bg-white">
                  <img
                    src="https://i.pinimg.com/736x/c0/28/34/c02834a1463d2e75c6ca82369ab15fa9.jpg"
                    alt="Logo Dasar Seni Musik"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Overlay Gradasi Tipis agar gambar lebih menyatu */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                </div>

                {/* Floating Badge (Ikon Not Balok) */}
                <div className="absolute -bottom-1 -right-1 bg-secondary text-blue-900 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-xl flex items-center justify-center border-4 border-[#00AEEF] z-20 animate-bounce">
                  <span className="material-icons text-xl md:text-2xl font-black">
                    music_note
                  </span>
                </div>
              </div>
            </div>

            {/* Judul & Deskripsi */}
            <div className="space-y-4 mb-14">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter drop-shadow-2xl leading-[0.9]">
                DASAR SENI <br />
                <span className="text-secondary inline-block mt-2">MUSIK</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-50 font-medium max-w-lg mx-auto opacity-90 italic">
                "Harmoni dalam genggaman, kreativitas tanpa batas."
              </p>
            </div>

            {/* Tombol Aksi (CTA Redesign) */}
            <div className="flex flex-col gap-6 w-full max-w-md">
              <button
                onClick={() => setStep("menu")}
                className="group relative overflow-hidden bg-secondary hover:bg-yellow-300 text-blue-900 py-6 px-10 rounded-3xl text-3xl font-black shadow-[0_12px_0_0_#caac00] hover:shadow-[0_6px_0_0_#caac00] hover:translate-y-[6px] active:shadow-none active:translate-y-[12px] transition-all flex items-center justify-center gap-4"
              >
                MULAI BELAJAR
                <span className="material-icons text-4xl group-hover:translate-x-3 transition-transform duration-300">
                  play_circle_filled
                </span>
              </button>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModal("tentang")}
                  className="flex-1 bg-blue-900/40 hover:bg-blue-900/60 backdrop-blur-md border-2 border-white/20 p-5 rounded-3xl font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <span className="material-icons">info_outline</span> Tentang
                </button>
                <button
                  onClick={() => setActiveModal("bantuan")}
                  className="flex-1 bg-blue-900/40 hover:bg-blue-900/60 backdrop-blur-md border-2 border-white/20 p-5 rounded-3xl font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <span className="material-icons">help_outline</span> Bantuan
                </button>
              </div>
            </div>
          </div>

          <div className="pb-4 pt-8 opacity-30 text-[10px] md:text-[12px] tracking-[6px] font-bold uppercase shrink-0">
            Digital Music
          </div>
        </div>
      )}

      {/* --- MODAL SYSTEM (LOGIKA TENTANG & BANTUAN) --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-blue-950/80 backdrop-blur-xl"
            onClick={() => setActiveModal(null)}
          ></div>

          <div className="relative bg-white w-full max-w-xl rounded-[40px] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"
            >
              <span className="material-icons text-4xl">cancel</span>
            </button>

            {activeModal === "tentang" ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center">
                  <span className="material-icons text-primary text-[45px]">
                    auto_awesome
                  </span>
                </div>
                <h3 className="text-4xl font-black text-blue-900 leading-none">
                  Tentang Aplikasi
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  <strong>Dasar Seni Musik</strong> adalah platform edukasi
                  revolusioner yang dirancang untuk mempermudah siapa saja
                  mempelajari fondasi musik. Dari teori notasi hingga studio
                  piano virtual.
                </p>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm text-slate-500 font-medium">
                  Dikembangkan untuk masa depan musik Indonesia. Versi 1.0
                  (2026).
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center">
                  <span className="material-icons text-yellow-600 text-[45px]">
                    tips_and_updates
                  </span>
                </div>
                <h3 className="text-4xl font-black text-blue-900 leading-none">
                  Pusat Bantuan
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      t: "Cara Belajar",
                      d: "Pilih modul di menu utama untuk mulai membaca materi interaktif.",
                    },
                    {
                      t: "Studio Piano",
                      d: "Gunakan mouse atau sentuhan pada layar untuk membunyikan tuts piano.",
                    },
                    {
                      t: "Sertifikat",
                      d: "Selesaikan kuis di akhir sesi untuk mendapatkan skor dan sertifikat.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
                    >
                      <span className="text-primary font-black text-xl italic group-hover:scale-125 transition-transform">
                        0{i + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800">{item.t}</h4>
                        <p className="text-slate-500 text-sm">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-10 bg-primary text-white py-5 rounded-[24px] text-xl font-black hover:bg-blue-600 shadow-lg active:scale-95 transition-all"
            >
              MENGERTI
            </button>
          </div>
        </div>
      )}

      {/* 2. MENU UTAMA */}
      {step === "menu" && (
        <div className="min-h-screen bg-[#FDFDFD] animate-in fade-in duration-500 pb-12">
          {/* Navigasi Atas - Disesuaikan Tinggi & Safe Area untuk Mobile */}
          <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
              <button
                onClick={() => setStep("splash")}
                className="group flex items-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-500 px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl transition-all duration-300 active:scale-90 border border-transparent hover:border-red-100"
              >
                <span className="material-icons text-xl">
                  keyboard_backspace
                </span>
                <span className="font-bold text-sm md:text-base">Beranda</span>
              </button>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-amber-50 text-amber-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-amber-100 flex items-center gap-2">
                  <span className="material-icons text-base md:text-lg">
                    music_note
                  </span>
                  <span className="text-[10px] md:text-xs font-black tracking-wider uppercase italic">
                    Edu Music
                  </span>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto py-8 md:py-12 px-5 md:px-6">
            {/* Header Section - Ukuran Font Adaptif */}
            <div className="mb-10 md:mb-16 animate-in slide-in-from-top-4 duration-700">
              <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-primary/10 rounded-full mb-3 md:mb-4">
                <span className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[2px] md:tracking-[3px]">
                  Menu Pengajaran
                </span>
              </div>
              <h2 className="text-3xl md:text-6xl font-black text-blue-900 tracking-tight mb-3 md:mb-4 leading-tight">
                Kurikulum <span className="text-primary italic">Musik</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-xl font-medium max-w-2xl leading-relaxed">
                Pilih modul di bawah untuk membuka potensi musisi dalam dirimu.
                Setiap langkah adalah melodi baru!
              </p>
            </div>

            {/* Grid Modul: Layout yang nyaman untuk jari (Touch Targets) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  id: "pengenalan",
                  label: "Pengenalan Musik",
                  desc: "Sejarah & dasar musik",
                  icon: "history_edu",
                  color: "bg-[#FF6B6B]",
                  shadow: "shadow-red-100",
                },
                {
                  id: "unsur",
                  label: "Unsur Dasar Musik",
                  desc: "Melodi, ritme & harmoni",
                  icon: "auto_awesome",
                  color: "bg-[#4ECDC4]",
                  shadow: "shadow-cyan-100",
                },
                {
                  id: "alat",
                  label: "Alat Musik",
                  desc: "Tradisional & Modern",
                  icon: "straighten",
                  color: "bg-[#45B7D1]",
                  shadow: "shadow-blue-100",
                },
                {
                  id: "notasi",
                  label: "Notasi Musik",
                  desc: "Membaca not balok",
                  icon: "music_video",
                  color: "bg-[#96CEB4]",
                  shadow: "shadow-green-100",
                },
                {
                  id: "irama",
                  label: "Irama & Tempo",
                  desc: "Latihan ketukan & BPM",
                  icon: "speed",
                  color: "from-[#FF9F43] to-[#FF6B6B]",
                  shadow: "shadow-orange-100",
                },
                {
                  id: "teknik",
                  label: "Teknik Dasar",
                  desc: "Vokal & Instrumen",
                  icon: "videocam",
                  color: "bg-[#EE5253]",
                  shadow: "shadow-red-200",
                },
                {
                  id: "studio",
                  label: "Studio Latihan",
                  desc: "Piano Virtual Aktif",
                  icon: "piano",
                  color: "bg-[#1DD1A1]",
                  shadow: "shadow-emerald-100",
                },
                {
                  id: "galeri",
                  label: "Galeri Musik",
                  desc: "Koleksi lagu pilihan",
                  icon: "library_music",
                  color: "bg-[#FECA57]",
                  shadow: "shadow-yellow-100",
                },
                {
                  id: "kuis",
                  label: "Evaluasi / Kuis",
                  desc: "Tes kemampuan anda",
                  icon: "quiz",
                  color: "bg-[#5F27CD]",
                  shadow: "shadow-purple-100",
                },
              ].map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setStep(item.id as Step)}
                  className={`group relative bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] flex items-center gap-4 md:gap-5 transition-all duration-300 md:hover:-translate-y-2 border-2 border-slate-50 md:hover:border-white shadow-lg md:shadow-xl active:scale-95 touch-manipulation ${item.shadow}`}
                >
                  {/* Ikon CTA Adaptif */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 ${
                      item.color.includes("from")
                        ? "bg-gradient-to-br " + item.color
                        : item.color
                    } rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 md:group-hover:scale-110`}
                  >
                    <span className="material-icons text-2xl md:text-3xl">
                      {item.icon}
                    </span>
                  </div>

                  {/* Konten Teks */}
                  <div className="flex-1 text-left">
                    <h3 className="text-base md:text-lg font-black text-slate-800 leading-tight md:group-hover:text-primary transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 font-medium">
                      {item.desc}
                    </p>
                  </div>

                  {/* Panah Navigasi - Disembunyikan di Mobile kecil agar text lebih luas, atau dikecilkan */}
                  <div className="bg-slate-50 md:group-hover:bg-primary md:group-hover:text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0">
                    <span className="material-icons text-[10px] md:text-sm md:group-hover:translate-x-0.5 transition-transform">
                      arrow_forward_ios
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODUL CONTENT AREA */}
      <div className="responsive-container px-4 py-8">
        {/* 3. PENGENALAN MUSIK */}
        {step === "pengenalan" && (
          <div className="min-h-screen bg-white animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Navigation - Tetap 9 Steps Flow */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                {/* Tombol Kembali - Tambah active scale untuk feel mobile */}
                <button
                  onClick={() => setStep("menu")}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>

                {/* JUDUL WEB & PROGRES (9 Dots) */}
                <div className="flex flex-col items-center">
                  <h2 className="text-xl md:text-2xl font-black tracking-tighter text-blue-900 leading-none">
                    DASAR SENI <span className="text-primary">MUSIK</span>
                  </h2>
                  <div className="flex gap-1 mt-2">
                    <div className="w-6 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-1.5 rounded-full bg-slate-200"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Indikator Materi Aktif */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-300 leading-none mb-1">
                      Step 01
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      Pengenalan
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-blue-100">
                    <span className="material-icons text-xl">menu_book</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="responsive-container py-12 px-4 md:px-10">
              {/* Hero Section */}
              <div className="relative rounded-[40px] bg-gradient-to-br from-primary to-blue-700 p-8 md:p-12 text-white overflow-hidden mb-12 shadow-2xl shadow-blue-200">
                <span className="material-icons absolute -right-10 -bottom-10 text-[200px] text-white/10 rotate-12">
                  history_edu
                </span>
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                    Materi Pembuka
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black mb-4">
                    Pengenalan <br />
                    <span className="text-secondary italic">Seni Musik</span>
                  </h1>
                  <p className="text-blue-100 text-lg md:text-xl max-w-xl leading-relaxed">
                    Memahami dasar, kegunaan, dan perjalanan panjang musik dari
                    masa ke masa.
                  </p>
                </div>
              </div>

              {/* Konten Materi Lengkap */}
              <div className="space-y-16 text-slate-700 leading-relaxed">
                {/* Bagian 1: Definisi Mendalam */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF6B6B] flex items-center justify-center text-white shadow-lg">
                      <span className="material-icons">info</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Apa itu Musik?
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <p className="text-lg">
                        Seni musik adalah cabang seni yang menggunakan media{" "}
                        <strong>bunyi atau suara</strong> untuk menyampaikan
                        karya yang dihasilkan oleh manusia. Musik bukan sekadar
                        bunyi, melainkan susunan nada yang teratur dan memiliki
                        nilai keindahan.
                      </p>
                      <p className="text-lg">
                        Istilah musik berasal dari bahasa Yunani{" "}
                        <em>mousikos</em>, yang merujuk pada{" "}
                        <strong>Muses</strong> (sembilan dewi dalam mitologi
                        Yunani yang menguasai seni dan ilmu pengetahuan).
                      </p>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-[30px] border-2 border-amber-100 relative group transition-transform hover:scale-[1.01] active:scale-[0.98]">
                      <span className="material-icons absolute -top-4 -left-4 text-4xl text-secondary">
                        format_quote
                      </span>
                      <p className="italic text-slate-700 text-lg leading-relaxed">
                        "Musik adalah hukum moral. Ia memberi jiwa pada alam
                        semesta, sayap pada pikiran, dan terbang pada
                        imajinasi."
                      </p>
                      <p className="mt-3 font-black text-sm text-amber-600 tracking-wider text-right">
                        — PLATO
                      </p>
                    </div>
                  </div>
                </section>

                {/* Bagian 2: Fungsi Musik Lengkap */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4ECDC4] flex items-center justify-center text-white shadow-lg">
                      <span className="material-icons">settings_suggest</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Fungsi Seni Musik
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        t: "Sarana Ekspresi",
                        d: "Wadah bagi seniman untuk meluapkan perasaan, gagasan, dan ide lewat rangkaian nada.",
                        c: "border-red-100 bg-red-50/50",
                      },
                      {
                        t: "Sarana Upacara",
                        d: "Musik menjadi bagian vital dalam upacara adat, pernikahan, hingga ritual keagamaan.",
                        c: "border-blue-100 bg-blue-50/50",
                      },
                      {
                        t: "Terapi Kesehatan",
                        d: "Membantu proses penyembuhan, relaksasi mental, dan meningkatkan konsentrasi otak.",
                        c: "border-emerald-100 bg-emerald-50/50",
                      },
                      {
                        t: "Media Hiburan",
                        d: "Memberikan rasa senang dan kepuasan batin bagi pendengarnya di waktu luang.",
                        c: "border-amber-100 bg-amber-50/50",
                      },
                      {
                        t: "Sarana Pendidikan",
                        d: "Musik digunakan untuk menanamkan nilai moral, kecerdasan emosional, dan disiplin.",
                        c: "border-indigo-100 bg-indigo-50/50",
                      },
                    ].map((f, i) => (
                      <div
                        key={i}
                        className={`p-6 rounded-[32px] border-2 ${f.c} transition-all hover:bg-white hover:shadow-lg active:scale-95`}
                      >
                        <h4 className="font-black text-slate-800 mb-2">
                          {f.t}
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {f.d}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Bagian 3: Sejarah Musik (TEKS ASLI UTUH) */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#5F27CD] flex items-center justify-center text-white shadow-lg">
                      <span className="material-icons">history</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                      Perjalanan Sejarah Musik
                    </h3>
                  </div>
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {/* Era Prasejarah */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <span className="material-icons text-sm">
                          noise_aware
                        </span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-3xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all active:scale-[0.98]">
                        <h4 className="font-black text-blue-900 mb-1 text-base md:text-lg">
                          Zaman Prasejarah
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Manusia purba menciptakan musik lewat tepukan tangan,
                          hentakan kaki, dan alat perkusi sederhana dari tulang
                          atau kayu untuk ritual komunikasi.
                        </p>
                      </div>
                    </div>

                    {/* Era Klasik */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <span className="material-icons text-sm">piano</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-3xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all active:scale-[0.98]">
                        <h4 className="font-black text-blue-900 mb-1 text-base md:text-lg">
                          Zaman Klasik (1750-1820)
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Masa keemasan orkestra. Lahirlah tokoh besar seperti
                          Mozart dan Beethoven yang menciptakan struktur musik
                          yang sangat formal dan indah.
                        </p>
                      </div>
                    </div>

                    {/* Era Modern */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-secondary text-blue-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <span className="material-icons text-sm">
                          graphic_eq
                        </span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-3xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all active:scale-[0.98]">
                        <h4 className="font-black text-blue-900 mb-1 text-base md:text-lg">
                          Era Modern & Digital
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Ditemukannya teknologi perekaman dan alat musik
                          elektronik (synthesizer) yang melahirkan genre Pop,
                          Rock, Jazz, hingga musik EDM saat ini.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Navigasi Footer */}
              <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 self-start md:self-center">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic text-xl">
                    01
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-tight">
                    Materi selanjutnya: <br />{" "}
                    <span className="text-slate-700 font-bold">
                      Mempelajari Unsur-Unsur Dasar Musik
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setStep("unsur")}
                  className="group flex items-center gap-4 bg-secondary hover:bg-yellow-300 text-blue-900 px-8 py-5 rounded-[24px] text-xl font-black shadow-[0_8px_0_0_#caac00] hover:translate-y-1 hover:shadow-[0_4px_0_0_#caac00] active:translate-y-2 active:shadow-none transition-all w-full sm:w-auto justify-center touch-manipulation"
                >
                  MODUL SELANJUTNYA
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. UNSUR DASAR MUSIK */}
        {step === "unsur" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Navigation - 9 Dots Progress */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 md:h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                <button
                  onClick={() => setStep("menu")}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90 touch-manipulation"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-lg md:text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>

                <div className="flex flex-col items-center">
                  <h2 className="text-lg md:text-2xl font-black tracking-tighter text-blue-900 leading-none uppercase">
                    DASAR SENI <span className="text-primary">MUSIK</span>
                  </h2>
                  <div className="flex gap-1 mt-1.5 md:mt-2">
                    <div className="w-2 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="w-5 md:w-6 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-100">
                  <span className="material-icons text-lg md:text-xl">
                    auto_awesome
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-container py-8 md:py-12 px-4 md:px-10">
              {/* Hero Section */}
              <div className="relative rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-cyan-600 to-blue-700 p-8 md:p-12 text-white overflow-hidden mb-8 md:mb-12 shadow-2xl">
                <span className="material-icons absolute -right-10 -bottom-10 text-[150px] md:text-[200px] text-white/10 rotate-12">
                  waves
                </span>
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                    Materi Inti • Step 02
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
                    5 Unsur Dasar <br />
                    <span className="text-secondary italic">
                      Komposisi Musik
                    </span>
                  </h1>
                  <p className="text-cyan-50 text-base md:text-xl max-w-2xl leading-relaxed">
                    Musik bukan sekadar bunyi. Ia adalah perpaduan harmonis
                    antara waktu, nada, kekerasan suara, dan kecepatan.
                  </p>
                </div>
              </div>

              {/* Grid Interaktif 5 Unsur Musik */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
                {[
                  {
                    id: "ritme",
                    label: "Ritme (Irama)",
                    desc: "Jantung dari sebuah musik yang mengatur durasi bunyi dan jeda dalam aliran waktu.",
                    detail: [
                      "Beat: Ketukan dasar teratur",
                      "Birama: Kelompok hitungan",
                      "Pola: Variasi panjang nada",
                    ],
                    vid: "GHe0lgSkRdg",
                    color: "bg-blue-500",
                    icon: "reorder",
                  },
                  {
                    id: "melodi",
                    label: "Melodi",
                    desc: "Rangkaian nada yang disusun secara horizontal dengan tinggi rendah yang teratur.",
                    detail: [
                      "Pitch: Tinggi rendah nada",
                      "Interval: Jarak antar nada",
                      "Frase: Kalimat musik",
                    ],
                    vid: "gXS7rhqgKKo?si",
                    color: "bg-purple-500",
                    icon: "music_note",
                  },
                  {
                    id: "harmoni",
                    label: "Harmoni",
                    desc: "Keselarasan bunyi yang dihasilkan ketika dua nada atau lebih dibunyikan bersamaan.",
                    detail: [
                      "Chord: Gabungan 3+ nada",
                      "Interval: Jarak vertikal",
                      "Kadens: Progresi penutup",
                    ],
                    vid: "gXS7rhqgKKo?si",
                    color: "bg-emerald-500",
                    icon: "layers",
                  },
                  {
                    id: "tempo",
                    label: "Tempo",
                    desc: "Ukuran kecepatan birama lagu. Menentukan suasana perasaan dari sebuah karya.",
                    detail: [
                      "Largo: Sangat lambat",
                      "Moderato: Sedang",
                      "Allegro: Cepat & Riang",
                    ],
                    vid: "UyOpRmpS-Fs?si",
                    color: "bg-orange-500",
                    icon: "speed",
                  },
                  {
                    id: "dinamika",
                    label: "Dinamika",
                    desc: "Tingkat volume atau keras lembutnya suara yang memberikan emosi pada musik.",
                    detail: [
                      "Piano (p): Lembut",
                      "Forte (f): Keras",
                      "Crescendo: Mengeras",
                    ],
                    vid: "qhnOlYkWlLU?si",
                    color: "bg-rose-500",
                    icon: "volume_up",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl overflow-hidden flex flex-col active:scale-[0.98] touch-manipulation"
                  >
                    <div className="p-6 md:p-8 pb-4 flex-1">
                      <div className="flex items-start justify-between mb-6">
                        <div
                          className={`w-12 h-12 md:w-14 md:h-14 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <span className="material-icons text-2xl md:text-3xl">
                            {item.icon}
                          </span>
                        </div>
                        <div className="flex items-end gap-1 h-8 group-hover:opacity-100 opacity-20 transition-opacity">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 ${
                                item.color
                              } rounded-full animate-pulse h-${(i + 1) * 3}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3 group-hover:text-primary transition-colors uppercase tracking-tight">
                        {item.label}
                      </h3>
                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6 font-medium">
                        {item.desc}
                      </p>

                      <div className="space-y-2 mb-6 bg-slate-50 p-4 md:p-5 rounded-[24px] md:rounded-3xl border border-slate-100">
                        {item.detail.map((point, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className={`w-1 h-1 rounded-full ${item.color}`}
                            ></div>
                            <p className="text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-5 md:px-6 pb-6 md:pb-8">
                      <div className="relative rounded-[20px] md:rounded-[24px] overflow-hidden aspect-video bg-black shadow-lg border-2 border-slate-50">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${item.vid}`}
                          title={item.label}
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigasi Footer */}
              <div className="mt-16 md:mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4 self-start">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic text-lg md:text-xl">
                    02
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-tight">
                    Materi selanjutnya: <br />{" "}
                    <span className="text-slate-700 font-bold">
                      Mengenal Instrumen Musik
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setStep("alat")}
                  className="group flex items-center gap-4 bg-secondary hover:bg-yellow-300 text-blue-900 px-8 py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#caac00] active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto justify-center touch-manipulation"
                >
                  MODUL SELANJUTNYA
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. ALAT MUSIK */}
        {step === "alat" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Navigation - Sticky dengan tinggi adaptif */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 md:h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                <button
                  onClick={() => setStep("menu")}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90 touch-manipulation"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-lg md:text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>

                <div className="flex flex-col items-center">
                  <h2 className="text-lg md:text-2xl font-black tracking-tighter text-blue-900 leading-none uppercase">
                    DASAR SENI <span className="text-primary">MUSIK</span>
                  </h2>
                  <div className="flex gap-1 mt-1.5 md:mt-2">
                    <div className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="w-5 md:w-6 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <span className="material-icons text-lg md:text-xl">
                    library_music
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-container py-8 md:py-12 px-4 md:px-10">
              {/* Hero Section - Penyesuaian padding mobile */}
              <div className="relative rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 text-white overflow-hidden mb-12 shadow-2xl">
                <span className="material-icons absolute -right-10 -bottom-10 text-[150px] md:text-[200px] text-white/10 rotate-12">
                  album
                </span>
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                    Materi Inti • Step 03
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
                    Mengenal <br />
                    <span className="text-secondary italic">
                      Instrumen Musik
                    </span>
                  </h1>
                  <p className="text-indigo-50 text-base md:text-xl max-w-2xl leading-relaxed">
                    Setiap alat musik memiliki warna suara (timbre) yang unik.
                    Pahami karakteristik mereka untuk menciptakan harmoni yang
                    sempurna.
                  </p>
                </div>
              </div>

              {/* BAGIAN 1: ALAT MUSIK MODERN */}
              <section className="mb-16 md:mb-24">
                <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-100">
                    <span className="material-icons text-2xl md:text-3xl">
                      music_note
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight">
                      Instrumen Modern
                    </h3>
                    <p className="text-slate-400 font-bold text-[10px] md:text-sm uppercase tracking-widest">
                      Global & Teknologi
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[
                    {
                      name: "Gitar Akustik",
                      tag: "Chordophone",
                      desc: "Alat musik dawai yang serbaguna, menghasilkan suara hangat melalui resonansi lubang gitar.",
                      vid: "tX-j0fmFk2U?si",
                      color: "from-blue-500 to-cyan-500",
                      icon: "music_note",
                    },
                    {
                      name: "Piano / Keyboard",
                      tag: "Idiophone/Digital",
                      desc: "Raja instrumen dengan rentang nada terluas, menjadi standar dalam penulisan teori musik.",
                      vid: "5v9qO37qp2U?si",
                      color: "from-slate-700 to-slate-900",
                      icon: "piano",
                    },
                    {
                      name: "Drum Kit",
                      tag: "Membranophone",
                      desc: "Kumpulan instrumen perkusi yang menjadi penjaga tempo dan dinamika utama dalam musik modern.",
                      vid: "SYHJWr1DhG0?si",
                      color: "from-orange-500 to-red-600",
                      icon: "🥁",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col active:scale-[0.98] touch-manipulation"
                    >
                      <div className="relative aspect-[4/3] w-full bg-slate-900">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${item.vid}`}
                          title={item.name}
                          allowFullScreen
                        ></iframe>
                        <div
                          className={`absolute top-4 left-4 px-3 py-1 rounded-xl md:rounded-2xl bg-gradient-to-r ${item.color} text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider shadow-lg`}
                        >
                          {item.tag}
                        </div>
                      </div>
                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight uppercase">
                            {item.name}
                          </h4>
                          <span className="material-icons text-slate-200 group-hover:rotate-12 transition-transform">
                            {item.icon.length > 2 ? item.icon : ""}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium mb-6 flex-1">
                          {item.desc}
                        </p>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase">
                            Demonstrasi Video
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <span className="material-icons text-sm text-blue-500">
                              play_circle
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* BAGIAN 2: ALAT MUSIK TRADISIONAL */}
              <section className="mb-16 md:mb-20">
                <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                    <span className="material-icons text-2xl md:text-3xl">
                      temple_hindu
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight">
                      Instrumen Tradisional
                    </h3>
                    <p className="text-slate-400 font-bold text-[10px] md:text-sm uppercase tracking-widest">
                      Warisan Budaya & Lokal
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[
                    {
                      name: "Angklung",
                      tag: "Jawa Barat",
                      desc: "Keunikan bambu yang bergoyang, satu-satunya alat musik tradisional Indonesia yang diakui UNESCO.",
                      vid: "zCagoDFZLEU?si",
                      color: "from-emerald-500 to-teal-600",
                    },
                    {
                      name: "Gamelan",
                      tag: "Jawa & Bali",
                      desc: "Orkestra perkusi yang terdiri dari saron, bonang, dan gong, menciptakan harmoni mistis nan megah.",
                      vid: "BD39g1W_TZ0?si",
                      color: "from-amber-500 to-orange-600",
                    },
                    {
                      name: "Sasando",
                      tag: "NTT",
                      desc: "Instrumen dawai tradisional dengan wadah resonansi dari daun lontar yang menghasilkan suara jernih.",
                      vid: "0HpqmLz-Feo?si",
                      color: "from-rose-500 to-purple-600",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col active:scale-[0.98] touch-manipulation"
                    >
                      <div className="relative aspect-[4/3] w-full bg-slate-900">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${item.vid}`}
                          title={item.name}
                          allowFullScreen
                        ></iframe>
                        <div
                          className={`absolute top-4 left-4 px-3 py-1 rounded-xl md:rounded-2xl bg-gradient-to-r ${item.color} text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider shadow-lg`}
                        >
                          {item.tag}
                        </div>
                      </div>
                      <div className="p-6 md:p-8 flex-1">
                        <h4 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors mb-4 uppercase italic">
                          {item.name}
                        </h4>
                        <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Navigasi Footer - Tombol diperlebar untuk mobile */}
              <div className="mt-12 md:mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4 self-start">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic text-lg md:text-xl">
                    03
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-tight">
                    Materi selanjutnya: <br />{" "}
                    <span className="text-slate-700 font-bold">
                      Mempelajari Notasi Musik
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setStep("notasi")}
                  className="group flex items-center gap-4 bg-secondary hover:bg-yellow-300 text-blue-900 px-8 py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#caac00] active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto justify-center touch-manipulation"
                >
                  MODUL SELANJUTNYA
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. NOTASI MUSIK */}
        {step === "notasi" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Navigation - Responsif untuk Mobile */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 md:h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                <button
                  onClick={() => setStep("menu")}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90 touch-manipulation"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-lg md:text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>

                <div className="flex flex-col items-center">
                  <h2 className="text-lg md:text-2xl font-black tracking-tighter text-blue-900 leading-none">
                    DASAR SENI <span className="text-primary">MUSIK</span>
                  </h2>
                  <div className="flex gap-1 mt-1.5 md:mt-2">
                    <div className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="w-5 md:w-6 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100 active:rotate-12 transition-transform">
                  <span className="material-icons text-lg md:text-xl">
                    edit_note
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-container py-8 md:py-12 px-4 md:px-10">
              {/* Hero Section - Padding disesuaikan untuk HP */}
              <div className="relative rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-orange-500 to-red-600 p-8 md:p-12 text-white overflow-hidden mb-12 md:mb-16 shadow-2xl">
                <span className="material-icons absolute -right-10 -bottom-10 text-[150px] md:text-[200px] text-white/10 rotate-12">
                  scuba_diving
                </span>
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                    Materi Inti • Step 04
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
                    Membaca <br />
                    <span className="text-secondary italic">Simbol Musik</span>
                  </h1>
                  <p className="text-orange-50 text-base md:text-xl max-w-2xl leading-relaxed">
                    Bahasa universal musik dituliskan dalam bentuk notasi agar
                    karya dapat dimainkan dengan presisi oleh musisi di seluruh
                    dunia.
                  </p>
                </div>
              </div>

              {/* Materi Notasi Section - Grid sistem yang lebih fleksibel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-16 md:mb-20">
                {[
                  {
                    title: "Not Angka",
                    subtitle: "Sistem Solmisasi",
                    desc: "Sistem penulisan nada menggunakan angka 1 (do) sampai 7 (si). Sangat praktis dan populer di Indonesia, terutama untuk musik vokal dan paduan suara.",
                    vid: "DqilWhvOoPM?si",
                    color: "bg-orange-500",
                    lightColor: "bg-orange-50",
                    icon: "looks_one",
                    points: [
                      "Mudah dipelajari pemula",
                      "Dominan di musik vokal",
                      "Menggunakan titik untuk oktaf",
                    ],
                  },
                  {
                    title: "Not Balok",
                    subtitle: "Sistem Paranada",
                    desc: "Standar internasional yang menggunakan simbol pada 5 garis paranada. Memberikan informasi detail mengenai tinggi nada (pitch) dan durasi nada secara visual.",
                    vid: "gTdkMRHya9c?si",
                    color: "bg-blue-600",
                    lightColor: "bg-blue-50",
                    icon: "blur_on",
                    points: [
                      "Standar global profesional",
                      "Visualisasi melodi yang jelas",
                      "Detail durasi sangat akurat",
                    ],
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[35px] md:rounded-[45px] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group active:scale-[0.98] touch-manipulation"
                  >
                    <div className="p-7 md:p-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}
                        >
                          <span className="material-icons text-2xl md:text-3xl">
                            {item.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-800">
                            {item.title}
                          </h3>
                          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-60">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8 font-medium">
                        {item.desc}
                      </p>

                      <div className="grid grid-cols-1 gap-2.5 md:gap-3 mb-10">
                        {item.points.map((p, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-xl md:rounded-2xl ${item.lightColor} hover:brightness-95 transition-all`}
                          >
                            <span className="material-icons text-sm">
                              check_circle
                            </span>
                            <span className="text-xs md:text-sm font-bold text-slate-700">
                              {p}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden aspect-video bg-black shadow-xl border-[4px] md:border-[6px] border-slate-50 group-hover:border-white transition-all">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${item.vid}`}
                          title={item.title}
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigasi Footer - Penyesuaian Layout HP */}
              <div className="mt-12 md:mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8 md:gap-6">
                <div className="flex items-center gap-4 self-start">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic text-lg md:text-xl">
                    04
                  </div>

                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-tight">
                    Materi selanjutnya: <br />{" "}
                    <span className="text-slate-700 font-bold">
                      Irama, Birama dan Tempo
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setStep("irama")}
                  className="group flex items-center gap-4 bg-secondary hover:bg-yellow-300 text-blue-900 px-8 py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#caac00] active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto justify-center touch-manipulation"
                >
                  MODUL SELANJUTNYA
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. IRAMA & TEMPO + METRONOM */}
        {step === "irama" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Navigation - Mobile Optimized */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 md:h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setStep("menu");
                  }}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90 touch-manipulation"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-lg md:text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>

                <div className="flex flex-col items-center">
                  <h2 className="text-lg md:text-2xl font-black tracking-tighter text-blue-900 leading-none">
                    DASAR SENI <span className="text-primary">MUSIK</span>
                  </h2>
                  <div className="flex gap-1 mt-1.5 md:mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      />
                    ))}
                    <div className="w-5 md:w-6 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      />
                    ))}
                  </div>
                </div>

                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-100">
                  <span className="material-icons text-lg md:text-xl">
                    speed
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-container py-8 md:py-12 px-4 md:px-10">
              {/* Hero Section */}
              <div className="relative rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-rose-500 to-red-600 p-8 md:p-12 text-white overflow-hidden mb-10 md:mb-12 shadow-2xl">
                <span className="material-icons absolute -right-10 -bottom-10 text-[150px] md:text-[200px] text-white/10 rotate-12">
                  schedule
                </span>
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                    Materi Inti • Step 05
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
                    Irama, Birama <br />
                    <span className="text-secondary italic">& Tempo</span>
                  </h1>
                  <p className="text-rose-50 text-base md:text-xl max-w-2xl leading-relaxed">
                    Pelajari cara menjaga ketukan yang stabil dan memahami
                    bagaimana kecepatan (BPM) mengubah emosi sebuah lagu.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                <div className="lg:col-span-2 space-y-8 md:space-y-10">
                  <div className="bg-white p-6 md:p-10 rounded-[35px] md:rounded-[45px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                        <span className="material-icons text-xl md:text-2xl">
                          graphic_eq
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                        Visualisasi Pola Irama 4/4
                      </h3>
                    </div>

                    {/* AREA VISUALIZER INTERAKTIF */}
                    <div className="relative rounded-[30px] md:rounded-[40px] p-6 md:p-10 bg-slate-900 shadow-2xl border-[6px] md:border-[8px] border-slate-50 overflow-hidden mb-10">
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="flex gap-3 md:gap-8 mb-8 md:mb-10">
                          {[0, 1, 2, 3].map((beat) => (
                            <div
                              key={beat}
                              className="flex flex-col items-center gap-3"
                            >
                              <div
                                className={`w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-150 border-4 ${
                                  activeBeat === beat
                                    ? "bg-rose-500 border-rose-300 scale-110 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                                    : "bg-slate-800 border-slate-700"
                                }`}
                              >
                                <span
                                  className={`material-icons text-xl md:text-4xl ${
                                    activeBeat === beat
                                      ? "text-white"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {beat === 0 ? "stars" : "fiber_manual_record"}
                                </span>
                              </div>
                              <span
                                className={`font-black text-sm md:text-base ${
                                  activeBeat === beat
                                    ? "text-rose-400"
                                    : "text-slate-600"
                                }`}
                              >
                                {beat + 1}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => setIsPlayingRhythm(!isPlayingRhythm)}
                          className={`group flex items-center gap-3 md:gap-4 px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl text-base md:text-lg font-black transition-all touch-manipulation ${
                            isPlayingRhythm
                              ? "bg-rose-500 text-white shadow-[0_4px_0_0_#9f1239]"
                              : "bg-emerald-500 text-white shadow-[0_4px_0_0_#065f46]"
                          } active:translate-y-1 active:shadow-none`}
                        >
                          <span className="material-icons text-xl md:text-2xl">
                            {isPlayingRhythm ? "stop_circle" : "play_circle"}
                          </span>
                          {isPlayingRhythm ? "HENTIKAN" : "MULAI VISUALISASI"}
                        </button>

                        <p className="text-slate-500 text-[8px] md:text-[10px] font-black tracking-[2px] md:tracking-[3px] mt-6 uppercase">
                          Tempo Terkunci: 120 BPM
                        </p>
                      </div>
                    </div>

                    {/* PENJELASAN BIRAMA - Grid adaptif untuk Mobile */}
                    <div className="mt-8 md:mt-12 p-6 md:p-8 bg-blue-50 rounded-[30px] md:rounded-[35px] border border-blue-100 relative overflow-hidden">
                      <span className="material-icons absolute -right-4 -bottom-4 text-6xl md:text-8xl text-blue-100/50">
                        reorder
                      </span>
                      <h4 className="text-xl md:text-2xl font-black text-blue-900 mb-4 flex items-center gap-2">
                        <span className="material-icons">straighten</span>{" "}
                        Mengenal Birama
                      </h4>
                      <p className="text-blue-800/80 text-sm md:text-base font-medium leading-relaxed mb-6">
                        Birama adalah ayunan kelompok ketukan yang datang
                        berulang-ulang dengan teratur.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        {[
                          { type: "2/4", desc: "Dua ketukan (Tuk-Cak)" },
                          { type: "3/4", desc: "Tiga ketukan (Waltz)" },
                          { type: "4/4", desc: "Empat ketukan (Pop/Rock)" },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="bg-white p-4 rounded-xl md:rounded-2xl shadow-sm border border-blue-100 active:scale-95 transition-transform touch-manipulation"
                          >
                            <div className="text-blue-500 font-black text-lg md:text-xl mb-1">
                              {item.type}
                            </div>
                            <div className="text-slate-500 text-[10px] md:text-xs font-bold leading-tight">
                              {item.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100">
                        <h4 className="font-black text-rose-500 uppercase text-[10px] tracking-widest mb-2">
                          Apa itu Tempo?
                        </h4>
                        <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                          Ukuran kecepatan birama lagu dalam satuan BPM.
                        </p>
                      </div>
                      <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100">
                        <h4 className="font-black text-rose-500 uppercase text-[10px] tracking-widest mb-2">
                          Pentingnya Irama
                        </h4>
                        <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                          Irama adalah penggerak musik agar melodi tetap stabil.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metronom Digital - Sticky hanya di Desktop */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-900 rounded-[35px] md:rounded-[45px] p-8 md:p-10 text-white text-center md:sticky md:top-24 shadow-2xl border-b-8 border-slate-800 transition-all">
                    <div className="relative mb-6 md:mb-8">
                      <div
                        className={`absolute inset-0 ${
                          isPlaying
                            ? "bg-secondary/40 animate-pulse"
                            : "bg-secondary/10"
                        } blur-3xl rounded-full`}
                      />
                      <span
                        className={`material-icons relative text-6xl md:text-7xl text-secondary origin-top ${
                          isPlaying
                            ? "animate-[swing_0.5s_ease-in-out_infinite]"
                            : ""
                        }`}
                      >
                        av_timer
                      </span>
                    </div>

                    <h4 className="text-xl md:text-2xl font-black mb-1 md:mb-2 tracking-tight">
                      Metronom Digital
                    </h4>
                    <p className="text-slate-400 text-xs md:text-sm mb-8 md:mb-10 font-medium">
                      Latih stabilitas ketukanmu.
                    </p>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[25px] md:rounded-[35px] p-6 md:p-8 mb-8 md:mb-10">
                      <div className="text-6xl md:text-7xl font-black text-secondary mb-2 tracking-tighter">
                        {bpm}
                      </div>
                      <div className="inline-block px-4 py-1 rounded-full bg-secondary text-blue-900 text-[10px] font-black uppercase tracking-widest">
                        {getTempoLabel(bpm)}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`w-full ${
                        isPlaying ? "bg-rose-500" : "bg-primary"
                      } text-white py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-base md:text-lg transition-all shadow-xl active:scale-95 mb-6 flex items-center justify-center gap-3 touch-manipulation`}
                    >
                      <span className="material-icons">
                        {isPlaying ? "stop" : "play_arrow"}
                      </span>
                      {isPlaying ? "BERHENTI" : "MULAI LATIHAN"}
                    </button>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setBpm(Math.max(40, bpm - 5))}
                        className="flex-1 bg-white/10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-xl md:text-2xl active:bg-white/20 touch-manipulation"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setBpm(Math.min(240, bpm + 5))}
                        className="flex-1 bg-white/10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-xl md:text-2xl active:bg-white/20 touch-manipulation"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigasi Footer */}
              <div className="mt-12 md:mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8 md:gap-6">
                <div className="flex items-center gap-4 self-start">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic text-lg md:text-xl">
                    05
                  </div>
                  <div className="text-left">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5 tracking-tight">
                      Materi selanjutnya
                    </p>
                    <p className="text-slate-700 font-bold leading-tight text-sm md:text-base">
                      Teknik Dasar dan Vokal
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setStep("teknik");
                  }}
                  className="group flex items-center gap-4 bg-secondary text-blue-900 px-8 py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#caac00] active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto justify-center touch-manipulation"
                >
                  MODUL SELANJUTNYA
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. TEKNIK DASAR BERMAIN MUSIK */}
        {step === "teknik" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Navigation - Mobile Optimized */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 md:h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                <button
                  onClick={() => setStep("menu")}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-lg md:text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>

                <div className="flex flex-col items-center">
                  <h2 className="text-lg md:text-2xl font-black tracking-tighter text-blue-900 leading-none">
                    DASAR SENI <span className="text-primary">MUSIK</span>
                  </h2>
                  <div className="flex gap-1 mt-1.5 md:mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      />
                    ))}
                    <div className="w-5 md:w-6 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      />
                    ))}
                  </div>
                </div>

                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100">
                  <span className="material-icons text-lg md:text-xl">
                    school
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-container py-8 md:py-12 px-4 md:px-10">
              {/* Hero Section */}
              <div className="relative rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-amber-500 to-orange-600 p-8 md:p-12 text-white overflow-hidden mb-10 md:mb-12 shadow-2xl">
                <span className="material-icons absolute -right-10 -bottom-10 text-[150px] md:text-[200px] text-white/10 rotate-12">
                  front_hand
                </span>
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                    Materi Inti • Step 06
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
                    Teknik <span className="text-secondary italic">Dasar</span>{" "}
                    <br className="hidden md:block" />& Cara Bermain
                  </h1>
                  <p className="text-amber-50 text-base md:text-xl max-w-2xl leading-relaxed">
                    Pilih instrumen yang ingin kamu pelajari. Fokus pada posisi
                    tubuh yang benar dan teknik dasar untuk menghasilkan nada
                    yang sempurna.
                  </p>
                </div>
              </div>

              {/* Instrumen Grid - Mobile Responsive 1 Column */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
                {[
                  {
                    t: "Teknik Vokal & Napas",
                    d: "Latihan pernapasan diafragma dan pemanasan pita suara untuk jangkauan nada yang lebih luas.",
                    vid: "nojUovjGU64?si",
                    icon: "mic_external_on",
                    color: "bg-rose-500",
                    lightColor: "bg-rose-50 text-rose-600",
                  },
                  {
                    t: "Petikan Gitar Dasar",
                    d: "Mengenal posisi jari pada fretboard dan teknik strumming (genjrengan) yang stabil.",
                    vid: "DAMX7eERXI4?si",
                    icon: "straighten",
                    color: "bg-amber-500",
                    lightColor: "bg-amber-50 text-amber-600",
                  },
                  {
                    t: "Penempatan Jari Piano",
                    d: "Teknik melenturkan jari dan koordinasi tangan kiri-kanan pada tuts piano/keyboard.",
                    vid: "TJs0irkODO0?si",
                    icon: "piano",
                    color: "bg-blue-500",
                    lightColor: "bg-blue-50 text-blue-600",
                  },
                  {
                    t: "Tiupan Suling / Recorder",
                    d: "Cara mengatur lubang udara dan kekuatan tiupan untuk menghasilkan nada yang tidak melengking.",
                    vid: "UjOPYfmO3gA?si",
                    icon: "music_note",
                    color: "bg-emerald-500",
                    lightColor: "bg-emerald-50 text-emerald-600",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-[35px] md:rounded-[45px] border-b-8 border-slate-200/50 overflow-hidden hover:border-primary/20 hover:shadow-2xl md:hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="p-6 md:p-10">
                      <div className="flex items-start justify-between mb-6 md:mb-8">
                        <div className="flex items-center gap-4 md:gap-5">
                          <div
                            className={`w-14 h-14 md:w-16 md:h-16 rounded-[18px] md:rounded-[22px] ${item.lightColor} flex items-center justify-center transition-all group-hover:rotate-6 shadow-sm`}
                          >
                            <span className="material-icons text-2xl md:text-3xl">
                              {item.icon}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                              {item.t}
                            </h3>
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Tutorial Masterclass
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Video Container - Aspect Video Optimized */}
                      <div className="relative rounded-[25px] md:rounded-[35px] overflow-hidden aspect-video bg-slate-900 group/video shadow-xl">
                        <iframe
                          className="w-full h-full opacity-90 group-hover/video:opacity-100 transition-opacity"
                          src={`https://www.youtube.com/embed/${item.vid}`}
                          allowFullScreen
                        ></iframe>
                        {/* Desktop-only overlay for better feel */}
                        <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 transition-all pointer-events-none items-center justify-center">
                          <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white font-bold text-sm">
                            Sedang Dipelajari...
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 md:mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                        <p className="text-slate-500 font-medium leading-relaxed sm:max-w-[80%] text-sm md:text-base">
                          {item.d}
                        </p>
                        <div
                          className={`hidden sm:flex h-12 w-12 rounded-full ${item.lightColor} items-center justify-center opacity-20 group-hover:opacity-100 transition-all`}
                        >
                          <span className="material-icons">
                            arrow_forward_ios
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Navigation */}
              <div className="mt-12 md:mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8 md:gap-6">
                <div className="flex items-center gap-4 self-start sm:self-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic text-lg">
                    06
                  </div>
                  <div className="text-left">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5 tracking-tight">
                      Langkah Selanjutnya
                    </p>
                    <p className="text-slate-700 font-bold leading-tight text-base md:text-lg">
                      Studio Latihan Virtual
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setStep("studio");
                  }}
                  className="group flex items-center gap-4 bg-secondary hover:bg-yellow-300 text-blue-900 px-8 py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#caac00] active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto justify-center"
                >
                  MASUK STUDIO LATIHAN
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 9. STUDIO LATIHAN VIRTUAL (TEKS LENGKAP & FIX SUARA) */}
        {step === "studio" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Navigation */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 md:h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                <button
                  onClick={() => setStep("menu")}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-lg md:text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>

                <div className="flex flex-col items-center">
                  <h2 className="text-lg md:text-2xl font-black tracking-tighter text-blue-900 leading-none">
                    STUDIO <span className="text-primary">VIRTUAL</span>
                  </h2>
                  <div className="flex gap-1 mt-1.5 md:mt-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      />
                    ))}
                    <div className="w-5 md:w-6 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      />
                    ))}
                  </div>
                </div>

                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                  <span className="material-icons text-lg md:text-xl">
                    piano
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-container py-8 md:py-12 px-4 md:px-10">
              {/* SECTION PENJELASAN (Hero Section) */}
              <div className="relative rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-12 text-white overflow-hidden mb-10 shadow-2xl">
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                    Praktek Mandiri • Step 07
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
                    Eksplorasi <br />
                    <span className="text-secondary italic">Bunyi & Irama</span>
                  </h1>
                  <p className="text-indigo-50 text-base md:text-xl max-w-2xl leading-relaxed">
                    Selamat datang di Studio Latihan! Di sini kamu bisa
                    mempraktekkan teori yang telah dipelajari. Gunakan{" "}
                    <strong>Keyboard Virtual</strong> untuk memahami jarak antar
                    nada (interval) dan <strong> Rhythm Pad</strong> untuk
                    mengasah kestabilan ketukan (tempo).
                  </p>
                </div>
                <span className="material-icons absolute -right-10 -bottom-10 text-[150px] md:text-[200px] text-white/10 rotate-12 select-none">
                  graphic_eq
                </span>
              </div>

              {/* 1. KEYBOARD VIRTUAL SECTION */}
              <div className="mb-10 md:mb-12">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <span className="material-icons">keyboard</span>
                  </span>
                  Keyboard Virtual
                </h3>

                <div className="bg-slate-900 rounded-[30px] md:rounded-[40px] p-2 md:p-10 shadow-3xl border-b-[8px] md:border-b-[12px] border-slate-950 overflow-hidden">
                  <div className="overflow-x-auto pb-6 pt-2 flex touch-pan-x snap-x">
                    <div className="flex justify-start md:justify-center min-w-max px-4 mx-auto">
                      <div className="relative flex bg-slate-800 p-2 md:p-3 rounded-2xl select-none">
                        {[
                          { n: "C", f: 261.63, hasSharp: true },
                          { n: "D", f: 293.66, hasSharp: true },
                          { n: "E", f: 329.63, hasSharp: false },
                          { n: "F", f: 349.23, hasSharp: true },
                          { n: "G", f: 392.0, hasSharp: true },
                          { n: "A", f: 440.0, hasSharp: true },
                          { n: "B", f: 493.88, hasSharp: false },
                          { n: "C2", f: 523.25, hasSharp: false },
                        ].map((k, i) => (
                          <div key={i} className="relative flex snap-start">
                            <button
                              onPointerDown={(e) => {
                                e.preventDefault();
                                playNote(k.f);
                              }}
                              className="w-12 md:w-20 h-48 md:h-80 bg-gradient-to-b from-slate-50 to-white border-x border-slate-200 rounded-b-xl md:rounded-b-2xl active:from-slate-200 active:to-slate-300 transition-all flex items-end justify-center pb-6 shadow-[0_4px_0_0_#cbd5e1] active:shadow-none active:translate-y-1"
                            >
                              <span className="text-slate-400 font-black text-xs md:text-sm">
                                {k.n}
                              </span>
                            </button>

                            {k.hasSharp && (
                              <button
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  playNote(k.f * 1.059463);
                                }}
                                className="absolute z-10 top-0 left-[70%] w-8 md:w-12 h-28 md:h-48 bg-gradient-to-b from-slate-700 to-black rounded-b-lg md:rounded-b-xl active:from-black shadow-xl border-x border-black transition-all flex items-end justify-center pb-4"
                              >
                                <div className="w-[1px] h-8 md:h-10 bg-white/20 rounded-full"></div>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-slate-500 text-[9px] md:text-[10px] font-bold tracking-[4px] uppercase mt-4">
                    Gunakan mouse atau sentuhan untuk bermain
                  </p>
                </div>
              </div>

              {/* 2. RHYTHM & QUIZ GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
                <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-slate-100 shadow-xl">
                  <h3 className="text-lg md:text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <span className="material-icons text-orange-500">
                      grid_view
                    </span>{" "}
                    Rhythm Pad
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        playDrum("kick");
                      }}
                      className="h-32 md:h-36 bg-orange-500 rounded-[24px] md:rounded-[30px] shadow-[0_6px_0_0_#c2410c] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center text-white gap-2"
                    >
                      <span className="material-icons text-3xl md:text-4xl">
                        radio_button_checked
                      </span>
                      <span className="font-black text-[10px] md:text-xs tracking-widest uppercase">
                        KICK
                      </span>
                    </button>
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        playDrum("snare");
                      }}
                      className="h-32 md:h-36 bg-rose-500 rounded-[24px] md:rounded-[30px] shadow-[0_6px_0_0_#be123c] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center text-white gap-2"
                    >
                      <span className="material-icons text-3xl md:text-4xl">
                        layers
                      </span>
                      <span className="font-black text-[10px] md:text-xs tracking-widest uppercase">
                        SNARE
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3. TEBAK NADA (EAR TRAINING) */}
                <div
                  className={`rounded-[32px] md:rounded-[40px] p-6 md:p-8 transition-colors duration-500 border shadow-xl ${
                    quizFeedback === "correct"
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : quizFeedback === "wrong"
                      ? "bg-rose-500 border-rose-600 text-white"
                      : "bg-slate-50 border-slate-100 text-slate-800"
                  }`}
                >
                  <h3 className="text-lg md:text-xl font-black mb-6 flex items-center gap-3">
                    <span className="material-icons">psychology</span> Tebak
                    Nada
                  </h3>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-6">
                    <button
                      onClick={() => playNote(quizFreq)}
                      className="w-full bg-white text-indigo-600 py-3 md:py-4 rounded-xl md:rounded-2xl font-black mb-4 md:mb-6 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <span className="material-icons">play_circle_filled</span>{" "}
                      DENGARKAN NADA
                    </button>
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      {[
                        { label: "C", f: 261.63 },
                        { label: "E", f: 329.63 },
                        { label: "G", f: 392.0 },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          onClick={() => checkGuess(btn.f)}
                          className="py-3 md:py-4 rounded-xl bg-white/20 border-2 border-white/30 font-black hover:bg-white/40 active:bg-white/60 transition-all"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {quizFeedback === "correct"
                      ? "Luar Biasa!"
                      : quizFeedback === "wrong"
                      ? "Salah, coba lagi!"
                      : "Manakah nada tersebut?"}
                  </p>
                </div>
              </div>

              {/* Footer Navigation */}
              <div className="mt-12 md:mt-20 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4 self-start sm:self-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic">
                    07
                  </div>
                  <div className="text-left">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5 tracking-tight">
                      Langkah Selanjutnya
                    </p>
                    <p className="text-slate-700 font-bold text-base md:text-lg">
                      Eksplorasi Galeri Musik
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setStep("galeri")}
                  className="group flex items-center gap-4 bg-secondary hover:bg-yellow-300 text-blue-900 px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#caac00] active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto justify-center"
                >
                  KE GALERI MUSIK
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. GALERI MUSIK (FIXED SPACING) */}
        {step === "galeri" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* --- HEADER NAVIGATION --- */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 md:h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                <button
                  onClick={() => setStep("menu")}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-lg md:text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>

                <div className="flex flex-col items-center">
                  <h2 className="text-lg md:text-2xl font-black tracking-tighter text-blue-900 leading-none uppercase">
                    GALERI <span className="text-emerald-600">BUDAYA</span>
                  </h2>
                  <div className="flex gap-1 mt-1.5 md:mt-2">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 md:w-2 h-1.5 rounded-full bg-slate-200"
                      />
                    ))}
                    <div className="w-5 md:w-6 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                </div>

                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                  <span className="material-icons text-lg md:text-xl">
                    library_music
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-container py-6 md:py-10 px-4 md:px-10">
              {/* --- HERO SECTION --- */}
              <div className="relative rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-800 p-8 md:p-12 text-white overflow-hidden mb-8 shadow-2xl">
                <div className="relative z-10">
                  <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6">
                    Apresiasi Musik • Step 08
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">
                    Jelajah <br />
                    <span className="text-yellow-300 italic">
                      Nada Nusantara
                    </span>
                  </h1>
                  <p className="text-emerald-50 text-base md:text-xl max-w-2xl leading-relaxed">
                    Dengarkan keindahan harmoni lagu daerah dan nasional. Klik
                    daftar lagu di bawah untuk memutar video dan mempelajari
                    latar belakangnya.
                  </p>
                </div>
                <span className="material-icons absolute -right-10 -bottom-10 text-[150px] md:text-[200px] text-white/10 rotate-12 select-none pointer-events-none">
                  queue_music
                </span>
              </div>

              {/* --- VIDEO PLAYER SECTION --- */}
              <div className="mb-10 scroll-mt-20" id="videoPlayer">
                <div className="bg-slate-900 rounded-[24px] md:rounded-[40px] overflow-hidden shadow-3xl border-b-[8px] md:border-b-[12px] border-slate-950">
                  <div className="aspect-video w-full bg-black relative">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&rel=0`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="p-5 md:p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <span className="px-3 py-1 bg-emerald-600 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                          Sedang Diputar
                        </span>
                        <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                          {currentVideo.artist}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black mb-2 leading-tight">
                        {currentVideo.title}
                      </h3>
                      <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed italic opacity-80">
                        {currentVideo.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- PLAYLIST GRID --- */}
              <div className="mb-10">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <span className="material-icons text-xl">
                      playlist_play
                    </span>
                  </span>
                  Daftar Koleksi Lagu
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      t: "Indonesia Pusaka",
                      a: "Lagu Nasional",
                      id: "8KQwWBAq8JQ?si",
                      c: "from-red-500 to-rose-600",
                      d: "Lagu wajib nasional ciptaan Ismail Marzuki yang menggambarkan keindahan tanah air.",
                    },
                    {
                      t: "Manuk Dadali",
                      a: "Jawa Barat",
                      id: "zASs9t6D6EU?si",
                      c: "from-blue-500 to-indigo-600",
                      d: "Lagu daerah berbahasa Sunda yang menceritakan kegagahan burung garuda.",
                    },
                    {
                      t: "Ampar Ampar Pisang",
                      a: "Kalimantan Selatan",
                      id: "3-SUh9f0hEE?si",
                      c: "from-amber-400 to-orange-500",
                      d: "Lagu permainan anak-anak tradisional dari daerah Kalimantan Selatan.",
                    },
                    {
                      t: "Bungong Jeumpa",
                      a: "Aceh",
                      id: "96VSf0gyt5A?si",
                      c: "from-purple-500 to-violet-600",
                      d: "Berarti 'Bunga Cempaka', lagu ini menggambarkan keindahan bunga khas Aceh.",
                    },
                    {
                      t: "Apuse",
                      a: "Papua",
                      id: "ayRrrRBHkDg?si",
                      c: "from-orange-500 to-red-600",
                      d: "Lagu perpisahan cucu dengan kakek/neneknya saat hendak merantau.",
                    },
                    {
                      t: "Rayuan Pulau Kelapa",
                      a: "Lagu Nasional",
                      id: "UlroVhbT5Vo?si",
                      c: "from-teal-500 to-emerald-600",
                      d: "Ismail Marzuki menulis lagu ini untuk memuja keindahan alam kepulauan Indonesia.",
                    },
                  ].map((song, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentVideo({
                          id: song.id,
                          title: song.t,
                          artist: song.a,
                          desc: song.d,
                        });
                        document.getElementById("videoPlayer")?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      className={`group overflow-hidden bg-white p-1 rounded-[28px] border transition-all active:scale-95 ${
                        currentVideo.id === song.id
                          ? "border-emerald-500 ring-4 ring-emerald-100"
                          : "border-slate-100 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <div
                          className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${song.c} flex items-center justify-center text-white`}
                        >
                          <span className="material-icons text-2xl">
                            {currentVideo.id === song.id
                              ? "equalizer"
                              : "play_arrow"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4
                            className={`font-black text-sm truncate ${
                              currentVideo.id === song.id
                                ? "text-emerald-600"
                                : "text-slate-800"
                            }`}
                          >
                            {song.t}
                          </h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            {song.a}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* --- FOOTER NAVIGATION (OPTIMIZED SPACING) --- */}
              <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 pb-12">
                <div className="flex items-center gap-4 self-start sm:self-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic">
                    08
                  </div>
                  <div className="text-left">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                      Langkah Selanjutnya
                    </p>
                    <p className="text-slate-700 font-bold text-base md:text-lg leading-tight">
                      Evaluasi & Kuis Musik
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setStep("kuis")}
                  className="group flex items-center gap-4 bg-secondary hover:bg-yellow-300 text-blue-900 px-8 py-4 rounded-2xl md:rounded-[24px] text-lg font-black shadow-[0_6px_0_0_#caac00] active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto justify-center"
                >
                  MULAI KUIS SEKARANG
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 11. KUIS EVALUASI (MOBILE OPTIMIZED) */}
        {step === "kuis" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Navigation */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 md:h-20">
              <div className="responsive-container h-full px-4 md:px-10 flex items-center justify-between">
                <button
                  onClick={() => setStep("menu")}
                  className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-bold group active:scale-90"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons text-lg md:text-xl group-hover:-translate-x-1 transition-transform">
                      west
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">Menu Utama</span>
                </button>
                <h2 className="text-lg md:text-2xl font-black tracking-tighter text-blue-900 leading-none uppercase text-center">
                  EVALUASI <span className="text-rose-600">KUIS</span>
                </h2>
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg">
                  <span className="material-icons text-lg md:text-xl">
                    assignment
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-container py-8 md:py-12 px-4 md:px-10">
              <div className="max-w-2xl mx-auto">
                {!showResult ? (
                  <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1.5 md:h-2 bg-slate-100 w-full">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCorrect === true
                            ? "bg-emerald-500"
                            : isCorrect === false
                            ? "bg-rose-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${
                            ((currentQuestion + 1) / quizData.length) * 100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center mb-6 md:mb-10 mt-2">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest">
                        Soal {currentQuestion + 1} / {quizData.length}
                      </span>
                      {isCorrect !== null && (
                        <span
                          className={`animate-bounce px-3 py-1.5 rounded-xl font-black text-[10px] md:text-sm uppercase ${
                            isCorrect
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {isCorrect ? "Benar! +20" : "Salah! +0"}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl md:text-3xl font-black text-slate-800 mb-8 md:mb-10 leading-tight">
                      {quizData[currentQuestion].question}
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {quizData[currentQuestion].options.map((opt, i) => {
                        let buttonStyle =
                          "bg-slate-50 border-slate-100 text-slate-700";
                        let icon = "radio_button_unchecked";

                        if (selectedOption !== null) {
                          if (i === quizData[currentQuestion].correct) {
                            buttonStyle =
                              "bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50";
                            icon = "check_circle";
                          } else if (i === selectedOption) {
                            buttonStyle =
                              "bg-rose-50 border-rose-500 text-rose-700";
                            icon = "cancel";
                          } else {
                            buttonStyle =
                              "bg-white border-slate-50 text-slate-300 opacity-50";
                          }
                        }

                        return (
                          <button
                            key={i}
                            disabled={selectedOption !== null}
                            onClick={() => {
                              setSelectedOption(i);
                              const correct =
                                i === quizData[currentQuestion].correct;
                              setIsCorrect(correct);
                              if (correct)
                                setQuizScore(quizScore + 100 / quizData.length);
                              setTimeout(() => {
                                if (currentQuestion + 1 < quizData.length) {
                                  setCurrentQuestion(currentQuestion + 1);
                                  setSelectedOption(null);
                                  setIsCorrect(null);
                                } else {
                                  setShowResult(true);
                                }
                              }, 1500);
                            }}
                            className={`group flex items-center justify-between p-4 md:p-6 border-2 rounded-2xl md:rounded-[24px] transition-all duration-300 text-left active:scale-95 ${buttonStyle}`}
                          >
                            <span className="font-bold text-sm md:text-lg pr-4">
                              {opt}
                            </span>
                            <span className="material-icons text-xl md:text-2xl shrink-0">
                              {icon}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Tampilan Hasil */
                  <div className="bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-12 shadow-2xl text-center border border-slate-100 animate-in zoom-in duration-500">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-icons text-3xl md:text-4xl">
                        emoji_events
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
                      Kuis Selesai!
                    </h3>
                    <div className="text-6xl md:text-7xl font-black text-rose-600 my-6 md:my-8 leading-none">
                      {Math.round(quizScore)}
                    </div>
                    <p className="text-slate-500 font-medium mb-8">
                      Selamat! Kamu telah menyelesaikan evaluasi modul ini.
                    </p>
                    <button
                      onClick={() => {
                        setCurrentQuestion(0);
                        setQuizScore(0);
                        setShowResult(false);
                        setSelectedOption(null);
                        setIsCorrect(null);
                      }}
                      className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95"
                    >
                      ULANGI KUIS
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Navigation (OPTIMIZED) */}
              <div className="mt-12 md:mt-20 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8 pb-10">
                <div className="flex items-center gap-4 self-start sm:self-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 font-black italic">
                    09
                  </div>
                  <div className="text-left">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                      Langkah Terakhir
                    </p>
                    <p className="text-slate-700 font-bold text-base md:text-lg">
                      Selesai & Penutup
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep("penutup")}
                  disabled={!showResult}
                  className={`group flex items-center gap-4 px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#caac00] transition-all w-full sm:w-auto justify-center active:translate-y-1 active:shadow-none
            ${
              showResult
                ? "bg-secondary text-blue-900 opacity-100"
                : "bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed shadow-none"
            }
          `}
                >
                  SELESAIKAN MODUL
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    celebration
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 12. PENUTUP & SERTIFIKAT (MOBILE OPTIMIZED) */}
        {step === "penutup" && (
          <div className="min-h-screen bg-[#FBFBFE] animate-in fade-in zoom-in duration-700 pb-16 pt-6 md:pt-10 px-4">
            <div className="max-w-4xl mx-auto">
              {/* --- AREA SERTIFIKAT --- */}
              <div
                id="certificate-area"
                className="relative bg-white rounded-[32px] md:rounded-[60px] p-8 md:p-20 shadow-3xl border-[8px] md:border-[16px] border-slate-50 overflow-hidden text-center"
              >
                {/* Dekorasi Atas */}
                <div className="absolute top-0 left-0 w-full h-3 md:h-5 bg-gradient-to-r from-blue-600 via-secondary to-emerald-500"></div>

                <div className="relative z-10">
                  {/* Badge Medali */}
                  <div className="inline-flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600 text-white shadow-2xl mb-6 md:mb-10 border-[6px] md:border-[10px] border-white">
                    <span className="material-icons text-4xl md:text-6xl">
                      verified_user
                    </span>
                  </div>

                  <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[4px] md:tracking-[8px] text-slate-400 mb-4">
                    Sertifikat Kelulusan
                  </h2>

                  <h1 className="text-3xl md:text-7xl font-black text-blue-900 mb-6 md:mb-8 tracking-tighter leading-none px-2">
                    EKSPLORASI <br />
                    <span className="text-primary italic text-2xl md:text-6xl uppercase leading-tight">
                      Seni Musik Dasar
                    </span>
                  </h1>

                  <div className="w-20 md:w-32 h-1.5 bg-secondary mx-auto mb-8 md:mb-10 rounded-full"></div>

                  <p className="text-sm md:text-2xl text-slate-600 font-medium mb-10 md:mb-16 leading-relaxed max-w-2xl mx-auto italic px-4">
                    "Diberikan sebagai pengakuan resmi atas keberhasilan
                    menyelesaikan seluruh rangkaian modul pembelajaran Teori
                    Nada, Harmoni, dan Budaya Nusantara."
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 border-t border-slate-100 pt-8 md:pt-12">
                    <div className="text-center md:text-left">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">
                        Tanggal Terbit
                      </p>
                      <p className="text-base md:text-xl font-bold text-slate-800 italic">
                        {new Date().toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-center md:text-right">
                      <div className="flex items-center gap-2 md:gap-3 justify-center md:justify-end">
                        <p className="font-black text-blue-900 text-lg md:text-xl tracking-tighter">
                          EduMusik ID
                        </p>
                      </div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Platform Belajar Seni
                      </p>
                    </div>
                  </div>
                </div>

                {/* Watermark Dekoratif (Hanya muncul di desktop agar tidak mengganggu bacaan mobile) */}
                <span className="material-icons absolute -right-10 -bottom-10 text-[150px] text-slate-50 rotate-12 select-none pointer-events-none hidden md:block">
                  auto_awesome
                </span>
              </div>

              {/* --- ACTION BUTTONS (no-print) --- */}
              <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 md:gap-5 no-print">
                <button
                  onClick={() => window.print()}
                  className="group flex-1 flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white px-6 py-5 md:py-6 rounded-2xl md:rounded-[28px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#334155] active:translate-y-1 active:shadow-none transition-all"
                >
                  <span className="material-icons">file_download</span>
                  UNDUH SERTIFIKAT
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="group flex-1 flex items-center justify-center gap-3 bg-secondary hover:bg-yellow-300 text-blue-900 px-6 py-5 md:py-6 rounded-2xl md:rounded-[28px] text-lg md:text-xl font-black shadow-[0_6px_0_0_#caac00] active:translate-y-1 active:shadow-none transition-all"
                >
                  SELESAI
                  <span className="material-icons group-hover:translate-x-2 transition-transform">
                    check_circle
                  </span>
                </button>
              </div>

              {/* Tips Mobile */}
              <p className="text-center text-slate-400 text-[10px] mt-6 no-print md:hidden">
                Gunakan mode lanskap (miring) untuk tampilan sertifikat yang
                lebih maksimal saat mengunduh.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
