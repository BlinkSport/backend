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
      table.integer('age').notNullable()
      table.string('biography').nullable()
      table.string('location').notNullable()
      table.string('status').defaultTo('aveugle')
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
