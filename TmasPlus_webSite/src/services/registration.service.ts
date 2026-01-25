import { UsersService } from './users.service';
import type { UserInsert, UserRow } from '@/config/database.types';

type RegisterInput = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  mobile: string;
  user_type: 'customer' | 'driver' | 'company';
};

export class RegistrationService {
  static async register(input: RegisterInput): Promise<UserRow> {
    const userData: UserInsert = {
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
      mobile: input.mobile,
      user_type: input.user_type,
      approved: input.user_type !== 'driver',
      blocked: false,
      wallet_balance: 0,
    };

    return await UsersService.createUser(userData);
  }
}
