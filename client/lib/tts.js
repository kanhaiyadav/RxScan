import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import path from "path";

// resolve to current folder
const outputFile = path.join(process.cwd(), "output.wav");

const speechConfig = sdk.SpeechConfig.fromSubscription(
    "7haAZjs2yOU6vFfRvE3dtYqzuev7OftQwnvlpyJkkrN7nbbj5M0XJQQJ99BHACqBBLyXJ3w3AAAYACOGcAQU",
    "southeastasia"
);

// Instead of playing through speakers, save to file
const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFile);

const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

synthesizer.speakTextAsync(
    "Hello, this is a text to speech test. The audio will be saved to a file.",
    (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log(`✅ Synthesis finished. File saved at: ${outputFile}`);
        } else {
            console.error(
                "❌ Speech synthesis canceled: " + result.errorDetails
            );
        }
        synthesizer.close();
    },
    (error) => {
        console.error(error);
        synthesizer.close();
    }
);
