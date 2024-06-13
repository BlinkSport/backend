import { BaseSchema } from '@adonisjs/lucid/schema'
import UserStatus from '../../app/enums/user.js'

export default class extends BaseSchema {
  protected tableName = 'users'

  // Permet de mettre à jour
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('lastname').nullable()
      table.string('firstname').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('phone_number').nullable()
      table.date('birthdate').nullable()
      table.string('biography').nullable()
      table.string('location').nullable()
      table.float('latitude').nullable()
      table.float('longitude').nullable()
      table.string('status').defaultTo(UserStatus.AVEUGLE)
      table.string('profil_image').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }
  // Permet de revenir en arrière
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
