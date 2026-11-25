// Runtime hints and runtime custom vocabulary for a voice agent with Amazon
// Transcribe streaming, using the AWS SDK for JavaScript v3.
//
// The sample plays a banking agent. It asks one question per turn, sends the
// hint for that question in a ConfigureEvent, and asks the next question when
// Amazon Transcribe sends an EndOfTurnEvent (turn detection). The hints are:
//
//   - Menu options (KeywordPhrases)
//   - An entity type (EntityTypes), such as PHONE or CURRENCY
//   - A runtime custom vocabulary (VocabularyPhrases), such as payee names
//
// The caller's answers come from a WAV file.
//
// Run: node runtime-hints.mjs [--audio caller.wav] [--region us-east-2] [--endpoint URL] [--no-hints]

import { parseArgs } from "node:util";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";
import { SAMPLE_RATE, audioStream, log, readPCM } from "./audio.mjs";

// Each turn pairs a question the agent asks with the hint it sends to Amazon
// Transcribe after asking it. In your own agent, the hints come from your
// dialog logic, such as the options you just offered.
//
// In each ConfigureEvent, a member you include replaces its setting, an empty
// list clears it, and a member you leave out keeps its setting.
const TURNS = [
  {
    question: "Which account is this about: checking, savings, or your HELOC?",
    // Runtime hint: menu options (up to 10 phrases).
    hint: { KeywordPhrases: [{ Text: "checking" }, { Text: "savings" }, { Text: "HELOC" }] },
  },
  {
    question: "What's the phone number on the account?",
    hint: {
      KeywordPhrases: [], // clear the menu options
      EntityTypes: ["PHONE"], // runtime hint: entity type
    },
  },
  {
    question: "What's your account number?",
    hint: { EntityTypes: ["SERIAL"] },
  },
  {
    question: "How much would you like to transfer?",
    hint: { EntityTypes: ["CURRENCY"] },
  },
  {
    question: "Who would you like to pay?",
    hint: {
      EntityTypes: [], // clear the entity type
      // Runtime custom vocabulary: the caller's payees (up to 200 phrases).
      VocabularyPhrases: [{ Text: "Octank" }, { Text: "AnyCompany" }],
    },
  },
];

// The agent asks the questions in TURNS, one per caller turn.
class BankingAgent {
  constructor(useHints) {
    this.useHints = useHints;
    this.next = 0;
    this.pendingHints = []; // hints to send on the stream, between audio chunks
  }

  // Asks the next question and queues its hint. Returns false when there are no questions left.
  askNextQuestion() {
    if (this.next === TURNS.length) return false;
    const turn = TURNS[this.next++];
    log(`Agent: ${turn.question}`); // In your agent, send this to text-to-speech.
    if (this.useHints) {
      // Send the hint right after asking, before the caller answers.
      this.pendingHints.push(turn.hint);
      log(`ConfigureEvent: ${JSON.stringify(turn.hint)}`);
    }
    return true;
  }

  // Reacts to one event from the result stream. Each event is an object with one key.
  onEvent(ev) {
    if (ev.TranscriptEvent) {
      for (const r of ev.TranscriptEvent.Transcript?.Results ?? []) {
        if (!r.IsPartial && r.Alternatives?.length) log(`Caller: ${r.Alternatives[0].Transcript}`);
      }
    } else if (ev.EndOfTurnEvent) {
      // The caller has answered: ask the next question.
      const e = ev.EndOfTurnEvent;
      log(`EndOfTurnEvent: ${JSON.stringify(e)}`);
      this.askNextQuestion();
    } else if (ev.ConfigureAppliedEvent) {
      log(`ConfigureAppliedEvent: ${JSON.stringify(ev.ConfigureAppliedEvent)}`);
    } else if (ev.ConfigureRejectedEvent) {
      // A rejected ConfigureEvent changes nothing, and the stream goes on.
      log(`ConfigureRejectedEvent: ${JSON.stringify(ev.ConfigureRejectedEvent)}`);
    }
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      audio: { type: "string", default: "caller.wav" }, // 16 kHz, 16-bit, mono PCM WAV of the caller's answers
      region: { type: "string", default: "us-east-2" },
      endpoint: { type: "string" }, // optional, such as https://transcribestreaming.us-east-2.amazonaws.com
      "no-hints": { type: "boolean", default: false }, // ask the same questions without sending hints
    },
  });

  const pcm = readPCM(values.audio);
  // Use one client per concurrent stream.
  const client = new TranscribeStreamingClient({
    region: values.region,
    ...(values.endpoint && { endpoint: values.endpoint }),
  });

  const agent = new BankingAgent(!values["no-hints"]);
  agent.askNextQuestion(); // its hint is the stream's first event

  try {
    // Start the stream with turn detection on. ConfigureEvent requires it.
    const out = await client.send(
      new StartStreamTranscriptionCommand({
        LanguageCode: "en-US",
        MediaEncoding: "pcm",
        MediaSampleRateHertz: SAMPLE_RATE,
        EndOfTurnDetection: true,
        AudioStream: audioStream(pcm, agent.pendingHints),
      })
    );
    log(`requestId=${out.RequestId}`);
    for await (const ev of out.TranscriptResultStream) agent.onEvent(ev);
  } catch (e) {
    // Stream-open rejections (HTTP 400) and mid-stream errors both arrive here.
    console.error(`${e.name}: ${e.message} requestId=${e.$metadata?.requestId}`);
    process.exitCode = 1;
  } finally {
    client.destroy();
  }
}

main();
