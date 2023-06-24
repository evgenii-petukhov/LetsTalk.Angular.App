# 💬LetsTalk Chat App💬 @ front-end
![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)

🔔 Please, also see the [back-end repository](https://github.com/evgenii-petukhov/LetsTalk.Server) 🙏

![scheme](demo.gif)

🔴 [Live demo](https://chat.epetukhov.cyou/)
## Description
This is an instant messaging service with authentication via social media, such as Facebook. The service allows users to send text messages and share links. 

This project is a showcase of my technical skills and talent for potential IT recruiters, employers, customers, etc. It demonstrates that I am able to
* create a single-page web application with Angular
* implement reactive state management with NgRx store in Angular applications
* understand the basic principles of the OpenAPI Specification
* understand microservice communication patterns and protocols, such as GRPC
* use event streaming platforms and brokers, such as Apache Kafka
## Architecture
![scheme](scheme-compressed.svg)

The back-end implements microservice architecture. There are a few microservices, such as
* **Authentication microservice** generates and validates JWT tokens
* **Notification microservice** sends notifications to the Angular application via SignalR
* **Link preview microservice** processes links inside messages and generates a preview
* **File storage microservice** saves and retrieves files on / from the file system

The API and the Notification microservice communicate with the Authentication microservice via GRPC.

The API, the LinkPreview, and the Notification microservice communicate with each other via Apache Kafka.

## Get started
1. Clone the repository
2. Install dependencies `npm install`
3. Build the project. Use one of the following commands
   - `npm run build` for the production environment
   - `npm run build:dev` for development purposes
4. Copy the output files to the website's directory