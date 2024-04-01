import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { UserTG } from 'src/models/userstg.model'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston' // winston churchill
import { Logger } from 'winston' // logger to file

@Injectable()
export class UsersTgService {
  constructor(
    @InjectModel(UserTG) private userTgModel: typeof UserTG,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async createUser(userData: Partial<UserTG>): Promise<UserTG> {
    try {
      return await this.userTgModel.create(userData)
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() + ` UsersTgService createUser Error :`,
        error,
      )
      throw error
    }
  }

  async createOrReplaceUser(userData: Partial<UserTG>): Promise<UserTG> {
    try {
      const [user, created] = await this.userTgModel.findOrCreate({
        where: { chatId: userData.chatId },
        defaults: userData,
      })

      if (!created) {
        await user.update(userData)
      }

      return user
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ' UsersTgService createOrReplaceUser Error:',
        error,
      )
      throw error
    }
  }

  async findUserByChatId(chatId: number): Promise<UserTG | null> {
    try {
      return await this.userTgModel.findOne({ where: { chatId } })
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` UsersTgService findUserByChatId Error :`,
        error,
      )
    }
  }

  async findAllUsersNotifyOn(): Promise<UserTG[] | null> {
    try {
      return await this.userTgModel.findAll({ where: { notificationOn: true } })
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() +
          ` UsersTgService findAllUsersNotifyOn Error :`,
        error,
      )
    }
  }

  async updateUser(
    chatId: number,
    userData: Partial<UserTG>,
  ): Promise<UserTG | null> {
    try {
      const updatedUser = await this.userTgModel.findOne({ where: { chatId } })
      if (updatedUser) {
        await updatedUser.update(userData)
        return updatedUser
      } else {
        console.log('UsersTgService updateUser User to update - not found')
      }
    } catch (error) {
      this.logger.error(
        new Date().toLocaleString() + ` UsersTgService updateUser Error :`,
        error,
      )
    }
  }
}
