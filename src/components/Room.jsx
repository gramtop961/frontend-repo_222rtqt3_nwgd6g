import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Users, DoorOpen, Loader2, Video as VideoIcon, VideoOff, User } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export default function Room({ code }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [level, setLevel] = useState(0);
  const [xrSupport, setXrSupport] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const backend = import.meta.env.VITE_BACKEND_URL;

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const viewerRef = useRef(null);
  const creatorRef = useRef(null);
  const frameReadyRef = useRef(false);

  useEffect(() => {
    let active = true;
    async function fetchRoom() {
      try {
        setFetchError('');
        const res = await fetch(`${backend}/rooms/${code}`);
        if (!res.ok) throw new Error('Room not found');
        const data = await res.json();
        if (active) setRoom(data);
      } catch (e) {
        console.error(e);
        if (active) setFetchError('Room not found. It may have expired or the code is invalid.');
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
        setMediaError('');
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
          const slice = dataArray.slice(0, 16);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          const lvl = Math.min(1, avg / 160);
          setLevel(lvl);
          // Try drive avatar lip-sync if viewer is ready
          sendBlendShapes(lvl);
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (err) {
        console.error('Media init failed', err);
        let msg = 'Could not access camera/microphone.';
        if (err && err.name === 'NotReadableError') {
          msg = 'Your camera or microphone is already in use by another application.';
        } else if (err && err.name === 'NotAllowedError') {
          msg = 'Permission denied. Please allow camera and microphone access.';
        }
        setMediaError(msg);
      }
    }

    initMedia();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Ready Player Me postMessage handling
  useEffect(() => {
    function handleMessage(event) {
      const data = event.data;
      if (!data) return;
      // Creator frame events
      if (data.source === 'readyplayerme') {
        if (data.eventName === 'v1.frame.ready') {
          // Subscribe to avatar export event
          creatorRef.current?.contentWindow?.postMessage({
            target: 'readyplayerme',
            type: 'subscribe',
            eventName: 'v1.avatar.exported'
          }, '*');
        }
        if (data.eventName === 'v1.avatar.exported') {
          const url = data.data?.url;
          if (url) {
            setAvatarUrl(url);
            setShowCreator(false);
          }
        }
      }

      // Viewer frame readiness
      if (data.target === 'readyplayerme' && data.type === 'frameReady') {
        frameReadyRef.current = true;
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendBlendShapes = (lvl) => {
    // Map audio level to jaw open
    if (!viewerRef.current) return;
    try {
      const cw = viewerRef.current.contentWindow;
      if (!cw) return;
      if (!frameReadyRef.current) return;
      cw.postMessage({
        target: 'readyplayerme',
        type: 'setBlendShapes',
        blendShapes: [
          { name: 'JawOpen', value: Math.max(0, Math.min(1, lvl * 1.4)) },
          { name: 'MouthClose', value: 1 - Math.max(0, Math.min(1, lvl * 1.4)) }
        ]
      }, '*');
    } catch (e) {
      // no-op
    }
  };

  const sceneUrl = useMemo(() => {
    return 'https://prod.spline.design/EF7JOSsHLk16Tlw9/scene.splinecode';
  }, []);

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

  const checkWebXR = async () => {
    try {
      if (!('xr' in navigator)) {
        setXrSupport({ supported: false, details: 'WebXR not found in this browser.' });
        return;
      }
      const isSecure = window.isSecureContext;
      if (!isSecure) {
        setXrSupport({ supported: false, details: 'WebXR requires HTTPS (secure context).' });
        return;
      }
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      setXrSupport({ supported, details: supported ? 'Immersive VR is supported.' : 'Immersive VR is not supported on this device.' });
    } catch (e) {
      console.error(e);
      setXrSupport({ supported: false, details: 'Could not determine WebXR support.' });
    }
  };

  const openCreator = () => {
    setShowCreator(true);
    // creator iframe will emit frame.ready then we subscribe
  };

  const viewerSrc = avatarUrl
    ? `https://readyplayer.me/avatar?model=${encodeURIComponent(avatarUrl)}&pose=idle&hideControls=true&frameApi=1`
    : '';

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
            <p className="text-sm text-indigo-200/80">{loading ? 'Loading room...' : fetchError ? 'Not found' : `Scene: ${room?.scene ?? 'default'}`}</p>
          </div>
          <button onClick={leave} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-indigo-200 transition hover:border-indigo-400/60 hover:text-white">
            <DoorOpen size={16} /> Leave
          </button>
        </div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-indigo-200">
            <Loader2 className="animate-spin" size={18} /> Loading...
          </div>
        ) : fetchError ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-indigo-100">
            <div className="text-base font-medium">{fetchError}</div>
            <p className="mt-1 text-sm text-indigo-200/80">Create a new room from the homepage, or double-check the code.</p>
            <div className="mt-4">
              <button onClick={leave} className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm text-white">Go Home</button>
            </div>
          </div>
        ) : (
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

                {mediaError && (
                  <div className="rounded-lg border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
                    {mediaError}
                  </div>
                )}

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-100"><User size={16} /> Avatar</div>
                  {!avatarUrl ? (
                    <button onClick={openCreator} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-indigo-200 transition hover:border-indigo-400/60 hover:text-white">Choose Avatar</button>
                  ) : (
                    <button onClick={() => setShowCreator(true)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-indigo-200 transition hover:border-indigo-400/60 hover:text-white">Change</button>
                  )}
                </div>

                {!avatarUrl ? (
                  <p className="mt-3 text-xs text-indigo-200/80">Pick a Ready Player Me avatar. Your mic will drive basic lip-sync.</p>
                ) : (
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                    <div className="aspect-video w-full">
                      <iframe
                        ref={viewerRef}
                        title="Avatar Viewer"
                        src={viewerSrc}
                        allow="camera; microphone; autoplay; xr-spatial-tracking; fullscreen; clipboard-read; clipboard-write;"
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="text-indigo-100">Coming soon</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-indigo-200/90">
                  <li>Peer-to-peer WebRTC with signaling</li>
                  <li>Avatar head/eye rig from webcam</li>
                  <li>WebXR AR/VR mode toggle</li>
                </ul>
                <div className="mt-4">
                  <button onClick={checkWebXR} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-indigo-200 transition hover:border-indigo-400/60 hover:text-white">Check WebXR Support</button>
                  {xrSupport && (
                    <div className={`mt-2 rounded-md px-3 py-2 text-xs ${xrSupport.supported ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border border-yellow-400/30 bg-yellow-500/10 text-yellow-200'}`}>
                      {xrSupport.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreator && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f1a] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <div className="text-sm font-medium">Ready Player Me — Create your avatar</div>
              <button onClick={() => setShowCreator(false)} className="text-xs text-indigo-200 hover:text-white">Close</button>
            </div>
            <div className="h-[70vh] w-full">
              <iframe
                ref={creatorRef}
                title="Ready Player Me Creator"
                src="https://readyplayer.me/avatar?frameApi"
                allow="camera; microphone; autoplay; clipboard-read; clipboard-write;"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
