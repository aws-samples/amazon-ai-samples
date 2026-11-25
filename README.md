# Amazon AI Samples

Home of Amazon first-party foundation models and AI services. This repository
contains sample code, notebooks, workshops, and reference applications for
building with **Amazon first-party foundation models** and AI services on
[Amazon Bedrock](https://aws.amazon.com/bedrock/),
[Amazon SageMaker AI](https://aws.amazon.com/sagemaker/), and third-party
platforms.

> **This repository was renamed from `aws-samples/amazon-nova-samples`.**
> Existing links and `git clone` URLs redirect automatically. To update a local
> clone, run:
> `git remote set-url origin https://github.com/aws-samples/amazon-ai-samples.git`

## Repository map

| Folder | What's inside | Primary services |
| --- | --- | --- |
| [`multimodal-understanding/`](multimodal-understanding/) | Getting-started notebooks, a self-paced workshop, repeatable patterns, and sample apps for Nova understanding models: text, image, video, and document understanding, tool calling, RAG, agents, and prompt optimization | Amazon Bedrock (Nova Lite, Pro, Premier, Nova 2 Lite) |
| [`speech-to-speech/`](speech-to-speech/) | Real-time, bidirectional voice conversation samples in Python, Java, Node.js, .NET, and Ruby, plus integration patterns, workshops, and a Nova Sonic 2.5 prompting guide | Amazon Bedrock (Nova Sonic, Nova 2 Sonic, Nova Sonic 2.5) |
| [`text-to-speech/`](text-to-speech/) | A guided quickstart, focused feature samples (SSML, speech marks, lexicons, async and bidirectional streaming synthesis, voice cloning), and end-to-end speech applications | Amazon Polly, with Transcribe, Translate, Bedrock, and AgentCore in the use cases |
| [`speech-to-text/`](speech-to-text/) | Amazon Transcribe streaming features for voice agents: semantic turn-taking, runtime hints, and runtime custom vocabulary | Amazon Transcribe |
| [`multimodal-embeddings/`](multimodal-embeddings/) | Embedding text, images, video, audio, and documents, and patterns for semantic, multilingual, and visual search, clustering, and classification | Amazon Bedrock (Nova Multimodal Embeddings), Amazon S3 Vectors, OpenSearch Serverless |
| [`customization/`](customization/) | Fine-tuning (SFT, PEFT, DPO), reinforcement fine-tuning (RFT), distillation, evaluation, and deployment of custom Nova models, plus HyperPod setup and utilities | Amazon Bedrock, Amazon SageMaker AI (Training Jobs, HyperPod) |
| [`nova-act/`](nova-act/) | Tutorials and use cases for building agents that take actions in web browsers: QA testing, adaptive UI testing, and price comparison | Amazon Nova Act, Amazon Bedrock AgentCore Browser |
| [`skills/`](skills/) | Agent Skills and Claude Code plugins for AI coding assistants: Nova prompt optimization, migrating from OpenAI, Gemini, or Titan to Nova, and turning a text agent into a voice agent | Works with Claude Code, Kiro, and other Agent Skills–compatible tools |

## Where to start

| I want to… | Start here |
| --- | --- |
| Make my first call to a Nova model | [`multimodal-understanding/getting-started/`](multimodal-understanding/getting-started/) |
| Learn Nova models end to end in a guided workshop | [`multimodal-understanding/workshop/`](multimodal-understanding/workshop/) |
| Find a ready-made pattern (RAG, agents, IDP, citations, batch inference, …) | [`multimodal-understanding/repeatable-patterns/`](multimodal-understanding/repeatable-patterns/) |
| Build a real-time voice agent | [`speech-to-speech/amazon-nova-2-sonic/`](speech-to-speech/amazon-nova-2-sonic/) |
| Write prompts for Nova Sonic 2.5 | [`speech-to-speech/amazon-nova-2.5-sonic/`](speech-to-speech/amazon-nova-2.5-sonic/) |
| Convert text to natural-sounding speech | [`text-to-speech/getting-started/`](text-to-speech/getting-started/) |
| Add turn-taking and runtime hints to a voice agent's speech-to-text | [`speech-to-text/turbo/features/javascript/`](speech-to-text/turbo/features/javascript/) |
| Build semantic or multimodal search | [`multimodal-embeddings/getting-started/`](multimodal-embeddings/getting-started/) |
| Fine-tune or distill a Nova model | [`customization/`](customization/) |
| Automate browser workflows with an agent | [`nova-act/tutorials/path-to-production/`](nova-act/tutorials/path-to-production/) |
| Migrate existing OpenAI, Gemini, or Titan code to Nova | [`skills/`](skills/) |

Each folder has its own README with prerequisites, setup steps, and a full
index of its samples.

## Highlights by folder

### Multimodal understanding

- **[Getting started](multimodal-understanding/getting-started/)**: setup, the
  Converse API, built-in tool calling, and integrations with Strands Agents and
  LangChain.
- **[Workshop](multimodal-understanding/workshop/)**: a three-part self-paced
  workshop: getting started with Nova 2, multimodal intelligence, and agentic
  workflows deployed to Amazon Bedrock AgentCore.
- **[Repeatable patterns](multimodal-understanding/repeatable-patterns/)**:
  task-focused guides covering document understanding and IDP, image grounding,
  video temporal reasoning, citations, prompt caching, LLM-as-a-judge, batch
  inference, and agents built with Strands, LangGraph, CrewAI, smolagents, and
  the OpenAI Agents SDK.
- **[Sample apps](multimodal-understanding/sample-apps/)** and the
  **[Nova meta-prompter](multimodal-understanding/nova-meta-prompter/)**, which
  transforms prompts written for other models into Nova-optimized prompts.

### Speech-to-speech (Nova Sonic)

Nova Sonic uses the `InvokeModelWithBidirectionalStream` API for low-latency
voice conversations.

- **[`amazon-nova-2-sonic/`](speech-to-speech/amazon-nova-2-sonic/)**: the
  current samples. Includes sample code (console Python, WebSocket in Java,
  Node.js, and .NET, and AgentCore), repeatable patterns (knowledge bases,
  session continuation, conversation transfer, chat-history and token-usage
  logging, customer service),
  and workshops (Python server, React client, LiveKit, AgentCore).
- **[`amazon-nova-2.5-sonic/`](speech-to-speech/amazon-nova-2.5-sonic/)**: a
  getting-started and migration guide and a prompting guide for Nova Sonic 2.5.
- The top-level `sample-codes/`, `repeatable-patterns/`, and `workshops/`
  folders hold the original Nova Sonic samples.

### Text-to-speech (Amazon Polly)

- **[Getting started](text-to-speech/getting-started/)**: a guided first
  request that covers Polly engines, voice discovery, and synthesis.
- **[Features](text-to-speech/features/)**: eight focused examples:
  `SynthesizeSpeech`, `DescribeVoices`, SSML, speech marks, lexicons,
  asynchronous synthesis to S3, bidirectional streaming, and voice cloning.
- **[Use cases](text-to-speech/use-cases/)**: a cascading STT → LLM → TTS voice
  agent, a podcast generator, a live speech translator, a lip-synced 3D avatar,
  and a voice assistant for the Reachy Mini robot.
- **[Skills](text-to-speech/skills/)**: agent skills that help AI coding
  assistants work with these samples.

### Multimodal embeddings

Numbered [getting-started notebooks](multimodal-embeddings/getting-started/) for
each modality, and [repeatable patterns](multimodal-embeddings/repeatable-patterns/)
for video search with S3 Vectors, multilingual search, clustering, and intent
classification, visual product search, multimodal document search with
LangChain and LlamaIndex, and industry examples.

### Customization

Bedrock fine-tuning and distillation (text-to-SQL, understanding, Nova Canvas,
citations, and function-calling recipes); SageMaker AI customization for Nova 1.0
and Nova 2.0 (data prep → SFT → RFT → evaluation → deployment); HyperPod cluster
setup; and utilities such as a dataset validator, an FT-to-eval converter, and
job monitoring. See the [customization README](customization/) for a
use-case-to-folder map.

### Nova Act

A [path-to-production tutorial](nova-act/tutorials/path-to-production/) (setup,
workflow basics, tool use) and [use cases](nova-act/usecases/) for agentic QA
testing, adaptive UI testing, and price comparison, using Amazon Bedrock
AgentCore Browser.

### Skills and Claude Code plugins

The [`skills/`](skills/) folder holds [Agent Skills](https://agentskills.io/specification)
for AI coding assistants. Several are also published as Claude Code plugins
through this repository's marketplace:

```text
/plugin marketplace add aws-samples/amazon-ai-samples
/plugin install nova-prompting@aws-samples-amazon-nova-samples
```

| Plugin | Purpose |
| --- | --- |
| `nova-prompting` | Prompt optimization for Nova 1 and Nova 2 Lite (`/nova1-prompt`, `/nova2-prompt`) |
| `nova-sonic25-prompting` | Prompt best practices for Nova Sonic 2.5 voice agents (`/nova-sonic25-prompt`) |
| `openai-to-nova-migration` | Migrate OpenAI code and prompts to Nova 2 Lite |
| `gemini-to-nova-migration` | Migrate Google Gemini code and prompts to Nova 2 Lite |
| `titan-nova-mme-migration` | Migrate Titan embedding code to Nova Multimodal Embeddings |

> The marketplace keeps its original identifier,
> `aws-samples-amazon-nova-samples`, so existing plugin installs keep working.

## Prerequisites

1. An AWS account and credentials configured for the AWS CLI or SDK (for
   example, with `aws configure` or an IAM role).
2. A Region where the model or service you're using is available. Check the
   individual sample README for supported Regions and model IDs.
3. Python 3.10 or later for most samples. Some samples use Java, Node.js, or
   .NET, or need a newer Python version; their READMEs say so.
4. IAM permissions for the services the sample uses (see below).

### IAM permissions

The AWS identity you use, whether it's an IAM user, an assumed role, or a
[SageMaker AI execution role](https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-roles.html),
needs permission to call the services in the sample. For **experimentation
only**, a policy like the one below covers the core Bedrock and Polly samples.
For anything beyond experimentation, scope `Action` and `Resource` to what the
sample actually needs.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BedrockInvoke",
            "Effect": "Allow",
            "Action": ["bedrock:InvokeModel*"],
            "Resource": "*"
        },
        {
            "Sid": "PollySynthesis",
            "Effect": "Allow",
            "Action": ["polly:*"],
            "Resource": "*"
        }
    ]
}
```

Many samples need more than this, such as Amazon S3, Amazon Transcribe, Amazon
Translate, Amazon SageMaker AI, OpenSearch Serverless, or Amazon Bedrock
AgentCore. Each sample's README lists its own permissions.

> ⚠️ With Amazon SageMaker AI, the notebook execution role is usually *separate*
> from the role you use to sign in to the AWS Management Console. Grant
> permissions to both if you also want to use the console.

For fine-grained Bedrock permissions, see the
[Amazon Bedrock User Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html).

## Costs

These samples are for demonstration and learning, and are not intended for
production use as-is. Running them makes billed AWS API calls, and some samples
deploy infrastructure (for example, Fargate, OpenSearch Serverless, HyperPod
clusters, or training jobs) that keeps costing money until you delete it.
Review each sample's README before running it, and follow its cleanup steps
when you're done.

## Contributing

We welcome community contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for
guidelines.

> **Note:** Please contact the repository maintainers before proposing new
> top-level folders or changes to them.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more
information.

## License

This library is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file.

## 👏 Contributors

Shout out to these awesome contributors:

<a href="https://github.com/aws-samples/amazon-ai-samples/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=aws-samples/amazon-ai-samples" />
</a>
