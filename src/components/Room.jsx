import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Users, DoorOpen, Loader2, Video as VideoIcon, VideoOff } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export default function Room({ code }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [level, setLevel] = useState(0);
  const backend = import.meta.env.VITE_BACKEND_URL;

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function fetchRoom() {
      try {
        const res = await fetch(`${backend}/rooms/${code}`);
        if (!res.ok) throw new Error('Room not found');
        const data = await res.json();
        if (active) setRoom(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchRoom();
    return () => {
      active = false;
    };
  }, [backend, code]);

  // Initialize local media (webcam + mic) and audio level meter
  useEffect(() => {
    let stopped = false;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (stopped) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Audio meter via Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(dataArray);
          // Rough volume estimation using average of lower bins
          const slice = dataArray.slice(0, 16);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          setLevel(Math.min(1, avg / 160));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (err) {
        console.error('Media init failed', err);
      }
    }

    initMedia();

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const sceneUrl = useMemo(() => {
    if (!room) return null;
    // Use a consistent Spline background for immersive feel
    return 'https://prod.spline.design/EF7JOSsHLk16Tlw9/scene.splinecode';
  }, [room]);

  const leave = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const toggleMute = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    const next = !muted;
    audioTracks.forEach((t) => (t.enabled = !next));
    setMuted(next);
  };

  const toggleCamera = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    const next = !cameraOn;
    videoTracks.forEach((t) => (t.enabled = next));
    setCameraOn(next);
  };

  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden bg-[#070a13]">
      <div className="absolute inset-0">
        {sceneUrl && (
          <Spline scene={sceneUrl} style={{ width: '100%', height: '100%' }} />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070a13]/30 via-[#070a13]/50 to-[#070a13]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Room {code}</h1>
            <p className="text-sm text-indigo-200/80">Scene: {room?.scene ?? 'loading...'}</p>
          </div>
          <button onClick={leave} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-indigo-200 transition hover:border-indigo-400/60 hover:text-white">
            <DoorOpen size={16} /> Leave
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur lg:col-span-2">
            <div className="grid h-[50vh] grid-rows-[1fr_auto] gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
              <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-black/40">
                {/* Local webcam preview */}
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                {/* Audio level meter */}
                <div className="pointer-events-none absolute bottom-3 left-1/2 w-40 -translate-x-1/2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-[width]"
                      style={{ width: `${Math.max(6, level * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleMute}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                    muted
                      ? 'bg-white/5 text-indigo-200 border border-white/10'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_18px_rgba(139,92,246,0.35)]'
                  }`}
                >
                  {muted ? <MicOff size={16} /> : <Mic size={16} />} {muted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                    !cameraOn
                      ? 'bg-white/5 text-indigo-200 border border-white/10'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.35)]'
                  }`}
                >
                  {cameraOn ? <VideoIcon size={16} /> : <VideoOff size={16} />} {cameraOn ? 'Camera On' : 'Camera Off'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-100"><Users size={16} /> Participants</div>
                <span className="text-xs text-indigo-200/80">Local</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-indigo-200/90">
                <div className="flex items-center justify-between">
                  <span>You</span>
                  <span className="opacity-70">Connected</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-indigo-100">Coming soon</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-indigo-200/90">
                <li>Peer-to-peer WebRTC with signaling</li>
                <li>Avatar lip-sync (Ready Player Me)</li>
                <li>WebXR AR/VR mode toggle</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
