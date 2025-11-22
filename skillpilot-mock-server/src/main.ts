import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with specific origins
  app.enableCors({
    origin: ['http://localhost:3000', 'http://frontend:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SkillPilot AI API')
    .setDescription('Comprehensive API for SkillPilot AI hackathon. Includes mock server endpoints and LangChain chat functionality.')
    .setVersion('1.0.0')
    .addTag('Mock Server', 'Mock API endpoints for learners, integrations, and data')
    .addTag('LangChain Chat', 'AI chat endpoints using LangChain')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   SkillPilot AI - NestJS API Server                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running at: http://localhost:${port}`);
  console.log(`📚 API Docs at: http://localhost:${port}/api-docs`);
  console.log('');
  console.log('Available Endpoints:');
  console.log(`  GET http://localhost:${port}/healthcheck - Health check`);
  console.log(`  POST http://localhost:${port}/auth/login - Login (requires email & password)`);
  console.log(`  GET http://localhost:${port}/learners - Get all learners (requires JWT token)`);
  console.log(`  POST http://localhost:${port}/employees - Create employee (requires JWT token, sends invitation)`);
  console.log(`  GET http://localhost:${port}/suggest-skills?position=...&role=learner - Get AI skill suggestions (requires JWT token)`);
  console.log(`  GET http://localhost:${port}/api/v1/invitation/verify/:token - Verify invitation link`);
  console.log(`  POST http://localhost:${port}/api/v1/invitation/create-profile - Create profile from invitation`);
  console.log(`  GET http://localhost:${port}/githubProfiles - GitHub integration`);
  console.log(`  GET http://localhost:${port}/linkedinProfiles - LinkedIn integration`);
  console.log(`  POST http://localhost:${port}/api/v1/langchain-chat/basic-chat - Basic chat`);
  console.log(`  POST http://localhost:${port}/api/v1/langchain-chat/context-aware-chat - Context-aware chat`);
  console.log(`  POST http://localhost:${port}/api/v1/llama-chat/chat - Llama 3.3 70B chat`);
  console.log(`  GET http://localhost:${port}/api/v1/llama-chat/health - Llama chat health check`);
  console.log('');
}

bootstrap();

