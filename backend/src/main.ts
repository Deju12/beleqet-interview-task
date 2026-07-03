import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  console.log('1️⃣ Starting bootstrap...');
  const logger = new Logger('Bootstrap');
  console.log('2️⃣ Creating Nest app...');
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
  console.log('3️⃣ Nest app created!');

  console.log('4️⃣ Getting ConfigService...');
  const configService = app.get(ConfigService);
  console.log('5️⃣ ConfigService obtained!');
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Validation ────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strip unknown props
      forbidNonWhitelisted: true,
      transform: true,          // auto-transform to DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Serialization ─────────────────────────────────────────────────────────
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ── Exception filter ──────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Logging interceptor ───────────────────────────────────────────────────
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ── Swagger (disabled in production) ──────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Beleqet API')
      .setDescription(
        'Beleqet Hiring Platform — Jobs Board, Freelance Marketplace, BeleqetSafe Escrow',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & session management')
      .addTag('users', 'User profile management')
      .addTag('jobs', 'Job listings & search')
      .addTag('applications', 'Job applications & workflow')
      .addTag('freelance', 'Freelance gigs, bids & contracts')
      .addTag('escrow', 'BeleqetSafe escrow & payments')
      .addTag('wallet', 'Freelancer wallet & withdrawals')
      .addTag('notifications', 'Notification management')
      .addTag('analytics', 'Platform analytics')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger UI → http://localhost:${port}/api/docs`);
  }

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  app.enableShutdownHooks();

  console.log('6️⃣ About to listen on port ' + port + '...');
  console.log('7️⃣ Creating HTTP server...');
  const server = app.getHttpServer();
  console.log('8️⃣ HTTP server created:', typeof server);
  console.log('9️⃣ Calling app.listen()...');
  try {
    console.log('🔟 Attempting to listen...');
    await app.listen(port);
    console.log('✅ Server listening on port ' + port + '!');
  } catch (err) {
    console.error('❌ Error in app.listen:', err);
    process.exit(1);
  }
  console.log('7️⃣ Server listening on port ' + port + '!');
  logger.log(`🚀 Beleqet API running on http://localhost:${port}/api/v1`);
  logger.log(`   Environment: ${nodeEnv}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Fatal startup error', err);
  process.exit(1);
});


