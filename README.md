# SMEAN Backend

## Description

Smean is a real-time Khmer transcription platform that allows users to effectively transcribe and get key summaries of important meetings through accurate speech-to-text conversion. Through generated insights, searchable archives, and interactive editing, SMEAN enables users to have a more productive and efficient report of each meeting.
This repository handles the backend of the SMEAN platform using NestJS.

## Project setup

```bash
npm install
```

## Compile and run the project

There are two ways to compile and run the project from terminal and docker. You can choose the one that suits you best:

### 1. Running from the console

```bash
# development
npm run start

# watch mode (Recommended: to view updates without restarting the project)
npm run start:dev 

# production mode
npm run start:prod
```
### 2. Running on the docker
- First, go to download docker desktop from the official website: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
<br>**Note**: Make sure you open the docker desktop in the background to run the below command.
- If you clone the project for the first time, run the following command:
```bash
# development
docker compose build dev
```
- If you want to start and run the containers, after building
```bash
docker compose up dev
```
- If you want to stop and remove the containers:
```bash
docker compose down dev
```
It seems that there is no existing CONTRIBUTING.md file in the `smean-backend` repository. Here are some basic guidelines for contribution instructions that you can add to your README.md file or create a new CONTRIBUTING.md file:

---

## Contributing

We welcome contributions to the SMEAN Backend project! Here are some guidelines to help you get started:

1. **Create a Branch**: Create a new branch for your feature.
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
2. **Make Changes**: Implement your changes in the codebase.

3. **Commit Changes**: Commit your changes with a meaningful commit message.
   ```bash
   git commit -m "Add feature: description of your feature"
   ```

4. **Push Changes**: Push your changes.
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**: Open a pull request to the main repository with a description of your changes.

6. **Code Review**: 

7. **Merge**: Once approved, your changes will be merged into the main repository.

---

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
