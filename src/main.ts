import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './utils/http-exception.filter';

async function bootstrap() {

  const PORT = process.env.PORT || 3005;
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(PORT);

  console.log(`Server is launched on http://localhost:${PORT}`);

}
bootstrap();