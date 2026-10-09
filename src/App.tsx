/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  Gamepad2, 
  Activity, 
  Shield, 
  Flame,
  Wind,
  Plus,
  Minus,
  Sparkles,
  Info,
  BookOpen,
  X,
  Target,
  ArrowUpDown,
  Zap,
  CheckCircle2,
  Globe,
  Wifi,
  WifiOff,
  Copy,
  Check
} from 'lucide-react';

// Sound Generator using Web Audio API
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public onPlaySound?: (name: string, args: any[]) => void;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHit(type: string = 'normal', isSpecial: boolean = false) {
    if (this.onPlaySound) this.onPlaySound('hit', [type, isSpecial]);
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'shoot') {
      // Powerful laser-sharp shoot ball sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      gain.gain.setValueAtTime(isSpecial ? 0.5 : 0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    } else if (type === 'smash') {
      // Heavy smash sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
      gain.gain.setValueAtTime(isSpecial ? 0.55 : 0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    } else if (type === 'mishit') {
      // Dull wooden frame clonk sound on mishit / flyout
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.15);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    } else if (type === 'miracle') {
      // Sparkling magical chime sound for miracle return!
      [587.33, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        const o = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + idx * 0.04);
        g.gain.setValueAtTime(0.22, now + idx * 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.16);
        o.connect(g);
        g.connect(this.ctx!.destination);
        o.start(now + idx * 0.04);
        o.stop(now + idx * 0.04 + 0.18);
      });
      return;
    } else if (type === 'lob') {
      // High lob whoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    } else {
      // Crisp tennis racket hit
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playBounce(irregular: boolean = false) {
    if (this.onPlaySound) this.onPlaySound('bounce', [irregular]);
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (irregular) {
      // Sharp friction sound on technique spin bounce
      osc.type = 'square';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    } else {
      // Crisper, punchy court bounce
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playPoint() {
    if (this.onPlaySound) this.onPlaySound('point', []);
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [392, 523.25, 659.25].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  }

  playWin() {
    if (this.onPlaySound) this.onPlaySound('win', []);
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.2, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }
}

const sfx = new SoundFX();

export interface EffortValues {
  spd: number; // 足 (速さ) 0〜5
  jmp: number; // ジャンプ (高さと地面に戻るまでの速さ) 0〜5
  pow: number; // 決定力 (スマッシュやシュートボールの速度) 0〜5
  tec: number; // テクニック (バウンド変化: 無振りの場合は一切なし) 0〜5
  car: number; // キャリー力 (ボールを拾う範囲) 0〜5
}

const MAX_TOTAL_EV = 12;

const STAT_CONFIG = [
  { key: 'spd', name: '足', desc: '移動速度 (0振りは安定、5振りで俊足ダッシュ)', icon: Wind },
  { key: 'jmp', name: 'ジャンプ', desc: '高さUP ＆ 素早い着地復帰で隙激減', icon: Activity },
  { key: 'pow', name: '決定力', desc: 'スマッシュ＆シュートボールの弾丸加速', icon: Flame },
  { key: 'tec', name: 'テクニック', desc: 'バウンド変化 (無振は通常、振るとスピン変化)', icon: Sparkles },
  { key: 'car', name: 'キャリー力', desc: '届かない遠いボールも吸い込む守備範囲', icon: Shield },
] as const;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [touchControls, setTouchControls] = useState(false);
  const [showShotGuide, setShowShotGuide] = useState(false);

  // Game UI state
  const [mode, setMode] = useState<number>(1); // 0=2人対戦, 1=かんたん, 2=ふつう, 3=つよい, 4=オンライン対戦
  const [styles, setStyles] = useState<['front' | 'back', 'front' | 'back']>(['front', 'back']);
  const [p1EV, setP1EV] = useState<EffortValues>({ spd: 3, jmp: 2, pow: 3, tec: 2, car: 2 });
  const [p2EV, setP2EV] = useState<EffortValues>({ spd: 3, jmp: 1, pow: 4, tec: 2, car: 2 });
  const [gameState, setGameState] = useState<'select' | 'serve' | 'play' | 'over'>('select');
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [rallyCount, setRallyCount] = useState<number>(0);
  const [bestRally, setBestRally] = useState<number>(0);

  // Online multiplayer state
  const [onlineRoomId, setOnlineRoomId] = useState<string>(() => {
    return 'ROOM' + Math.floor(100 + Math.random() * 900);
  });
  const [onlineStatus, setOnlineStatus] = useState<'disconnected' | 'connecting' | 'waiting' | 'ready'>('disconnected');
  const [onlineRole, setOnlineRole] = useState<'1p' | '2p' | null>(null);
  const [onlineNotice, setOnlineNotice] = useState<string>('');
  const [copiedRoomId, setCopiedRoomId] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const isOnlineHostRef = useRef<boolean>(false);

  // References to communicate with game loop
  const liveGameRef = useRef<{
    state: 'select' | 'serve' | 'play' | 'over';
    mode: number;
    styles: ['front' | 'back', 'front' | 'back'];
    evs: [EffortValues, EffortValues];
    isOnline: boolean;
    onlinePlayerIndex: 0 | 1 | null;
    sendWs: (msg: any) => void;
    startMatch: () => void;
    restartMatch: () => void;
    startMatchLocal: () => void;
    restartMatchLocal: () => void;
    onNetMessage?: (msg: any) => void;
  }>({
    state: 'select',
    mode: 1,
    styles: ['front', 'back'],
    evs: [
      { spd: 3, jmp: 2, pow: 3, tec: 2, car: 2 },
      { spd: 3, jmp: 1, pow: 4, tec: 2, car: 2 }
    ],
    isOnline: false,
    onlinePlayerIndex: null,
    sendWs: () => {},
    startMatch: () => {},
    restartMatch: () => {},
    startMatchLocal: () => {},
    restartMatchLocal: () => {},
  });

  const activeTouchKeys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    sfx.enabled = soundOn;
  }, [soundOn]);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setTouchControls(true);
    }
  }, []);

  useEffect(() => {
    liveGameRef.current.mode = mode;
    liveGameRef.current.styles = styles;
    liveGameRef.current.evs = [p1EV, p2EV];
    liveGameRef.current.isOnline = mode === 4;
    liveGameRef.current.onlinePlayerIndex = onlineRole === '1p' ? 0 : onlineRole === '2p' ? 1 : null;
    liveGameRef.current.sendWs = (msg: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg));
      }
    };
  }, [mode, styles, p1EV, p2EV, onlineRole]);

  const sendConfigOnline = (newStyles: ['front' | 'back', 'front' | 'back'], newP1EV: EffortValues, newP2EV: EffortValues) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && onlineRole) {
      const pIdx = onlineRole === '1p' ? 0 : 1;
      wsRef.current.send(JSON.stringify({
        type: 'config',
        playerIndex: pIdx,
        style: newStyles[pIdx],
        ev: pIdx === 0 ? newP1EV : newP2EV
      }));
    }
  };

  const changeStyle = (playerIndex: 0 | 1, style: 'front' | 'back') => {
    if (mode === 4) {
      if (onlineRole === '1p' && playerIndex === 1) return;
      if (onlineRole === '2p' && playerIndex === 0) return;
    }
    const updated: ['front' | 'back', 'front' | 'back'] = playerIndex === 0 
      ? [style, styles[1]] 
      : [styles[0], style];
    setStyles(updated);
    if (mode === 4) sendConfigOnline(updated, p1EV, p2EV);
  };

  const handleEVChange = (playerIndex: 0 | 1, statKey: keyof EffortValues, delta: number) => {
    if (mode === 4) {
      if (onlineRole === '1p' && playerIndex === 1) return;
      if (onlineRole === '2p' && playerIndex === 0) return;
    }
    const currentEV = playerIndex === 0 ? p1EV : p2EV;
    const currentVal = currentEV[statKey];
    const totalUsed = Object.values(currentEV).reduce((a, b) => a + b, 0);

    if (delta > 0) {
      if (currentVal >= 5) return;
      if (totalUsed >= MAX_TOTAL_EV) return;
    } else {
      if (currentVal <= 0) return;
    }

    const updated = { ...currentEV, [statKey]: currentVal + delta };
    if (playerIndex === 0) {
      setP1EV(updated);
      if (mode === 4) sendConfigOnline(styles, updated, p2EV);
    } else {
      setP2EV(updated);
      if (mode === 4) sendConfigOnline(styles, p1EV, updated);
    }
  };

  const applyPreset = (playerIndex: 0 | 1, preset: EffortValues) => {
    if (mode === 4) {
      if (onlineRole === '1p' && playerIndex === 1) return;
      if (onlineRole === '2p' && playerIndex === 0) return;
    }
    if (playerIndex === 0) {
      setP1EV(preset);
      if (mode === 4) sendConfigOnline(styles, preset, p2EV);
    } else {
      setP2EV(preset);
      if (mode === 4) sendConfigOnline(styles, p1EV, preset);
    }
  };

  const connectOnline = useCallback((targetRoomId?: string) => {
    const roomIdToUse = (targetRoomId || onlineRoomId).trim().toUpperCase();
    if (!roomIdToUse) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setOnlineStatus('connecting');
    setOnlineNotice('サーバーに接続中...');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        roomId: roomIdToUse,
        name: 'Player'
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'joined') {
          const role = msg.playerIndex === 0 ? '1p' : '2p';
          setOnlineRole(role);
          isOnlineHostRef.current = (role === '1p');
          liveGameRef.current.onlinePlayerIndex = msg.playerIndex;

          if (role === '1p') {
            if (msg.playersCount === 2) {
              setOnlineStatus('ready');
              setOnlineNotice('対戦相手(2P)が参加しました！');
            } else {
              setOnlineStatus('waiting');
              setOnlineNotice(`部屋を作成しました (コード: ${roomIdToUse})。相手の参加を待っています...`);
            }
          } else {
            setOnlineStatus('ready');
            setOnlineNotice('部屋に参加しました！ 1Pの試合開始を待っています。');
          }

          if (role === '2p' && msg.p1Config) {
            setStyles((prev) => [msg.p1Config.style, prev[1]]);
            if (msg.p1Config.ev) setP1EV(msg.p1Config.ev);
          }
          if (role === '1p' && msg.p2Config) {
            setStyles((prev) => [prev[0], msg.p2Config.style]);
            if (msg.p2Config.ev) setP2EV(msg.p2Config.ev);
          }

          ws.send(JSON.stringify({
            type: 'config',
            playerIndex: msg.playerIndex,
            style: liveGameRef.current.styles[msg.playerIndex],
            ev: liveGameRef.current.evs[msg.playerIndex]
          }));
        }

        else if (msg.type === 'player_joined') {
          setOnlineStatus('ready');
          setOnlineNotice('対戦相手が参加しました！ スタイルと努力値を決めて開始できます。');
          const myIdx = isOnlineHostRef.current ? 0 : 1;
          ws.send(JSON.stringify({
            type: 'config',
            playerIndex: myIdx,
            style: liveGameRef.current.styles[myIdx],
            ev: liveGameRef.current.evs[myIdx]
          }));
        }

        else if (msg.type === 'player_left') {
          if (isOnlineHostRef.current) {
            setOnlineStatus('waiting');
            setOnlineNotice('対戦相手が退出しました。再参加を待っています...');
          } else {
            setOnlineStatus('disconnected');
            setOnlineNotice('ホストが退出しました。');
          }
        }

        else if (msg.type === 'config') {
          if (msg.playerIndex === 0 && !isOnlineHostRef.current) {
            setStyles((prev) => [msg.style, prev[1]]);
            if (msg.ev) setP1EV(msg.ev);
          } else if (msg.playerIndex === 1 && isOnlineHostRef.current) {
            setStyles((prev) => [prev[0], msg.style]);
            if (msg.ev) setP2EV(msg.ev);
          }
        }

        else if (msg.type === 'start') {
          liveGameRef.current.startMatchLocal();
        }

        else if (msg.type === 'restart') {
          liveGameRef.current.restartMatchLocal();
        }

        else if (msg.type === 'error') {
          setOnlineNotice(`エラー: ${msg.message}`);
          setOnlineStatus('disconnected');
        }

        else if (msg.type === 'p2_input' || msg.type === 'p2_swing' || msg.type === 'sync_game') {
          if (liveGameRef.current.onNetMessage) {
            liveGameRef.current.onNetMessage(msg);
          }
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onclose = () => {
      setOnlineStatus('disconnected');
      setOnlineRole(null);
    };

    ws.onerror = () => {
      setOnlineStatus('disconnected');
      setOnlineNotice('接続エラーが発生しました');
    };
  }, [onlineRoomId]);

  const disconnectOnline = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setOnlineStatus('disconnected');
    setOnlineRole(null);
    setOnlineNotice('');
    liveGameRef.current.onlinePlayerIndex = null;
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Main Canvas & Game Engine
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rawCtx = cv.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    const W = 1280, H = 620, L = 60, R = 1220, NET = 640, GY = 500, NETH = 40;
    const WIN = 7, BALL_R = 6, SPEED_MAX = 1450, G = 1000, PG_BASE = 1500, PS = 0.7;
    const COLORS = ["#ff5d73", "#ffb703"], HAIR = ["#3b2a20", "#2d3a5c"], SKIN = "#ffd9b8";

    // 素の移動速度を落ち着かせ、努力値「足」の恩恵が際立つように調整 (前衛・後衛の個体差は完全保持)
    const STY: Record<string, {
      name: string;
      spd: number;
      fwd: number;
      bwd: number;
      swingMul: number;
      jump: number;
      reach: number;
      hi: number;
      sw: number;
      lock: number;
      jit: number;
      build: number;
      tag: string;
      note: string;
      stats: [string, number][];
    }> = {
      front: { 
        name: "前衛", spd: 220, fwd: 1.18, bwd: 0.8, swingMul: 0.5, jump: 500, reach: 52, hi: 46,
        sw: 0.22, lock: 0.2, jit: 0.2, build: 25,
        tag: "ネットで決めるアタッカー", note: "スイングが速い / ジャンプスマッシュ",
        stats: [["足", 3], ["ジャンプ", 5], ["ネット際", 5], ["ストローク", 2], ["安定感", 2]] 
      },
      back: { 
        name: "後衛", spd: 250, fwd: 1.0, bwd: 0.92, swingMul: 0.85, jump: 420, reach: 43, hi: 62,
        sw: 0.34, lock: 0.08, jit: 0.06, build: 60,
        tag: "粘って押し込むラリー＆シュート", note: "シュートボール / ラリーで球速UP",
        stats: [["足", 5], ["ジャンプ", 2], ["ネット際", 2], ["ストローク", 5], ["安定感", 5]] 
      },
    };

    const keys: Record<string, boolean> = {};

    let state: 'select' | 'serve' | 'play' | 'over' = 'select';
    let score = [0, 0];
    let server = 0;
    let timer = 0;
    let msg = "";
    let rally = 0;
    let best = 0;

    interface Player {
      x: number;
      z: number;
      vz: number;
      ix: number;
      walk: number;
      sw: number;
      lock: number;
      kind: string;
      style: string;
      ev: EffortValues;
      spdMul?: number;
    }

    interface Ball {
      x: number;
      z: number;
      vx: number;
      vz: number;
      speed: number;
      last: number;
      cool: number;
      bounces: number;
      e: number;
      f: number;
      lobs: number;
      hitId?: number;
      techSpinType: 'none' | 'back' | 'top';
      techPower: number; // 0 to 5
      isPowerShot?: boolean;
    }

    let players: Player[] = [];
    let ball: Ball;
    let rings: { x: number; age: number; irregular?: boolean; color?: string }[] = [];
    let dustParticles: { x: number; y: number; vx: number; vy: number; age: number; maxAge: number; color: string }[] = [];
    let popups: { t: string; sub?: string; x: number; z: number; age: number; color?: string }[] = [];
    let ballTrails: { x: number; z: number; age: number; color: string }[] = [];

    const CPU_LV = [
      null,
      { spdMul: 0.70, err: 90, noise: 0.12, lob: 0.22, miss: 0.20 },
      { spdMul: 0.88, err: 40, noise: 0.05, lob: 0.35, miss: 0.07 },
      { spdMul: 1.00, err: 10, noise: 0.02, lob: 0.45, miss: 0.015 },
    ];
    const ai = { hitId: -1, kind: "n", sp: 0.5, err: 0, noise: 0, skip: false };

    const queuedNetSounds: { name: string; args: any[] }[] = [];
    const queuedNetPopups: { t: string; sub?: string; x: number; z: number; color?: string }[] = [];
    const queuedNetRings: { x: number; irregular?: boolean; color?: string }[] = [];

    sfx.onPlaySound = (name: string, args: any[]) => {
      if (liveGameRef.current.isOnline && liveGameRef.current.onlinePlayerIndex === 0) {
        queuedNetSounds.push({ name, args });
      }
    };

    function addPopup(p: { t: string; sub?: string; x: number; z: number; age: number; color?: string }) {
      popups.push(p);
      if (liveGameRef.current.isOnline && liveGameRef.current.onlinePlayerIndex === 0) {
        queuedNetPopups.push({ t: p.t, sub: p.sub, x: p.x, z: p.z, color: p.color });
      }
    }

    function addRing(r: { x: number; age: number; irregular?: boolean; color?: string }) {
      rings.push(r);
      if (liveGameRef.current.isOnline && liveGameRef.current.onlinePlayerIndex === 0) {
        queuedNetRings.push({ x: r.x, irregular: r.irregular, color: r.color });
      }
    }

    const nameOf = (i: number) => (i === 1 && liveGameRef.current.mode >= 1 && liveGameRef.current.mode <= 3 ? "CPU" : `${i + 1}P`);

    function syncState() {
      setGameState(state);
      setScores([score[0], score[1]]);
      setRallyCount(rally);
      setBestRally(best);
      liveGameRef.current.state = state;
    }

    function resetPlayers() {
      const curStyles = liveGameRef.current.styles;
      const curEVs = liveGameRef.current.evs;

      players = [0, 1].map((i) => {
        const style = curStyles[i];
        const front = style === "front";
        const x = i === 0 ? (front ? NET - 170 : L + 190) : (front ? NET + 170 : R - 190);
        return { 
          x, 
          z: 0, 
          vz: 0, 
          ix: 0, 
          walk: 0, 
          sw: -1, 
          lock: 0, 
          kind: "n", 
          style, 
          ev: curEVs[i] 
        };
      });
      players[server].x = server === 0 ? L + 110 : R - 110;
    }

    function placeBall() {
      ball = { 
        x: players[server].x + (server === 0 ? 14 : -14), 
        z: 60, 
        vx: 0, 
        vz: 0, 
        speed: 480,
        last: server, 
        cool: 0, 
        bounces: 0, 
        e: 0.74, 
        f: 0.85, 
        lobs: 0,
        techSpinType: 'none',
        techPower: 0,
        isPowerShot: false,
      };
      ai.hitId = -1;
      ballTrails = [];
    }

    function startMatchLocal() {
      score = [0, 0];
      server = 0;
      rally = 0;
      best = 0;
      resetPlayers();
      placeBall();
      state = "serve";
      timer = 1.2;
      msg = "サーブ!";
      syncState();
    }

    function startMatch() {
      if (liveGameRef.current.mode === 4) {
        if (liveGameRef.current.onlinePlayerIndex === 0) {
          liveGameRef.current.sendWs({ type: 'start' });
          startMatchLocal();
        }
      } else {
        startMatchLocal();
      }
    }

    function restartMatchLocal() {
      state = "select";
      syncState();
    }

    function restartMatch() {
      if (liveGameRef.current.mode === 4) {
        liveGameRef.current.sendWs({ type: 'restart' });
      }
      restartMatchLocal();
    }

    liveGameRef.current.startMatch = startMatch;
    liveGameRef.current.restartMatch = restartMatch;
    liveGameRef.current.startMatchLocal = startMatchLocal;
    liveGameRef.current.restartMatchLocal = restartMatchLocal;

    liveGameRef.current.onNetMessage = (msg: any) => {
      if (liveGameRef.current.mode !== 4) return;
      const myIdx = liveGameRef.current.onlinePlayerIndex;

      if (myIdx === 0) {
        // We are 1P (Host). Receive inputs from 2P.
        if (msg.type === 'p2_input') {
          const p2 = players[1];
          if (p2) {
            p2.x = msg.x;
            p2.z = msg.z;
            p2.vz = msg.vz;
            p2.ix = msg.ix;
            p2.walk = msg.walk;
            if (msg.sw >= 0) {
              p2.sw = msg.sw;
              p2.kind = msg.kind;
            }
          }
        } else if (msg.type === 'p2_swing') {
          const p2 = players[1];
          if (p2) {
            p2.sw = 0;
            p2.kind = msg.kind;
          }
        }
      } else if (myIdx === 1) {
        // We are 2P (Guest). Receive full game snapshot from 1P.
        if (msg.type === 'sync_game') {
          state = msg.state;
          score = msg.score;
          rally = msg.rally;
          server = msg.server;
          msg = msg.msg || '';

          if (msg.ball && ball) {
            ball.x = msg.ball.x;
            ball.z = msg.ball.z;
            ball.vx = msg.ball.vx;
            ball.vz = msg.ball.vz;
            ball.speed = msg.ball.speed;
            ball.bounces = msg.ball.bounces;
            ball.lobs = msg.ball.lobs;
            ball.last = msg.ball.last;
            ball.techSpinType = msg.ball.techSpinType;
            ball.techPower = msg.ball.techPower;
            ball.isPowerShot = msg.ball.isPowerShot;
          }

          if (msg.p1 && players[0]) {
            players[0].x = msg.p1.x;
            players[0].z = msg.p1.z;
            players[0].vz = msg.p1.vz;
            players[0].ix = msg.p1.ix;
            players[0].walk = msg.p1.walk;
            players[0].sw = msg.p1.sw;
            players[0].kind = msg.p1.kind;
            players[0].lock = msg.p1.lock;
          }

          if (msg.popups && Array.isArray(msg.popups)) {
            msg.popups.forEach((pq: any) => {
              popups.push({
                t: pq.t,
                sub: pq.sub,
                x: pq.x,
                z: pq.z,
                age: 0,
                color: pq.color
              });
            });
          }

          if (msg.rings && Array.isArray(msg.rings)) {
            msg.rings.forEach((rg: any) => {
              rings.push({
                x: rg.x,
                age: 0,
                irregular: rg.irregular,
                color: rg.color
              });
            });
          }

          if (msg.sounds && Array.isArray(msg.sounds)) {
            msg.sounds.forEach((snd: any) => {
              if (snd.name === 'hit') sfx.playHit(snd.args[0], snd.args[1]);
              else if (snd.name === 'bounce') sfx.playBounce(snd.args[0]);
              else if (snd.name === 'point') sfx.playPoint();
              else if (snd.name === 'win') sfx.playWin();
            });
          }

          syncState();
        }
      }
    };

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    function updateSinglePlayer(p: Player, i: number, dt: number) {
      const c = [
        { l: "KeyA", r: "KeyD", u: "KeyW", n: ["KeyQ"], b: ["KeyE"], x0: L + 10, x1: NET - 24 },
        { l: "ArrowLeft", r: "ArrowRight", u: "ArrowUp", n: ["Slash"], b: ["Backslash", "IntlBackslash", "IntlRo", "IntlYen"], x0: NET + 24, x1: R - 10 },
      ][i];
      const st = STY[p.style];
      const is2POnline = liveGameRef.current.mode === 4 && liveGameRef.current.onlinePlayerIndex === 1 && i === 1;

      const isR = keys[c.r] || activeTouchKeys.current[c.r] || (is2POnline && (keys["KeyD"] || activeTouchKeys.current["KeyD"]));
      const isL = keys[c.l] || activeTouchKeys.current[c.l] || (is2POnline && (keys["KeyA"] || activeTouchKeys.current["KeyA"]));
      const isU = keys[c.u] || activeTouchKeys.current[c.u] || (is2POnline && (keys["KeyW"] || activeTouchKeys.current["KeyW"]));

      const dx = (isR ? 1 : 0) - (isL ? 1 : 0);
      p.ix = dx; 
      p.walk += Math.abs(dx) * dt * 14;

      // 足 (速さ) 努力値: 0振りは落ち着いた速度、5振りで +60% の高速ダッシュ
      const speedBonus = 1 + (p.ev.spd * 0.12);

      const toward = dx === (i === 0 ? 1 : -1);
      const spd = st.spd * (toward ? st.fwd : st.bwd) * (p.sw >= 0 ? st.swingMul : 1) * (p.spdMul || 1) * speedBonus;
      p.x = Math.max(c.x0, Math.min(c.x1, p.x + dx * spd * dt));

      // ジャンプ (高さと地面に戻るまでの速さ) 努力値
      const jumpBonus = 1 + (p.ev.jmp * 0.12);
      const gravityBonus = 1 + (p.ev.jmp * 0.18);

      if (isU && p.z === 0) {
        p.vz = st.jump * jumpBonus;
      }

      p.vz -= (PG_BASE * gravityBonus) * dt; 
      p.z += p.vz * dt;
      if (p.z <= 0) { p.z = 0; p.vz = 0; }

      if (p.sw >= 0) { 
        p.sw += dt; 
        if (p.sw > st.sw) { p.sw = -1; p.lock = st.lock; } 
      } else {
        p.lock = Math.max(0, p.lock - dt);
        if (p.lock === 0) {
          const hasN = c.n.some((k) => keys[k] || activeTouchKeys.current[k]) || (is2POnline && (keys["KeyQ"] || activeTouchKeys.current["KeyQ"]));
          const hasB = c.b.some((k) => keys[k] || activeTouchKeys.current[k]) || (is2POnline && (keys["KeyE"] || activeTouchKeys.current["KeyE"]));
          if (hasN) { 
            p.sw = 0; p.kind = "n"; 
            if (is2POnline) liveGameRef.current.sendWs({ type: 'p2_swing', kind: 'n' });
          }
          else if (hasB) { 
            p.sw = 0; p.kind = "b"; 
            if (is2POnline) liveGameRef.current.sendWs({ type: 'p2_swing', kind: 'b' });
          }
        }
      }
    }

    function movePlayers(dt: number) {
      if (liveGameRef.current.mode === 4 && liveGameRef.current.onlinePlayerIndex === 0) {
        // Host moves 1P; 2P is updated via network packets
        if (players[0]) updateSinglePlayer(players[0], 0, dt);
      } else {
        players.forEach((p, i) => updateSinglePlayer(p, i, dt));
      }
    }

    function shoot(dir: number, kind: string, p: Player | null) {
      const h = ball.z, ix = p ? p.ix : 0, st = p ? p.style : "back", fr = st === "front";
      const sp = p ? clamp(p.sw / STY[st].sw, 0, 1) : 0.5;

      const rel = p ? clamp((ball.x - p.x) * dir / 36, -1, 1) : 0;
      const away = p ? clamp((Math.abs(p.x - NET) - 350) / 450, -0.15, 0.15) : 0;
      const back = ix === -dir ? 1 : 0, fwd = ix === dir ? 1 : 0;
      const low = h < 24, streak = ball.lobs || 0;
      const high = !!p && kind === "n" && h > STY[st].hi; // 頭上の高い打点
      
      // ネット前の正規ノーバウンドボレー判定 (ネットから260px以内かつ前衛、またはネット際160px以内)
      const nearNet = p ? Math.abs(p.x - NET) < 260 : false;
      const isLegalVolley = !!p && kind === "n" && !high && ball.bounces === 0 && (nearNet && (fr || Math.abs(p.x - NET) < 160));
      const bias = fr ? -0.08 : 0.06;

      // ★【ノーバンの特大デメリット (ミスヒット・フライアウト) ＆ ミラクル返球】
      // スマッシュ(高打点)でもなく、正規のネット前ボレーでもない時のノーバウンド打球
      const isImproperAirHit = !!p && kind === "n" && ball.bounces === 0 && !high && !isLegalVolley;

      let isMiracle = false;
      let isMishit = false;
      if (isImproperAirHit) {
        // ミラクル返球の確率 (基本約18%、テクニックやキャリー力、ジャストタイミングで最大約35%まで上昇)
        const miracleChance = 0.18 + (p ? p.ev.tec * 0.025 + p.ev.car * 0.015 : 0) + (Math.abs(sp - 0.5) < 0.12 ? 0.06 : 0);
        if (Math.random() < miracleChance) {
          isMiracle = true;
        } else {
          isMishit = true; // 約80%の確率でミスヒット
        }
      }

      // 決定力 (スマッシュやシュートボールの速度)
      const finishingBonus = p ? (1 + p.ev.pow * 0.20) : 1;
      const isPowHigh = p ? p.ev.pow >= 4 : false;

      // テクニック (無振りの場合は一切なし、振るとバウンド変化)
      const techVal = p ? p.ev.tec : 0;

      let u, tmin = 0.85, tfix = 0, sf = 1;
      let label = "", subLabel = "", labelColor = "#14212b";
      ball.e = 0.74; ball.f = 0.85;
      ball.techSpinType = 'none';
      ball.techPower = techVal;
      ball.isPowerShot = false;

      // ★ 後衛のシュートボール判定：
      // 後衛が通常ショット(Qまたは/)を打つとき、頭上スマッシュやミスヒット、ミラクルでない限り発動！
      const isShootBall = !fr && !!p && kind === "n" && !high && !isImproperAirHit;

      if (isMishit) {
        // ★ ノーバン吹かしミスヒット！大空へ高く打ち上がって大アウト！(確率特大)
        u = 1.45; // ベースラインを遥かに越えるアウト
        const tx = NET + dir * 720;
        const dist = Math.abs(tx - ball.x);
        const t = 1.35;
        ball.vx = dir * dist / t;
        ball.vz = 760; // 超高弾道で大空へ吹っ飛ぶ！
        ball.bounces = 0;
        ball.lobs = 0;
        ball.hitId = (ball.hitId || 0) + 1;
        ball.isPowerShot = false;

        label = "【ミスヒット!】";
        subLabel = "ノーバン吹かし！大フライアウト！";
        labelColor = "#ef4444";
        sfx.playHit('mishit');

        if (p) {
          addPopup({ 
            t: label, 
            sub: subLabel,
            x: p.x, 
            z: p.z + 85, 
            age: 0, 
            color: labelColor 
          });
        }
        return;
      } else if (isMiracle) {
        // ✨【ミラクル返球!!】稀に成功する奇跡のキャッチ！
        u = 0.30 + Math.random() * 0.18; // ネットを越えた手前〜中間地点にポトリと落ちる
        tmin = 0.75;
        sf = 0.9;
        ball.e = 0.55;
        ball.f = 0.65;
        label = "✨ ミラクル返球!!";
        subLabel = "奇跡のノーバンキャッチ！";
        labelColor = "#38bdf8";
        sfx.playHit('miracle');

        if (p) {
          for (let k = 0; k < 8; k++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 30 + Math.random() * 60;
            dustParticles.push({
              x: p.x,
              y: GY - p.z - 30,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              age: 0,
              maxAge: 0.5,
              color: '#38bdf8'
            });
          }
        }
      } else if (kind === "b") {
        // 【ロブ】 高い山なり放物線
        u = 0.68 + 0.2 * back - 0.25 * fwd - 0.12 * rel + away + (sp - 0.5) * 0.35 - 0.1 * streak + (fr ? -0.1 : 0.05);
        tfix = Math.max(0.85, 1.3 + (low ? 0.2 : 0) - (h > 50 ? 0.2 : 0) + (0.5 - sp) * 0.3 - 0.2 * streak);
        ball.e = 0.8; ball.f = 0.7; 
        label = "ロブ"; 
        subLabel = "山なり軌道";
        sfx.playHit('lob');
      } else if (high) {
        // 【スマッシュ】 頭上の高いボールを叩き落とす！
        u = 0.42 - 0.15 * rel + 0.1 * back + (sp - 0.5) * 0.25 + (fr ? -0.05 : 0.08);
        tmin = fr ? 0.5 : 0.68; 
        ball.e = fr ? 0.5 : 0.6; 
        ball.f = fr ? 0.85 : 0.75; 
        sf = (fr ? 1.25 : 1.05) * finishingBonus;
        ball.speed += (p ? p.ev.pow * 45 : 0);
        ball.isPowerShot = isPowHigh;

        if (p && p.z > 20 && fr) {
          label = isPowHigh ? "豪快ジャンプスマッシュ!!" : "ジャンプスマッシュ!";
          subLabel = "高打点・空中強打";
        } else {
          label = isPowHigh ? "剛速スマッシュ!!" : "スマッシュ!";
          subLabel = "高打点・叩き込み";
        }
        labelColor = "#ef4444";
        sfx.playHit('smash', isPowHigh);
      } else if (isShootBall) {
        // ★【後衛シュートボール】
        // 相手コート深くに確実に突き刺す！ネットに絶対にかからない安全高度クリアランスを保証
        u = 0.72 - 0.1 * rel + 0.08 * back - 0.15 * fwd + away + bias;
        tmin = 0.64 / Math.min(1.6, finishingBonus);
        sf = 1.32 * finishingBonus;
        ball.speed += (p ? p.ev.pow * 48 : 0);
        ball.e = 0.65; 
        ball.f = 0.98;
        ball.isPowerShot = isPowHigh;

        if (sp < 0.35) {
          label = "スライス・シュート";
          subLabel = "早振り低弾道";
          if (techVal > 0) ball.techSpinType = 'back';
        } else if (sp > 0.65) {
          label = "スピン・シュート";
          subLabel = "強烈回転・伸びる";
          if (techVal > 0) ball.techSpinType = 'top';
        } else {
          label = isPowHigh ? "弾丸シュートボール!!" : "シュートボール!";
          subLabel = "後衛の得意ショット";
          if (techVal > 0) ball.techSpinType = 'top';
        }
        labelColor = "#f59e0b";
        sfx.playHit('shoot', isPowHigh);
      } else if (isLegalVolley && fr) {
        // 【前衛ボレー】 ネット前ノーバウンドで鋭く迎撃
        u = 0.32 - 0.1 * rel + (sp - 0.5) * 0.2; 
        tmin = 0.65; 
        sf = 1.2;
        ball.e = 0.5; ball.f = 0.7; 
        label = "ネットボレー!"; 
        subLabel = "ネット前ノーバウンド";
        labelColor = "#06b6d4";
        sfx.playHit('normal');
      } else if (isLegalVolley) {
        // 【後衛ブロック】
        u = 0.42 + (sp - 0.5) * 0.2; 
        tmin = 0.95; 
        sf = 0.85;
        ball.e = 0.6; ball.f = 0.6; 
        label = "ブロック"; 
        subLabel = "ノーバウンド返球";
        sfx.playHit('normal');
      } else if (sp < 0.35) {
        // 【スライス】 早振り
        u = 0.38 - 0.15 * rel + away + bias; 
        tmin = 0.95; 
        sf = 0.82;
        ball.e = 0.5; ball.f = 0.55; 
        label = "スライス";
        subLabel = "早振り・低弾道";

        if (techVal > 0) {
          ball.techSpinType = 'back';
          label = techVal >= 4 ? "魔球スライス" : "スライス";
          subLabel = techVal >= 3 ? "跳ねない＆キックバック" : "バウンド低反発";
          labelColor = "#8b5cf6";
        }
        sfx.playHit('normal');
      } else if (sp > 0.65) {
        // 【トップスピン】 引きつけ
        u = 0.68 - 0.1 * rel + 0.1 * back - 0.15 * fwd + away + bias; 
        tmin = 1.1;
        ball.e = fr ? 0.8 : 0.88; 
        ball.f = fr ? 0.9 : 1.1; 
        label = "トップスピン";
        subLabel = "引きつけ・強回転";

        if (techVal > 0) {
          ball.techSpinType = 'top';
          label = techVal >= 4 ? "爆速トップスピン" : "トップスピン";
          subLabel = "バウンド後スライド加速";
          labelColor = "#10b981";
        }
        sfx.playHit('normal');
      } else {
        // 【ドライブ / ドロップ】
        u = 0.52 - 0.18 * rel + 0.15 * back - 0.2 * fwd + away + bias;
        tmin = (low ? 1.05 : h > 42 ? 0.7 : 0.85) * (fr ? 1.1 : 0.9); 
        ball.f = 0.92;
        label = u < 0.28 ? "ドロップ" : low ? "すくい上げ" : "ドライブ";
        subLabel = u < 0.28 ? "ネット際ドロップ" : "ジャストミート";

        if (u < 0.28 && techVal > 0) {
          ball.techSpinType = 'back';
          label = "ピタ止まりドロップ";
          subLabel = "跳ねずにその場で急停止";
          labelColor = "#8b5cf6";
        }
        sfx.playHit('normal');
      }

      const dn = p ? Math.abs(p.x - NET) : 0;
      if (kind !== "b") { 
        if (fr && dn < 260) sf *= 1.12; 
        if (!fr && dn > 400) sf *= 1.12; 
      }
      if (high && fr && p && p.z > 20) { 
        tmin *= 0.85; 
      }

      // ★ バウンド地点の調整：相手コートの「手前〜深部（ベースライン手前）」に自然にバウンドさせ、
      // 相手がノーバウンドでキャッチするのを防ぎ、1バウンド後に気持ちよく打てるように！
      // 1P時: 800〜1060 (相手コートは640〜1220、相手ポジションは1030〜1100なので、相手の手前で確実にバウンド！)
      u = clamp(u + (Math.random() - 0.5) * STY[st].jit, 0.12, kind === "b" ? 1.05 : 0.88);
      const targetMin = 180;
      const targetMax = isShootBall ? 390 : 360;
      const tx = NET + dir * (targetMin + (targetMax - targetMin) * u);
      const dist = Math.abs(tx - ball.x);
      let t = tfix || Math.max(tmin, dist / (ball.speed * sf));

      ball.vx = dir * dist / t;
      ball.vz = (G * t * t / 2 - ball.z) / t;

      // ★【ネットにかかるのを完全に防ぐ高度保証計算 (Net Clearance Guarantee)】
      // ボールがネット（NET = 640, NETH = 40）を通過する瞬間、ネット上端より必ず+18px以上高い安全高度を保証！
      const distToNet = Math.abs(NET - ball.x);
      const isCrossingNet = (dir === 1 && ball.x < NET) || (dir === -1 && ball.x > NET);
      if (isCrossingNet && distToNet > 10) {
        const tNet = distToNet / Math.abs(ball.vx);
        const requiredNetHeight = NETH + 18; // ネット上端(40)より18px高い58pxを最低保証！
        const minVz = (requiredNetHeight - ball.z + 0.5 * G * tNet * tNet) / tNet;

        if (ball.vz < minVz) {
          // ネットに当たる恐れがある場合、初速vzを引き上げてネットを確実にクリア！
          ball.vz = minVz;
          // 新しいvzに合わせて着地時間t_landを再計算
          const disc = ball.vz * ball.vz + 2 * G * ball.z;
          const tLand = (ball.vz + Math.sqrt(Math.max(0, disc))) / G;
          if (tLand > 0) {
            // 着地位置がコート内に入るようにvxを調整
            ball.vx = dir * dist / tLand;
          }
        }
      }

      ball.bounces = 0;
      ball.lobs = kind === "b" ? streak + 1 : 0;
      ball.hitId = (ball.hitId || 0) + 1;

      if (p) {
        addPopup({ 
          t: label, 
          sub: subLabel,
          x: p.x, 
          z: p.z + 85, 
          age: 0, 
          color: labelColor 
        });
      }
    }

    function launch() {
      const dir = server === 0 ? 1 : -1;
      ball.z = 50; 
      ball.last = server; 
      rally = 0;
      shoot(dir, "n", null);
      state = "play"; 
      msg = "";
      syncState();
    }

    function point(scorer: number, textMsg: string) {
      score[scorer]++;
      best = Math.max(best, rally);
      sfx.playPoint();
      if (score[scorer] >= WIN) { 
        state = "over"; 
        msg = `${nameOf(scorer)} の勝ち!`; 
        sfx.playWin();
        syncState();
        return; 
      }
      server = scorer; 
      resetPlayers(); 
      placeBall();
      state = "serve"; 
      timer = 1.4; 
      msg = textMsg;
      syncState();
    }
    const pt = (sc: number, r: string) => point(sc, `${r} ${nameOf(sc)}の得点`);

    function onBounce() {
      const isIrregular = ball.techSpinType !== 'none' && ball.techPower > 0;
      const bounceColor = ball.techSpinType === 'back' ? '#a855f7' : ball.techSpinType === 'top' ? '#10b981' : '#facc15';

      // ★ バウンドがハッキリ分かるインパクトリング
      addRing({ 
        x: ball.x, 
        age: 0, 
        irregular: isIrregular,
        color: bounceColor
      });

      // ★ バウンド時の地面ダスト爆発エフェクト (6個の土煙パーティクル)
      for (let k = 0; k < 6; k++) {
        const ang = Math.PI + (Math.random() - 0.5) * 1.6;
        const spd = 40 + Math.random() * 80;
        dustParticles.push({
          x: ball.x,
          y: GY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd * 0.4,
          age: 0,
          maxAge: 0.35 + Math.random() * 0.2,
          color: bounceColor
        });
      }

      sfx.playBounce(isIrregular);

      const h = ball.last, side = ball.x < NET ? 0 : 1;
      if (ball.bounces === 0) {
        if (side === h) return pt(1 - h, "自陣バウンド!");
        if (ball.x < L || ball.x > R) return pt(1 - h, "アウト!");
        ball.bounces = 1;

        // ★ 1バウンド目の視覚的通知ポップアップ
        addPopup({
          t: "1 BOUND!",
          sub: "今が打ち頃！",
          x: ball.x,
          z: 32,
          age: 0,
          color: "#38bdf8"
        });
      } else {
        pt(h, "ツーバウンド!");
      }
    }

    function updateBall(dt: number) {
      const px = ball.x;
      ball.x += ball.vx * dt;
      ball.vz -= G * dt; 
      ball.z += ball.vz * dt;
      ball.cool = Math.max(0, ball.cool - dt);

      // パワーショット軌跡の追加
      if (ball.isPowerShot || ball.techSpinType !== 'none') {
        ballTrails.push({
          x: ball.x,
          z: ball.z,
          age: 0,
          color: ball.isPowerShot ? '#f59e0b' : ball.techSpinType === 'back' ? '#a855f7' : '#10b981'
        });
      }

      if ((px - NET) * (ball.x - NET) < 0 && ball.z < NETH) return pt(1 - ball.last, "ネット!");

      if (ball.z <= 0) {
        ball.z = 0;
        if (ball.vz < -120) {
          onBounce();
          if (state !== "play") return;

          // ★ テクニック (無振りの場合は一切なし！振っていると劇的なバウンド変化)
          if (ball.techSpinType === 'back' && ball.techPower > 0) {
            // スライス/ドロップ: バウンドしても全然上に上がらない！さらに後ろへ逆走キックバック！
            const decay = Math.max(0.04, 1 - ball.techPower * 0.19);
            ball.vz = -ball.vz * ball.e * decay;
            
            if (ball.techPower >= 3) {
              const returnSpeed = 40 + ball.techPower * 40;
              ball.vx = -Math.sign(ball.vx) * returnSpeed;
              addPopup({ 
                t: "【キックバック!】", 
                sub: "後ろに戻る魔球！前に走れ！",
                x: ball.x, 
                z: 40, 
                age: 0, 
                color: "#8b5cf6" 
              });
            } else {
              ball.vx = ball.vx * ball.f * 0.2;
              addPopup({ 
                t: "【低反発ドロップ】", 
                sub: "跳ねずに急ブレーキ！",
                x: ball.x, 
                z: 40, 
                age: 0, 
                color: "#8b5cf6" 
              });
            }
          } else if (ball.techSpinType === 'top' && ball.techPower > 0) {
            // トップスピン/シュートボール: バウンド時に低空で前方に大加速！
            const slide = 1 + ball.techPower * 0.24;
            ball.vz = -ball.vz * ball.e * Math.max(0.25, 0.75 - ball.techPower * 0.08);
            ball.vx = ball.vx * ball.f * slide;
            addPopup({ 
              t: "【低空スライド加速!】", 
              sub: "バウンド後に奥へ急加速！",
              x: ball.x, 
              z: 40, 
              age: 0, 
              color: "#10b981" 
            });
          } else {
            // 通常バウンド (無振り)
            ball.vz = -ball.vz * ball.e; 
            ball.vx *= ball.f;
          }
        } else ball.vz = 0;
      }

      players.forEach((p, i) => {
        const dir = i === 0 ? 1 : -1;
        if (p.sw < 0 || ball.last === i || ball.cool > 0) return;
        if (i === 0 ? ball.x > NET + 30 : ball.x < NET - 30) return;
        const cz = (p.kind === "b" ? 38 : 52) * PS;

        // キャリー力 (ボールを拾う範囲) 努力値
        const carryBonus = p.ev.car * 14;
        const effectiveReach = STY[p.style].reach + carryBonus + (p.style === "front" && Math.abs(p.x - NET) < 260 ? 8 : 0) + BALL_R;

        if (Math.hypot(ball.x - (p.x + dir * 18 * PS), (ball.z + BALL_R) - (p.z + cz)) > effectiveReach) return;

        // キャリー力で遠くから拾った場合のエフェクト
        if (p.ev.car >= 3 && Math.hypot(ball.x - (p.x + dir * 18 * PS), (ball.z + BALL_R) - (p.z + cz)) > STY[p.style].reach + 15) {
          addPopup({
            t: `【吸い込みレシーブ!】`,
            sub: `キャリー力Lv.${p.ev.car}`,
            x: p.x,
            z: p.z + 110,
            age: 0,
            color: "#38bdf8"
          });
        }

        ball.speed = Math.min(SPEED_MAX, ball.speed + STY[p.style].build);
        shoot(dir, p.kind, p);
        ball.last = i; 
        ball.cool = 0.15; 
        rally++;
        syncState();
      });

      if (ball.x < L || ball.x > R) {
        if (ball.bounces >= 1) pt(ball.last, "ミス!");
        else pt(1 - ball.last, "アウト!");
      }
    }

    function predict(thr: number, minX: number, mustBounce: boolean = false) {
      let x = ball.x, z = ball.z, vx = ball.vx, vz = ball.vz, b = ball.bounces;
      const dt = 1 / 60;
      for (let k = 1; k <= 300; k++) {
        const px = x;
        x += vx * dt; 
        vz -= G * dt; 
        z += vz * dt;
        if ((px - NET) * (x - NET) < 0 && z < NETH) return null;
        if (z <= 0) {
          z = 0;
          if (vz < -120) {
            if (b === 0 && (x < NET || x > R)) return null;
            if (b >= 1) return null;
            b = 1; 
            vz = -vz * ball.e; 
            vx *= ball.f;
          } else vz = 0;
        }
        if (x > R + 40 || x < L - 40) return null;
        if (mustBounce && b === 0 && z <= 55) continue;
        if (x >= minX && z <= thr) return { t: k * dt, x, z };
      }
      return null;
    }

    function cpuThink() {
      const curMode = liveGameRef.current.mode;
      const p = players[1], st = STY[p.style], lv = CPU_LV[curMode], front = p.style === "front";
      if (!lv) return;
      const K = { l: "ArrowLeft", r: "ArrowRight", u: "ArrowUp", n: "Slash", b: "Backslash" };
      keys[K.l] = keys[K.r] = keys[K.u] = keys[K.n] = keys[K.b] = false;
      p.spdMul = lv.spdMul;
      let target = front ? NET + 170 : R - 190;

      if (state === "play" && ball.last === 0) {
        if (ball.hitId !== ai.hitId) {
          ai.hitId = ball.hitId || 0;
          ai.err = (Math.random() * 2 - 1) * lv.err;
          ai.noise = (Math.random() * 2 - 1) * lv.noise;
          ai.skip = Math.random() < lv.miss;
          const near = players[0].x > NET - 260, deepOpp = players[0].x < L + 320, r = Math.random();
          ai.kind = Math.random() < lv.lob * (near ? 1.8 : 0.5) * (front ? 0.6 : 1) ? "b" : "n";
          ai.sp = ai.kind === "b" ? 0.5
            : deepOpp ? (r < 0.5 ? 0.2 : r < 0.8 ? 0.5 : 0.85)
            : (r < 0.15 ? 0.2 : r < 0.6 ? 0.5 : 0.85);
        }
        const thr = ai.kind === "b" ? 30 : front ? 72 : 38;
        // 前衛でネット際以外は、スマッシュを除いて1バウンド待って打つ（ミスヒット防止）
        const mustBounce = !front || target > NET + 260;
        const plan = predict(thr, front ? NET + 20 : NET + 140, mustBounce);
        if (plan) {
          target = plan.x + 18 * PS + ai.err;
          if (plan.z > 55 && p.z === 0 && plan.t < 0.34 && plan.t > 0.12) keys[K.u] = true;
          const lead = ai.sp * st.sw + 0.05 + ai.noise;
          if (!ai.skip && plan.t <= lead && p.sw < 0 && p.lock === 0 && Math.abs(p.x - target) < 40) {
            keys[ai.kind === "b" ? K.b : K.n] = true;
          }
        }
      }
      target = clamp(target, NET + 24, R - 10);
      const d = target - p.x;
      if (Math.abs(d) > 6) keys[d > 0 ? K.r : K.l] = true;
    }

    function update(dt: number) {
      if (state === "select" || state === "over") return;
      if (liveGameRef.current.mode === 4) {
        // Online match mode
        const myIdx = liveGameRef.current.onlinePlayerIndex;
        if (myIdx === 0) {
          // 1P is host: move players & simulate ball
          movePlayers(dt);
          if (state === "serve") { 
            timer -= dt; 
            if (timer <= 0) launch(); 
          }
          else if (state === "play") updateBall(dt);
        } else if (myIdx === 1) {
          // 2P is guest: predict own movement locally for instantaneous response
          if (players[1]) updateSinglePlayer(players[1], 1, dt);
          // Ball is extrapolated smoothly between network snapshots
          if (ball && state === "play") {
            ball.x += ball.vx * dt;
            ball.vz -= G * dt;
            ball.z = Math.max(0, ball.z + ball.vz * dt);
          }
        }
      } else {
        if (liveGameRef.current.mode >= 1 && liveGameRef.current.mode <= 3) cpuThink();
        movePlayers(dt);
        if (state === "serve") { 
          timer -= dt; 
          if (timer <= 0) launch(); 
        }
        else if (state === "play") updateBall(dt);
      }
    }

    // Canvas drawing
    function drawScene() {
      const g = ctx.createLinearGradient(0, 0, 0, GY);
      g.addColorStop(0, "#9fd3ee"); 
      g.addColorStop(1, "#e4f4fb");
      ctx.fillStyle = g; 
      ctx.fillRect(0, 0, W, GY);
      ctx.fillStyle = "#2b5d7e"; 
      ctx.fillRect(0, GY - 130, W, 130);
      ctx.fillStyle = "#357092";
      for (let k = 0; k < 8; k++) ctx.fillRect(30 + k * 156, GY - 100, 126, 44);
      ctx.fillStyle = "#245a96"; 
      ctx.fillRect(0, GY, W, H - GY);
      ctx.fillStyle = "#2f6fb5"; 
      ctx.fillRect(L, GY, R - L, H - GY);
      ctx.fillStyle = "#fff";
      ctx.fillRect(L - 2, GY - 2, R - L + 4, 4);
      [L, R].forEach((x) => ctx.fillRect(x - 2, GY, 4, H - GY));
      [NET - 300, NET + 300].forEach((x) => ctx.fillRect(x - 1, GY, 2, H - GY));
    }

    function drawNet() {
      ctx.fillStyle = "rgba(255,255,255,.28)"; 
      ctx.fillRect(NET - 3, GY - NETH, 6, NETH);
      ctx.strokeStyle = "rgba(255,255,255,.55)"; 
      ctx.lineWidth = 1;
      for (let y = GY - NETH + 6; y < GY; y += 6) { 
        ctx.beginPath(); 
        ctx.moveTo(NET - 3, y); 
        ctx.lineTo(NET + 3, y); 
        ctx.stroke(); 
      }
      ctx.fillStyle = "#fff"; 
      ctx.fillRect(NET - 4, GY - NETH - 3, 8, 4);
      ctx.fillStyle = "#e8edf2"; 
      ctx.fillRect(NET - 1.5, GY - NETH - 3, 3, NETH + 8);
    }

    function drawPlayer(p: Player, i: number, now: number) {
      const dir = i === 0 ? 1 : -1, air = p.z > 0, moving = p.ix !== 0, ph = Math.sin(p.walk);
      
      // 影
      ctx.fillStyle = `rgba(0,0,0,${Math.max(0.1, 0.28 - p.z / 400)})`;
      ctx.beginPath(); 
      ctx.ellipse(p.x, GY + 5, Math.max(7, 15 - p.z / 12), 3.5, 0, 0, 7); 
      ctx.fill();

      // キャリー力 (拾う範囲) のオーラサークル可視化
      const carryRange = STY[p.style].reach + p.ev.car * 14;
      if (p.ev.car > 0) {
        ctx.strokeStyle = p.ev.car >= 4 ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.14)";
        ctx.lineWidth = p.ev.car >= 4 ? 1.5 : 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(p.x + dir * 18 * PS, GY - p.z - 30, carryRange, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // スイング中：タイミングゲージのリアルタイム頭上描画
      if (p.sw >= 0) {
        const prog = clamp(p.sw / STY[p.style].sw, 0, 1);
        const meterW = 46;
        const meterH = 6;
        const meterX = p.x - meterW / 2;
        const meterY = GY - p.z - 88;

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.beginPath();
        ctx.roundRect(meterX - 2, meterY - 2, meterW + 4, meterH + 4, 3);
        ctx.fill();

        ctx.fillStyle = "#3b82f6"; ctx.fillRect(meterX, meterY, meterW * 0.35, meterH);
        ctx.fillStyle = "#f59e0b"; ctx.fillRect(meterX + meterW * 0.35, meterY, meterW * 0.3, meterH);
        ctx.fillStyle = "#10b981"; ctx.fillRect(meterX + meterW * 0.65, meterY, meterW * 0.35, meterH);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(meterX + prog * meterW - 1.5, meterY - 2, 3, meterH + 4);
      }

      ctx.save(); 
      ctx.translate(p.x, GY - p.z); 
      ctx.scale(dir * PS, PS);
      ctx.lineCap = "round"; 
      ctx.lineJoin = "round";

      const feet = [-1, 1].map((s) => ({
        x: air ? s * 7 : moving ? ph * s * 11 : s * 5,
        y: air ? -12 : -3 - (moving ? Math.max(0, ph * s) * 6 : 0), 
        s,
      }));

      ctx.strokeStyle = SKIN; 
      ctx.lineWidth = 5;
      ctx.beginPath(); 
      ctx.moveTo(-7, -48); 
      ctx.lineTo(-10, -33 + (air ? -6 : 0)); 
      ctx.stroke();
      ctx.lineWidth = 6;
      feet.forEach((f) => { 
        ctx.beginPath(); 
        ctx.moveTo(f.s * 4, -26); 
        ctx.lineTo(f.x, f.y - 3); 
        ctx.stroke(); 
      });
      feet.forEach((f) => {
        ctx.fillStyle = "#fff"; 
        ctx.strokeStyle = "#444"; 
        ctx.lineWidth = 1.5;
        ctx.beginPath(); 
        ctx.ellipse(f.x + 3, f.y, 7, 4, 0, 0, 7); 
        ctx.fill(); 
        ctx.stroke();
      });

      ctx.fillStyle = COLORS[i];
      ctx.beginPath(); 
      ctx.roundRect(-11, -54, 22, 30, 8); 
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath(); 
      ctx.roundRect(-11, -30, 22, 10, 4); 
      ctx.fill();

      ctx.fillStyle = HAIR[i];
      ctx.beginPath(); 
      ctx.ellipse(-8, -68, 10, 12, 0, 0, 7); 
      ctx.fill();

      ctx.fillStyle = SKIN; 
      ctx.strokeStyle = "rgba(0,0,0,.25)"; 
      ctx.lineWidth = 1;
      ctx.beginPath(); 
      ctx.arc(0, -70, 16, 0, 7); 
      ctx.fill(); 
      ctx.stroke();

      ctx.fillStyle = HAIR[i];
      ctx.beginPath(); 
      ctx.arc(0, -70, 16.5, Math.PI, Math.PI * 2); 
      ctx.fill();

      if (p.style === "front") {
        ctx.fillStyle = COLORS[i];
        ctx.beginPath(); 
        ctx.arc(0, -71, 17, Math.PI, Math.PI * 2); 
        ctx.fill();
        ctx.beginPath(); 
        ctx.roundRect(4, -76, 22, 5, 2); 
        ctx.fill();
      } else {
        ctx.strokeStyle = "#fff"; 
        ctx.lineWidth = 4;
        ctx.beginPath(); 
        ctx.arc(0, -70, 14, Math.PI * 1.08, Math.PI * 1.92); 
        ctx.stroke();
      }

      ctx.fillStyle = "#222";
      ctx.beginPath(); 
      ctx.arc(4, -68, 2.3, 0, 7); 
      ctx.arc(10, -68, 2.3, 0, 7); 
      ctx.fill();
      ctx.fillStyle = "rgba(255,110,140,.5)"; 
      ctx.beginPath(); 
      ctx.arc(13, -62, 3, 0, 7); 
      ctx.fill();
      ctx.strokeStyle = "#a33"; 
      ctx.lineWidth = 1.5;
      ctx.beginPath(); 
      ctx.arc(7.5, -63, 3, 0.2, Math.PI - 0.2); 
      ctx.stroke();

      let a = 0.45 + Math.sin(now / 300 + i) * 0.05;
      if (p.sw >= 0) { 
        const u = Math.min(1, p.sw / STY[p.style].sw), e = 1 - (1 - u) * (1 - u); 
        a = p.kind === "b" ? 1.5 - 2.9 * e : -2.4 + 3.4 * e; 
      }
      const sx = 6, sy = -48, hx = sx + 15 * Math.cos(a), hy = sy + 15 * Math.sin(a);
      ctx.strokeStyle = SKIN; 
      ctx.lineWidth = 5;
      ctx.beginPath(); 
      ctx.moveTo(sx, sy); 
      ctx.lineTo(hx, hy); 
      ctx.stroke();

      ctx.save(); 
      ctx.translate(hx, hy); 
      ctx.rotate(a);
      ctx.strokeStyle = "#5a3a22"; 
      ctx.lineWidth = 3.5;
      ctx.beginPath(); 
      ctx.moveTo(-3, 0); 
      ctx.lineTo(15, 0); 
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.2)"; 
      ctx.strokeStyle = "#f2f2f2"; 
      ctx.lineWidth = 3;
      ctx.beginPath(); 
      ctx.ellipse(29, 0, 14, 10, 0, 0, 7); 
      ctx.fill(); 
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.65)"; 
      ctx.lineWidth = 0.8;
      for (let k = -2; k <= 2; k++) { 
        ctx.beginPath(); 
        ctx.moveTo(29 + k * 5, -8); 
        ctx.lineTo(29 + k * 5, 8); 
        ctx.stroke(); 
      }
      for (let k = -1; k <= 1; k++) { 
        ctx.beginPath(); 
        ctx.moveTo(18, k * 5); 
        ctx.lineTo(40, k * 5); 
        ctx.stroke(); 
      }
      ctx.restore();
      ctx.restore();
    }

    function text(s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "center", weight: number = 800) {
      ctx.font = `${weight} ${size}px "Hiragino Sans","Yu Gothic",system-ui,sans-serif`;
      ctx.fillStyle = color; 
      ctx.textAlign = align; 
      ctx.textBaseline = "middle";
      ctx.fillText(s, x, y);
    }

    function draw(now: number) {
      drawScene();
      const nm = (i: number) => {
        const p = players[i];
        if (!p) return "";
        return STY[p.style].name;
      };

      // スコア & プレイヤーHUD
      text(String(score[0]), 560, 48, 46, COLORS[0], "center", 900);
      text("—", 640, 48, 30, "#14212b", "center", 500);
      text(String(score[1]), 720, 48, 46, COLORS[1], "center", 900);
      
      text(`1P ${nm(0)}`, L + 20, 42, 22, COLORS[0], "left");
      text(`${nm(1)} ${nameOf(1)}`, R - 20, 42, 22, COLORS[1], "right");

      if (players[0] && players[1]) {
        const e0 = players[0].ev;
        const e1 = players[1].ev;
        text(`足:${e0.spd} 跳:${e0.jmp} 決:${e0.pow} 技:${e0.tec} 拾:${e0.car}`, L + 20, 68, 12, "#94a3b8", "left", 600);
        text(`足:${e1.spd} 跳:${e1.jmp} 決:${e1.pow} 技:${e1.tec} 拾:${e1.car}`, R - 20, 68, 12, "#94a3b8", "right", 600);
      }

      text(`ラリー ${rally}`, W / 2, H - 16, 18, "#cfe3f7", "center", 600);
      drawNet();

      if (state === "select") { 
        return; 
      }

      // ★【バウンド着地予測マーカー】(ノーバウンド返球を防ぎ、バウンドを予告する！)
      // ボールが飛行中かつノーバウンドの時、地面(z=0)に到達するX座標を計算してコート上にターゲットサークルを描画
      if (state === "play" && ball.bounces === 0 && ball.vz < 600) {
        const disc = ball.vz * ball.vz + 2 * G * ball.z;
        if (disc >= 0) {
          const tLand = (ball.vz + Math.sqrt(disc)) / G;
          if (tLand > 0 && tLand < 1.8) {
            const xLand = ball.x + ball.vx * tLand;
            if (xLand >= L && xLand <= R) {
              const pulse = (Math.sin(now / 80) + 1) * 0.5;
              const markerR = 14 + pulse * 6;

              // 着地ターゲット外枠
              ctx.strokeStyle = "rgba(250, 204, 21, 0.75)";
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.ellipse(xLand, GY + 5, markerR, markerR * 0.35, 0, 0, Math.PI * 2);
              ctx.stroke();

              // 内側のターゲット点
              ctx.fillStyle = "rgba(250, 204, 21, 0.9)";
              ctx.beginPath();
              ctx.ellipse(xLand, GY + 5, 4, 2, 0, 0, Math.PI * 2);
              ctx.fill();

              // バウンド予告ラベル
              ctx.fillStyle = "rgba(250, 204, 21, 0.9)";
              ctx.font = '700 11px system-ui';
              ctx.textAlign = "center";
              ctx.fillText("▼バウンド", xLand, GY - 10);
            }
          }
        }
      }

      // ボールの光跡 (パワーショット / テクニックスピン)
      ballTrails.forEach((tr) => {
        ctx.fillStyle = tr.color;
        ctx.globalAlpha = Math.max(0, 0.6 * (1 - tr.age / 0.35));
        ctx.beginPath();
        ctx.arc(tr.x, GY - tr.z - BALL_R, BALL_R * (1 - tr.age / 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // ★ バウンド時の劇的な波紋リング (ダブルリング)
      rings.forEach((r) => {
        const alpha = Math.max(0, 0.9 * (1 - r.age / 0.5));
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = r.color || "#fff"; 
        ctx.lineWidth = r.irregular ? 3.5 : 2.5;

        // 外側リング
        ctx.beginPath(); 
        ctx.ellipse(r.x, GY + 5, 8 + r.age * 70, (8 + r.age * 70) * 0.35, 0, 0, Math.PI * 2); 
        ctx.stroke();

        // 内側リング
        ctx.beginPath(); 
        ctx.ellipse(r.x, GY + 5, 4 + r.age * 40, (4 + r.age * 40) * 0.35, 0, 0, Math.PI * 2); 
        ctx.stroke();

        ctx.globalAlpha = 1;
      });

      // ★ バウンド時の地面ダストパーティクル
      dustParticles.forEach((d) => {
        const alpha = Math.max(0, 1 - d.age / d.maxAge);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(d.x, d.y + 4, 3 * (1 - d.age / d.maxAge), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      players.forEach((p, i) => drawPlayer(p, i, now));

      // 打球名＆解説ポップアップ
      popups.forEach((q) => {
        const alpha = Math.max(0, 1 - q.age / 0.95);
        ctx.globalAlpha = alpha;

        text(q.t, q.x, GY - q.z - q.age * 28, 20, q.color || "#14212b", "center", 900);
        if (q.sub) {
          text(q.sub, q.x, GY - q.z - q.age * 28 + 20, 13, "#334155", "center", 700);
        }
        ctx.globalAlpha = 1;
      });

      // ★【ボールの立体影】
      // ボールが地面に近づくほど影が濃く小さくなり、高くなるほど広く薄くなる！
      const bz = ball.z + (state === "serve" ? Math.sin(now / 150) * 3 : 0);
      const shadowAlpha = Math.max(0.12, 0.45 - ball.z / 350);
      const shadowScale = Math.max(0.7, 1 + ball.z / 180);
      ctx.fillStyle = `rgba(15, 23, 42, ${shadowAlpha})`;
      ctx.beginPath(); 
      ctx.ellipse(ball.x, GY + 5, BALL_R * 1.6 * shadowScale, BALL_R * 0.5 * shadowScale, 0, 0, Math.PI * 2); 
      ctx.fill();

      // テクニックスピン中のボールオーラ
      if (ball.techSpinType !== 'none') {
        ctx.fillStyle = ball.techSpinType === 'top' ? "rgba(16,185,129,0.4)" : "rgba(168,85,247,0.4)";
        ctx.beginPath();
        ctx.arc(ball.x, GY - bz - BALL_R, BALL_R * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ボール本体
      ctx.fillStyle = "#e8ff3b"; 
      ctx.strokeStyle = "#fff"; 
      ctx.lineWidth = 1.2;
      ctx.beginPath(); 
      ctx.arc(ball.x, GY - bz - BALL_R, BALL_R, 0, 7); 
      ctx.fill();
      ctx.beginPath(); 
      ctx.arc(ball.x - BALL_R * 1.1, GY - bz - BALL_R, BALL_R * 0.85, -0.9, 0.9); 
      ctx.stroke();

      if (state === "serve") text(msg, W / 2, 130, 32, "#14212b");
      else if (state === "over") {
        ctx.fillStyle = "rgba(10,25,45,.85)"; 
        ctx.fillRect(L, 100, R - L, 360);
        text(msg, W / 2, 210, 64, "#fff", "center", 900);
        text(`最長ラリー ${best}`, W / 2, 285, 24, "#dbe8f5", "center", 500);
        text("Space キー か 画面タップで設定画面へ", W / 2, 345, 26, "#e8ff3b");
      }
    }

    let animId: number;
    let prev = performance.now();
    let lastNetSync = 0;

    function frame(now: number) {
      const dt = Math.min(0.033, (now - prev) / 1000); 
      prev = now;
      update(dt);

      // Online network sync
      if (liveGameRef.current.mode === 4 && now - lastNetSync >= 25) { // ~40 fps
        lastNetSync = now;
        const myIdx = liveGameRef.current.onlinePlayerIndex;
        if (myIdx === 0 && (state === 'play' || state === 'serve' || state === 'over')) {
          liveGameRef.current.sendWs({
            type: 'sync_game',
            state,
            score,
            rally,
            server,
            msg,
            ball: ball ? {
              x: ball.x,
              z: ball.z,
              vx: ball.vx,
              vz: ball.vz,
              speed: ball.speed,
              bounces: ball.bounces,
              lobs: ball.lobs,
              last: ball.last,
              techSpinType: ball.techSpinType,
              techPower: ball.techPower,
              isPowerShot: ball.isPowerShot
            } : null,
            p1: players[0] ? {
              x: players[0].x,
              z: players[0].z,
              vz: players[0].vz,
              ix: players[0].ix,
              walk: players[0].walk,
              sw: players[0].sw,
              kind: players[0].kind,
              lock: players[0].lock
            } : null,
            popups: queuedNetPopups.splice(0),
            rings: queuedNetRings.splice(0),
            sounds: queuedNetSounds.splice(0)
          });
        } else if (myIdx === 1 && (state === 'play' || state === 'serve')) {
          const p2 = players[1];
          if (p2) {
            liveGameRef.current.sendWs({
              type: 'p2_input',
              x: p2.x,
              z: p2.z,
              vz: p2.vz,
              ix: p2.ix,
              walk: p2.walk,
              sw: p2.sw,
              kind: p2.kind,
              lock: p2.lock
            });
          }
        }
      }

      rings.forEach((r) => (r.age += dt)); 
      rings = rings.filter((r) => r.age < 0.5);

      dustParticles.forEach((d) => {
        d.age += dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      });
      dustParticles = dustParticles.filter((d) => d.age < d.maxAge);

      popups.forEach((q) => (q.age += dt)); 
      popups = popups.filter((q) => q.age < 0.95);
      ballTrails.forEach((tr) => (tr.age += dt));
      ballTrails = ballTrails.filter((tr) => tr.age < 0.35);
      draw(now);
      animId = requestAnimationFrame(frame);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","Slash","Backslash","IntlRo","IntlYen"].includes(e.code)) {
        e.preventDefault();
      }
      keys[e.code] = true;

      if (state === "over" && e.code === "Space") {
        restartMatch();
        return;
      }

      if (state === "select") {
        if (e.code === "Space") {
          startMatch();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const handleCanvasClick = () => {
      cv.focus();
      if (state === "over") {
        restartMatch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    cv.addEventListener("click", handleCanvasClick);

    resetPlayers(); 
    placeBall();
    syncState();
    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cv.removeEventListener("click", handleCanvasClick);
    };
  }, []);

  // Update CPU EVs according to CPU difficulty & style when mode changes
  useEffect(() => {
    if (mode === 0 || mode === 4) return;
    const cpuStyle = styles[1];
    if (mode === 1) {
      setP2EV({ spd: 2, jmp: 2, pow: 2, tec: 2, car: 2 });
    } else if (mode === 2) {
      if (cpuStyle === 'front') {
        setP2EV({ spd: 3, jmp: 4, pow: 3, tec: 0, car: 2 });
      } else {
        setP2EV({ spd: 3, jmp: 1, pow: 4, tec: 2, car: 2 });
      }
    } else if (mode === 3) {
      if (cpuStyle === 'front') {
        setP2EV({ spd: 3, jmp: 5, pow: 3, tec: 0, car: 1 });
      } else {
        setP2EV({ spd: 3, jmp: 0, pow: 5, tec: 2, car: 2 });
      }
    }
  }, [mode, styles[1]]);

  const handleTouchAction = (code: string, pressed: boolean) => {
    activeTouchKeys.current[code] = pressed;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const p1TotalEV = Object.values(p1EV).reduce((a, b) => a + b, 0);
  const p2TotalEV = Object.values(p2EV).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-5 select-none font-sans">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
            🎾
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              ふたりでテニス
              {mode === 4 && onlineStatus === 'ready' ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  オンライン対戦中 (部屋: {onlineRoomId} | あなた: {onlineRole?.toUpperCase()})
                </span>
              ) : (
                <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  ネットクリア保証 ＆ バウンド予測実装
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          {/* 球筋＆タイミングガイドボタン */}
          <button
            onClick={() => setShowShotGuide(true)}
            className="py-1.5 px-2.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="球筋・タイミングの解説を見る"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">球筋の出し方</span>
          </button>

          {gameState !== 'select' && (
            <button
              onClick={() => liveGameRef.current.restartMatch()}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="設定画面に戻る"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">設定へ</span>
            </button>
          )}

          <button
            onClick={() => setTouchControls(!touchControls)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              touchControls 
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="タッチ操作パネル"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">タッチ操作</span>
          </button>

          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={soundOn ? '効果音ON' : '効果音OFF'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="フルスクリーン表示"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Arena */}
      <main 
        ref={containerRef}
        className="w-full max-w-6xl flex flex-col items-center justify-center my-auto py-2 relative"
      >
        <div className="relative w-full aspect-[1280/620] bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
          <canvas
            ref={canvasRef}
            width={1280}
            height={620}
            tabIndex={0}
            aria-label="ふたりでテニス ゲーム画面"
            className="w-full h-full block cursor-pointer outline-none"
          />

          {/* Effort Values & Style Selection Overlay (when in 'select' state) */}
          {gameState === 'select' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto flex flex-col justify-between z-10">
              {/* Header inside modal */}
              <div className="text-center max-w-2xl mx-auto mb-3">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                  <span>プレースタイル ＆ 努力値カスタマイズ</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  12ポイントを各ステータスに自由に振り分けて戦おう！(後衛シュートボールのネットクリア保証 ＆ バウンド予告マーカーを新搭載)
                </p>

                {/* Mode Select Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                  {[
                    { id: 0, label: '1: 2人対戦' },
                    { id: 1, label: '2: CPU かんたん' },
                    { id: 2, label: '3: CPU ふつう' },
                    { id: 3, label: '4: CPU つよい' },
                    { id: 4, label: '5: オンライン対戦 🌐' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMode(m.id);
                        if (m.id === 4 && onlineStatus === 'disconnected') {
                          connectOnline();
                        }
                      }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        mode === m.id
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Online Room Control Bar */}
                {mode === 4 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-sky-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                        <Globe className="w-4 h-4" />
                        <span>部屋コード:</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={onlineRoomId}
                          onChange={(e) => setOnlineRoomId(e.target.value.toUpperCase())}
                          disabled={onlineStatus !== 'disconnected'}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-white uppercase tracking-wider w-28 text-center focus:outline-none focus:border-sky-400 disabled:opacity-60"
                          placeholder="ROOM1"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(onlineRoomId);
                            setCopiedRoomId(true);
                            setTimeout(() => setCopiedRoomId(false), 2000);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          title="部屋コードをコピー"
                        >
                          {copiedRoomId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {onlineStatus === 'disconnected' ? (
                        <button
                          onClick={() => connectOnline()}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Wifi className="w-3.5 h-3.5" />
                          <span>接続 / 入室</span>
                        </button>
                      ) : (
                        <button
                          onClick={disconnectOnline}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <WifiOff className="w-3.5 h-3.5" />
                          <span>切断</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-[11px] ${
                        onlineStatus === 'ready' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                          : onlineStatus === 'waiting' 
                          ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse' 
                          : onlineStatus === 'connecting'
                          ? 'bg-sky-950 text-sky-300 border border-sky-700'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          onlineStatus === 'ready' ? 'bg-emerald-400' : onlineStatus === 'waiting' ? 'bg-amber-400' : 'bg-slate-500'
                        }`} />
                        {onlineStatus === 'ready'
                          ? '対戦準備完了 (2名接続中)'
                          : onlineStatus === 'waiting'
                          ? '相手の参加待ち...'
                          : onlineStatus === 'connecting'
                          ? '接続中...'
                          : '未接続'}
                      </span>

                      {onlineRole && (
                        <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                          あなた: <span className={onlineRole === '1p' ? 'text-[#ff5d73]' : 'text-[#ffb703]'}>{onlineRole.toUpperCase()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {mode === 4 && onlineNotice && (
                  <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg text-center">
                    {onlineNotice}
                  </div>
                )}
              </div>

              {/* Two Players Customization Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
                {/* 1P Setup */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-[#ff5d73]/40 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#ff5d73]"></span>
                        <span className="font-bold text-sm text-[#ff5d73]">
                          {mode === 4 
                            ? onlineRole === '1p' 
                              ? '1P (あなた・左コート)' 
                              : '1P (対戦相手・左コート)' 
                            : '1P (左コート)'}
                        </span>
                      </div>
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                        p1TotalEV === MAX_TOTAL_EV 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' 
                          : 'bg-slate-800 text-amber-300'
                      }`}>
                        努力値: {p1TotalEV} / {MAX_TOTAL_EV} pt (残 {MAX_TOTAL_EV - p1TotalEV})
                      </span>
                    </div>

                    {/* Style Selection for 1P */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => changeStyle(0, 'front')}
                        disabled={mode === 4 && onlineRole === '2p'}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          styles[0] === 'front'
                            ? 'bg-[#ff5d73]/20 border-[#ff5d73] text-white shadow-sm'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                        } ${mode === 4 && onlineRole === '2p' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>前衛スタイル</span>
                          {styles[0] === 'front' && <span className="text-[10px] text-[#ff5d73]">選択中</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">速いスイング / スマッシュ &amp; ボレー</div>
                      </button>

                      <button
                        onClick={() => changeStyle(0, 'back')}
                        disabled={mode === 4 && onlineRole === '2p'}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          styles[0] === 'back'
                            ? 'bg-[#ff5d73]/20 border-[#ff5d73] text-white shadow-sm'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                        } ${mode === 4 && onlineRole === '2p' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>後衛スタイル</span>
                          {styles[0] === 'back' && <span className="text-[10px] text-[#ff5d73]">選択中</span>}
                        </div>
                        <div className="text-[11px] text-amber-300 mt-0.5">確実ネット越え！弾丸シュートボール</div>
                      </button>
                    </div>

                    {/* EV Allocator */}
                    <div className="space-y-2">
                      {STAT_CONFIG.map(({ key, name, desc, icon: Icon }) => {
                        const val = p1EV[key as keyof EffortValues];
                        return (
                          <div key={key} className="flex items-center justify-between text-xs bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-200 mr-1.5">{name}</span>
                                <span className="text-[10px] text-slate-400 hidden sm:inline">{desc}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleEVChange(0, key as keyof EffortValues, -1)}
                                disabled={val <= 0 || (mode === 4 && onlineRole === '2p')}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <div className="flex gap-0.5 px-1">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                  <div
                                    key={lvl}
                                    className={`w-3.5 h-3 rounded-xs ${
                                      lvl <= val 
                                        ? 'bg-[#ff5d73] shadow-xs shadow-[#ff5d73]/50' 
                                        : 'bg-slate-800'
                                    }`}
                                  />
                                ))}
                              </div>

                              <button
                                onClick={() => handleEVChange(0, key as keyof EffortValues, 1)}
                                disabled={val >= 5 || p1TotalEV >= MAX_TOTAL_EV || (mode === 4 && onlineRole === '2p')}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center font-mono font-bold text-slate-200 text-xs">{val}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1P Presets */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">プリセット:</span>
                    <button 
                      onClick={() => applyPreset(0, { spd: 3, jmp: 2, pow: 3, tec: 2, car: 2 })}
                      disabled={mode === 4 && onlineRole === '2p'}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
                    >
                      バランス
                    </button>
                    <button 
                      onClick={() => applyPreset(0, { spd: 3, jmp: 0, pow: 5, tec: 2, car: 2 })}
                      disabled={mode === 4 && onlineRole === '2p'}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 cursor-pointer"
                    >
                      超攻撃(決定力5)
                    </button>
                    <button 
                      onClick={() => applyPreset(0, { spd: 2, jmp: 1, pow: 2, tec: 5, car: 2 })}
                      disabled={mode === 4 && onlineRole === '2p'}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-300 cursor-pointer"
                    >
                      魔球(テク5)
                    </button>
                    <button 
                      onClick={() => applyPreset(0, { spd: 5, jmp: 2, pow: 2, tec: 0, car: 3 })}
                      disabled={mode === 4 && onlineRole === '2p'}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sky-300 cursor-pointer"
                    >
                      快足(足5)
                    </button>
                  </div>
                </div>

                {/* 2P / CPU Setup */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-[#ffb703]/40 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#ffb703]"></span>
                        <span className="font-bold text-sm text-[#ffb703]">
                          {mode === 4 
                            ? onlineRole === '2p' 
                              ? '2P (あなた・右コート)' 
                              : '2P (対戦相手・右コート)' 
                            : mode > 0 
                            ? `CPU (${['', 'かんたん', 'ふつう', 'つよい'][mode]})` 
                            : '2P (右コート)'}
                        </span>
                      </div>
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                        p2TotalEV === MAX_TOTAL_EV 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' 
                          : 'bg-slate-800 text-amber-300'
                      }`}>
                        努力値: {p2TotalEV} / {MAX_TOTAL_EV} pt (残 {MAX_TOTAL_EV - p2TotalEV})
                      </span>
                    </div>

                    {/* Style Selection for 2P */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => changeStyle(1, 'front')}
                        disabled={mode === 4 && onlineRole === '1p'}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          styles[1] === 'front'
                            ? 'bg-[#ffb703]/20 border-[#ffb703] text-white shadow-sm'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                        } ${mode === 4 && onlineRole === '1p' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>前衛スタイル</span>
                          {styles[1] === 'front' && <span className="text-[10px] text-[#ffb703]">選択中</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">速いスイング / スマッシュ &amp; ボレー</div>
                      </button>

                      <button
                        onClick={() => changeStyle(1, 'back')}
                        disabled={mode === 4 && onlineRole === '1p'}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          styles[1] === 'back'
                            ? 'bg-[#ffb703]/20 border-[#ffb703] text-white shadow-sm'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white'
                        } ${mode === 4 && onlineRole === '1p' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>後衛スタイル</span>
                          {styles[1] === 'back' && <span className="text-[10px] text-[#ffb703]">選択中</span>}
                        </div>
                        <div className="text-[11px] text-amber-300 mt-0.5">確実ネット越え！弾丸シュートボール</div>
                      </button>
                    </div>

                    {/* EV Allocator */}
                    <div className="space-y-2">
                      {STAT_CONFIG.map(({ key, name, desc, icon: Icon }) => {
                        const val = p2EV[key as keyof EffortValues];
                        return (
                          <div key={key} className="flex items-center justify-between text-xs bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-200 mr-1.5">{name}</span>
                                <span className="text-[10px] text-slate-400 hidden sm:inline">{desc}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleEVChange(1, key as keyof EffortValues, -1)}
                                disabled={val <= 0 || (mode === 4 && onlineRole === '1p')}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <div className="flex gap-0.5 px-1">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                  <div
                                    key={lvl}
                                    className={`w-3.5 h-3 rounded-xs ${
                                      lvl <= val 
                                        ? 'bg-[#ffb703] shadow-xs shadow-[#ffb703]/50' 
                                        : 'bg-slate-800'
                                    }`}
                                  />
                                ))}
                              </div>

                              <button
                                onClick={() => handleEVChange(1, key as keyof EffortValues, 1)}
                                disabled={val >= 5 || p2TotalEV >= MAX_TOTAL_EV || (mode === 4 && onlineRole === '1p')}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center font-mono font-bold text-slate-200 text-xs">{val}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2P Presets */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">プリセット:</span>
                    <button 
                      onClick={() => applyPreset(1, { spd: 3, jmp: 2, pow: 3, tec: 2, car: 2 })}
                      disabled={mode === 4 && onlineRole === '1p'}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
                    >
                      バランス
                    </button>
                    <button 
                      onClick={() => applyPreset(1, { spd: 3, jmp: 0, pow: 5, tec: 2, car: 2 })}
                      disabled={mode === 4 && onlineRole === '1p'}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 cursor-pointer"
                    >
                      超攻撃(決定力5)
                    </button>
                    <button 
                      onClick={() => applyPreset(1, { spd: 2, jmp: 1, pow: 2, tec: 5, car: 2 })}
                      disabled={mode === 4 && onlineRole === '1p'}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-300 cursor-pointer"
                    >
                      魔球(テク5)
                    </button>
                  </div>
                </div>
              </div>

              {/* Start Game Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    コート上の黄色い「▼バウンド」マークを確認してから打つと、ノーバウンドにならず強力なストロークが打てます！
                  </span>
                </div>

                <button
                  onClick={() => liveGameRef.current.startMatch()}
                  disabled={mode === 4 && (onlineStatus !== 'ready' || onlineRole !== '1p')}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 4 && onlineRole === '2p'
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                      : mode === 4 && onlineStatus !== 'ready'
                      ? 'bg-amber-400/50 text-slate-950/60 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <span>
                    {mode === 4 
                      ? onlineRole === '2p' 
                        ? '1Pの試合開始を待機中...' 
                        : onlineStatus === 'ready' 
                        ? 'オンライン試合開始！' 
                        : '対戦相手の参加待ち...' 
                      : '試合開始！ (Space)'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* On-screen touch controller */}
        {touchControls && (
          <div className="w-full mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl grid grid-cols-2 gap-4">
            {/* 1P Left Pad */}
            <div className="flex flex-col items-center gap-2 p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-[#ff5d73]">1P 操作 (左コート)</span>
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={() => handleTouchAction('KeyA', true)}
                  onMouseUp={() => handleTouchAction('KeyA', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('KeyA', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('KeyA', false); }}
                  className="w-12 h-12 rounded-lg bg-slate-800 active:bg-slate-700 font-bold text-sm border border-slate-700 flex items-center justify-center"
                >
                  ◀
                </button>
                <button
                  onMouseDown={() => handleTouchAction('KeyW', true)}
                  onMouseUp={() => handleTouchAction('KeyW', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('KeyW', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('KeyW', false); }}
                  className="w-12 h-12 rounded-lg bg-slate-800 active:bg-slate-700 font-bold text-sm border border-slate-700 flex items-center justify-center text-emerald-400"
                >
                  ジャンプ
                </button>
                <button
                  onMouseDown={() => handleTouchAction('KeyD', true)}
                  onMouseUp={() => handleTouchAction('KeyD', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('KeyD', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('KeyD', false); }}
                  className="w-12 h-12 rounded-lg bg-slate-800 active:bg-slate-700 font-bold text-sm border border-slate-700 flex items-center justify-center"
                >
                  ▶
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onMouseDown={() => handleTouchAction('KeyQ', true)}
                  onMouseUp={() => handleTouchAction('KeyQ', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('KeyQ', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('KeyQ', false); }}
                  className="px-4 py-2.5 rounded-lg bg-pink-900/60 active:bg-pink-800 text-xs font-bold border border-pink-700 text-pink-200"
                >
                  通常/シュート (Q)
                </button>
                <button
                  onMouseDown={() => handleTouchAction('KeyE', true)}
                  onMouseUp={() => handleTouchAction('KeyE', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('KeyE', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('KeyE', false); }}
                  className="px-4 py-2.5 rounded-lg bg-indigo-900/60 active:bg-indigo-800 text-xs font-bold border border-indigo-700 text-indigo-200"
                >
                  ロブ (E)
                </button>
              </div>
            </div>

            {/* 2P Right Pad */}
            <div className="flex flex-col items-center gap-2 p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-[#ffb703]">2P 操作 (右コート)</span>
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={() => handleTouchAction('ArrowLeft', true)}
                  onMouseUp={() => handleTouchAction('ArrowLeft', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('ArrowLeft', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('ArrowLeft', false); }}
                  className="w-12 h-12 rounded-lg bg-slate-800 active:bg-slate-700 font-bold text-sm border border-slate-700 flex items-center justify-center"
                >
                  ◀
                </button>
                <button
                  onMouseDown={() => handleTouchAction('ArrowUp', true)}
                  onMouseUp={() => handleTouchAction('ArrowUp', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('ArrowUp', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('ArrowUp', false); }}
                  className="w-12 h-12 rounded-lg bg-slate-800 active:bg-slate-700 font-bold text-sm border border-slate-700 flex items-center justify-center text-emerald-400"
                >
                  ジャンプ
                </button>
                <button
                  onMouseDown={() => handleTouchAction('ArrowRight', true)}
                  onMouseUp={() => handleTouchAction('ArrowRight', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('ArrowRight', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('ArrowRight', false); }}
                  className="w-12 h-12 rounded-lg bg-slate-800 active:bg-slate-700 font-bold text-sm border border-slate-700 flex items-center justify-center"
                >
                  ▶
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onMouseDown={() => handleTouchAction('Slash', true)}
                  onMouseUp={() => handleTouchAction('Slash', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('Slash', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('Slash', false); }}
                  className="px-4 py-2.5 rounded-lg bg-amber-900/60 active:bg-amber-800 text-xs font-bold border border-amber-700 text-amber-200"
                >
                  通常/シュート (/)
                </button>
                <button
                  onMouseDown={() => handleTouchAction('Backslash', true)}
                  onMouseUp={() => handleTouchAction('Backslash', false)}
                  onTouchStart={(e) => { e.preventDefault(); handleTouchAction('Backslash', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleTouchAction('Backslash', false); }}
                  className="px-4 py-2.5 rounded-lg bg-orange-900/60 active:bg-orange-800 text-xs font-bold border border-orange-700 text-orange-200"
                >
                  ロブ (\)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Keys Guide Footer */}
      <footer className="w-full max-w-6xl mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5d73]"></span>
            <span className="font-semibold text-slate-200">1P(左):</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">A</kbd><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">D</kbd> 移動</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">W</kbd> ジャンプ</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">Q</kbd> 通常/シュート</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">E</kbd> ロブ</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffb703]"></span>
            <span className="font-semibold text-slate-200">2P(右):</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">←</kbd><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">→</kbd> 移動</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">↑</kbd> ジャンプ</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">/</kbd> 通常/シュート</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-200">\</kbd> ロブ</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span>7点先取で勝利</span>
          <span>スタート: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300">Space</kbd> / タップ</span>
        </div>
      </footer>

      {/* Shot & Timing Guide Modal */}
      {showShotGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowShotGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-black text-white">球筋＆バウンド・タイミングの解説</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              後衛のシュートボールはネット安全高度保証付き！バウンド予測マーカーを見て1バウンド後に打とう！
            </p>

            <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
              {/* バウンドとシュートボール・新ミスペナルティの最新仕様 */}
              <div className="p-3.5 bg-rose-950/40 rounded-xl border border-rose-800/60">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm mb-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>★【超重要ルール】ノーバウンド返球の特大ペナルティ</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-rose-400 shrink-0">⚠️ ミスヒット特大（約80%）:</span>
                    <span>スマッシュ（高打点）やネットボレー（ネット前）以外でノーバウンドで打つと、<strong>約80%の特大確率で大空へ打ち上がって大アウト（相手の得点）</strong>になります！</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-sky-400 shrink-0">✨ ミラクル返球（約20%）:</span>
                    <span>稀に奇跡のノーバンキャッチが発動！ネットを越えて相手コート手前にポトリと落ちる<strong>「✨ミラクル返球!!」</strong>で生き残れるチャンスがあります（テクニック努力値で成功率アップ）！</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400 shrink-0">✅ 1バウンド必須:</span>
                    <span>コート上の<strong>「▼バウンド」</strong>マークを確認し、地面で1回バウンドさせてから打つと、後衛の<strong>「弾丸シュートボール」</strong>や強烈なストロークが100%確実にクリーンヒットします！</span>
                  </div>
                </div>
              </div>

              {/* バウンドとシュートボールの最新仕様 */}
              <div className="p-3.5 bg-amber-950/30 rounded-xl border border-amber-800/60">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>★ 確実ネット越え ＆ バウンド予測</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-amber-400 shrink-0">⚡ 後衛シュートボール:</span>
                    <span>速度が上がっても絶対にネットにかからないよう、ネット通過時の最低高度（+18px）をプログラム側で自動保証！低空を切り裂いて必ず相手コートに突き刺さります。</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-yellow-400 shrink-0">🎯 バウンド予測マーカー:</span>
                    <span>ボールが飛んでいる最中、コート地面に「▼バウンド」と黄色い着地リングが表示されます。</span>
                  </div>
                </div>
              </div>

              {/* スイングタイミング */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>スイングタイミングによる変化 (通常ボタン Q / /)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60">
                    <div className="font-bold text-blue-300 mb-1">🔵 早振り (スライス)</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      球が来る前に早く振ると発動。テクニックが高いと跳ねずにキックバック！
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60">
                    <div className="font-bold text-amber-300 mb-1">🟡 ジャスト (ドライブ/シュート)</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      芯で捉えた最も安定した強打。後衛は低空超速の「シュートボール」に！
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                    <div className="font-bold text-emerald-300 mb-1">🟢 引きつけ (トップスピン)</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      ボールをギリギリまで引きつけて振ると発動。高く弾んで奥へ急加速！
                    </div>
                  </div>
                </div>
              </div>

              {/* 高さ・ポジション */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
                  <Target className="w-4 h-4" />
                  <span>高さ・ポジションによるショット</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p><strong className="text-rose-400">👑 スマッシュ:</strong> 頭上の高いボールを鋭角に叩き落とす！(決定力で剛速球化)</p>
                  <p><strong className="text-cyan-400">🛡️ ネットボレー:</strong> 前衛がネットのすぐ前でノーバウンド迎撃した時のみ発動！</p>
                  <p><strong className="text-indigo-400">🎈 ロブ (E / \):</strong> 相手の頭上を越す高い放物線。ネットに出てきた相手に有効！</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowShotGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              理解した・閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
