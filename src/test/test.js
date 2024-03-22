import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: "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", // defaults to process.env["ANTHROPIC_API_KEY"]
});

const msg = await anthropic.messages.create({
  model: "claude-instant-1.2",
  max_tokens: 1519,
  temperature: 0.1,
  messages: [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "介绍一下你自己"
        }
      ]
    }
  ]
});
console.log(msg);