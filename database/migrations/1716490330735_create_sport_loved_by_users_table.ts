import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sport_loved_by_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      /*
        .unsigned():  garantit que la colonne 'user_id' ne contiendra que des valeurs positives
        .references('id').inTable('users'):  indique que la colonne 'user_id' fait référence à la colonne 'id' dans la table user
        .onDelete(): spécifie que si un utilisateur associé est supprimé, tous les enregistrements liés dans la table actuelle doivent également être supprimés
      */
      table.integer('sport_id').unsigned().references('id').inTable('sports').onDelete('CASCADE')

      // Définit une clé primaire composite composée des colonnes 'user_id' et 'sport_id'.
      // Cela signifie que chaque enregistrement dans la table est identifié de manière unique par la combinaison de ces deux valeurs.
      // Une clé primaire composite est nécessaire ici car aucune des deux colonnes seules ne suffit à identifier un enregistrement de manière unique,
      // mais leur combinaison unique le fait. Cela est particulièrement utile pour modéliser des relations complexes entre différentes entités.
      table.primary(['user_id', 'sport_id'])

      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
