import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private pool: Pool;

  constructor(private jwtService: JwtService) {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'skillpilot',
      password: process.env.DB_PASSWORD || 'skillpilot123',
      database: process.env.DB_NAME || 'skillpilot_db',
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } finally {
      client.release();
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateToken(payload: any) {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [
        payload.sub,
      ]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } finally {
      client.release();
    }
  }

  async createUser(userData: { email: string; password: string; role: string }) {
    const client = await this.pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [userData.email],
      );

      if (existingUser.rows.length > 0) {
        // Update existing user password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await client.query(
          'UPDATE users SET password = $1, role = $2 WHERE email = $3',
          [hashedPassword, userData.role, userData.email],
        );
        return existingUser.rows[0];
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const result = await client.query(
        `INSERT INTO users (email, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, email, role`,
        [userData.email, hashedPassword, userData.role],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

