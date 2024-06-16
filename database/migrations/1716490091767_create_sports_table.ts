import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('sport_name', 255).notNullable()

      table.timestamps(true)
    })
    // On génère une colonne de sport à la table sport
    this.defer(async (db) => {
      await db.table(this.tableName).insert([
        { id: 1, sport_name: 'Football', created_at: new Date(), updated_at: new Date() },
        { id: 2, sport_name: 'Footing', created_at: new Date(), updated_at: new Date() },
        { id: 3, sport_name: 'Musculation', created_at: new Date(), updated_at: new Date() },
        { id: 4, sport_name: 'Basket', created_at: new Date(), updated_at: new Date() },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
