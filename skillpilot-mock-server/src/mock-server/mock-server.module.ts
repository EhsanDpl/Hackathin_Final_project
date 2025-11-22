import { Module } from '@nestjs/common';
import { MockServerController } from './mock-server.controller';
import { MockServerService } from './mock-server.service';

@Module({
  controllers: [MockServerController],
  providers: [MockServerService],
  exports: [MockServerService],
})
export class MockServerModule {}

