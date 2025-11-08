---
title: Working with Structured Data in AI Agents Using JSON Schema
date: '2025-11-04'
tags: ['AI Agent', 'LLM', 'Azure', 'Agent Framework']
draft: false
images: ['/static/images/2025-10-11/structured-output-flow.png']
summary: While LLMs excel at generating human-like text, their responses can be unpredictable in format and structure. The format is important when the AI's responses need to be consumed by other downstream systems. JSON has always been a popular choice for structured data interchange. In this post, we will explore how to implement structured output using JSON Schema in AI agents so that the responses are consistent and can be consumed reliably by other systems.
---

![structured-output-flow](/static/images/2025-01-08/structured-output-flow.png)

While Language Models excel at generating human-like text, their responses can be unpredictable in format and structure. The format is important when the AI's responses need to be consumed by other downstream systems.

JSON has always been a popular choice for structured data interchange. In this post, we will explore how to implement structured output using JSON Schema in AI agents so that the responses are consistent and can be consumed reliably by other systems.

💡 **Source Code**: You can find the full working implementation of the example discussed in this post in the GitHub repository: [agent_framework_structured_output](https://github.com/rakeshl4/agent_framework_structured_output)

## The Challenge with Unstructured Output from the Language Models

Before diving into structured output, let's understand the problem we are solving.

Consider a customer placing an order at Contoso Bike Store by interacting with an AI-powered agent.
The agent may handle multiple types of requests, such as product inquiries, orders, and support tickets.

But for this example, let's focus on the scenario where a customer wants to place an order for a bike.

The customer might say:

> I want to buy Constoso Roadster bike. I need it to be delivered to Seattle.

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
    "name": "process_bike_order",
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

The below diagram illustrates the high-level flow:

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

AIAgent agent = new AzureOpenAIClient(
    new Uri("https://your-resource.openai.azure.com"),
    new AzureCliCredential())
        .GetChatClient("gpt-4o-mini")
        .CreateAIAgent(new ChatClientAgentOptions()
        {
            Name = "ContosoBikeReviewAnalyzer",
            Instructions = @"You are a customer review analyzer for Contoso Bike Store.
            Your role is to analyze customer reviews and extract insights.

            ANALYSIS GUIDELINES:
            - Extract overall sentiment (positive, negative, neutral) and rating (1-5)
            - List specific issues and positive highlights as separate arrays
            - Determine recommendation likelihood (high, medium, low) based on overall tone
            - Provide a concise summary of the review's key points
            - If information is not mentioned, leave fields as null rather than guessing",
            ChatOptions = chatOptions
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
    Console.WriteLine($"Bike Model: {analysis.BikeModel}");
    Console.WriteLine($"Overall Rating: {analysis.OverallRating}/5");
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

The below diagram illustrates the overall steps in this process:

![design](/static/images/2025-11-04/agent_framework.png)

1. The customer review text is sent to the AI agent.
2. The AI agent consists of three main components: the Language Model, tools and the instructions that guide the agent's behavior. The agent processes the review text based on the defined instructions and generates the response.

   The Microsoft Agent Framework ensures that the response adheres to the specified JSON Schema for structured output.

3. The output from the agent can be deserialized into the `ReviewAnalysis` objects which can then be used for further processing, reporting, or integration with other systems.

## Conclusion

Structured output with JSON Schema transforms how businesses can extract value from customer feedback. In our Contoso Bike Store example, we saw how the Customer Review Analyzer can:

1. **Provide Consistent Analysis**: Every review is processed using the same criteria and categories
2. **Enable Data-Driven Decisions**: Structured insights can be aggregated to identify trends and patterns
3. **Integrate Seamlessly**: JSON output feeds directly into product management and customer service systems
4. **Scale Efficiently**: Automated analysis handles hundreds of reviews faster than manual processing
5. **Maintain Quality**: Validation ensures analysis results meet business requirements

### Key Takeaways for Implementation

- **Design Comprehensive Schemas**: Include all aspects of feedback your business needs to track
- **Use Validation Extensively**: Ensure analysis quality with both schema-level and business-logic validation
- **Handle Missing Information Gracefully**: Design for real-world scenarios where not all information is available
- **Plan for Aggregation**: Structure data to enable meaningful business intelligence and reporting
- **Implement Monitoring**: Track analysis quality and adjust prompts based on results

### The Business Impact

Structured review analysis enables:

- **Product Improvement**: Systematic identification of product issues and enhancement opportunities
- **Customer Service Optimization**: Data-driven improvements to delivery, support, and ordering processes
- **Competitive Analysis**: Understanding how customers compare your products to competitors
- **Quality Assurance**: Early detection of product defects or service issues
- **Strategic Planning**: Customer sentiment trends inform business strategy decisions

In the Contoso Bike Store scenario, structured output isn't just about data format—it's about transforming unstructured customer feedback into actionable business intelligence that drives product development, improves customer satisfaction, and increases operational efficiency.

By implementing structured output in your AI agents, you're building the foundation for truly intelligent business processes that understand both customer sentiment and system requirements.

## Getting Started

The complete source code for the example is available on GitHub:

🔗 **[agent_framework_structured_output](https://github.com/rakeshl4/agent_framework_structured_output)**
