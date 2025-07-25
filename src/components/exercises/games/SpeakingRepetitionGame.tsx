import React, { useRef, useState } from 'react';
import { Play, Pause, Mic, StopCircle, Check, X, ChevronDown } from 'lucide-react';

interface SpeakingRepetitionGameProps {
    question: {
        game_id: string;
        sentence_to_repeat: string;
        audio_model_file: string;
        model_answer: string;
        grading_criteria: string;
        justification?: string;
        isChecked: boolean;
        isCorrect?: boolean;
        userRecording?: Blob;
    };
    onAnswer: (transcript: string) => void;
    disabled?: boolean;
}

interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}


const SpeakingRepetitionGame: React.FC<SpeakingRepetitionGameProps> = ({
    question,
    onAnswer,
    disabled = false,
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    React.useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Web Speech API no está soportada en este navegador. Usa Chrome o Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        setSpeechRecognition(recognition);

        return () => {
            recognition.abort();
        };
    }, []);


    React.useEffect(() => {
        return () => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaRecorder]);


    const handlePlayModel = () => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        if (audio.paused) {
            audio.play();
            setIsPlaying(true);
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    };

    const handleAudioEnd = () => setIsPlaying(false);

    const handleSpeedChange = (rate: number) => {
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
    };

    const audioPath = question.audio_model_file.startsWith('http')
        ? question.audio_model_file
        : `/audio/${question.audio_model_file.replace('../audio/', '')}`;

    const handleStartRecording = async () => {
        if (disabled || isRecording) return;
        
        // Limpiar estados de la grabación anterior
        setAudioURL(null);
        setTranscript(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = []; // Reiniciar el array de chunks para cada nueva grabación

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

                if (audioURL) {
                    URL.revokeObjectURL(audioURL);
                }

                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Error al iniciar la grabación:', err);
            return;
        }

        if (!speechRecognition) {
            console.warn('Web Speech API no disponible');
            return;
        }
        
        speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcriptText = event.results[0][0].transcript;
            setTranscript(transcriptText);
            onAnswer(transcriptText);
        };

        speechRecognition.onerror = (event: any) => {
            console.error('Error en Web Speech API:', event.error);
        };
        
        speechRecognition.onend = () => {
            setIsRecording(false);
        };

        speechRecognition.start();
    };

    const handleStopRecording = () => {
        if (!isRecording) return;

        if (speechRecognition) {
            speechRecognition.stop();
        }

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    };

    return (
        <div className="space-y-6 text-center">
            <span className="text-base font-semibold text-[#1ea5b9] block mb-2">
                Repeat the following sentence:
            </span>
            <div className="text-xl font-semibold text-gray-800">
                "{question.sentence_to_repeat}"
            </div>

            <div className="flex justify-center">
                <div className="flex items-center space-x-8 border border-gray-300 rounded-full px-5 py-3 bg-white shadow-sm">
                    <button
                        onClick={handlePlayModel}
                        disabled={disabled}
                        className="flex items-center space-x-2 disabled:opacity-50"
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 text-[#1ea5b9]" />
                        ) : (
                            <Play className="h-5 w-5 text-[#1ea5b9]" />
                        )}
                        <span className="text-[#1ea5b9] font-medium">
                            {isPlaying ? 'Pause Audio' : 'Play Audio'}
                        </span>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowSpeedMenu(prev => !prev)}
                            className="flex items-center space-x-1 text-sm text-gray-700 hover:text-[#1ea5b9] transition"
                        >
                            <span className="font-medium">Speed: {playbackRate}x</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {showSpeedMenu && (
                            <div className="absolute top-full left-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow z-10 text-left">
                                {[0.75, 1, 1.25, 1.5].map(rate => (
                                    <button
                                        key={rate}
                                        onClick={() => handleSpeedChange(rate)}
                                        className={`w-full px-4 py-2 text-sm text-left hover:bg-[#1ea5b9]/10 ${playbackRate === rate ? 'text-[#1ea5b9] font-semibold' : 'text-gray-700'
                                            }`}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={audioPath}
                preload="auto"
                onEnded={handleAudioEnd}
            />

            <div className="flex justify-center gap-6 mt-4">
                {!isRecording ? (
                    <button
                        onClick={handleStartRecording}
                        disabled={disabled || question.isChecked}
                        className="flex items-center space-x-2 px-4 py-2 border border-red-500 text-red-600 rounded-full hover:bg-red-100 transition"
                    >
                        <Mic className="w-5 h-5" />
                        <span>Record</span>
                    </button>
                ) : (
                    <button
                        onClick={handleStopRecording}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                        <StopCircle className="w-5 h-5" />
                        <span>Stop</span>
                    </button>
                )}
            </div>

            {audioURL && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-1">Your transcript</p>
                    {transcript && (
                        <p className="mt-2 italic text-gray-800 text-sm font-semibold">
                            "{transcript}"
                        </p>
                    )}
                </div>
            )}

            {question.isChecked && (
                <div className="text-sm mt-4">
                    <div className={question.isCorrect ? 'text-green-700' : 'text-red-700'}>
                        {question.isCorrect ? <Check className="inline w-5 h-5 mr-1" /> : <X className="inline w-5 h-5 mr-1" />}
                        {question.isCorrect ? 'Great pronunciation!' : 'Needs improvement. Review the model.'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeakingRepetitionGame;