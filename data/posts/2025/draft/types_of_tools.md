# Understanding LLM Tools: Knowledge Tools vs Action Tools

In a recent article on binarytrails.com, we explored how Large Language Models (LLMs) can be extended with tools to go beyond simple text generation. By integrating tools, LLMs can access external data, perform calculations, or even take real-world actions—making them far more useful for practical applications.

A key concept in this space is the distinction between two main types of tools: **knowledge tools** and **action tools**. Understanding the difference is essential for designing effective AI-powered solutions.

## What Are LLM Tools?

LLM tools are external functions, APIs, or plugins that an LLM can call to enhance its capabilities. Instead of relying solely on the information encoded in its training data, an LLM can use tools to:

- Retrieve up-to-date or domain-specific knowledge
- Interact with databases or search engines
- Perform calculations or data transformations
- Trigger actions in the real world (e.g., send an email, place an order)

## Knowledge Tools

**Knowledge tools** are designed to help the LLM retrieve or generate information. They do not change the state of the world; instead, they provide the model with access to knowledge that may be outside its training data or too large to fit in context.

### Examples of Knowledge Tools

- **Web Search**: Querying a search engine to fetch the latest news or facts.
- **Database Query**: Retrieving records from a product catalog, customer database, or knowledge base.
- **Document Retrieval**: Searching and summarizing content from internal documentation, wikis, or file systems.
- **Weather Lookup**: Getting the current weather for a specific location.
- **Stock Price Fetcher**: Returning the latest price for a given stock symbol.

These tools are read-only—they help the LLM answer questions, provide recommendations, or summarize information, but they do not perform any actions that change external systems.

## Action Tools

**Action tools** enable the LLM to perform operations that have an effect on the outside world. These tools go beyond information retrieval and can trigger workflows, update records, or interact with other systems.

### Examples of Action Tools

- **Send Email**: Composing and sending an email on behalf of the user.
- **Create Calendar Event**: Scheduling a meeting or appointment.
- **Place an Order**: Initiating a purchase or booking a service.
- **Update Database Record**: Modifying customer information or order status.
- **Trigger Workflow**: Starting a business process, such as approving a request or generating a report.

Action tools are powerful, but they require careful design and governance to ensure safety, security, and compliance.

## How Does the Model Decide Which Tool to Call?

When an LLM is equipped with tools, it doesn't just generate text—it also reasons about which tool to use and what arguments to provide. The process typically works as follows:

1. **Intent Recognition**: The model interprets the user's request and determines if a tool is needed to fulfill it.
2. **Tool Selection**: Based on the available tools and their descriptions, the model selects the most appropriate tool for the task (e.g., knowledge vs action tool).
3. **Argument Preparation**: The model extracts relevant information from the user's input (or conversation history) and formats it as arguments for the tool call.
4. **Tool Invocation**: The tool is called with the prepared arguments, and the result is used to generate the final response.

This workflow allows LLMs to dynamically extend their capabilities, making them more useful and context-aware.

## Out-of-the-Box Tools in Azure AI Agent Service

Azure AI Agent Service provides a catalog of out-of-the-box tools that can be easily integrated with your agents. These include knowledge tools (like web search, document retrieval, and database queries) and action tools (such as sending emails, creating calendar events, or triggering workflows). The service handles tool orchestration, security, and observability, so you can focus on building intelligent solutions without reinventing the wheel.

## Using OpenAPI Specification for Tool Calling

A common standard for describing tools (especially APIs) is the OpenAPI specification. By defining your tools using OpenAPI, you enable LLMs and agent frameworks to:

- Automatically understand available endpoints, parameters, and expected responses
- Dynamically generate tool calls with the correct arguments and data types
- Validate and document tool usage for safety and compliance

Many modern LLM frameworks—including Azure AI Agent Service—support registering tools via OpenAPI specs, making it easier to scale and govern tool integration. This approach also improves interoperability and allows for rapid onboarding of new capabilities as your needs evolve.

## Sample: Calling a Product API Using OpenAPI Specification

To illustrate how LLMs and agents can use OpenAPI specifications to call external APIs, here’s a simple example for calling a Product API to get a list of products. This approach allows the model to understand the available endpoints, required parameters, and expected responses—enabling dynamic and safe tool use.

Suppose you have an OpenAPI spec for a Product API like this (simplified):

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Product API",
    "version": "1.0.0"
  },
  "paths": {
    "/products": {
      "get": {
        "summary": "Get all products",
        "operationId": "getProducts",
        "responses": {
          "200": {
            "description": "A list of products",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Product"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Product": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "price": { "type": "number" }
        }
      }
    }
  }
}
```

You can register this OpenAPI spec as a tool in your agent framework (such as Azure AI Agent Service). The model can then call the `/products` endpoint to retrieve the product list.

### Example (C# Pseudocode)

```csharp
// Load the OpenAPI spec (as shown above)
BinaryData spec = BinaryData.FromString(File.ReadAllText("product-api-openapi.json"));
OpenApiAnonymousAuthDetails openApiAnonAuth = new();
OpenApiToolDefinition openApiToolDef = new(
    name: "get_products",
    description: "Retrieve a list of products",
    spec: spec,
    openApiAuthentication: openApiAnonAuth
);

// Create the agent with the OpenAPI tool
tools: [openApiToolDef]

// Instruct the agent to answer product-related questions using the tool
PersistentAgent agent = client.Administration.CreateAgent(
    model: modelDeploymentName,
    name: "Product Agent",
    instructions: "You are a helpful agent. Use the product API to answer product questions.",
    tools: [openApiToolDef]
);

// Create a thread and add a user message
PersistentAgentThread thread = client.Threads.CreateThread();
client.Messages.CreateMessage(
    thread.Id,
    MessageRole.User,
    "Show me all available products."
);

// Run the thread and get the response
ThreadRun run = client.Runs.CreateRun(thread.Id, agent.Id);
// ...poll for completion and print the assistant's response as shown in previous examples...
```

This setup allows the LLM or agent to call the `/products` endpoint, retrieve the product list, and present it to the user—all by leveraging the OpenAPI specification for safe, dynamic tool use.

## Why the Distinction Matters

Understanding the difference between knowledge and action tools helps in:

- Designing safe and reliable AI systems
- Controlling what the LLM is allowed to do (read vs write/act)
- Auditing and monitoring tool usage
- Providing the right user experience (e.g., confirming before taking actions)

In summary, knowledge tools empower LLMs to answer questions with up-to-date or specialized information, while action tools let them interact with and change the world. By combining both, you can build AI assistants that are both smart and useful—capable of informing, assisting, and acting on your behalf.

## Example Notebooks Using C#

To see these concepts in action, you can explore example notebooks that demonstrate how to use knowledge and action tools with LLMs in C#:

- **Semantic Kernel Function Calling**: Shows how to use Semantic Kernel in C# to enable LLMs to call custom functions and plugins, including both knowledge and action tools. [View on GitHub](https://github.com/rakeshl4/ai-examples/tree/main/01-semantic-kernel-function-calling)
- **Azure AI Agent Service Notebooks**: Demonstrate how to build agents in C# that leverage out-of-the-box tools, OpenAPI integrations, and custom workflows. These notebooks illustrate real-world scenarios such as weather lookup, document retrieval, and workflow automation.

These resources provide hands-on guidance for building intelligent assistants that can inform, assist, and act using the power of LLMs and tools.
