# Amazon Transcribe voice agent features: JavaScript samples

These samples show three Amazon Transcribe streaming features for voice agents, using the AWS SDK for JavaScript v3:

| Feature | What it does |
| --- | --- |
| **Turn detection** (semantic turn-taking) | Amazon Transcribe tells your agent when the speaker has finished a turn (`EndOfTurnEvent`), when they are about to finish (`EagerEndOfTurnEvent`) and when they keep talking (`TurnResumedEvent`). |
| **Runtime hints** | Your agent tells Amazon Transcribe what it expects next: up to 10 keyword phrases (`KeywordPhrases`), or one entity type (`EntityTypes`) that sets how a value is written, such as `PHONE` or `CURRENCY`. |
| **Runtime custom vocabulary** | Your agent sends up to 200 names or domain terms (`VocabularyPhrases`) during the stream, with an optional `DisplayAs` for how a term is written. |

There are two samples:

| Sample | What it shows |
| --- | --- |
| [`turn-taking.mjs`](turn-taking.mjs) | A `TurnTaker` that lets turn events decide when the agent replies. It starts drafting a reply on `EagerEndOfTurnEvent`, throws the draft away on `TurnResumedEvent`, and replies on `EndOfTurnEvent`, reusing the draft if the words didn't change. |
| [`runtime-hints.mjs`](runtime-hints.mjs) | A five-turn banking agent. It asks one question per turn, sends the hint for that question in a `ConfigureEvent` (menu options, an entity type or a runtime custom vocabulary), and asks the next question on each `EndOfTurnEvent`. |

Both stream a recorded WAV file at real-time pace, as a microphone would.

## Prerequisites

- Node.js 20 or later.
- AWS credentials allowed to call `transcribe:StartStreamTranscription`. The SDK finds them the usual way: environment variables, `~/.aws` profiles or an IAM role.
- An AWS account that has these features turned on. On an account without them, the stream fails to open with a `BadRequestException`.
- The AWS SDK for JavaScript v3 build with these features, [`JsSdkV3_ReInvent.zip`](https://reinvent-2026-263736276041.s3.us-east-2.amazonaws.com/javascript/JsSdkV3_ReInvent.zip) (354 MB). The Transcribe Streaming client on npm doesn't have the new types yet.

## Set up

Run these commands from this folder, `speech-to-text/turbo/features/javascript`.

1. Download and unzip the SDK outside the repository, then pack the Transcribe Streaming client into this folder's `vendor` directory:

   ```bash
   SAMPLE_DIR="$PWD"
   mkdir -p vendor ~/aws-sdk-js-v3
   cd ~/aws-sdk-js-v3
   curl -O https://reinvent-2026-263736276041.s3.us-east-2.amazonaws.com/javascript/JsSdkV3_ReInvent.zip
   unzip -q JsSdkV3_ReInvent.zip
   cd clients/client-transcribe-streaming
   npm pack --pack-destination "$SAMPLE_DIR/vendor"
   cd "$SAMPLE_DIR"
   ```

   This writes `vendor/aws-sdk-client-transcribe-streaming-3.1178.0.tgz`. If your tarball has a different version, update the path in `package.json`. `vendor/` is in `.gitignore`, so the SDK isn't committed.

2. Install the dependencies. The client's other dependencies come from npm:

   ```bash
   npm install
   ```

## Semantic turn-taking: `turn-taking.mjs`

```bash
node turn-taking.mjs --audio caller.wav
```

| Option | Default | Description |
| --- | --- | --- |
| `--audio <file>` | `test.wav` | A 16 kHz, 16-bit, mono PCM WAV file. |
| `--end-of-turn-threshold <n>` | `0.7` | The confidence the detector needs to end a turn, 0.50 to 1.00. Higher waits longer and interrupts less. |
| `--end-of-turn-timeout <s>` | `3` | Seconds without new words before the turn ends anyway, 1 to 60. |
| `--eager-threshold <n>` | `0.5` | The confidence for an `EagerEndOfTurnEvent`, 0.30 to 0.95 and below the threshold. |
| `--region <region>` | `us-east-2` | The AWS Region. |
| `--endpoint <url>` | The Region's endpoint | An endpoint URL, such as `https://transcribestreaming.us-east-2.amazonaws.com`. |

The settings go in a `ConfigureEvent` that is the stream's first event. `EchoAgent` stands in for your LLM (it takes 500 ms to reply) and your text-to-speech. Expected output (the first column is seconds since the sample started; times in the events are seconds from the start of the audio):

```
  0.00s  ConfigureEvent: {"EndOfTurnThreshold":0.7,"EndOfTurnTimeout":3,"EagerEndOfTurnThreshold":0.5}
  0.50s  requestId=...
  0.50s  ConfigureAppliedEvent: {"KeywordPhrases":[],"EntityTypes":[],"EndOfTurnThreshold":0.7,"EndOfTurnTimeout":3,"EagerEndOfTurnThreshold":0.5,"EndOfTurnConfidence":false}
  1.49s  EagerEndOfTurnEvent: drafting a reply to 'My HELOC.'
  2.01s  User:  My HELOC.
  2.01s  EndOfTurnEvent: {"Reason":"DETECTED","StartTime":0.06,"EndTime":1.92,"Confidence":0.7852,"ChannelId":"ch_0"}
  2.01s  Agent: You said: My HELOC.
  7.71s  User:  (212) 555-0182.
  7.71s  EndOfTurnEvent: {"Reason":"DETECTED","StartTime":4.04,"EndTime":7.68,"Confidence":0.9141,"ChannelId":"ch_0"}
  8.21s  Agent: You said: (212) 555-0182.
```

In the first turn, the reply was drafted on the `EagerEndOfTurnEvent`, so the agent speaks as soon as the turn ends. In the second, there was no eager event, so the agent speaks 500 ms later.

## Runtime hints and runtime custom vocabulary: `runtime-hints.mjs`

```bash
node runtime-hints.mjs
```

| Option | Default | Description |
| --- | --- | --- |
| `--audio <file>` | `caller.wav` | A 16 kHz, 16-bit, mono PCM WAV file of the caller's answers. |
| `--no-hints` | Off | Ask the same questions without sending any `ConfigureEvent`, to compare. |
| `--region <region>` | `us-east-2` | The AWS Region. |
| `--endpoint <url>` | The Region's endpoint | An endpoint URL, such as `https://transcribestreaming.us-east-2.amazonaws.com`. |

| Turn | Agent asks | Hint sent |
| --- | --- | --- |
| 1 | Which account is this about: checking, savings, or your HELOC? | `KeywordPhrases`: checking, savings, HELOC |
| 2 | What's the phone number on the account? | `KeywordPhrases: []` (clears them), `EntityTypes: ["PHONE"]` |
| 3 | What's your account number? | `EntityTypes: ["SERIAL"]` |
| 4 | How much would you like to transfer? | `EntityTypes: ["CURRENCY"]` |
| 5 | Who would you like to pay? | `EntityTypes: []` (clears it), `VocabularyPhrases`: Octank, AnyCompany |

Expected output for turns 3 to 5:

```
  7.72s  Agent: What's your account number?
  7.72s  ConfigureEvent: {"EntityTypes":["SERIAL"]}
  8.70s  ConfigureAppliedEvent: {"KeywordPhrases":[],"EntityTypes":["SERIAL"],"EndOfTurnThreshold":0.6,"EndOfTurnTimeout":5,"EndOfTurnConfidence":false}
 14.01s  Caller: 4417209381.
 14.01s  EndOfTurnEvent: {"Reason":"DETECTED","StartTime":10.6,"EndTime":13.92,"Confidence":0.875,"ChannelId":"ch_0"}
 14.01s  Agent: How much would you like to transfer?
 14.01s  ConfigureEvent: {"EntityTypes":["CURRENCY"]}
 14.90s  ConfigureAppliedEvent: {"KeywordPhrases":[],"EntityTypes":["CURRENCY"],"EndOfTurnThreshold":0.6,"EndOfTurnTimeout":5,"EndOfTurnConfidence":false}
 18.31s  Caller: $250.
 18.31s  EndOfTurnEvent: {"Reason":"DETECTED","StartTime":16.84,"EndTime":18.24,"Confidence":0.6914,"ChannelId":"ch_0"}
 18.31s  Agent: Who would you like to pay?
 18.31s  ConfigureEvent: {"EntityTypes":[],"VocabularyPhrases":[{"Text":"Octank"},{"Text":"AnyCompany"}]}
 19.30s  ConfigureAppliedEvent: {"KeywordPhrases":[],"EntityTypes":[],"VocabularyPhrases":"UPDATED","EndOfTurnThreshold":0.6,"EndOfTurnTimeout":5,"EndOfTurnConfidence":false}
 22.95s  Caller: Octank.
 22.95s  EndOfTurnEvent: {"Reason":"DETECTED","StartTime":21.26,"EndTime":22.56,"Confidence":0.7891,"ChannelId":"ch_0"}
```

With `--no-hints`, the same audio gives:

| Question | With hints | Without hints |
| --- | --- | --- |
| Which account is this about? | My HELOC. | My HELOC. |
| What's the phone number on the account? | (212) 555-0182. | (212) 555-0182. |
| What's your account number? | 4417209381. | (441) 720-9381. |
| How much would you like to transfer? | $250. | 250. |
| Who would you like to pay? | Octank. | Tank. |

Without the `SERIAL` hint, the account number is written as a phone number. Without the vocabulary, the payee name is misheard.

Your timings and confidences can differ a little from run to run.

## How it works

1. **Start the stream with turn detection on.** `EndOfTurnDetection: true` in `StartStreamTranscriptionCommand`. A `ConfigureEvent` on a stream without turn detection ends the stream with a `BadRequestException`.
2. **Send a `ConfigureEvent` before the audio** to apply settings from the first word.
3. **Stream audio.** `audioStream()` in [`audio.mjs`](audio.mjs) is an async generator: every value it yields is sent. Each value is an object with one key: `{ AudioEvent }`, `{ ConfigureEvent }` or `{ ForceEndOfTurnEvent }`. Before each 100 ms audio chunk, it sends any `ConfigureEvent`s the agent has queued. An empty `AudioEvent` ends the audio.
4. **React to the result stream.** Transcripts, turn events and answers to your `ConfigureEvent`s all arrive on `TranscriptResultStream`, each as an object with one key, such as `ev.EndOfTurnEvent`.

### Updating settings during the stream

In each `ConfigureEvent`:

- A member you include replaces its setting.
- An empty list clears it. For example, `KeywordPhrases: []` clears the menu options.
- A member you leave out keeps its setting.

Each `ConfigureEvent` is applied whole or not at all, and gets one answer: a `ConfigureAppliedEvent` with the settings now in effect, or a `ConfigureRejectedEvent` with the `Field`, `Reason` and `Message`. A rejected event changes nothing, and the stream goes on. A `ConfigureAppliedEvent` doesn't return the vocabulary's phrases: its `VocabularyPhrases` is `UPDATED` instead.

### Turn events

| Event | Meaning | What a voice agent does |
| --- | --- | --- |
| `StartOfTurnEvent` | The caller started a turn. | Stop speaking, if your agent supports barge-in. |
| `EagerEndOfTurnEvent` | The caller sounds nearly done: the confidence crossed `EagerEndOfTurnThreshold` but not `EndOfTurnThreshold`. | Start drafting the reply, to cut latency. |
| `TurnResumedEvent` | The caller kept talking after an eager end of turn. | Discard the draft. |
| `EndOfTurnEvent` | The turn ended. `Reason` is `DETECTED`, `TIMEOUT`, `FORCED` or `STREAM_END`. | Reply. |

To end a turn yourself, such as when your own voice activity detection fires first, yield `{ ForceEndOfTurnEvent: {} }`. The turn ends with `Reason` `FORCED`.

## Limits

| Setting | Limit |
| --- | --- |
| `EndOfTurnThreshold` | 0.50 to 1.00, default 0.60 |
| `EndOfTurnTimeout` | 1 to 60 whole seconds, default 5 |
| `EagerEndOfTurnThreshold` | 0.30 to 0.95 and below `EndOfTurnThreshold`. Off by default, and 0 turns it off. |
| `KeywordPhrases` | Up to 10 phrases, 30 tokens each and 200 tokens in total. A phrase's optional `LanguageCode` must be the stream's. |
| `EntityTypes` | One of `NUM`, `DATE`, `TIME`, `CURRENCY`, `PHONE`, `UNIT`, `SERIAL`, `URL`, `SOCIAL` or `ADDRESS`. |
| `VocabularyPhrases` | Up to 200 phrases per `ConfigureEvent`, 256 characters each and 51,200 bytes in total. Replaces any vocabulary named when the stream started. |

A `ConfigureEvent` outside these limits is rejected, and the stream goes on.

Turn detection takes PCM audio, and is available for these language codes: `en-US`, `en-GB`, `en-AU`, `en-IN`, `en-IE`, `en-NZ`, `en-AB`, `en-ZA` and `en-WL`. Turn detection and entity types can't be combined with language identification or partial results stabilization.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `BadRequestException` when the stream opens | Your account doesn't have these features turned on, or a setting can't be combined with turn detection. |
| `ConfigureRejectedEvent` with `FEATURE_NOT_AVAILABLE` | Your account doesn't have that feature turned on. |
| `ConfigureRejectedEvent` with `OUT_OF_RANGE` | A setting is outside the limits above. |
| `... must be 16 kHz, 16-bit, mono PCM` | Convert your file, for example with `ffmpeg -i in.wav -ar 16000 -ac 1 -c:a pcm_s16le out.wav`. |
| "An error was encountered in a non-retryable streaming request." on stderr | The SDK prints this when a stream ends with an error. The error the sample prints after it is the one to look at. |

## Files

| File | Description |
| --- | --- |
| `turn-taking.mjs` | The semantic turn-taking sample. |
| `runtime-hints.mjs` | The runtime hints and runtime custom vocabulary sample. |
| `audio.mjs` | Reads the WAV file, streams it in real time, and logs with timestamps. |
| `package.json` | Depends on the packed Transcribe Streaming client in `vendor/`. |
| `caller.wav` | A caller answering the banking agent's five questions: 16 kHz, 16-bit, mono PCM. |
| `test.wav` | A caller describing a transfer in three sentences: 16 kHz, 16-bit, mono PCM. |
