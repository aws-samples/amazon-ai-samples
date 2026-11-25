// Helpers shared by the samples: read a WAV file, stream it in real time, and log with timestamps.

import fs from "node:fs";

export const SAMPLE_RATE = 16000;
const CHUNK_BYTES = (SAMPLE_RATE * 2) / 10; // 100 ms of 16-bit mono audio

const started = Date.now();

// Prints a line prefixed with the seconds since the sample started.
export function log(msg) {
  console.log(`${((Date.now() - started) / 1000).toFixed(2).padStart(6)}s  ${msg}`);
}

// The audio stream: every value yielded is sent to Amazon Transcribe. Each value
// is an object with one key: { AudioEvent }, { ConfigureEvent } or
// { ForceEndOfTurnEvent }. Before each 100 ms audio chunk, it sends the
// ConfigureEvents queued in `pending`. It sends the audio at real-time pace,
// then the empty AudioEvent that ends the audio.
export async function* audioStream(pcm, pending = []) {
  const start = Date.now();
  for (let offset = 0; offset < pcm.length; offset += CHUNK_BYTES) {
    while (pending.length) yield { ConfigureEvent: pending.shift() };
    const chunk = pcm.subarray(offset, offset + CHUNK_BYTES);
    yield { AudioEvent: { AudioChunk: chunk } };
    // Pace a recorded file as if it came from a live microphone.
    const due = start + ((offset + chunk.length) * 1000) / (SAMPLE_RATE * 2);
    await new Promise((r) => setTimeout(r, Math.max(0, due - Date.now())));
  }
  yield { AudioEvent: { AudioChunk: new Uint8Array(0) } };
}

// Returns the samples of a 16 kHz, 16-bit, mono PCM WAV file.
export function readPCM(path) {
  const data = fs.readFileSync(path);
  if (data.length < 12 || data.toString("ascii", 0, 4) !== "RIFF" || data.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`${path} is not a WAV file`);
  }
  let format;
  for (let pos = 12; pos + 8 <= data.length; ) {
    const id = data.toString("ascii", pos, pos + 4);
    const size = data.readUInt32LE(pos + 4);
    const body = data.subarray(pos + 8, Math.min(pos + 8 + size, data.length));
    if (id === "fmt ") {
      format = body;
    } else if (id === "data") {
      if (
        !format ||
        format.length < 16 ||
        format.readUInt16LE(0) !== 1 || // PCM
        format.readUInt16LE(2) !== 1 || // mono
        format.readUInt32LE(4) !== SAMPLE_RATE ||
        format.readUInt16LE(14) !== 16
      ) {
        throw new Error(`${path} must be 16 kHz, 16-bit, mono PCM`);
      }
      return body;
    }
    pos += 8 + size + (size % 2);
  }
  throw new Error(`${path} has no audio data`);
}
