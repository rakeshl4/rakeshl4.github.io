---
title: Solving Context Window Challenges with AI Skills in Microsoft Agent Framework
date: '2026-03-11'
tags: ['AI Agent', 'Microsoft Agent Framework', 'Skills', 'Context Engineering']
draft: false
images: ['/static/images/2026-03-11/cover.png']
summary: As AI agents grow in capability, they quickly hit context window limitations. Packing all instructions, tool descriptions, and domain knowledge into a single prompt wastes tokens and degrades performance. In this post, we explore how AI Skills in Microsoft Agent Framework solve this through progressive disclosure—keeping the context lean while enabling rich, modular agent capabilities.
---

Building AI agents often starts simple: a system prompt, a few tools, and a straightforward conversation.
But as your agent grows in capability, you start packing more and more into the context: detailed instructions, business rules and domain knowledge, tool usage guidelines, etc.

This can quickly lead to a bloated context window, where critical instructions get lost in the noise, and you hit token limits that degrade performance.

In this post, we'll explore why context windows fill up so quickly when building AI agents, and how **AI Skills** in Microsoft Agent Framework provide an elegant solution through **progressive disclosure**.

We'll use a practical example of a travel assistant agent to demonstrate how skills keep the context lean and focused, while still providing rich domain knowledge and guidance when needed.

💡 **Source Code**: You can find the full working implementation in the GitHub repository: [agent-skills](https://github.com/binarytrails-ai/agent-skills)

## Why Does the Context Window Fill Up?

Every conversation with a language model has a limited context window. This is the total amount of text (measured in tokens) the model can process at once. When building agents, several factors consume this valuable space:

1. **System Instructions**: The initial prompt that defines the agent's identity, goals, and behavior.

2. **Tool Usage Guidelines**: Each tool your agent can use requires instructions on when and how to use it. A single tool might require 50-100 tokens of description. With multiple tools, this quickly adds up.

3. **Business Rules and Domain Knowledge**: If your agent operates in a specific domain or a scenario, you may need to include detailed information in the context to ensure the agent behaves correctly.

4. **Sample Conversations**: Providing examples of how the agent should respond in different scenarios can consume hundreds of tokens.

In addition to these, you will also have the user's query and the chat history, which also consume tokens. When you combine all these elements, it's easy to reach thousands of tokens.

## How Can We Optimize Context Usage?

There are several approaches to optimizing context usage: summarizing chat history, condensing instructions, using external data optimally, and more.

In this post, we'll focus on the challenge of instruction overload. The problem is that all the instructions for the agent are typically loaded into the context at startup, regardless of whether they are relevant to the user's query or not. This means that if you have instructions for multiple domains or scenarios, they all consume tokens even if the user only interacts with one of those domains.

For example, consider a travel assistant that helps with weather information, visa requirements, and destination recommendations.
When building this agent, you'd typically add instructions for all three domains into the system prompt. This means every interaction processes instructions for weather, visas, and destinations even if the user only asks about one topic. The irrelevant instructions add noise, consume tokens unnecessarily, and increase costs.

The solution?

Load only the relevant instructions based on the user's query. This is where **AI Skills** come in. They modularize your agent's knowledge and load it on demand, keeping the context lean and focused on what the user actually needs.

## Introducing Microsoft Agent Skills

Microsoft Agent Framework introduces **AI Skills** as a solution to this problem. Skills are self-contained units of domain knowledge that the agent discovers and loads on demand.

Rather than stuffing everything into the initial context, skills use a **progressive disclosure** pattern:

1. **Advertise** (~100 tokens per skill): The agent sees only skill names and brief descriptions
2. **Load** (on-demand): Full skill instructions are loaded when relevant to the user's query
3. **Read resources** (as needed): Supplementary data files are loaded only when referenced

This means an agent with 10 skill areas consumes only a few hundred tokens at startup (advertising), rather than potentially thousands of tokens if all instructions were loaded upfront. The agent autonomously determines which skills are relevant and loads them on demand.

[FileAgentSkillsProvider](https://learn.microsoft.com/en-us/dotnet/api/microsoft.agents.ai.fileagentskillsprovider?view=agent-framework-dotnet-latest) is a built-in provider that discovers skills from `SKILL.md` files in a specified directory. The skills can be organized hierarchically, and the provider handles the mechanics of advertising and loading them based on the agent's needs.

```
skills/
├── skill-one/
│   └── SKILL.md           # Instructions for skill one
├── skill-two/
│   └── SKILL.md           # Instructions for skill two
└── skill-three/
    ├── SKILL.md           # Instructions for skill three
    └── references/
        └── DATA.md        # Reference data (loaded on demand)
```

Each skill file contains YAML frontmatter (name and description) for advertising, and markdown content (full instructions) that is loaded on demand.
It can also reference additional data files that are only loaded when the agent needs them.

## Implementing AI Skills for a Travel Assistant

Let's build a travel assistant that demonstrates skills in action. We'll create an agent with three skills: weather information, visa recommendations, and destination suggestions.

### Step 1: Define the Skill Files

Each skill is a `SKILL.md` file with two parts: YAML frontmatter (for advertising) and markdown content (loaded on demand).

In the instruction, notice how the visa-recommendation skill references an additional data file `references/VISA_REQUIREMENTS.md` for detailed visa requirements, which is only loaded when needed.

**skills/visa-recommendation/SKILL.md**

```markdown
---
name: visa-recommendation
description: Provides visa requirements, entry regulations, and travel 
document guidance for international destinations
---

# Visa Recommendation Skill

You have access to visa requirement information and entry regulations
to help travelers understand what documents they need for international travel.
Reference the [visa requirements documentation](references/VISA_REQUIREMENTS.md)
for detailed country-specific information.

## When to Use This Skill

Use this skill when the traveler:

- Asks about visa requirements for a specific country
- Needs to know about visa-free entry eligibility
- Wants to understand visa application processes
- Asks about passport validity requirements
- Is planning international travel and unsure about entry requirements

## Usage Guidelines

1. **Ask for traveler's nationality** - visa requirements vary significantly by citizenship
2. **Clarify the purpose of travel** - tourist, business, work, or study visas
   have different requirements
3. **Check trip duration** - visa-free periods have time limits
4. **Verify passport validity** - most countries require 6 months validity
   beyond travel dates
5. **Consider processing time** - recommend starting visa applications
   4-8 weeks before travel

## Important Notes

- Visa requirements can change frequently - always recommend checking
  official embassy/consulate websites
- Requirements vary by nationality - never assume visa rules without
  knowing traveler's citizenship
- Remind travelers about passport validity (typically 6 months beyond travel)
```

**skills/destination-recommendation/SKILL.md**

```markdown
---
name: destination-recommendation
description: Suggests travel destinations based on preferences, budget, 
season, and interests with detailed information about each location
---

# Destination Recommendation Skill

You have access to destination information and travel planning tools to help
travelers discover and choose the perfect destination for their trip.

## When to Use This Skill

Use this skill when the traveler:

- Is unsure where to travel
- Wants destination suggestions based on specific criteria
- Asks "Where should I go?" or "What are good places to visit?"
- Needs help choosing between multiple destinations
- Is looking for destinations that match their interests

## Usage Guidelines

1. **Ask clarifying questions** to understand traveler preferences:

   - Budget level (budget, mid-range, luxury)
   - Travel style (adventure, relaxation, cultural, urban, nature)
   - Interests (food, history, shopping, outdoor activities, nightlife)
   - Season or month of travel
   - Duration of trip
   - Traveling solo, couple, family, or group

2. **Provide personalized recommendations** based on:

   - Weather and seasonal factors
   - Budget compatibility
   - Cultural and activity matches

3. **Include practical information**:
   - Best time to visit
   - Typical duration recommended
   - Highlight attractions and experiences

## For Specific Interests

**Food Lovers**: Tokyo, Singapore, Bangkok, Melbourne, Paris, Mexico City
**History Buffs**: Rome, Athens, Cairo, Kyoto, Istanbul
**Beach & Relaxation**: Maldives, Bali, Caribbean islands, Greek islands
**Adventure**: New Zealand, Nepal, Iceland, Patagonia, Costa Rica
**Budget Conscious**: Southeast Asia, Eastern Europe, Central America
```

**skills/weather-info/SKILL.md**

```markdown
---
name: weather-info
description: Provides weather forecasts for travel destinations
---

# Weather Information Skill

Provides weather forecasts to help travelers plan trips.

## Available Tools

### get_weather_forecast

Returns current weather conditions including temperature, conditions,
and humidity for any city.

## Usage

- Use when travelers ask about weather at a destination
- Remember southern hemisphere seasons are reversed (June is winter in Melbourne)
- Recommend checking forecasts closer to travel dates
```

The `weather-info` skill requires a tool to fetch weather data, which we'll define in the next step. The tool must be always registered with the agent, but the skill provides the instructions on when and how to use it.

### Step 2: Create the Agent with Skills Provider

We will use .NET 10 and the Microsoft Agent Framework to create our agent. Create a new file `Program.cs` and set up the agent with the `FileAgentSkillsProvider` to load our skills.

💡 This example shows the core concepts in minimal form. You can find the full working implementation in the GitHub repository: [agent-skills](https://github.com/binarytrails-ai/agent-skills)

**Program.cs**

```csharp
#:package Azure.AI.OpenAI@2.1.0
#:package Azure.Identity@1.18.0
#:package Microsoft.Agents.AI@1.0.0-rc2
#:package Microsoft.Extensions.AI@10.3.0

#pragma warning disable MAAI001 // FileAgentSkillsProvider is experimental

using System.ClientModel;
using System.ComponentModel;
using Azure.AI.OpenAI;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;

// Step 1: Create the chat client (Azure AI or GitHub Models)
var azureEndpoint = Environment.GetEnvironmentVariable("AZURE_AI_SERVICES_ENDPOINT");
var azureApiKey = Environment.GetEnvironmentVariable("AZURE_AI_SERVICES_KEY");
var modelName = Environment.GetEnvironmentVariable("AZURE_TEXT_MODEL_NAME") ?? "gpt-4o";

var azureClient = new AzureOpenAIClient(
    new Uri(azureEndpoint!),
    new ApiKeyCredential(azureApiKey!));

IChatClient chatClient = azureClient
    .GetChatClient(modelName)
    .AsIChatClient();

// Step 2: Create the skills provider
// FileAgentSkillsProvider discovers skills from SKILL.md files in the specified directory
// Progressive disclosure: advertises ~100 tokens per skill, loads full content on-demand
var skillsProvider = new FileAgentSkillsProvider(
    skillPath: Path.Combine(Directory.GetCurrentDirectory(), "skills"));

// Step 3: Create the agent with skills and tools
var agent = chatClient.AsAIAgent(new ChatClientAgentOptions
{
    Name = "TravelAssistant",
    ChatOptions = new()
    {
        Instructions = """
            You are a helpful travel assistant. Help users plan trips with
            weather information, visa requirements, and destination recommendations.
            """,
        Tools = [AIFunctionFactory.Create(GetWeatherForecast)],
    },
    AIContextProviders = [skillsProvider],  // Skills loaded progressively
});

// Step 4: Run conversations
AgentSession session = await agent.CreateSessionAsync();

var query = "I'm an Australian citizen planning to visit Japan for 2 weeks " +
            "What visas do I need?";

Console.WriteLine($"User: {query}");
var response = await agent.RunAsync(query, session);
Console.WriteLine($"Agent: {response.Text}");
```

### Step 3: Define the Weather Tool

The `get_weather_forecast` tool is a simple function that the agent can call. The skill provides instructions on _when_ and _how_ to use it.

```csharp
[Description("Get the weather forecast for a specific city")]
static string GetWeatherForecast(
    [Description("The city name to get weather for")] string city)
{
    // In production, call a real weather API
    var conditions = new[] { "Sunny", "Partly Cloudy", "Cloudy", "Rainy" };
    var random = new Random();
    var temp = random.Next(-5, 40);
    var condition = conditions[random.Next(conditions.Length)];
    var humidity = random.Next(30, 90);

    return $"Weather in {city}: {condition}, {temp}°C, Humidity: {humidity}%";
}
```

### How Progressive Disclosure Works at Runtime

When the agent runs, here's what happens behind the scenes:

**1. Startup (Advertise Phase)**

The `FileAgentSkillsProvider` scans the skills directory and injects a skill list into the agent's context:

```
Available skills:
- weather-info: Provides weather forecasts for travel destinations
- visa-recommendation: Provides visa requirements and travel document guidance
- destination-recommendation: Suggests travel destinations based on preferences
```

This consumes only a few hundred tokens, allowing the agent to be aware of its capabilities without overwhelming the context.

**2. User Query: "What visas do I need for Japan?"**

The agent receives the query and determines that visa information is relevant. It calls the `load_skill` tool (automatically registered by the provider):

```
Agent: [Calling load_skill("visa-recommendation")]
```

**3. Load Phase**

The full skill instructions are loaded into context. If the agent had needed specific visa details from the `references/VISA_REQUIREMENTS.md` file, it would only be loaded at that moment.

Now the agent has detailed guidance on visa requirements.

**4. Agent Response**

With the loaded skill instructions, the agent provides a comprehensive answer:

```
Agent: For Australian citizens:

**Japan**: Good news! Australians can visit Japan visa-free for up to 90 days
for tourism. Your 2-week trip is well within this limit. Just ensure your
passport is valid for the duration of your stay.

```

**5. Skills Not Loaded**

Notice that `weather-info` and `destination-recommendation` were never loaded. The agent determined they weren't relevant to this query. This keeps the context lean and focused.

Try the [agent-skills repository](https://github.com/binarytrails-ai/agent-skills) to see skills in action, or start building your own!

## References

- [Microsoft Agent Framework Skills Documentation](https://learn.microsoft.com/en-us/agent-framework/agents/skills?pivots=programming-language-csharp)
- [Microsoft Agent Framework Overview](https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview/)
