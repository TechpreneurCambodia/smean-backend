# SMEAN Backend

## Description

Smean is a real-time Khmer transcription platform that allows users to effectively transcribe and get key summaries of important meetings through accurate speech-to-text conversion. Through generated insights, searchable archives, and interactive editing, SMEAN enables users to have a more productive and efficient report of each meeting.
This repository handles the backend of the SMEAN platform using NestJS.

## Project setup

```bash
npm install
```
## Setup the environment
- Copy the `.env.example` and configure the value based on the environment you will be using. 
To copy
```bash
cp .env.example .env
```
- Generate Secret Keys: Generate a random string for the secret keys by (Open your terminal and run)
```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```
- Copy the output and paste it to the `SECRET_KEY` in `.env` file
- Run the script above again and copy the generated key to the `REFRESH_SECRET` in `.env` file
![Screenshot 2025-02-17 at 8 17 27 in the evening](https://github.com/user-attachments/assets/156fb8ed-2141-4675-8733-88b5788a8f8a)

## Compile and run the project

There are two ways to compile and run the project from terminal and docker. You can choose the one that suits you best:

### 1. Running from the console

- In the `.env` in the root of your project, change the value based on your postgres database (If the database name u put is not exists yet, create a new one).
Example:
```
# Database Configurations for npm run start:dev
DATABASE_HOST=localhost
DATABASE_USER=postgres
DATABASE_PASSWORD=pich
DATABASE_PORT=5432
DATABASE_NAME=postgres
```
- Then run:
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
- Change database settings value the`.env` in the root of your project (You can change or use the default value)
```
DATABASE_HOST=db
DATABASE_USER=user
DATABASE_PASSWORD={yourpass}
DATABASE_PORT=5432
DATABASE_NAME={yourdb}
```
- If you clone the project for the first time, run the following command:
```bash
# development
docker-compose -f docker-compose.dev.yml build          
```
- If you want to start and run the containers, after building
```bash
docker compose -f docker-compose.dev.yml up         
```
- If you want to stop and remove the containers:
```bash
docker compose -f docker-compose.dev.yml down
```

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
