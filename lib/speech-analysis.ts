// Note: Web Speech API requires live microphone input, not audio blobs
// This function is called during recording, not after
// For MVP, we'll use a simplified approach that works with the recording flow
export async function analyzeSpeech(audioBlob: Blob): Promise<string> {
  // Web Speech API doesn't support audio blobs directly
  // In a real implementation, we would use the API during recording
  // For MVP, we return an empty string and rely on heuristic analysis
  // based on audio duration and other signals
  
  // This is a placeholder - actual transcription would happen during recording
  // For now, return empty string and let feedback generator use duration-based heuristics
  return "";
}

// This function should be called during recording to get real-time transcription
export function startSpeechRecognition(
  onTranscript: (text: string) => void,
  onError: (error: string) => void
): () => void {
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    onError("Speech recognition not available in this browser");
    return () => {};
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  let fullTranscript = "";
  let isStopped = false;

  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        fullTranscript += event.results[i][0].transcript + " ";
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    onTranscript(fullTranscript + interimTranscript);
  };

  recognition.onerror = (event: any) => {
    // Ignore "aborted" errors when we intentionally stopped recognition
    if (event.error === 'aborted' && isStopped) {
      return; // Expected behavior when stopping recognition
    }
    
    console.error("Speech recognition error:", event.error);
    onError(event.error);
  };

  recognition.onend = () => {
    // Auto-restart if stopped unexpectedly
    if (!isStopped) {
      try {
        recognition.start();
      } catch (e) {
        // Already started or other error
      }
    }
  };

  try {
    recognition.start();
  } catch (e) {
    onError("Could not start speech recognition");
  }

  return () => {
    isStopped = true;
    recognition.stop();
  };
}
