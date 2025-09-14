# Building Agentic Solutions with Azure AI Agents

AI agents are revolutionizing how we build intelligent applications by enabling more autonomous, context-aware, and multi-step workflows. While traditional LLMs with tools can solve many problems, agentic solutions offer a new level of flexibility and orchestration for complex business scenarios.

## What is an AI Agent?

An AI agent is an autonomous system that can make decisions, invoke tools, and participate in workflows—sometimes independently, sometimes in collaboration with other agents or humans. What sets agents apart from assistants is autonomy: assistants support people, agents complete goals. Agents are foundational to real process automation.

In Azure AI, an agent is a composable unit with a specific role, powered by the right model, equipped with the right tools, and deployed within a secure, observable, and governable runtime. Each agent has three core components:

- **Model (LLM)**: Powers the agent's reasoning and language understanding. This is the intelligence core, such as GPT-4, GPT-3.5, or Llama.
- **Instructions**: Define the agent’s goals, behavior, and constraints. These are the prompts or system messages that shape how the agent acts.
- **Tools**: Let the agent retrieve knowledge or take action—such as accessing enterprise data, calling APIs, or triggering workflows.

Agents receive unstructured inputs (user prompts, alerts, or messages) and produce outputs (tool results or messages). Along the way, they may call tools to perform retrieval or trigger actions, and can be orchestrated, monitored, and governed for enterprise use.

## Why Use AI Agents Instead of Just LLMs with Tools?

While LLMs with tool-calling capabilities can answer questions and perform single-step actions, they often fall short in scenarios that require:

- **Multi-step reasoning**: Chaining together several actions or tool calls to achieve a goal.
- **Stateful interactions**: Maintaining context and memory across a conversation or workflow.
- **Autonomous decision-making**: Choosing which tools to use, when to use them, and how to sequence actions.
- **Complex orchestration**: Integrating with multiple data sources, APIs, or business logic.

## How LLMs Plan and Execute Steps (and Where They Fall Short)

LLMs can be prompted to plan a sequence of steps to solve a user query. For example, given a complex instruction, an LLM might:

1. Break down the instruction into sub-tasks.
2. Decide which tool or function to call for each sub-task.
3. Execute each tool call in sequence, using the output of one as input to the next.
4. Aggregate the results and generate a final response.

This approach works well for simple, linear workflows. However, LLMs with tool-calling alone have limitations:

- **Limited memory**: LLMs struggle to maintain long-term context or state across multiple turns or sessions.
- **No persistent workflow state**: Each tool call is stateless, making it hard to manage complex, branching workflows.
- **Lack of autonomy**: LLMs typically require explicit prompting for each step and cannot easily adapt to changing goals or user corrections.
- **Error handling**: Handling failures, retries, or conditional logic is difficult to encode in a prompt.

Agentic frameworks, like Azure AI Agent Service, address these gaps by providing persistent state, memory, planning, and orchestration capabilities.

## Example Use Case: Automated Travel Assistant

Imagine building a travel assistant that can:

- Search for flights and hotels
- Book reservations
- Answer follow-up questions
- Adapt its workflow based on user preferences

With Azure AI Agents, you can orchestrate these steps, maintain conversation history, and call external APIs as needed.

Below is a sample notebook demonstrating how to use Azure AI Agent Service in C# to create a simple agent that fetches weather information and responds to user queries.

<VSCode.Cell language="markdown">

## Azure AI Agent: Weather Assistant Example

This notebook demonstrates how to create and evaluate a simple weather assistant agent using Azure AI Agent Service in C#.
</VSCode.Cell>

<VSCode.Cell language="csharp">
// Import required namespaces
using Azure.AI.Projects;
using Azure.AI.Projects.Models;
using Azure.AI.Evaluation;
using Azure.Identity;
using System;
using System.Threading.Tasks;

// Load environment variables (assume .env or set in environment)
var credential = new DefaultAzureCredential();
var connectionString = Environment.GetEnvironmentVariable("PROJECT_CONNECTION_STRING");
var modelDeployment = Environment.GetEnvironmentVariable("MODEL_DEPLOYMENT_NAME");

// Define a simple function tool for weather
string FetchWeather(string location)
{
// In production, call a real API. Here, return a mock response.
if (location == "Seattle") return "Sunny, 25°C";
if (location == "London") return "Cloudy, 18°C";
return "Weather data not available.";
}

// Register the function tool
var weatherTool = new FunctionTool(new[] { (Func<string, string>)FetchWeather });
var toolset = new ToolSet();
toolset.Add(weatherTool);

// Create the agent
var projectClient = new AIProjectClient(connectionString, credential);
var agent = await projectClient.Agents.CreateAgentAsync(new CreateAgentOptions
{
Model = modelDeployment,
Name = "Weather Assistant",
Instructions = "You are a helpful assistant that provides weather information.",
Toolset = toolset
});

// Create a thread and send a message
var thread = await projectClient.Agents.CreateThreadAsync();
var message = await projectClient.Agents.CreateMessageAsync(thread.Id, new CreateMessageOptions
{
Role = "user",
Content = "What's the weather in Seattle?"
});

// Run the agent
var run = await projectClient.Agents.CreateAndProcessRunAsync(thread.Id, agent.Id);
Console.WriteLine($"Run finished with status: {run.Status}");

// Display the agent's response
var messages = await projectClient.Agents.ListMessagesAsync(thread.Id, order: "asc");
foreach (var msg in messages.Data)
{
Console.WriteLine($"Role: {msg.Role}");
    Console.WriteLine($"Content: {msg.Content[0].Text.Value}");
}
</VSCode.Cell>

<VSCode.Cell language="markdown">

## Conclusion

Azure AI Agents enable you to build advanced, autonomous solutions that go beyond simple LLM tool use. By leveraging agentic workflows, you can orchestrate complex tasks, maintain context, and deliver more intelligent, adaptive applications.
</VSCode.Cell>
