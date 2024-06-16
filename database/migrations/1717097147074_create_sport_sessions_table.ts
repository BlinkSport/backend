import { BaseSchema } from '@adonisjs/lucid/schema'
import Status from '../../app/enums/sport_session.js'
import Level from '../../app/enums/difficulty_level.js'

export default class extends BaseSchema {
  protected tableName = 'sport_sessions'
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.dateTime('start_date').nullable()
      table.integer('sport_id').unsigned().references('id').inTable('sports')
      table.integer('max_participants').notNullable()
      table.boolean('only_blind_or_visually_impaired').defaultTo(false)
      table.string('difficulty_level').notNullable().defaultTo(Level.AUCUN)
      table.string('description')
      table.string('location').notNullable()
      table.float('latitude').notNullable()
      table.float('longitude').notNullable()
      table.specificType('geo_location_point', 'geometry(Point, 4326)').nullable() // type géométrique pour stocker les points
      table.boolean('is_private').defaultTo(false)
      table.string('status').notNullable().defaultTo(Status.PENDING)
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
