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
        { id: 2, sport_name: 'Course', created_at: new Date(), updated_at: new Date() },
        { id: 3, sport_name: 'Cyclysme', created_at: new Date(), updated_at: new Date() },
        { id: 4, sport_name: 'Randonnée', created_at: new Date(), updated_at: new Date() },
        { id: 5, sport_name: 'Yoga', created_at: new Date(), updated_at: new Date() },
        { id: 6, sport_name: 'Musculation', created_at: new Date(), updated_at: new Date() },
        { id: 7, sport_name: 'Natation', created_at: new Date(), updated_at: new Date() },
        { id: 8, sport_name: 'Combat', created_at: new Date(), updated_at: new Date() },
        { id: 9, sport_name: 'Voile', created_at: new Date(), updated_at: new Date() },
        { id: 10, sport_name: 'Ping Pong', created_at: new Date(), updated_at: new Date() },
        { id: 11, sport_name: 'Salle de sport', created_at: new Date(), updated_at: new Date() },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
