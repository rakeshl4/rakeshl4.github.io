---
title: Working with Structured Data in AI Agents Using JSON Schema
date: '2025-11-04'
tags: ['AI Agent', 'LLM', 'Azure', 'Agent Framework']
draft: false
images: ['/static/images/2025-10-11/structured-output-flow.png']
summary: While Language Models excel at generating human-like text, their responses can be unpredictable in format and structure. The format is important when the responses need to be consumed by other downstream systems. JSON has always been a popular choice for structured data interchange. In this post, we will bridge the gap between conversational AI and reliable system integration by using JSON Schema to enforce structured outputs in AI agents.
---

![structured-output-flow](/static/images/2025-01-08/structured-output-flow.png)

While Language Models excel at generating human-like text, their responses can be unpredictable in format and structure. The format is important when the responses need to be consumed by other downstream systems.

JSON has always been a popular choice for structured data interchange. In this post, we will bridge the gap between conversational AI and reliable system integration by using JSON Schema to enforce structured outputs in AI agents.

💡 **Source Code**: You can find the full working implementation of the example discussed in this post in the GitHub repository: [agent_framework_structured_output](https://github.com/rakeshl4/agent_framework_structured_output)

## The Challenge with Unstructured Output from the Language Models

Before diving into structured output, let's understand the problem we are solving.

Consider a customer placing an order at Contoso Bike Store by interacting with an AI-powered agent.
The agent may handle multiple types of requests, such as product inquiries, orders, and support tickets.

But for this example, let's focus on the scenario where a customer wants to place an order for a bike.

The customer might say:

> I want to buy Contoso Roadster bike. I need it to be delivered to Seattle.

In a real scenario, the customer will have more conversations with the agent to finalize the model and place the order. Now, based on the system instructions and the available tools the agent may respond with something like:

```text

To complete your order, I'll need your full name,
delivery address, phone number, and payment method.

Could you please provide these details?

```

While this response is conversational, it creates a few challenges:

1. **Information Gathering**: The system doesn't systematically collect the required order data. This means the user is not presented with a clear set of fields to fill out.
2. **Data Validation**: The language model may miss or misinterpret required fields, leading to incomplete orders.
3. **System Integration**: The order information must be sent to another system for processing which expects structured data.
4. **Process Tracking**: It is difficult to track if all necessary information has been collected from the user and ready to be sent to the order management system.

## Tool Schema for Function Calling

To support order processing, the agent is provided access to an order management tool to submit the order.

When language models interact with external tools or functions, they need to understand the tool's interface through a JSON Schema. This schema defines the tool's capabilities and contract, including input parameters, data types, required fields, and validation rules.

When you register a tool with a language model, you provide the following information.

1. **Tool Name and Description**: The name of the tool should be descriptive and indicate its purpose. In addition, a brief description helps the model understand when to use the tool.
2. **Parameter Schema**: The fields that the tool requires are defined using JSON Schema. This includes data types (string, integer, boolean, etc.), and required fields.

Here's an example of registering an order management tool:

```json
{
  "type": "function",
  "function": {
    "name": "submit_order",
    "description": "Process a customer bike order at Contoso Bike Store",
    "parameters": {
      "type": "object",
      "properties": {
        "customer_name": {
          "type": "string",
          "description": "Full name of the customer placing the order"
        },
        "customer_email": {
          "type": "string",
          "format": "email",
          "description": "Customer's email address for order confirmation"
        },
        "customer_phone": {
          "type": "string",
          "pattern": "^[0-9\\-\\+\\(\\)\\s]+$",
          "description": "Customer's phone number for delivery coordination"
        },
        "delivery_address": {
          "type": "string",
          "description": "Complete delivery address including street, city, state, and zip code"
        },
        "special_instructions": {
          "type": "string",
          "description": "Optional delivery or assembly instructions"
        }
      },
      "required": ["customer_name", "customer_email", "customer_phone", "delivery_address"]
    }
  }
}
```

The following diagram summarizes how the system interacts with the model and tools.

![design](/static/images/2025-11-04/execution-flow.png)

1. **Receive Customer Input**: The **AI Application** collects the input from the customer and sends it to the language model along with the tool schema.

2. **Process Customer Input**: The language model processes the customer's message and the tool schema to understand what information is needed.
   When the model collects all required fields, it returns a structured JSON payload that matches the schema similar to this:

```json
{
  "customer_name": "Sarah Johnson",
  "customer_email": "sarah.johnson@example.com.au",
  "customer_phone": "+61-2-9876-5432",
  "bike_model": "Contoso Mountain Explorer",
  "delivery_address": "123 Collins Street, Melbourne, VIC, 3000",
  "special_instructions": "Leave package at the front door."
}
```

Note that the function calling is not supported by all language models.

3. **Function Execution**: The AI application executes the actual function code **submit_order** with the structured parameters provided by the language model. The function returns the result which gets passed back to the language model.

4. **Customer Response**: The language model generates a natural language response to the customer based on the function execution result.

The key benefit is that the language model understands exactly what information the tool needs and can systematically collect it through natural conversation.

## Structured Output with Agent Framework

While tool schemas help with function calling, the Agent Framework provides an additional capability by enforcing structured output format for the agent's responses themselves. This ensures the agent always returns data in a predictable JSON structure, even when not calling tools.

Let's look at how to implement this using the Microsoft Agent Framework in C#.

For this example, we will build a **Customer Review Analyzer** agent that processes customer reviews of Contoso bikes and extracts insights. The agent analyzes review text and returns consistent JSON output that can be integrated with downstream systems for reporting and analysis.

The below diagram illustrates the overall steps in this process:

![design](/static/images/2025-11-04/agent_framework.png)

1. The customer review text is sent to the AI agent.
2. The AI agent consists of three main components: the Language Model, tools and the instructions that guide the agent's behavior. The agent processes the review text based on the defined instructions and generates the response.

   The Microsoft Agent Framework ensures that the response adheres to the specified JSON Schema for structured output.

3. The output from the agent can be deserialized into the `ReviewAnalysis` objects which can then be used for further processing, reporting, or integration with other systems.

The source code for this example is available on GitHub: [agent_framework_structured_output](https://github.com/rakeshl4/agent_framework_structured_output)

### Step 1: Define Your Data Model

Create a C# class that represents the review analysis structure with proper validation:

```csharp
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class ReviewAnalysis
{
    [Required]
    [JsonPropertyName("sentiment")]
    public string? Sentiment { get; set; } // "positive", "negative", "neutral"

    [JsonPropertyName("issues_mentioned")]
    public List<string>? IssuesMentioned { get; set; }

    [JsonPropertyName("positive_highlights")]
    public List<string>? PositiveHighlights { get; set; }

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }
}
```

### Step 2: Generate JSON Schema

Use the `AIJsonUtilities` class to automatically generate a JSON schema from your C# type:

```csharp
using System.Text.Json;
using Microsoft.Extensions.AI;

JsonElement schema = AIJsonUtilities.CreateJsonSchema(typeof(ReviewAnalysis));
```

### Step 3: Configure Chat Options

Create a `ChatOptions` instance that specifies the structured output format:

```csharp
ChatOptions chatOptions = new()
{
    ResponseFormat = ChatResponseFormat.ForJsonSchema(
        schema: schema,
        schemaName: "ReviewAnalysis",
        schemaDescription: "Structured analysis of customer bike reviews for Contoso Bike Store")
};
```

### Step 4: Create the Agent

Initialize your agent with the structured output configuration and intelligent prompting instructions:

```csharp
using Azure.AI.OpenAI;
using Azure.Identity;
using Microsoft.Agents.AI;

        var uri = "https://models.inference.ai.azure.com";
        var apiKey = Environment.GetEnvironmentVariable("GITHUB_TOKEN");

        var client = new OpenAIClient(new ApiKeyCredential(apiKey), new OpenAIClientOptions { Endpoint = new Uri(uri) });
        var chatCompletionClient = client.GetChatClient(modelId);

        _agent = chatCompletionClient.CreateAIAgent(new ChatClientAgentOptions()
        {
            Name = "ContosoBikeReviewAnalyzer",
            ChatOptions = chatOptions,
            Instructions = @"You are a customer review analyzer for Contoso Bike Store.
            Your role is to analyze customer reviews and extract insights.

            ANALYSIS GUIDELINES:
            - Extract overall sentiment (positive, negative, neutral) and rating (1-5)
            - Identify the bike model mentioned in the review
            - List specific issues and positive highlights as separate arrays
            - Determine recommendation likelihood (high, medium, low) based on overall tone
            - Provide a concise summary of the review's key points
            - If information is not mentioned, leave fields as null rather than guessing

            IMPORTANT: Always respond with valid JSON that matches the ReviewAnalysis schema exactly.",
        });

```

### Step 5: Process Reviews

Now you can analyze customer reviews and get consistent structured output:

```csharp
// Example customer review to analyze
var customerReview = @"I bought the Mountain Explorer last month for weekend trails. The bike is fantastic for climbing hills - really solid frame and smooth shifting. However, the seat is quite uncomfortable for longer rides (over 2 hours). Also, the delivery took 3 weeks which was longer than expected. Overall happy with the purchase, would definitely buy from Contoso again.";

try
{
    var response = await agent.RunAsync($"Please analyze this customer review: {customerReview}");
    var analysis = response.Deserialize<ReviewAnalysis>(JsonSerializerOptions.Web);

    Console.WriteLine($"Review Analysis Complete:");

    Console.WriteLine($"Sentiment: {analysis.Sentiment}");
    Console.WriteLine($"Recommendation Likelihood: {analysis.RecommendationLikelihood}");
    Console.WriteLine($"Summary: {analysis.Summary}");
    Console.WriteLine($"Issues: {string.Join(", ", analysis.IssuesMentioned ?? new List<string>())}");
    Console.WriteLine($"Highlights: {string.Join(", ", analysis.PositiveHighlights ?? new List<string>())}");
}
catch (JsonException ex)
{
    Console.WriteLine($"Error parsing analysis result: {ex.Message}");
}
```

Here is a sample JSON output from the agent:

```json
{
  "sentiment": "positive",
  "summary": "I bought the Mountain Explorer last month for weekend trails. The bike is fantastic for climbing hills - really solid frame and smooth shifting. However, the seat is quite uncomfortable for longer rides (over 2 hours). Also, the delivery took 3 weeks which was longer than expected. Overall happy with the purchase, would definitely buy from Contoso again.",
  "positive_highlights": [
    "Fantastic for climbing hills",
    "Solid frame",
    "Smooth shifting",
    "Overall satisfaction with the purchase"
  ],
  "issues_mentioned": ["Uncomfortable seat for longer rides", "Lengthy delivery time"]
}
```

## Conclusion

The real power of intelligent applications goes beyond generating text. To automate processes, connect with other systems, and maintain data quality, structured output is the key. It ensures AI agents produce consistent, reliable results that can easily fit into business workflows.

Microsoft’s Agent Framework makes this easier by using JSON Schema to define and validate structured responses.

## Further Reading

- [Microsoft Agent Framework Documentation](https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview)
- [Microsoft Agent Framework Samples](https://github.com/microsoft/Agent-Framework-Samples)
