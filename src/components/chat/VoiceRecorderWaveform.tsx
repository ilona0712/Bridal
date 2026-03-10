import { useEffect, useRef, useState } from "react";

type VoiceRecorderWaveformProps = {
  stream: MediaStream | null;
  isRecording: boolean;
};

export default function VoiceRecorderWaveform({
  stream,
  isRecording,
}: VoiceRecorderWaveformProps) {
  const [levels, setLevels] = useState<number[]>(new Array(20).fill(8));
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (!isRecording || !stream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
    dataArrayRef.current = dataArray;

    const updateWaveform = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const samples = 20;
      const bucketSize = Math.floor(dataArrayRef.current.length / samples);

      const newLevels = Array.from({ length: samples }, (_, i) => {
        const start = i * bucketSize;
        const end = start + bucketSize;
        let sum = 0;

        for (let j = start; j < end; j++) {
          sum += dataArrayRef.current![j];
        }

        const avg = sum / bucketSize || 0;
        return Math.max(8, Math.min(40, avg / 4));
      });

      setLevels(newLevels);
      animationRef.current = requestAnimationFrame(updateWaveform);
    };

    updateWaveform();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [stream, isRecording]);

  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-1 h-10 px-3 rounded-2xl bg-white/80 border border-stone-200 min-w-[180px]">
      {levels.map((level, index) => (
        <div
          key={index}
          className="w-1 rounded-full bg-gradient-to-t from-amber-300 via-pink-200 to-stone-300 transition-all duration-75"
          style={{ height: `${level}px` }}
        />
      ))}
    </div>
  );
}