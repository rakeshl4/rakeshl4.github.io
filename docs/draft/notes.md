# Microsoft Agent Framework - Podcast Questions

1. We talked about AI agents in our last episode that was built using Azure AI Foundry and Semantic Kernel. So what has changed since then with the Microsoft Agent Framework ? What gaps does it fill ?

Slides -
Old Architecture with single agent
Microsoft Agent Framework

In the demo we did last time, we built a single AI agent that had access to an MCP server.
(pause)

That MCP server exposed our product inventory and also gave the agent action tools to manage orders.
(pause)

We relied on Foundry Agent Service to handle the heavy lifting — things like conversation state, tool calls, and execution flow. And we used Semantic Kernel to structure our prompts and orchestration logic.

Overall, it was a solid example of building a customer support assistant using an AI Foundry agent with tools.
(short pause)

But… (emphasis) as with most real-world demos, there were some gaps.

The first gap was scale and complexity.
(pause)

A single agent works fine at the start, but in more complex scenarios, it quickly becomes a bottleneck. You end up with one agent trying to know everything — inventory, orders, refunds, policies — and that’s hard to scale and even harder to reason about.

What we really need is multiple specialized agents, each focused on a specific domain, and some kind of orchestration layer that decides which agent should handle what, based on user intent and context.
(pause)

We’ll talk about those orchestration patterns a bit later in the demo.

The second gap was tight coupling.
(pause)

In the earlier solution, we built a custom orchestration API for the client to talk to the agent. That meant the client was tightly coupled to our agent implementation.

So the big question was — (emphasis)
Can we expose agents in a more standard way, so any client can discover and interact with them easily?

The third gap was visibility.
(pause)

When you’re building agentic systems, you really need insight into what’s happening — conversation flows, agent handoffs, tool invocations, errors, and latency. Without that, it’s very hard to debug or improve your agents.

And finally — (slight emphasis)
vendor lock-in.

We don’t want our solution tied to a single provider. We want the flexibility to swap agents, try different models, or mix providers without rewriting everything.

This is where the Microsoft Agent Framework comes in.
(pause)

It’s an open-source framework for building AI agents and multi-agent workflows. And it combines the strengths of Semantic Kernel and AutoGen.

I have used Semantic Kernel in many of my previous projects which is enterprise ready to build AI applications using LLMs. And Autogen is another framework from Microsoft that focusses on multi-agent collaboration.

(short pause)
Microsoft Agent Framework provides SDKs for both .NET and Python.

The key features I want to highlight today are:

- Using Workflows to orchestrate multiple agents.
- exposing agents through OpenAI-compatible HTTP endpoints. This allows you to integrate your agents with any OpenAI-compatible client or tools.
- DevUI is a lightweight, standalone sample application for running agents and workflows in the Microsoft Agent Framework.Think of it as a playground where you can visually debug and test your agents and workflows before integrating them into your applications.
- Tool invocations that require explicit human approval before proceeding. The approval flow requires interaction with the client to send and receive approval prompts.

2. Okay, so you mentioned about building workflows using the framework. But why do we need workflows when the agents can decide on their own what to do next?

Slides - Agent Loop
Workflow Patterns
https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/overview#how-is-a-workflows-different-from-an-ai-agent

That’s a great question. Before answering that, let us take a step back and understand when we need an agent in the first place. You will need an AI agent for applications that require conversation based interactions, ad-hoc planning and some degree of autonomous decision making. We don't need an AI agent for tasks that are well defined and deterministic.
As you see in this diagram, the steps an AI agent takes are dynamic and is determined based on the LLM response, context of the conversation and the available tools. As the conversation progresses, the agent may need to call different tools based on the user intent and context. This continues in a loop until the agent reaches a final response.

For your solution to be scalable you need to break down complex tasks into smaller sub-tasks and have specialized agents to handle those sub-tasks. You can test the agents individually and reuse them in different scenarios. This will give us many advantages like improved reliability, easier maintenance. And also other other benefits like better performance, and flexibility to swap agents as needed.

And when you have multiple agents working together, you would still need control on the overall flow of the conversation. And this is where workflows come into picture.
Some processes will need sequential execution of agents while some can be executed in parallel. You can build workflows in Microsoft Agent Framework to define the overall orchestration logic and control the flow of the conversation between multiple agents. The framework allows you to share context between agents and maintain state across the workflow.

3. Can you use AI Foundry agents with the Microsoft Agent Framework ? How do they work together ?

Yes, absoutely.
The Microsoft Agent Framework is designed to be a unified framework to build AI agents and multi-agent workflows. This means you can create agents that can talk to ai foundry agents, or custom agents that talks to openai chat completions or any other LLM providers. All agents implement the same IAgent interface, so they can be used interchangeably in ythe solution. However, the framework is still in preview and you may find some rough edges. But the goal is to support different types of agents.

4. Let us talk about hosting. How can you start interacting with the agents that you build using the framework ?

Slides - OpenAI-compatible endpoints, Azure Functions

You can host your agent as OpenAI-compatible HTTP endpoints using ASP.NET Core with a few lines of code. This allows you to integrate your agents with any OpenAI-compatible client or tools. If you are using agents in your background prcocessing, you can also host them using Azure Functions or Durable Functions.

Let me take you through a quick demo.

I have hosted an agent from an asp.net core web api project. This is just using few lines of code.

You can now call this endpoint using OpenAI interface.

There are lot of samples in the microsoft agent framework github repo that you can refer to.

5. You said you have upgraded the demo that you showed in the last episode using the Microsoft Agent Framework. Can you show us what has changed ?

Slides - Demo Architecture

It is similar to the previous scenario where we have a customer support assistant that can help users with product information. I have upgraded the solution to .NET 10 and also migrated the agent implementation to use Microsoft Agent Framework. We also use workflows to orchestrate multiple agents. We have 2 agents in this solution - ProductInventoryAgent and BillingAgent. Their responsiblity is pretty straightforward from their names. The ProductInventoryAgent uses the MCP tool that we built in the previous demo to get product information. The BillingAgent uses a mock function to calculate the price. And ofcourse you can connect this to a real backend system. But for demo purposes I have kept it simple.

The other major upgrade is the client application. I am now using CopilotKit for the chat interface. CopilotKit supports AG-UI protocol to interact with the agent endpoint. We talked about MCP which is a protocol for calling tools, A2A which is a protocol for agent to agent communication. AG-UI is a protocol to standardize the way clients can discover agents, send messages and receive responses.

Let us run through a quick demo of the solution.

Approval Workflow - When we placed the order, we saw a popup for the approval. This is dynamic and not hardcoded in the client. The BillingAgent has access to the ProcessPayment tool which is configured to require human approval before proceeding. When the agent tries to call this tool, it sees that it needs approval and returns a response indicating that approval is needed. The client application then shows the approval prompt to the user. Once the user approves, the client sends the approval response back to the agent and the tool invocation proceeds.

It is similar to the previous scenario where we have a customer support assistant that can help users with product information.

But under the hood… (emphasis)
there are some important upgrades.

Platform & Framework Upgrades

First, I’ve upgraded the solution to .NET 10 and migrated the agent implementation to use the Microsoft Agent Framework.
(pause)

The biggest architectural change is that we’re no longer relying on a single agent.
(slight emphasis)

We now use workflows to orchestrate multiple agents, each with a clear responsibility.

Multi-Agent Setup

In this demo, we have two agents.

The first one is the ProductInventoryAgent.
(pause)

Its responsibility is exactly what the name suggests — handling product-related queries.
It uses the same MCP tool we built in the previous demo to fetch product information from the inventory system.

The second agent is the BillingAgent.
(pause)

This agent is responsible for pricing and payment logic.
For the purposes of this demo, it uses a mock function to calculate the price — but in a real system, this could easily be wired up to an actual backend.

The key point here is that each agent is focused, simple, and easy to reason about — and the workflow decides when to call which agent.

Client Application Upgrade

The other major upgrade is the client application.
(pause)

Instead of a custom chat UI, I’m now using CopilotKit for the chat interface.

CopilotKit supports the Agentic - User Interaction (AG-UI) protocol. We will be talking more about this protocol later.

(emphasis)

Earlier we talked about:

MCP for tool invocation

A2A for agent-to-agent communication

And AG-UI completes the picture by standardising how clients discover agents, send messages, and receive responses.

This removes tight coupling and makes the client far more flexible.

**Demo Time**
Let us jump into the demo now.

I have hosted the application on Azure. I will share the link to the repo on the comments.
When you open the link you will see a chat interface powered by CopilotKit. We have some prompt templates defined to guide the user on what to ask.
Let me click on the first prompt to show available bikes.
The app now makes a call to the agent endpoint using AG-UI protocol. The user prompt along with the conversation context is sent to the Contoso Assistant Workflow endpoint. And once the workflow has processed the request, the response is streamed back to the client. I can ask more questions about the product like price, availability etc.
Now let us pick a bike and place an order.
When I say I want to buy the bike, the agent calculates the price including tax breakdown and shows it to the user.
Let us assume that the agent has access to my shipping address and other details. I can now submit the order.
When I submit the order, you will see a popup asking for approval. I say approve and the order is processed. You can see the order confirmation message from the agent.
The approval prompt is not hardcoded in the client application. This is initiated by the agent when it tries to call a tool that requires human approval. I will explain this in detail shortly.

**Contoso Assitant Workflow**

The user prompt along with the conversation context is sent to the Contoso Assistant Workflow endpoint. The Triage Agent analyses the user prompt and decides which agent to call next - ProductInventoryAgent or BillingAgent. The selected agent receives the user prompt and context and generates a response. It would then return the response back to the Triage Agent which would then forward the response back to the client application or choose to call another agent based on the context. You can extend this workflow by adding more agents as needed.

Now let me walk you through the Contoso Assistant Workflow.
(pause)

When a user sends a message, the user prompt, along with the conversation context, is sent to the Contoso Assistant Workflow endpoint.
(pause)

The first agent involved is the Triage Agent.
(slight emphasis)

Its job is to analyse the user’s intent and decide which agent should handle the request next.

Based on that analysis, the Triage Agent will route the request to either the ProductInventoryAgent or the BillingAgent.
(pause)

The selected agent then receives the user prompt and the full context, performs its task, and generates a response.

Once that’s done, the control returns to the Triage Agent.
(pause)

At that point, the Triage Agent has two choices:

It can terminate the workflow and return the response back to the client application.

It can call another agent, if the conversation context requires it.
(emphasis)

This makes the workflow dynamic and flexible, rather than a fixed, linear flow.

And the best part is that this workflow is easy to extend.
(pause)

If in future you need a Shipping Agent, or a Loyalty Agent, you simply add it to the workflow and let the Triage Agent decide when to use it — without changing the client at all.

I used this pattern just to demonstrate how to build workflows using Microsoft Agent Framework. You can use other patterns to build more complex workflows as needed.

**Approval Workflow in Action**

Now let me highlight one of my favourite parts of the demo — the approval workflow.
(pause)

When we place an order, you’ll notice a popup asking for approval.
This UI interaction is not hardcoded in the client.

Here’s what’s actually happening behind the scenes.

The BillingAgent has access to a ProcessPayment tool, and that tool is configured to require human approval before it can run.
(pause)

When the agent attempts to call this tool, the framework detects that approval is required and returns a response indicating that human input is needed.

The client receives that signal via AG-UI and dynamically renders the approval prompt for the user.

Once the user approves, the client sends the approval response back to the agent — and only then does the tool invocation proceed.
(emphasis)

This gives us a clean, safe human-in-the-loop workflow, without embedding business logic or UI assumptions in the client.

6. DevUI looks like a great tool. This is helps during the build phase. But how does it help during production ? Are there other tools that can help with observability and monitoring ?

7. What is AG-UI ? What problem are we tryign to solve with it ?

Why Agentic Apps need AG-UI

In Agentic applications, the traditional request/response model between frontend and backend no longer works effectively. This is where a client makes a request, the server returns data, the client renders it, and the interaction ends. You would have worked with some of the applications like GitHub Copilot. When you look closely at these applications, you will see that they are powered by AI agents working behind the scenes. These agents are not just returning a final answer. They are often streaming intermediate work back to the client — partial responses, reasoning steps, or progress updates — so the user can see what’s happening in real time.

If you have observed closely, the interaction model is quite different from traditional applications -

- The agent streams intermediate work and updates to the client.
- The agent may need more information from the user during the interaction. S
- The agent can control the application UI in a nondeterministic way based on user inputs and context.
- The agent may need to maintain state with the client across multiple turns of interaction.

First — agents don’t just return a final answer.
(pause)

They often stream intermediate work back to the client — partial responses, reasoning steps, or progress updates — so the user can see what’s happening in real time.

Second — agents may need more input mid-conversation.
(pause)

The agent might ask a follow-up question, request clarification, or pause execution until the user provides additional information.
This isn’t a single request anymore — it’s a back-and-forth interaction.

Third — agents can influence the UI itself.
(slight emphasis)

Based on context and user input, an agent might decide to open a panel, trigger a confirmation dialog, show a form, or highlight certain options.
This behaviour is non-deterministic — you can’t fully predict it ahead of time.

And fourth — agents need shared state with the client.
(pause)

The agent and the UI need to stay in sync across multiple turns, remembering what’s already happened and what’s still in progress.

This is exactly the problem AG-UI is designed to solve.
(pause)

AG-UI provides a structured, event-driven way for agents and user interfaces to communicate.
Instead of a single response, the agent can send events — things like messages, UI updates, tool requests, or approval prompts — and the client can react to them in real time.

So if I had to summarise it:
(pause)

AG-UI bridges the gap between autonomous agents and human-friendly user interfaces.
(emphasis)

It’s what allows agentic applications to feel natural, and responsive — especially when humans are part of the loop.

Agentic applications break the simple request/response model that dominated frontend-backend development in the pre-agentic era: a client makes a request, the server returns data, the client renders it, and the interaction ends.

8. What are the next steps for someone who wants to get started with the Microsoft Agent Framework ?

## Agenda

- Introduction to Microsoft Agent Framework
  - Comparison with previous AI agent solutions
  - Key features and benefits - Unified framework for building AI agents, hosting options, observability etc.
  - Agents and Workflows
  - Using Agent Foundry agents with Microsoft Agent Framework
  - You can host the agents on asp.net core or Azure Functions
- Demo
- AG-UI and DevUI
- Observability and Monitoring
- Next Steps
  - Documentation, Samples, Community resources

AG-UI is one of three prominent open agentic protocols.
Layer Protocol / Example Purpose
Agent ↔ User Interaction AG-UI
(Agent–User Interaction Protocol) The open, event-based standard that connects agents to user-facing applications — enabling real-time, multimodal, interactive experiences.
Agent ↔ Tools & Data MCP
(Model Context Protocol) Open standard (originated by Anthropic) that lets agents securely connect to external systems — tools, workflows, and data sources.
Agent ↔ Agent A2A
(Agent to Agent) Open standard (originated by Google) which defines how agents coordinate and share work across distributed agentic systems.

1. An AI Agent is composed of 3 main components: Large Language Model, Tools, and Memory.
2. Uses LLM to interpret user input, make decisions, and generate responses.
3. Uses Tools to perform specific actions or retrieve information.
4. Use Memory to retain context across interactions. And Knowledge Base to access external information.
5. Loops through the steps until a final response is generated.

Unified agent platform – One open-source SDK to build AI agents and workflows

Open Standards: – Supports MCP (Model Context Protocol), A2A (Agent-to-Agent communication), AG-UI (Agent-User Interaction Protocol) and OpenAPI

Highly extensible – Pluggable memory, modular components, and config-driven agent definitions

Multi-language support – Develop agents in .NET or Python

Advanced Orchestration - – Type-safe Workflows to orchestrate complex multi-agent scenarios

Enterprise ready – Built-in monitoring, durable long-running agents, and compliance features

Enterprise-ready – Built-in monitoring, compliance, CI/CD support, and durable long-running agents

Open and interoperable – Supports MCP, agent-to-agent communication, and OpenAPI standards

Unified agent platform - One open-source SDK to build AI agents and workflows

Open Standards - Supports MCP (Model Context Protocol), A2A (Agent-to-Agent communication), AG-UI (Agent-User Interaction Protocol) and OpenAI

Extensibility - Modular and pluggable components for memory, tools, and LLMs

Multi-language support - Develop agents in .NET or Python

Advanced Orchestration - Type-safe Workflows to orchestrate complex multi-agent scenarios

Enterprise ready - Built-in monitoring, durable long-running agents, and compliance features

Flexible orchestration – Supports both structured workflows and dynamic, LLM-driven execution

Microsoft 365 integration – Deploy agents across Teams, Copilot, and web apps

Bi-directional communication – Streamed responses, tool calls, and human-in-the-loop interactions
Thinking steps: visualize intermediate reasoning via traces and tool events
Shared state – maintain context across multi-turn interactions
Frontend tool calls – agent handoffs to frontend-executed actions and responses back to the agent
Human-in-the-loop interrupts – pause, approve, edit, retry requests mid-flow without losing state

Bi-directional communication between user-facing applications and agentic backends
Thinking steps: visualize intermediate reasoning via traces and tool events (no raw chain-of-thought)
Shared state maintained across multi-turn interactions
Frontend tool calls: agent handoffs to frontend-executed actions and responses back to the agent
Interrupts (human-in-the-loop): pause, approve, edit, retry, or escalate mid-flow without losing state
