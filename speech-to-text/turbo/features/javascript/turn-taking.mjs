// Semantic turn-taking for a voice agent with Amazon Transcribe streaming,
// using the AWS SDK for JavaScript v3.
//
// The sample streams a WAV file to Amazon Transcribe with turn detection on,
// and lets the turn events decide when the agent replies:
//
//   EagerEndOfTurnEvent  the speaker sounds nearly done: start drafting a reply
//   TurnResumedEvent     the speaker kept talking: throw the draft away
//   EndOfTurnEvent       the turn is over: reply, reusing the draft if it still fits
//
// The EchoAgent class stands in for your LLM and text-to-speech.
//
// Run: node turn-taking.mjs [--audio test.wav] [--region us-east-2] [--endpoint URL]
//        [--end-of-turn-threshold 0.7] [--end-of-turn-timeout 3] [--eager-threshold 0.5]

import { parseArgs } from "node:util";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";
import { SAMPLE_RATE, audioStream, log, readPCM } from "./audio.mjs";

// Lets turn events decide when the agent replies.
class TurnTaker {
  constructor(agent) {
    this.agent = agent;
    this.finals = []; // final transcripts of the current turn
    this.partial = ""; // latest partial transcript of the current turn
    this.draft = null; // reply drafted on EagerEndOfTurnEvent: { text, reply, abort }
    this.replies = [];
  }

  // Reacts to one event from the result stream. Each event is an object with one key.
  onEvent(ev) {
    if (ev.TranscriptEvent) {
      for (const r of ev.TranscriptEvent.Transcript?.Results ?? []) {
        const text = r.Alternatives?.[0]?.Transcript ?? "";
        if (r.IsPartial) {
          this.partial = text;
        } else {
          this.finals.push(text);
          this.partial = "";
          log(`User:  ${text}`);
        }
      }
    } else if (ev.EagerEndOfTurnEvent) {
      // The speaker sounds nearly done: start drafting a reply early.
      const text = [...this.finals, this.partial].join(" ").trim();
      this.draft = this.startReply(text);
      log(`EagerEndOfTurnEvent: drafting a reply to '${text}'`);
    } else if (ev.TurnResumedEvent) {
      // The speaker kept talking: throw the draft away.
      this.draft?.abort.abort();
      this.draft = null;
      log("TurnResumedEvent: draft discarded");
    } else if (ev.EndOfTurnEvent) {
      // The turn is over: reply, reusing the draft if the words didn't change.
      const text = this.finals.join(" ").trim();
      log(`EndOfTurnEvent: ${JSON.stringify(ev.EndOfTurnEvent)}`);
      let reply = this.draft?.text === text ? this.draft : null;
      if (this.draft && !reply) this.draft.abort.abort();
      if (text) {
        reply ??= this.startReply(text);
        this.replies.push(reply.reply.then((r) => this.agent.speak(r)));
      }
      this.finals = [];
      this.partial = "";
      this.draft = null;
    } else if (ev.ConfigureAppliedEvent || ev.ConfigureRejectedEvent) {
      const [name, body] = Object.entries(ev)[0];
      log(`${name}: ${JSON.stringify(body)}`);
    }
  }

  // Starts generating a reply that can be cancelled with abort.abort().
  startReply(text) {
    const abort = new AbortController();
    const reply = this.agent.generateReply(text, abort.signal);
    reply.catch(() => {}); // a cancelled draft is not an error
    return { text, reply, abort };
  }
}

// Stands in for your LLM and text-to-speech.
class EchoAgent {
  async generateReply(text, signal) {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 500); // LLM latency
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(signal.reason);
      });
    });
    return `You said: ${text}`;
  }

  async speak(reply) {
    log(`Agent: ${reply}`);
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      audio: { type: "string", default: "test.wav" }, // 16 kHz, 16-bit, mono PCM WAV
      region: { type: "string", default: "us-east-2" },
      endpoint: { type: "string" }, // optional, such as https://transcribestreaming.us-east-2.amazonaws.com
      "end-of-turn-threshold": { type: "string", default: "0.7" },
      "end-of-turn-timeout": { type: "string", default: "3" },
      "eager-threshold": { type: "string", default: "0.5" },
    },
  });

  // Tune turn detection with a ConfigureEvent, the stream's first event.
  const settings = {
    EndOfTurnThreshold: Number(values["end-of-turn-threshold"]), // 0.50-1.00, default 0.60
    EndOfTurnTimeout: Number(values["end-of-turn-timeout"]), // seconds without new words, 1-60, default 5
    EagerEndOfTurnThreshold: Number(values["eager-threshold"]), // below the threshold; off by default
  };

  const pcm = readPCM(values.audio);
  // Use one client per concurrent stream.
  const client = new TranscribeStreamingClient({
    region: values.region,
    ...(values.endpoint && { endpoint: values.endpoint }),
  });
  const turnTaker = new TurnTaker(new EchoAgent());

  try {
    log(`ConfigureEvent: ${JSON.stringify(settings)}`);
    // Start the stream with turn detection on.
    const out = await client.send(
      new StartStreamTranscriptionCommand({
        LanguageCode: "en-US",
        MediaEncoding: "pcm",
        MediaSampleRateHertz: SAMPLE_RATE,
        EndOfTurnDetection: true,
        AudioStream: audioStream(pcm, [settings]),
      })
    );
    log(`requestId=${out.RequestId}`);
    for await (const ev of out.TranscriptResultStream) turnTaker.onEvent(ev);
    await Promise.all(turnTaker.replies);
  } catch (e) {
    // Stream-open rejections (HTTP 400) and mid-stream errors both arrive here.
    console.error(`${e.name}: ${e.message} requestId=${e.$metadata?.requestId}`);
    process.exitCode = 1;
  } finally {
    client.destroy();
  }
}

main();
