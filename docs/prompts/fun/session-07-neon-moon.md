# OpenCode Prompts: ZemLOVEka MasterPrompt.md: engineer tasks and tests (fork #1)

- Session ID: `ses_2f21932bdffeLt6mkQF1P9POoJ`
- Slug: `neon-moon`
- Directory: `/home/fun/proj/funnovation2026`
- Created: 2026-03-21 00:58:42 UTC
- Updated: 2026-03-21 04:24:25 UTC
- Prompt count: 11

## Prompts

### 001 - 2026-03-20 22:40:36 UTC

```text
read zemLOVEka_MasterPrompt.md. I am a prompt engineer, what is there for me to do and to test?
```

### 002 - 2026-03-20 22:45:49 UTC

```text
Yes, I'd like you to draft the Prompt Engineering Pack. Help me write the prompts - write every prompt. Assess schema.sql. Write structured output schemas (Gemini uses OpenAPI specifications in JSON format - individual specs for individual prompts).
```

### 003 - 2026-03-21 01:03:38 UTC

```text
# Gemini API Development Skill

## Overview

The Gemini API provides access to Google's most advanced AI models. Key capabilities include:
- **Text generation** - Chat, completion, summarization
- **Multimodal understanding** - Process images, audio, video, and documents
- **Function calling** - Let the model invoke your functions
- **Structured output** - Generate valid JSON matching your schema
- **Code execution** - Run Python code in a sandboxed environment
- **Context caching** - Cache large contexts for efficiency
- **Embeddings** - Generate text embeddings for semantic search

## Current Gemini Models

- `gemini-3-pro-preview`: 1M tokens, complex reasoning, coding, research
- `gemini-3-flash-preview`: 1M tokens, fast, balanced performance, multimodal
- `gemini-3-pro-image-preview`: 65k / 32k tokens, image generation and editing


> [!IMPORTANT]
> Models like `gemini-2.5-*`, `gemini-2.0-*`, `gemini-1.5-*` are legacy and deprecated. Use the new models above. Your knowledge is outdated.

## SDKs

- **Python**: `google-genai` install with `pip install google-genai`
- **JavaScript/TypeScript**: `@google/genai` install with `npm install @google/genai`
- **Go**: `google.golang.org/genai` install with `go get google.golang.org/genai`
- **Java**:
  - groupId: `com.google.genai`, artifactId: `google-genai`
  - Latest version can be found here: https://central.sonatype.com/artifact/com.google.genai/google-genai/versions (let's call it `LAST_VERSION`) 
  - Install in `build.gradle`:
    ```
    implementation("com.google.genai:google-genai:${LAST_VERSION}")
    ```
  - Install Maven dependency in `pom.xml`:
    ```
    <dependency>
	    <groupId>com.google.genai</groupId>
	    <artifactId>google-genai</artifactId>
	    <version>${LAST_VERSION}</version>
	</dependency>
    ```

> [!WARNING]
> Legacy SDKs `google-generativeai` (Python) and `@google/generative-ai` (JS) are deprecated. Migrate to the new SDKs above urgently by following the Migration Guide.

## Quick Start

### Python
```python
from google import genai

client = genai.Client()
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Explain quantum computing"
)
print(response.text)
```

### JavaScript/TypeScript
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: "Explain quantum computing"
});
console.log(response.text);
```

### Go
```go
package main

import (
	"context"
	"fmt"
	"log"
	"google.golang.org/genai"
)

func main() {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	resp, err := client.Models.GenerateContent(ctx, "gemini-3-flash-preview", genai.Text("Explain quantum computing"), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(resp.Text)
}
```

### Java

```java
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

public class GenerateTextFromTextInput {
  public static void main(String[] args) {
    Client client = new Client();
    GenerateContentResponse response =
        client.models.generateContent(
            "gemini-3-flash-preview",
            "Explain quantum computing",
            null);

    System.out.println(response.text());
  }
}
```

## API spec (source of truth)

**Always use the latest REST API discovery spec as the source of truth for API definitions** (request/response schemas, parameters, methods). Fetch the spec when implementing or debugging API integration:

- **v1beta** (default): `https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta`  
  Use this unless the integration is explicitly pinned to v1. The official SDKs (google-genai, @google/genai, google.golang.org/genai) target v1beta.
- **v1**: `https://generativelanguage.googleapis.com/$discovery/rest?version=v1`  
  Use only when the integration is specifically set to v1.

When in doubt, use v1beta. Refer to the spec for exact field names, types, and supported operations.

## How to use the Gemini API

For detailed API documentation, fetch from the official docs index:

**llms.txt URL**: `https://ai.google.dev/gemini-api/docs/llms.txt`

This index contains links to all documentation pages in `.md.txt` format. Use web fetch tools to:

1. Fetch `llms.txt` to discover available documentation pages
2. Fetch specific pages (e.g., `https://ai.google.dev/gemini-api/docs/function-calling.md.txt`)

### Key Documentation Pages 

> [!IMPORTANT]
> Those are not all the documentation pages. Use the `llms.txt` index to discover available documentation pages

- [Models](https://ai.google.dev/gemini-api/docs/models.md.txt)
- [Google AI Studio quickstart](https://ai.google.dev/gemini-api/docs/ai-studio-quickstart.md.txt)
- [Nano Banana image generation](https://ai.google.dev/gemini-api/docs/image-generation.md.txt)
- [Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling.md.txt)
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output.md.txt)
- [Text generation](https://ai.google.dev/gemini-api/docs/text-generation.md.txt)
- [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding.md.txt)
- [Embeddings](https://ai.google.dev/gemini-api/docs/embeddings.md.txt)
- [Interactions API](https://ai.google.dev/gemini-api/docs/interactions.md.txt)
- [SDK migration guide](https://ai.google.dev/gemini-api/docs/migrate.md.txt)

## Gemini Live API

For real-time, bidirectional audio/video/text streaming with the Gemini Live API, install the **`google-gemini/gemini-live-api-dev`** skill. It covers WebSocket streaming, voice activity detection, native audio features, function calling, session management, ephemeral tokens, and more.


find appropriate integration points in codebase that were placed by my team that are ready for integration. integrate it
```

### 004 - 2026-03-21 01:29:18 UTC

```text
continue
```

### 005 - 2026-03-21 01:58:10 UTC

```text
continue
```

### 006 - 2026-03-21 02:37:35 UTC

```text
yes add those
```

### 007 - 2026-03-21 03:09:27 UTC

```text
the docker build doesn't seem to get the env variable passed in
```

### 008 - 2026-03-21 03:14:59 UTC

```text
i got [frontend] | Onboarding evaluation fallback: Error: Model did not return valid JSON
[frontend] |     at <unknown> (.next/server/chunks/[root-of-the-server]__0cdfnvz._.js:37:2466)
[frontend] |     at n (.next/server/chunks/[root-of-the-server]__0cdfnvz._.js:37:2508)
[frontend] |     at async r (.next/server/chunks/[root-of-the-server]__0z-qsjd._.js:37:1678)
[frontend] |     at async u (.next/server/chunks/[root-of-the-server]__080-nqp._.js:37:3075)
[frontend] |     at async u (.next/server/chunks/[root-of-the-server]__080-nqp._.js:68:3618)
[frontend] |     at async l (.next/server/chunks/[root-of-the-server]__080-nqp._.js:68:4659)
```

### 009 - 2026-03-21 03:20:39 UTC

```text
still: [frontend] | Onboarding evaluation fallback: Error: Model did not return valid JSON
[frontend] |     at <unknown> (.next/server/chunks/[root-of-the-server]__0cdfnvz._.js:37:3095)
[frontend] |     at r (.next/server/chunks/[root-of-the-server]__0cdfnvz._.js:37:3137)
[frontend] |     at async r (.next/server/chunks/[root-of-the-server]__0z-qsjd._.js:37:1678)
[frontend] |     at async u (.next/server/chunks/[root-of-the-server]__080-nqp._.js:37:3074)
[frontend] |     at async u (.next/server/chunks/[root-of-the-server]__080-nqp._.js:68:3618)
[frontend] |     at async l (.next/server/chunks/[root-of-the-server]__080-nqp._.js:68:4659). since it's running can't you just show the log in postgres?
```

### 010 - 2026-03-21 03:36:21 UTC

```text
seems to work now and results appear in db. i don't like that last env variable (GEMINI_THINKING_BUDGET), seems redundant since we can't even process other thinking levels, maybe set it as a code constant instead.
```

### 011 - 2026-03-21 03:53:03 UTC

```text
hi
```
