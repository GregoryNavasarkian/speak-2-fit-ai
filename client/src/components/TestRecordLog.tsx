import React, { useState, useEffect } from "react";

//This Component is made only for testing purposes. It records the audio and sends it to the backend server for processing.

const TestRecordLog: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    useEffect(() => {
        if (isRecording) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);

                    recorder.ondataavailable = async (event) => {
                        const audioBlob = new Blob([event.data], { type: 'audio/wav' });

                        // Send audio to backend
                        const formData = new FormData();
                        formData.append('file', audioBlob, 'audio.wav');

                        try {
                            const response = await fetch('/api/exercise-log/translate',
                                {
                                    method: 'POST',
                                    body: formData
                                });
                            console.log("Audio file sent successfully: ");

                            const jsonResponse = await response.json();
                            console.log(jsonResponse)
                        } catch (error) {
                            console.error("Error sending audio to backend server: ", error);
                        }
                    };

                    recorder.start();
                })
                .catch(err => console.error("Error accessing microphone: ", err));
        } else {
            mediaRecorder?.stop();
        }
    }, [isRecording]);

    const handleStartRecording = () => {
        setIsRecording(true);
    };

    const handleStopRecording = () => {
        setIsRecording(false);
    };

    return (
        <div>
            <button onClick={handleStartRecording} disabled={isRecording}>Start Recording</button>
            <button onClick={handleStopRecording} disabled={!isRecording}>Stop Recording</button>
        </div>
    );
};

export default TestRecordLog;