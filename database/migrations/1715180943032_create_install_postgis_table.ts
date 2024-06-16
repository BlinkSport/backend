import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Installez l'extension PostGIS si elle n'est pas déjà installée
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS postgis')
  }

  async down() {
    // Supprimez l'extension PostGIS lors du nettoyage ou du rollback
    this.schema.raw('DROP EXTENSION IF EXISTS postgis')
  }
}
