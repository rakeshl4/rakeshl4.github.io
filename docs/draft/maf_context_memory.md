---
title: Long-Term Memory for AI Agents - Building Personalized Experiences with Microsoft Agent Framework
date: '2026-02-09'
tags: ['AI Agent', 'Microsoft Agent Framework', 'Context Engineering', 'Memory']
draft: false
images: ['/static/images/2026-02-09/cover.png']
summary: A language model does not have its own memory. It can only respond based on the the messages and context provided to it in each conversation. Providing the right context is critical to getting results that feel personalized and intelligent. This is where memory comes in. But what does memory look like in an AI agent? How can we build systems that remember user preferences across conversations, without overwhelming users with questions or forcing them to repeat themselves? In this post, we will explore short-term and long-term agent memory.
---

A language model does not have its own memory. It can only respond based on the the messages and context provided to it in each conversation. Providing the right context is critical to getting results that feel personalized and intelligent. This is where memory comes in.

But what does memory look like in an AI agent? How can we build systems that remember user preferences across conversations, without overwhelming users with questions or forcing them to repeat themselves?

In this post, we'll explore **short-term** and **long-term** agent memory.

We will take an example of a travel assistant agent that learns user preferences (like budget, interests, travel style) during conversations and remembers them for future interactions.

We will use Microsoft Agent Framework's powerful **AI Context Providers** to implement this memory system, demonstrating how to extract information from conversations, persist it with proper scoping, and inject it back into the agent's context.

💡 **Source Code**: You can find the full working implementation of the examples discussed in this post in the GitHub repository: [maf-context-engineering](https://github.com/binarytrails-ai/maf-context-engineering)

## Understanding Memory in AI Agents

### Short-Term Memory

Short-term memory is the context maintained during a single conversation session. It includes:

- The current conversation history - This is usually passed to the language model as part of the messages in the chat request. If the conversation exceeds the model's token limit, older messages may be truncated or summarized to fit within the limit.
- Temporary state during the conversation - This is information that is relevant only to the current interaction and does not need to persist beyond it. For example, if the user says "I need a hotel in Hobart for next week," the agent might store "destination: Hobart" and "travel dates: next week" in short-term memory to use during that conversation to provide relevant suggestions.

The scope of the short-term memory is limited to the current conversation thread. And once the conversation ends (e.g., user starts a new chat), the short-term memory is typically cleared.

### Long-Term Memory

Imagine you have a travel assistant that you chat with multiple times over weeks or months. Each time you interact, it remembers your preferences, past trips, and feedback. This is long-term memory.

For example, if you tell the agent "I love hiking and coastal walks, and my budget is around $2,000," you would expect the agent to remember this information for future conversations. The next time you ask for travel suggestions, it should reference your preferences without asking you to repeat them.

This memory persists across conversation sessions and allows the agent to provide personalized recommendations based on what it has learned about you over time.

## The Challenge: Building Effective Long-Term Memory

When building long-term memory for AI agents, there are a few key challenges to address:

1. **What to Remember**: Identifying the key pieces of information that are important to remember about the user, such as preferences, past interactions, feedback, and relevant history. It's important to be selective and focus on stable information that will enhance future interactions.
2. **How to Extract Information**: Extracting structured information from natural conversations can be tricky. You need to design prompts and use the language model effectively to pull out relevant details from the conversation.
3. **Where to Store It**: Implementing a storage solution that can persist the information across sessions with proper scoping (per user, per agent, per application) while ensuring privacy and security.
4. **How to Use It**: Determining when and how to inject remembered information back into the agent's context to influence its responses.

## Building Long-Term Memory with AI Context Providers

Let us now see how to implement long-term memory for a travel assistant agent.

![User Profile Memory Flow](/static/images/2026-02-09/user-preference-memory.png)

1. **What to Remember**: We will remember user preferences such as travel style, budget range, interests, past trips, number of travelers, trip duration, and dietary requirements. This will be useful information to provide personalized travel recommendations for future trips.

2. **How to Extract Information**: We must scan every conversation for relevant information to update the user's profile. For example, if the user says "I'm a budget backpacker who loves hiking and beaches," we want to extract "TravelStyle: budget backpacker" and "Interests: hiking, beaches". We need to intercept the conversation after the agent responds and use the language model to analyze the conversation and extract structured information in a consistent format.

For example, the response from the language model for `I am a budget backpacker who loves hiking and beaches` might look like this:

```json
{
  "TravelStyle": "budget backpacker",
  "BudgetRange": null,
  "Interests": ["hiking", "beaches"],
  "PastDestinations": null,
  "NumberOfTravelers": null,
  "TripDuration": null,
  "DietaryRequirements": null
}
```

3. **Where to Store It**: You would normally persist this information in a database with proper scoping. Scoping will ensure that user profiles are isolated per user and secure. For faster retrieval during conversations, you might also use an in-memory cache that syncs with the database.

4. **How to Use It**: Before the agent processes a new user message, we will inject the stored profile information into the agent's instructions. This way, the agent is aware of the user's preferences and can provide personalized responses without asking for the same information again. We need to have the ability to intercept the agent's processing pipeline before it sends the request to the language model and add the relevant context.

## Building the Long-Term Memory System with Microsoft Agent Framework

We'll build a travel agent that:

1. Learns user preferences during conversations (budget, interests, travel style)
2. Stores this information as a long-term profile
3. Uses the profile to provide personalized recommendations in future conversations
4. Updates preferences incrementally without overwhelming users with questions

Microsoft Agent Framework provides a powerful pattern to address these challenges through **AI Context Providers**.

AI Context Providers in MAF allow you to:

- **Hook into the agent lifecycle** - This is critical for both extracting information after the agent responds and injecting context before the agent processes a new message. You can add cusom logic at these key points to manage memory effectively.
- **Inject context** - In the hook that runs before the agent processes a message, you can inject additional context (like user preferences) into the agent's instructions, ensuring the agent is aware of this information during response generation.

💡 **Note**: In the following sections, we will be seeing code snippets that demonstrate how to implement the memory system using AI Context Provider. You can find the full implementation in the GitHub repository: [maf-context-engineering](https://github.com/binarytrails-ai/maf-context-engineering).

### Defining the User Profile Model

First, let's define what information we want to remember about each user. This will be our long-term memory model that captures user preferences for travel recommendations.

```csharp
public class UserProfileMemory
{
    // "budget backpacker", "luxury", "family", "adventure", "cultural"
    public string? TravelStyle { get; set; }

    // "$1000-2000", "$3000+", "budget-friendly"
    public string? BudgetRange { get; set; }

    // ["hiking", "beaches", "museums"] - keep top 3-5
    public List<string>? Interests { get; set; }

    public List<PastTrip>? PastDestinations { get; set; }

    // Number of people traveling (e.g., 2, 4)
    public int? NumberOfTravelers { get; set; }

    // "weekend", "1 week", "2 weeks", "1 month+"
    public string? TripDuration { get; set; }

    // "vegetarian", "vegan", "gluten-free", "halal", "kosher", "none"
    public string? DietaryRequirements { get; set; }
}

public class PastTrip
{
    public string? Destination { get; set; }
    public string? Rating { get; set; } // "loved it", "okay", "disappointing"
}
```

### Implementing the UserProfileMemoryProvider

The `UserProfileMemoryProvider` is where the magic happens. It implements the `AIContextProvider` interface and hooks into two key points in the agent lifecycle:

1. **InvokingAsync** (BEFORE the agent runs): Injects remembered preferences into the agent's context
2. **InvokedAsync** (AFTER the agent runs): Extracts new information from the conversation

For simplicity, we'll use an in-memory store to persist profiles in this example, but in production, you would replace this with an actual database to store user profiles persistently.

```csharp
internal sealed class UserProfileMemoryProvider : AIContextProvider
{
    private const string DefaultContextPrompt = "=== TRAVELER PROFILE ===";
    private static readonly ConcurrentDictionary<string, UserProfileMemory> _profileStore = new();

    private readonly IChatClient _chatClient;
    private readonly string _contextPrompt;
    private readonly ILogger<UserProfileMemoryProvider>? _logger;
    private readonly UserProfileMemoryProviderScope _scope;

    public UserProfileMemoryProvider(
        IChatClient chatClient,
        UserProfileMemoryProviderScope scope,
        UserProfileMemoryProviderOptions? options = null,
        ILoggerFactory? loggerFactory = null)
    {
        _chatClient = chatClient ?? throw new ArgumentNullException(nameof(chatClient));
        _scope = new UserProfileMemoryProviderScope(scope);
        _logger = loggerFactory?.CreateLogger<UserProfileMemoryProvider>();
        _contextPrompt = options?.ContextPrompt ?? DefaultContextPrompt;

        if (string.IsNullOrWhiteSpace(_scope.ApplicationId)
            && string.IsNullOrWhiteSpace(_scope.AgentId)
            && string.IsNullOrWhiteSpace(_scope.UserId))
        {
            throw new ArgumentException("At least one of ApplicationId, AgentId, or UserId must be provided for the scope.");
        }
    }

    public UserProfileMemory Profile
    {
        get
        {
            string key = GetStorageKey();
            return _profileStore.GetOrAdd(key, _ => new UserProfileMemory());
        }
        set
        {
            string key = GetStorageKey();
            _profileStore[key] = value;
        }
    }

    private string GetStorageKey()
    {
        return $"{_scope.ApplicationId ?? "null"}|{_scope.AgentId ?? "null"}|{_scope.UserId ?? "null"}";
    }
}
```

### Injecting Context Before Agent Invocation

Before the agent processes a user message, we want to inject any stored preferences into its instructions. This ensures the agent is aware of what it already knows about the user:

```csharp
public override ValueTask<AIContext> InvokingAsync(InvokingContext context, CancellationToken cancellationToken = default)
{
    try
    {
        UserProfileMemory profile = this.Profile;
        StringBuilder instructions = new();

        // Check if we have meaningful profile data
        bool hasProfileData = !string.IsNullOrEmpty(profile.TravelStyle)
            || !string.IsNullOrEmpty(profile.BudgetRange)
            || profile.Interests?.Any() == true
            || profile.NumberOfTravelers.HasValue
            || !string.IsNullOrEmpty(profile.TripDuration)
            || !string.IsNullOrEmpty(profile.DietaryRequirements)
            || profile.PastDestinations?.Any() == true;

        if (hasProfileData)
        {
            instructions.AppendLine(_contextPrompt);

            if (!string.IsNullOrEmpty(profile.TravelStyle))
            {
                instructions.AppendLine($"Travel Style: {profile.TravelStyle}");
            }

            if (!string.IsNullOrEmpty(profile.BudgetRange))
            {
                instructions.AppendLine($"Budget Range: {profile.BudgetRange}");
            }

            if (profile.Interests?.Any() == true)
            {
                instructions.AppendLine($"Interests: {string.Join(", ", profile.Interests)}");
            }

            if (profile.NumberOfTravelers.HasValue)
            {
                instructions.AppendLine($"Number of Travelers: {profile.NumberOfTravelers.Value}");
            }

            if (!string.IsNullOrEmpty(profile.TripDuration))
            {
                instructions.AppendLine($"Preferred Trip Duration: {profile.TripDuration}");
            }

            if (!string.IsNullOrEmpty(profile.DietaryRequirements))
            {
                instructions.AppendLine($"Dietary Restrictions: {profile.DietaryRequirements}");
            }

            if (profile.PastDestinations?.Any() == true)
            {
                instructions.AppendLine("Past Trips:");
                foreach (PastTrip trip in profile.PastDestinations)
                {
                    string tripInfo = $"  • {trip.Destination}";
                    if (!string.IsNullOrEmpty(trip.Rating))
                    {
                        tripInfo += $" ({trip.Rating})";
                    }
                    instructions.AppendLine(tripInfo);
                }
            }

            string injectedInstructions = instructions.ToString();

            _logger?.LogInformation(
                "UserProfileMemoryProvider: Injecting profile context. UserId: '{UserId}'.",
                _scope.UserId);

            return new ValueTask<AIContext>(new AIContext
            {
                Instructions = injectedInstructions
            });
        }

        return new ValueTask<AIContext>(new AIContext());
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, "UserProfileMemoryProvider: Failed to inject profile context.");
        return new ValueTask<AIContext>(new AIContext());
    }
}
```

The injected instructions might look like this:

```
=== TRAVELER PROFILE ===
Travel Style: adventure seeker
Budget Range: $2000-3000 AUD
Interests: hiking, beaches, coastal walks
Number of Travelers: 2
Preferred Trip Duration: 1 week
Past Trips:
  • Great Barrier Reef (loved it)
  • Tasmania (enjoyed it)
```

### Extracting Information After Agent Invocation

After the agent completes a response, we analyze the conversation to extract and update profile information:

```csharp
public override async ValueTask InvokedAsync(InvokedContext context, CancellationToken cancellationToken = default)
{
    if (context.InvokeException is not null)
    {
        return; // Do not update profile on failed invocations.
    }

    try
    {
        // Only extract if we have user messages and missing profile data
        if (context.RequestMessages.Any(x => x.Role == ChatRole.User) && HasIncompleteProfile())
        {
            _logger?.LogDebug("UserProfileMemoryProvider: Extracting profile information. UserId: '{UserId}'.", _scope.UserId);

            ChatResponse<UserProfileMemory> result = await _chatClient.GetResponseAsync<UserProfileMemory>(
                context.RequestMessages,
                new ChatOptions
                {
                    Instructions = """
                You are extracting traveler profile information from natural conversation to build a comprehensive profile.
                Extract ONLY information that is explicitly mentioned or strongly implied in the conversation.

                This is an incremental process - you don't need all fields at once. Extract what's available and return null for missing fields.

                EXTRACTION RULES:

                1. **TravelStyle** (string): Identify their travel style
                   - Examples: "budget backpacker", "luxury traveler", "family vacation", "adventure seeker", "cultural explorer"
                   - Extract from phrases like: "I'm a budget backpacker", "we're traveling with kids", "looking for luxury resorts"

                2. **BudgetRange** (string): Extract budget information
                   - Examples: "$1000-2000 AUD", "3000+ AUD", "budget-friendly", "mid-range", "luxury"
                   - Extract from phrases like: "my budget is 2000-3000 AUD", "looking for budget options"

                3. **Interests** (list): Travel interests and preferred activities - LIMIT TO TOP 3-5
                   - Examples: ["hiking", "beaches"], ["museums", "history"], ["food", "wine"]
                   - Extract from: "I love hiking", "interested in beaches and coastal areas"
                   - Keep only the most important interests

                4. **PastDestinations** (list of objects with Destination and Rating):
                   - Destination: Name of place visited
                   - Rating: Their sentiment ("loved it", "enjoyed it", "it was okay", "disappointing")
                   - Extract from: "I went to Portugal and loved it", "visited Iceland last year, it was amazing"

                5. **NumberOfTravelers** (integer): How many people are traveling
                   - Examples: 1, 2, 4, 6
                   - Extract from: "just me", "my partner and I", "family of four"

                6. **TripDuration** (string): Preferred trip length
                   - Examples: "weekend", "1 week", "2 weeks", "1 month+"
                   - Extract from: "looking for a week-long trip", "2-3 weeks"

                7. **DietaryRequirements** (string): Dietary requirements or restrictions
                   - Examples: "vegetarian", "vegan", "gluten-free", "halal", "kosher", "none"
                   - Extract from: "I'm vegetarian", "I have a gluten allergy"

                EXTRACTION GUIDELINES:
                - Be conservative: Only extract what is clearly stated or strongly implied
                - Normalize formats: Convert "three of us" to 3
                - Return null for any field not mentioned in the conversation
                - Don't infer beyond what's said
                """
                }, cancellationToken: cancellationToken);

            UserProfileMemory currentProfile = this.Profile;
            bool profileUpdated = false;

            // Update travel style (only if not set)
            if (!string.IsNullOrEmpty(result.Result.TravelStyle))
            {
                currentProfile.TravelStyle = result.Result.TravelStyle;
                profileUpdated = true;
            }

            // Update budget range (only if not set)
            if (!string.IsNullOrEmpty(result.Result.BudgetRange))
            {
                currentProfile.BudgetRange = result.Result.BudgetRange;
                profileUpdated = true;
            }

            // Merge interests without duplicates (cap at 5 most important)
            if (result.Result.Interests?.Any() == true)
            {
                currentProfile.Interests ??= new List<string>();
                foreach (string interest in result.Result.Interests)
                {
                    if (!currentProfile.Interests.Contains(interest, StringComparer.OrdinalIgnoreCase))
                    {
                        currentProfile.Interests.Add(interest);
                        profileUpdated = true;
                    }
                }
                // Cap at 5 interests to avoid list bloat
                if (currentProfile.Interests.Count > 5)
                {
                    currentProfile.Interests = currentProfile.Interests.Take(5).ToList();
                }
            }

            // Update other fields similarly...

            // Save updated profile to store
            if (profileUpdated)
            {
                this.Profile = currentProfile;
                _logger?.LogInformation("UserProfileMemoryProvider: Profile updated. UserId: '{UserId}'.", _scope.UserId);
            }
        }
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, "UserProfileMemoryProvider: Failed to extract profile information.");
    }
}

private bool HasIncompleteProfile()
{
    UserProfileMemory profile = this.Profile;
    return string.IsNullOrEmpty(profile.TravelStyle)
        || string.IsNullOrEmpty(profile.BudgetRange)
        || profile.Interests?.Any() != true
        || !profile.NumberOfTravelers.HasValue
        || string.IsNullOrEmpty(profile.DietaryRequirements);
}
```

### Registering the Memory Provider with the Agent

Now let's wire this up in our agent. We will register the `UserProfileMemoryProvider` as the AI Context Provider for our agent, ensuring it is invoked for every conversation:

```csharp
public class ContosoTravelAgentFactory
{
    private readonly IChatClient _chatClient;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public async Task<AIAgent> CreateAsync()
    {
        var agent = _chatClient.CreateAIAgent(new ChatClientAgentOptions
        {
            Name = "ContosoTravelAgent",
            ChatOptions = new()
            {
                ResponseFormat = ChatResponseFormat.Text,
                Instructions = """
                You are Contoso Travel Assistant, an intelligent assistant for Contoso Travel Agency.

                ## PROFILE USAGE (All Interactions)
                - When the profile contains preferences (budget, interests, travel style), acknowledge them explicitly
                - Ask if they want to use the same preferences or try something different
                - Example: "Hi again! Based on your love for hiking and your $2,000 budget. Do you want me to use the same preferences?"
                - If they confirm to use existing preferences, proceed with suggestions without asking again
                - Reference their profile naturally: "I see you've been to Tasmania before..."

                ## CONVERSATION GUIDANCE
                - Have natural conversations - don't rush or force a structured process
                - Ask follow-up questions to understand preferences better
                - When gathering missing details, ask no more than TWO questions at a time
                """,
                Tools = []
            },
            AIContextProviderFactory = (ctx) =>
            {
                // Use ApplicationId and UserId for memory scope
                string userId = _httpContextAccessor.HttpContext?.Items["UserId"] as string ?? "default-user";

                var userProfileMemoryProvider = new UserProfileMemoryProvider(
                    _chatClient,
                    new UserProfileMemoryProviderScope
                    {
                        UserId = userId,
                        ApplicationId = "ContosoTravelApp"
                    });

                return userProfileMemoryProvider;
            }
        });

        return agent;
    }
}
```

## How It Works: The Complete Flow

Let's walk through a complete user journey to see how this memory system works in practice.

### First Conversation

```text

**User:** "Hi! I want to plan a vacation"

**Agent:** "I'd love to help! What's your budget for this trip?"

**User:** "Around $2,000"

**Agent:** "Great! What kind of experiences do you enjoy?"

**User:** "I love hiking and coastal walks"

**Agent:** *(After response, `InvokedAsync` extracts: Budget=$2000, Interests=[hiking, coastal walks])*

"Sounds wonderful! Based on your interests, here are some destinations:

• **Great Ocean Road, Victoria** - Dramatic coastal cliffs and rainforest trails
• **Sunshine Coast, Queensland** - Beach trails and hinterland rainforest hikes

```

### Days Later - New Conversation Session

```text

**User:** "Suggest a vacation for me"

**Agent:** *(Before processing, `InvokingAsync` injects the stored profile)*

"Hi again! Based on your love for hiking, coastal walks, and your $2,000 budget, I'd love to help plan another adventure! Would you like me to use these same preferences, or are you looking for something different?"

**User:** "Yes, use the same preferences"

**Agent:** "Perfect! Here are some destinations that match your hiking and coastal interests:

• **Tasmania** - Pristine wilderness trails and stunning coastlines
• **Blue Mountains** - Spectacular hiking with eucalyptus forests

Let me know if you want more details!"

```

## Best Practices for Long-Term Memory in AI Agents

1. **Be Selective About What to Remember** - Focus on stable preferences and important history, and avoid storing temporary session state or speculative information.
2. **Design for Incremental Updates** - Extract information naturally from conversations and update profiles incrementally over time, without overwhelming users with questions.
3. **Scope Memory Appropriately** - Use per user, per agent, or per application scoping strategies to ensure profiles are relevant and secure.
4. **Implement Privacy and Control** - Allow users to view, update, delete their profiles, control sharing across agents, and opt out of memory storage.
5. **Handle Memory Conflicts Gracefully** - Prioritize recent, explicit statements, ask for confirmation when detecting conflicts, and keep timestamps to track data freshness.

## Conclusion

Context memory transforms AI agents from stateless chatbots into intelligent assistants that truly know their users. By leveraging Microsoft Agent Framework's AI Context Providers, you can build powerful long-term memory systems that deliver personalized, engaging experiences across conversations.

## References

- [Microsoft Agent Framework Documentation](https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview/)
- [Adding Memory to an Agent](https://learn.microsoft.com/en-us/agent-framework/tutorials/agents/memory?pivots=programming-language-csharp)
