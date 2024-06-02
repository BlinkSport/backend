import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import Sport from '#models/sport'
import SessionMember from '#models/session_member'
import Notification from './notification.js'

export default class SportSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare startDate: Date

  @column()
  declare sportId: number

  @column()
  declare numberOfMembers: number

  @column()
  declare onlyBlindOrVisuallyImpaired: boolean

  @column()
  declare difficultyLevel: string

  @column()
  declare location: string

  @column()
  declare isPrivate: boolean

  @column.dateTime({ autoCreate: true })
  declare created_At: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Sport)
  declare sport: BelongsTo<typeof Sport>

  @belongsTo(() => Notification, { foreignKey: 'target_id' })
  declare notification: BelongsTo<typeof Notification>

  @hasMany(() => SessionMember)
  declare member: HasMany<typeof SessionMember>
}
