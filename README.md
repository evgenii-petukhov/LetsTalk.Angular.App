# LetsTalk Chat App @ front-end

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)

🔔 Please, also see the [back-end repository](https://github.com/evgenii-petukhov/LetsTalk.Server) 🙏

![scheme](demo.gif)

🔴 [Live demo](https://chat.epetukhov.cyou/)

## Description

This is an instant messaging service with authentication via social media, such as Facebook. It allows users to send text messages, images, and share links.

This project is a showcase of my technical skills and talent for potential IT recruiters, employers, customers, etc. It demonstrates that

-   I can
    -   create a single-page web application with Angular
    -   implement reactive state management with NgRx store in Angular applications
-   I understand
    -   basic principles of the OpenAPI Specification
    -   microservice communication patterns and protocols, such as GRPC
    -   main principles of microservice architecture, event-driven development, and experienced in Apache Kafka

## Architecture

![scheme](scheme-compressed.svg)

The front-end is an Angular single-page application which uses NgRx for reactive state management.

The back-end implements microservice architecture. The table below describes each of them.

| Microservice name | Protocol                                                                                             | Description                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Chat API          | REST                                                                                                 | Responsible for sending messages and account management                                      |
| Authentication    | [GRPC](https://github.com/grpc/grpc)                                                                 | Generates and validates JSON Web Tokens                                                      |
| Notification      | [Apache Kafka](https://github.com/apache/kafka) &#124; [SignalR](https://github.com/SignalR/SignalR) | Sends out notifications about new messages                                                   |
| Link preview      | [Apache Kafka](https://github.com/apache/kafka)                                                      | Decorates messages with a website's name and a picture preview, if a message contains links  |
| File storage      | [GRPC Web](https://github.com/grpc/grpc-web)                                                         | Saves avatars and images uplodaed by users on the file system and serves them when requested |
| Image processing  | [Apache Kafka](https://github.com/apache/kafka)                                                      | Generates image previews, uses [SkiaSharp](https://github.com/mono/SkiaSharp)                |

## Get started

1. Clone the repository
2. Install dependencies `npm install`
3. Build the project. Use one of the following commands
    - `npm run build` for the production environment
    - `npm run build:dev` for development purposes
4. Copy the output files to the website's directory
