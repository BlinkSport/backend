import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        username: 'toto',
        email: 'virk@adonisjs.com',
        password: '12345678',
        phoneNumber: '0611111111',
        age: 16,
        biography: 'je suis gentil',
        location: 'Usa',
        status: 'bénévole',
      },
      {
        username: 'Jhon',
        email: 'tefjb@adonisjs.com',
        password: 'secpooit1239',
        phoneNumber: '0622222222',
        age: 20,
        biography: 'je suis méchant',
        location: 'Paris',
        status: 'aveugle',
      },
      {
        username: 'Pouder',
        email: 'uert@adonisjs.com',
        password: 'secret123',
        phoneNumber: '0611111111',
        age: 36,
        biography: "j'aime le sport",
        location: 'Pérou',
        status: 'malvoyant',
      },
      {
        username: 'Seda',
        email: 'seda@adonisjs.com',
        password: 'sret123jhy',
        phoneNumber: '0687968574',
        age: 25,
        biography: 'je suis gentil aussi',
        location: 'Brésil',
        status: 'bénévole',
      },
    ])
  }
}
