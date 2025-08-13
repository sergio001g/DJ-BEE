"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Zap, Radio, Upload, Volume2, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export default function DJBee() {
  const [isPlaying1, setIsPlaying1] = useState(false)
  const [isPlaying2, setIsPlaying2] = useState(false)
  const [volume1, setVolume1] = useState([75])
  const [volume2, setVolume2] = useState([75])
  const [crossfader, setCrossfader] = useState([50])
  const [pitch1, setPitch1] = useState([0])
  const [pitch2, setPitch2] = useState([0])
  const [rotation1, setRotation1] = useState(0)
  const [rotation2, setRotation2] = useState(0)
  const [activePads, setActivePads] = useState<Set<number>>(new Set())
  const [bpm1, setBpm1] = useState(128)
  const [bpm2, setBpm2] = useState(128)
  const [eq1, setEq1] = useState({ low: [50], mid: [50], high: [50] })
  const [eq2, setEq2] = useState({ low: [50], mid: [50], high: [50] })
  const [loadedTrack1, setLoadedTrack1] = useState<string>("")
  const [loadedTrack2, setLoadedTrack2] = useState<string>("")
  const [scrollY, setScrollY] = useState(0)

  const audio1Ref = useRef<HTMLAudioElement>(null)
  const audio2Ref = useRef<HTMLAudioElement>(null)
  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)
  const animationRef1 = useRef<number>()
  const animationRef2 = useRef<number>()

  const audioContext1Ref = useRef<AudioContext | null>(null)
  const audioContext2Ref = useRef<AudioContext | null>(null)
  const source1Ref = useRef<MediaElementAudioSourceNode | null>(null)
  const source2Ref = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNode1Ref = useRef<GainNode | null>(null)
  const gainNode2Ref = useRef<GainNode | null>(null)
  const lowFilter1Ref = useRef<BiquadFilterNode | null>(null)
  const midFilter1Ref = useRef<BiquadFilterNode | null>(null)
  const highFilter1Ref = useRef<BiquadFilterNode | null>(null)
  const lowFilter2Ref = useRef<BiquadFilterNode | null>(null)
  const midFilter2Ref = useRef<BiquadFilterNode | null>(null)
  const highFilter2Ref = useRef<BiquadFilterNode | null>(null)

  const initializeAudioContext = useCallback((deckNumber: 1 | 2) => {
    const audio = deckNumber === 1 ? audio1Ref.current : audio2Ref.current
    if (!audio) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaElementSource(audio)
      const gainNode = audioContext.createGain()

      const lowFilter = audioContext.createBiquadFilter()
      const midFilter = audioContext.createBiquadFilter()
      const highFilter = audioContext.createBiquadFilter()

      lowFilter.type = "lowshelf"
      lowFilter.frequency.setValueAtTime(320, audioContext.currentTime)

      midFilter.type = "peaking"
      midFilter.frequency.setValueAtTime(1000, audioContext.currentTime)
      midFilter.Q.setValueAtTime(0.5, audioContext.currentTime)

      highFilter.type = "highshelf"
      highFilter.frequency.setValueAtTime(3200, audioContext.currentTime)

      source.connect(lowFilter)
      lowFilter.connect(midFilter)
      midFilter.connect(highFilter)
      highFilter.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (deckNumber === 1) {
        audioContext1Ref.current = audioContext
        source1Ref.current = source
        gainNode1Ref.current = gainNode
        lowFilter1Ref.current = lowFilter
        midFilter1Ref.current = midFilter
        highFilter1Ref.current = highFilter
      } else {
        audioContext2Ref.current = audioContext
        source2Ref.current = source
        gainNode2Ref.current = gainNode
        lowFilter2Ref.current = lowFilter
        midFilter2Ref.current = midFilter
        highFilter2Ref.current = highFilter
      }
    } catch (error) {
      console.error("Error inicializando Web Audio API:", error)
    }
  }, [])

  useEffect(() => {
    if (audio1Ref.current && gainNode1Ref.current) {
      const crossfaderValue = crossfader[0] / 100
      const deck1Volume = (volume1[0] / 100) * (1 - crossfaderValue)
      gainNode1Ref.current.gain.setValueAtTime(deck1Volume, audioContext1Ref.current?.currentTime || 0)
    }
  }, [volume1, crossfader])

  useEffect(() => {
    if (audio2Ref.current && gainNode2Ref.current) {
      const crossfaderValue = crossfader[0] / 100
      const deck2Volume = (volume2[0] / 100) * crossfaderValue
      gainNode2Ref.current.gain.setValueAtTime(deck2Volume, audioContext2Ref.current?.currentTime || 0)
    }
  }, [volume2, crossfader])

  useEffect(() => {
    if (audio1Ref.current) {
      const pitchValue = 1 + pitch1[0] / 100
      audio1Ref.current.playbackRate = pitchValue
      setBpm1(Math.round(128 * pitchValue))
    }
  }, [pitch1])

  useEffect(() => {
    if (audio2Ref.current) {
      const pitchValue = 1 + pitch2[0] / 100
      audio2Ref.current.playbackRate = pitchValue
      setBpm2(Math.round(128 * pitchValue))
    }
  }, [pitch2])

  useEffect(() => {
    if (lowFilter1Ref.current && midFilter1Ref.current && highFilter1Ref.current) {
      const lowGain = (eq1.low[0] - 50) * 0.3
      const midGain = (eq1.mid[0] - 50) * 0.3
      const highGain = (eq1.high[0] - 50) * 0.3

      lowFilter1Ref.current.gain.setValueAtTime(lowGain, audioContext1Ref.current?.currentTime || 0)
      midFilter1Ref.current.gain.setValueAtTime(midGain, audioContext1Ref.current?.currentTime || 0)
      highFilter1Ref.current.gain.setValueAtTime(highGain, audioContext1Ref.current?.currentTime || 0)
    }
  }, [eq1])

  useEffect(() => {
    if (lowFilter2Ref.current && midFilter2Ref.current && highFilter2Ref.current) {
      const lowGain = (eq2.low[0] - 50) * 0.3
      const midGain = (eq2.mid[0] - 50) * 0.3
      const highGain = (eq2.high[0] - 50) * 0.3

      lowFilter2Ref.current.gain.setValueAtTime(lowGain, audioContext2Ref.current?.currentTime || 0)
      midFilter2Ref.current.gain.setValueAtTime(midGain, audioContext2Ref.current?.currentTime || 0)
      highFilter2Ref.current.gain.setValueAtTime(highGain, audioContext2Ref.current?.currentTime || 0)
    }
  }, [eq2])

  const audioContextRef = useRef<AudioContext | null>(null)

  const playEffect = useCallback((frequency: number, duration = 300, type: OscillatorType = "sine", volume = 0.3) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = type
    filter.frequency.setValueAtTime(frequency * 1.5, audioContext.currentTime)
    filter.Q.setValueAtTime(10, audioContext.currentTime)

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration / 1000)
  }, [])

  const padEffects = [
    { name: "BOMBO", freq: 60, color: "from-red-500 to-red-700", type: "sine" as OscillatorType, vol: 0.5 },
    { name: "CAJA", freq: 200, color: "from-blue-500 to-blue-700", type: "square" as OscillatorType, vol: 0.4 },
    { name: "HI-HAT", freq: 800, color: "from-green-500 to-green-700", type: "sawtooth" as OscillatorType, vol: 0.3 },
    { name: "CRASH", freq: 1200, color: "from-yellow-500 to-yellow-700", type: "triangle" as OscillatorType, vol: 0.4 },
    { name: "BAJO", freq: 80, color: "from-purple-500 to-purple-700", type: "sine" as OscillatorType, vol: 0.6 },
    { name: "LEAD", freq: 440, color: "from-pink-500 to-pink-700", type: "square" as OscillatorType, vol: 0.4 },
    { name: "PAD", freq: 330, color: "from-cyan-500 to-cyan-700", type: "sawtooth" as OscillatorType, vol: 0.3 },
    {
      name: "SIRENA",
      freq: 1000,
      color: "from-orange-500 to-orange-700",
      type: "triangle" as OscillatorType,
      vol: 0.4,
    },
    { name: "LASER", freq: 1500, color: "from-indigo-500 to-indigo-700", type: "sawtooth" as OscillatorType, vol: 0.3 },
    { name: "HORN", freq: 300, color: "from-teal-500 to-teal-700", type: "square" as OscillatorType, vol: 0.5 },
    { name: "SWEEP", freq: 500, color: "from-lime-500 to-lime-700", type: "triangle" as OscillatorType, vol: 0.3 },
    { name: "DROP", freq: 150, color: "from-rose-500 to-rose-700", type: "sine" as OscillatorType, vol: 0.6 },
  ]

  const handlePadPress = useCallback(
    (index: number) => {
      setActivePads((prev) => new Set([...prev, index]))
      const pad = padEffects[index]
      playEffect(pad.freq, 500, pad.type, pad.vol)
      setTimeout(() => {
        setActivePads((prev) => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }, 500)
    },
    [playEffect],
  )

  const handleFileLoad = (deckNumber: 1 | 2) => {
    const fileInput = deckNumber === 1 ? fileInput1Ref.current : fileInput2Ref.current
    if (fileInput) {
      fileInput.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, deckNumber: 1 | 2) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (deckNumber === 1) {
        setLoadedTrack1(file.name)
        if (audio1Ref.current) {
          audio1Ref.current.src = url
          audio1Ref.current.onloadeddata = () => initializeAudioContext(1)
        }
      } else {
        setLoadedTrack2(file.name)
        if (audio2Ref.current) {
          audio2Ref.current.src = url
          audio2Ref.current.onloadeddata = () => initializeAudioContext(2)
        }
      }
    }
  }

  const togglePlay1 = async () => {
    if (audio1Ref.current) {
      try {
        if (audioContext1Ref.current?.state === "suspended") {
          await audioContext1Ref.current.resume()
        }

        if (isPlaying1) {
          audio1Ref.current.pause()
        } else {
          await audio1Ref.current.play()
        }
        setIsPlaying1(!isPlaying1)
      } catch (error) {
        console.error("Error reproduciendo audio:", error)
      }
    }
  }

  const togglePlay2 = async () => {
    if (audio2Ref.current) {
      try {
        if (audioContext2Ref.current?.state === "suspended") {
          await audioContext2Ref.current.resume()
        }

        if (isPlaying2) {
          audio2Ref.current.pause()
        } else {
          await audio2Ref.current.play()
        }
        setIsPlaying2(!isPlaying2)
      } catch (error) {
        console.error("Error reproduciendo audio:", error)
      }
    }
  }

  useEffect(() => {
    if (isPlaying1) {
      const animate = () => {
        setRotation1((prev) => (prev + 0.2) % 360)
        animationRef1.current = requestAnimationFrame(animate)
      }
      animationRef1.current = requestAnimationFrame(animate)
    } else {
      if (animationRef1.current) {
        cancelAnimationFrame(animationRef1.current)
      }
    }

    return () => {
      if (animationRef1.current) {
        cancelAnimationFrame(animationRef1.current)
      }
    }
  }, [isPlaying1])

  useEffect(() => {
    if (isPlaying2) {
      const animate = () => {
        setRotation2((prev) => (prev + 0.2) % 360)
        animationRef2.current = requestAnimationFrame(animate)
      }
      animationRef2.current = requestAnimationFrame(animate)
    } else {
      if (animationRef2.current) {
        cancelAnimationFrame(animationRef2.current)
      }
    }

    return () => {
      if (animationRef2.current) {
        cancelAnimationFrame(animationRef2.current)
      }
    }
  }, [isPlaying2])

  useEffect(() => {
    let ticking = false
    let lastScrollTime = 0

    const handleScroll = () => {
      const now = Date.now()
      if (now - lastScrollTime < 16) return // 60fps throttle

      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
          lastScrollTime = now
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="bg-black text-white overflow-x-hidden">
      <input
        ref={fileInput1Ref}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileChange(e, 1)}
        className="hidden"
      />
      <input
        ref={fileInput2Ref}
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileChange(e, 2)}
        className="hidden"
      />

      <audio ref={audio1Ref} />
      <audio ref={audio2Ref} />

      <section className="h-screen bg-black text-white overflow-hidden relative">
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.1}px)`, willChange: "transform" }}
        >
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/5 to-red-500/5 rounded-full blur-3xl"></div>

          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-30"
              style={{
                top: `${20 + i * 30}%`,
                left: `${10 + i * 20}%`,
                width: `${200 + i * 100}px`,
                transform: `translateX(${scrollY * (0.05 + i * 0.02)}px)`,
                willChange: "transform",
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/60 rounded-full"
              style={{
                top: `${25 + i * 25}%`,
                left: `${15 + i * 20}%`,
                transform: `translate3d(${scrollY * (0.05 + i * 0.02)}px, ${scrollY * (0.02 + i * 0.01)}px, 0)`,
                opacity: Math.max(0, 1 - scrollY / 1000),
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>

        <div
          className="absolute right-[-60px] bottom-20 z-20"
          style={{
            transform: `translateX(${scrollY * 0.1}px) scale(${Math.max(0.8, 1 - scrollY / 2500)})`,
            opacity: Math.max(0.3, 1 - scrollY / 1200),
            willChange: "transform, opacity",
          }}
        >
          <div className="relative">
            <img
              src="/armin-van-buuren.png"
              alt="Armin van Buuren"
              className="w-80 h-80 object-contain"
              style={{ willChange: "transform" }}
            />
            <div className="absolute -inset-8 bg-gradient-to-l from-orange-400/20 via-yellow-400/10 to-transparent rounded-full blur-xl"></div>
          </div>
        </div>

        <div
          className="relative z-10 flex flex-col justify-center items-center h-full px-8"
          style={{
            transform: `translateY(${scrollY * -0.2}px)`,
            opacity: Math.max(0.2, 1 - scrollY / 800),
            willChange: "transform, opacity",
          }}
        >
          <div
            className="relative mb-12"
            style={{
              transform: `scale(${Math.max(0.7, 1 - scrollY / 2000)})`,
              willChange: "transform",
            }}
          >
            <div className="absolute -inset-20 bg-gradient-to-r from-white/3 via-cyan-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
            <div className="relative w-80 h-80">
              <img
                src="/marshmello-dj.png"
                alt="DJ Marshmello"
                className="w-full h-full object-contain filter brightness-110 contrast-105"
              />
              <div className="absolute -inset-12 bg-gradient-to-r from-white/5 via-cyan-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          <div className="text-center space-y-8">
            <div className="relative">
              <h1
                className="text-8xl font-black text-white tracking-wider mb-4"
                style={{
                  transform: `translateX(${scrollY * -0.05}px)`,
                  willChange: "transform",
                }}
              >
                DJ
              </h1>
              <h1
                className="text-8xl font-black bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent"
                style={{
                  transform: `translateX(${scrollY * 0.05}px)`,
                  willChange: "transform",
                }}
              >
                BEE
              </h1>
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl"></div>
            </div>
            <p
              className="text-xl text-gray-400 font-light tracking-wide"
              style={{
                transform: `translateY(${scrollY * 0.02}px)`,
                opacity: Math.max(0, 1 - scrollY / 600),
                willChange: "transform, opacity",
              }}
            >
              Experiencia de DJ Virtual Futurista
            </p>
          </div>
        </div>
      </section>

      <section
        className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden relative"
        style={{
          transform: `translateY(${Math.max(-30, -scrollY * 0.02)}px)`,
          opacity: Math.min(1, Math.max(0, (scrollY - 200) / 600)),
          willChange: "transform, opacity",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * -0.05}px)`,
            opacity: Math.min(1, Math.max(0, (scrollY - 300) / 700)),
            willChange: "transform, opacity",
          }}
        >
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-500/5 to-red-500/5 rounded-full blur-3xl"></div>
        </div>

        <header
          className="relative z-10 p-8 text-center"
          style={{
            transform: `translateY(${Math.max(-30, (scrollY - 400) * -0.02)}px)`,
            opacity: Math.min(1, Math.max(0, (scrollY - 400) / 400)),
            willChange: "transform, opacity",
          }}
        >
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-full p-1">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20"></div>
                  <Radio className="w-8 h-8 text-cyan-400 z-10" />
                </div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-lg opacity-30"></div>
            </div>
            <div className="text-center">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DJ BEE
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <p className="text-purple-300 text-sm">Matriz de Sonido Virtual</p>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </div>
        </header>

        <div
          className="relative z-10 p-6 space-y-8"
          style={{
            transform: `translateY(${Math.max(-20, (scrollY - 500) * -0.01)}px)`,
            opacity: Math.min(1, Math.max(0, (scrollY - 500) / 500)),
            willChange: "transform, opacity",
          }}
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">PLATO VIRTUAL A</h3>
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                {loadedTrack1 && <p className="text-cyan-300 text-sm mt-2 truncate">🎵 {loadedTrack1}</p>}
              </div>

              <div className="relative mx-auto mb-8 w-72 h-72">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                <div
                  className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-full border-2 border-cyan-400 cursor-pointer transition-all duration-300 ease-out hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-400/50 overflow-hidden"
                  style={{
                    transform: `rotate(${rotation1}deg)`,
                    transition: isPlaying1 ? "none" : "transform 0.3s ease-out",
                    willChange: isPlaying1 ? "transform" : "auto",
                  }}
                  onClick={togglePlay1}
                >
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border border-cyan-400/30 rounded-full"
                      style={{
                        top: `${15 + i * 20}px`,
                        left: `${15 + i * 20}px`,
                        right: `${15 + i * 20}px`,
                        bottom: `${15 + i * 20}px`,
                      }}
                    />
                  ))}

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                      {isPlaying1 ? <Pause className="w-8 h-8 text-black" /> : <Play className="w-8 h-8 text-black" />}
                    </div>
                  </div>

                  {isPlaying1 &&
                    [...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping"
                        style={{
                          top: `${30 + i * 20}%`,
                          left: `${30 + i * 20}%`,
                          animationDelay: `${i * 0.5}s`,
                        }}
                      />
                    ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-cyan-400 text-lg font-bold">BPM: {bpm1}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-cyan-400 block mb-2 font-semibold">VOLUMEN</label>
                    <Slider value={volume1} onValueChange={setVolume1} max={100} step={1} className="w-full" />
                    <div className="text-center text-cyan-300 text-sm mt-1">{volume1[0]}%</div>
                  </div>

                  <div>
                    <label className="text-sm text-cyan-400 block mb-2 font-semibold">PITCH</label>
                    <Slider value={pitch1} onValueChange={setPitch1} min={-50} max={50} step={1} className="w-full" />
                    <div className="text-center text-cyan-300 text-sm mt-1">
                      {pitch1[0] > 0 ? "+" : ""}
                      {pitch1[0]}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-cyan-400 block font-semibold">ECUALIZADOR</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-cyan-300">GRAVES</label>
                        <Slider value={eq1.low} onValueChange={(v) => setEq1({ ...eq1, low: v })} max={100} step={1} />
                      </div>
                      <div>
                        <label className="text-xs text-cyan-300">MEDIOS</label>
                        <Slider value={eq1.mid} onValueChange={(v) => setEq1({ ...eq1, mid: v })} max={100} step={1} />
                      </div>
                      <div>
                        <label className="text-xs text-cyan-300">AGUDOS</label>
                        <Slider
                          value={eq1.high}
                          onValueChange={(v) => setEq1({ ...eq1, high: v })}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleFileLoad(1)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl border border-cyan-400/50 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  CARGAR MÚSICA
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-purple-400 mb-2">MEZCLADOR NEURAL</h3>
                <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
              </div>

              <div className="mb-8">
                <label className="text-sm text-purple-400 block mb-4 text-center font-semibold">CROSSFADER</label>
                <div className="relative">
                  <Slider value={crossfader} onValueChange={setCrossfader} max={100} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span className="text-cyan-400 font-bold">PLATO A</span>
                    <span className="text-pink-400 font-bold">PLATO B</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-green-400 text-center">MATRIZ DE EFECTOS</h4>
                <div className="grid grid-cols-3 gap-2">
                  {padEffects.map((pad, index) => (
                    <Button
                      key={index}
                      onClick={() => handlePadPress(index)}
                      className={`h-14 text-white font-bold text-xs transition-all duration-200 transform relative overflow-hidden ${
                        activePads.has(index)
                          ? `bg-gradient-to-br ${pad.color} scale-95 shadow-lg shadow-white/20`
                          : `bg-gradient-to-br ${pad.color}/70 hover:bg-gradient-to-br hover:${pad.color} hover:scale-105`
                      } border border-white/20 hover:border-white/40`}
                    >
                      <span className="relative z-10">{pad.name}</span>
                      {activePads.has(index) && <div className="absolute inset-0 bg-white/20"></div>}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-center gap-4">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-lg">
                    <Headphones className="w-4 h-4 mr-2" />
                    CUE
                  </Button>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-4 py-2 rounded-lg">
                    <Volume2 className="w-4 h-4 mr-2" />
                    SYNC
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-red-500/10 backdrop-blur-xl rounded-3xl p-8 border border-pink-500/30 shadow-2xl shadow-pink-500/20">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-pink-400 mb-2">PLATO VIRTUAL B</h3>
                <div className="h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent"></div>
                {loadedTrack2 && <p className="text-pink-300 text-sm mt-2 truncate">🎵 {loadedTrack2}</p>}
              </div>

              <div className="relative mx-auto mb-8 w-72 h-72">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full blur-xl"></div>
                <div
                  className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-full border-2 border-pink-400 cursor-pointer transition-all duration-300 ease-out hover:border-pink-300 hover:shadow-lg hover:shadow-pink-400/50 overflow-hidden"
                  style={{
                    transform: `rotate(${rotation2}deg)`,
                    transition: isPlaying2 ? "none" : "transform 0.3s ease-out",
                    willChange: isPlaying2 ? "transform" : "auto",
                  }}
                  onClick={togglePlay2}
                >
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border border-pink-400/30 rounded-full"
                      style={{
                        top: `${15 + i * 20}px`,
                        left: `${15 + i * 20}px`,
                        right: `${15 + i * 20}px`,
                        bottom: `${15 + i * 20}px`,
                      }}
                    />
                  ))}

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                      {isPlaying2 ? <Pause className="w-8 h-8 text-black" /> : <Play className="w-8 h-8 text-black" />}
                    </div>
                  </div>

                  {isPlaying2 &&
                    [...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-pink-400 rounded-full animate-ping"
                        style={{
                          top: `${30 + i * 20}%`,
                          left: `${30 + i * 20}%`,
                          animationDelay: `${i * 0.5}s`,
                        }}
                      />
                    ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-pink-400 text-lg font-bold">BPM: {bpm2}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-pink-400 block mb-2 font-semibold">VOLUMEN</label>
                    <Slider value={volume2} onValueChange={setVolume2} max={100} step={1} className="w-full" />
                    <div className="text-center text-pink-300 text-sm mt-1">{volume2[0]}%</div>
                  </div>

                  <div>
                    <label className="text-sm text-pink-400 block mb-2 font-semibold">PITCH</label>
                    <Slider value={pitch2} onValueChange={setPitch2} min={-50} max={50} step={1} className="w-full" />
                    <div className="text-center text-pink-300 text-sm mt-1">
                      {pitch2[0] > 0 ? "+" : ""}
                      {pitch2[0]}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-pink-400 block font-semibold">ECUALIZADOR</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-pink-300">GRAVES</label>
                        <Slider value={eq2.low} onValueChange={(v) => setEq2({ ...eq2, low: v })} max={100} step={1} />
                      </div>
                      <div>
                        <label className="text-xs text-pink-300">MEDIOS</label>
                        <Slider value={eq2.mid} onValueChange={(v) => setEq2({ ...eq2, mid: v })} max={100} step={1} />
                      </div>
                      <div>
                        <label className="text-xs text-pink-300">AGUDOS</label>
                        <Slider
                          value={eq2.high}
                          onValueChange={(v) => setEq2({ ...eq2, high: v })}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleFileLoad(2)}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-400 hover:to-red-500 text-white font-bold py-3 rounded-xl border border-pink-400/50 shadow-lg shadow-pink-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  CARGAR MÚSICA
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
