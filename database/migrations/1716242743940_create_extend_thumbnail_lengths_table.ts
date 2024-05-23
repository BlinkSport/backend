import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ExtendThumbnailLength extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('thumbnail', 1024).alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('thumbnail', 255).alter()
    })
  }
}
