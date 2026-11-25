# Speech-to-text with Amazon Transcribe

Build speech recognition into your applications with
[Amazon Transcribe](https://aws.amazon.com/transcribe/). Amazon Transcribe
converts speech to text, in real time from a live audio stream or in batch from
recorded files. The samples in this folder focus on Amazon Transcribe
streaming for voice agents: knowing when the speaker has finished, and telling
Amazon Transcribe what to expect at each turn of a conversation.

> **Note:** These samples are for demonstration purposes and are not
> intended for production use.

> These samples make billed AWS API calls. Review the sample README before
> running it.

## Choose where to start

| Goal | Start here |
| --- | --- |
| Add turn detection, runtime hints, or runtime custom vocabulary to a voice agent | [Turbo voice agent features (JavaScript)](turbo/features/javascript/) |

## Turbo voice agent features

Amazon Transcribe streaming has three features for voice agents:

| Feature | What it does |
| --- | --- |
| **Semantic turn-taking** | Tells your agent when the speaker has finished a turn, based on what they said and how they said it, not only on silence. Early events let your agent start drafting a reply before the turn ends. |
| **Runtime hints** | Your agent tells Amazon Transcribe what it expects next, at each turn: menu options it just offered (keyword phrases), or the kind of value it asked for, such as a phone number or an amount (entity types). |
| **Runtime custom vocabulary** | Your agent sends names and domain terms for the current turn, such as a caller's payees or a product catalog, during the stream. |

| Sample | Language | What it demonstrates |
| --- | --- | --- |
| [JavaScript](turbo/features/javascript/) | Node.js 20+ | Semantic turn-taking with early replies, and a five-turn banking agent that sends runtime hints and a runtime custom vocabulary at each turn |

These features are available for English (`en-US`, `en-GB`, `en-AU`, `en-IN`,
`en-IE`, `en-NZ`, `en-AB`, `en-ZA`, `en-WL`) in the US East (Ohio) Region, and
are turned on per AWS account.

## Prerequisites and safety

Requirements vary by sample, but most require:

- An AWS account and a supported AWS Region
- AWS credentials configured through the standard credential chain
- Least-privilege permissions for the services used by the sample. The
  streaming samples need `transcribe:StartStreamTranscription`.
- The Node.js or SDK requirements documented in that sample's README

Never store credentials in source files or commit `.env` files,
`node_modules`, or caches. Amazon Transcribe is billed per audio duration. For
details, see [Amazon Transcribe pricing](https://aws.amazon.com/transcribe/pricing/).

There is no repository-wide build or test command for this folder. Run setup
and validation commands from the individual sample directory and follow its
README.
