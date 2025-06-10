import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    // Create the reflector mock for the JwtAuthGuard constructor
    const reflectorMock = {
      getAllAndOverride: jest.fn(),
    };

    expect(new JwtAuthGuard(reflectorMock as any)).toBeDefined();
  });
});
