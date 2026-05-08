# HeatGuard AI Agent — Android Integration Guide

The HeatGuard AI is a safety intelligence assistant powered by GPT-4o-mini via the Vercel AI SDK.
This guide explains how to connect your Android app to the same AI endpoint used by the web dashboard.

---

## Endpoint

```
POST https://dashboard.heatguard.ae/api/chat
Content-Type: application/json
```

The endpoint accepts a conversation history and returns a **streamed** response (Vercel AI data stream format).

---

## Request Format

```json
{
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "parts": [
        { "type": "text", "text": "Who is at risk right now?" }
      ]
    }
  ]
}
```

### Message object fields

| Field   | Type     | Required | Description                          |
|---------|----------|----------|--------------------------------------|
| `id`    | `string` | Yes      | Unique ID per message (any string)   |
| `role`  | `string` | Yes      | `"user"` or `"assistant"`            |
| `parts` | `array`  | Yes      | Array with one text part (see above) |

To send a multi-turn conversation, include all previous messages in the array in order.

---

## Response Format (Streaming)

The server streams the AI reply as a series of newline-delimited chunks:

```
0:"**Rajesh Iyer** (HG-0877) is at critical risk"
0:" — heat index 44.7°C with asthma."
0:" Recommend immediate shade + nurse dispatch.\n"
d:{"finishReason":"stop","usage":{"promptTokens":412,"completionTokens":38}}
```

- Lines starting with `0:"..."` → extract the text inside the quotes — this is the AI response content
- Lines starting with `d:` → metadata / finish signal, can be ignored
- Concatenate all `0:` text chunks in order to build the full response

---

## Android Implementation (Kotlin + OkHttp)

### 1. Add dependency to `build.gradle`

```kotlin
implementation("com.squareup.okhttp3:okhttp:4.12.0")
implementation("org.json:json:20231013")
```

### 2. Data classes

```kotlin
data class ChatMessage(
    val id: String,
    val role: String,   // "user" or "assistant"
    val text: String
)
```

### 3. API call with streaming

```kotlin
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

object HeatGuardAI {

    private val client = OkHttpClient.Builder()
        .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    private const val BASE_URL = "https://dashboard.heatguard.ae/api/chat"

    fun sendMessage(
        messages: List<ChatMessage>,
        onChunk: (String) -> Unit,       // called for each streamed word/chunk
        onDone: (String) -> Unit,        // called with the full response when complete
        onError: (String) -> Unit
    ) {
        val messagesJson = JSONArray()
        messages.forEachIndexed { index, msg ->
            val parts = JSONArray().put(
                JSONObject().put("type", "text").put("text", msg.text)
            )
            messagesJson.put(
                JSONObject()
                    .put("id", msg.id.ifEmpty { "msg-$index" })
                    .put("role", msg.role)
                    .put("parts", parts)
            )
        }

        val body = JSONObject().put("messages", messagesJson).toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url(BASE_URL)
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                onError(e.message ?: "Network error")
            }

            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    onError("Server error: ${response.code}")
                    return
                }

                val fullText = StringBuilder()

                response.body?.source()?.let { source ->
                    while (!source.exhausted()) {
                        val line = source.readUtf8Line() ?: break
                        // Parse Vercel AI stream: lines look like  0:"chunk text"
                        if (line.startsWith("0:\"") && line.endsWith("\"")) {
                            val chunk = line
                                .removePrefix("0:\"")
                                .removeSuffix("\"")
                                .replace("\\n", "\n")
                                .replace("\\\"", "\"")
                                .replace("\\\\", "\\")
                            fullText.append(chunk)
                            onChunk(chunk)
                        }
                    }
                }

                onDone(fullText.toString())
            }
        })
    }
}
```

### 4. Usage in your Activity / ViewModel

```kotlin
val history = mutableListOf<ChatMessage>()

fun askAI(userQuestion: String) {
    history.add(ChatMessage(
        id    = "msg-${System.currentTimeMillis()}",
        role  = "user",
        text  = userQuestion
    ))

    var aiReply = ""

    HeatGuardAI.sendMessage(
        messages = history,
        onChunk  = { chunk ->
            runOnUiThread {
                // Append chunk to your TextView / chat bubble in real time
                aiReply += chunk
                chatBubble.text = aiReply
            }
        },
        onDone   = { fullText ->
            // Save assistant reply to history for multi-turn conversation
            history.add(ChatMessage(
                id   = "msg-${System.currentTimeMillis()}",
                role = "assistant",
                text = fullText
            ))
        },
        onError  = { error ->
            runOnUiThread {
                Toast.makeText(this, "AI error: $error", Toast.LENGTH_SHORT).show()
            }
        }
    )
}
```

---

## Suggested Questions to Send

These match the web dashboard suggestion buttons:

```kotlin
val suggestions = listOf(
    "Any workers at risk?",
    "Whose certificate or license has expired?",
    "Show compliance gaps",
    "Summarize today"
)
```

---

## Conversation History

To support multi-turn conversations (follow-up questions), keep all messages in the `history` list and pass the full list on every request. The AI uses the history to understand context.

```
User:  "Who is at risk?"
AI:    "Rajesh Iyer is at critical risk..."
User:  "What should I do about him?"   ← AI understands "him" from context
```

---

## Error Handling

| HTTP Code | Meaning                              | Action                          |
|-----------|--------------------------------------|---------------------------------|
| `200`     | Success — stream begins              | Parse stream chunks             |
| `500`     | Server / OpenAI error                | Show retry message to user      |
| Network   | No connection / timeout              | Show offline message            |

---

## Notes

- The AI already has all worker data, certifications, incidents, and heat readings built in — **no extra API calls needed** to provide context.
- The endpoint does not require authentication (it is scoped to the HeatGuard domain). If you add auth later, pass the Supabase session token as `Authorization: Bearer <token>`.
- `maxDuration` on the server is 30 seconds. Set your Android `readTimeout` to at least 30s.
