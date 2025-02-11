import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { User } from './auth/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');
  app.use(
    session({
      secret: 'smeanSecret04', // Replace with your own secret key
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 }, // Set to true if using HTTPS
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: User, done) => {
      done(null, user);
    });
  
  await app.listen(3000);
}
bootstrap();
