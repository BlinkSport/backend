import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  // Permet de mettre à jour
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('username').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('phone_number').nullable()
      table.string('biography').nullable()
      table.string('localisation').notNullable()
      table.text('availability').nullable()
      table.string('status').defaultTo('bénévole')
      table.string('thumbnail').nullable()
      //table.string('remember_me_token').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }
  // Permet de revenir en arrière
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
