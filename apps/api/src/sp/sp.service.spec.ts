import { Test, TestingModule } from '@nestjs/testing';
import { SpService } from './sp.service';

describe('SpService', () => {
  let service: SpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpService],
    }).compile();

    service = module.get<SpService>(SpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
