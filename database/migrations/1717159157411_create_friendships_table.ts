import { BaseSchema } from '@adonisjs/lucid/schema'
import Status from '../../app/enums/status.js'

export default class extends BaseSchema {
  protected tableName = 'friendships'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('sender_user_id').unsigned().references('id').inTable('users')
      table.integer('receiver_user_id').unsigned().references('id').inTable('users')
      table.string('status').defaultTo(Status.PENDING).notNullable()
      table.timestamp('created_at').notNullable
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
