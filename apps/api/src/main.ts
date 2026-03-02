import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

// In tsconfig.json esModuleInterop is sometimes false, so * as is usually correct.
// However, if the type says "typeof cookieParser has no call signatures", it means the default export is the function.
// Let's try default import.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 18003);
}
bootstrap().catch((err) => {
  console.error(err);
});
