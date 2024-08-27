# Explore the benefits of running Azure Functions on Azure Kubernetes Services (AKS).

## Introduction

The serverless technology has been around for a while now, and it has revolutionized the way we build and deploy applications. Azure Functions, a serverless compute service from Microsoft Azure allows to run code on-demand without having to manage infrastructure. In this article, we will explore how running the Azure Functions on a dedicated Kubernetes cluster, such as Azure Kubernetes Services (AKS), can provide added benefits and flexibility to your applications.

## Serverless Computing with Azure Functions

Azure provides various hosting plans for Azure Functions, such as Consumption Plan, Premium Plan, and Dedicated (App Service) Plan.

The **Consumption Plan** provides complete abstraction of the underlying infrastructure.
You will be uploading your compiled code to the Azure Function App, after specifying the runtime stack and operating system requirements.
Azure will be taking care of running your code in a serverless environment, and scaling the resources based on the demand.

## Using Containers for Azure Functions

The previous setup works well for most of the application requirements.
But, if you are looking for more control over the runtime environment, you can consider running the function from a docker container.

The **Premium Plan** and **Dedicated plans** allow you to choose container images for your Azure Functions.
Microsoft provides a set of base images for the Azure Functions runtime targeting different programming languages which you can use to build your custom images. The base images can be found here - [https://mcr.microsoft.com/catalog?search=functions] (https://mcr.microsoft.com/catalog?search=functions).

Note that this is still a managed service, and you don't have to worry about the underlying infrastructure.
Azure will be managing the scaling and availability of your functions.

## Running Azure Functions on Kubernetes

To gain even more control over your infrastructure, you may want to consider running the functions on a Kubernetes cluster. In this setup, you will still be utilizing the Function-as-a-Service (FaaS) model, but with the added responsibility of managing the underlying infrastructure yourself.

Running functions on Kubernetes offers additional benefits. Kubernetes abstracts the underlying infrastructure, providing a unified approach to resource management.

When you run your Azure Functions on Kubernetes, you get the best of both worlds - the simplicity of serverless computing and the power of Kubernetes. This also means that you will not be locked into the Azure ecosystem, and you can run your applications on any Kubernetes cluster, including on-premises or other cloud providers.
This also means that you will not be locked into the Azure ecosystem, and you can run your applications on any Kubernetes cluster, including on-premises or other cloud providers.

## Running Azure Functions on Kubernetes

If you want to take this a step further, and have full control over your infrastructure, you want to consider running the functions on a Kubernetes cluster.
You are still running your code in Function-as-a-Service (FaaS) model while taking responsibility for managing the underlying infrastructure on your own.

Running functions on Kubernetes provides additional benefits -

1. Avoid vendor lock-in. The functions can be run on any Kubernetes cluster, including on-premises or other cloud providers.
1. The functions are initialized when the first request is received. In some cases, it may take considerable time to initialize the function, leading to increased latency. With Kubernetes, you can keep the functions warm and ready to serve requests.
1. A unified approach to resource management. You can manage your serverless functions and other containerized applications in a single Kubernetes cluster. This simplifies operations and reduces complexity.

The Azure Functions runtime can be packaged into a container image that are built using the Azure Functions base images provided by Microsoft.
This emphasizes seamless portability of running serverless functions on your own infrastructure.

In order to run your application on serverless technology, you primarily need two things -

1. platform that can host the runtime environment
1. mechanism to scale the resources based on the demand

The applications are triggered in various ways, such as HTTP requests, timers, or messages from a queue. The platform must be able to determine the demand and scale the resources accordingly.
For example, scaling the resources based on the number of incoming HTTP requests, number of messages in the queue.

## Triggering Azure Functions on AKS using KEDA

**KEDA (Kubernetes-based Event-Driven Autoscaling)** is a Kubernetes-based event-driven autoscaling component that provides event-driven scale for any container running in a Kubernetes cluster.
It is a Cloud Native Computing Foundation (CNCF) sandbox project and is installed as an add-on to the Kubernetes cluster. More information about KEDA can be found [here](https://keda.sh/).

The scaler component is responsible for detecting the events and feeding this data to the Horizontal Pod Autoscaler (HPA) in Kubernetes to scale the resources.

For example, if you are using Kafka as the messaging system -
When a message or event arrives at the specified Kafka Topic, KEDA detects this event and activates the deployment.

There are scalers for various sources - messaging (Azure Service Bus, Kafka, RabbitMQ), Database (MySQL, PostgreSQL, CosmosDB), and others. The full list of scalers can be found [here](https://keda.sh/docs/2.15/scalers/).

## Final Thoughts

Running Azure Functions on Kubernetes would require additional effort and expertise compared to running them on Azure Functions Consumption Plan. The choice of the hosting depends on the application requirements, the platform / tooling capabilities, and the expertise available in the team.

However, there is great value in running Azure Functions on Kubernetes, especially if you are looking for more control over the infrastructure and want to avoid vendor lock-in.
