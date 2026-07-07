import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthUser } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AccountService } from './account.service';

@Controller('account')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('export')
  export(@CurrentUser() user: AuthUser) {
    return this.accountService.exportData(user.id);
  }

  @Delete()
  remove(@CurrentUser() user: AuthUser) {
    return this.accountService.remove(user.id);
  }
}
