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
        biography: 'je suis gentil',
        location: 'Usa',
        availability: '16h-17h',
        status: 'bénévole',
      },
      {
        username: 'Jhon',
        email: 'tefjb@adonisjs.com',
        password: 'secpooit1239',
        phoneNumber: '0622222222',
        biography: 'je suis méchant',
        location: 'Paris',
        availability: '16h-17h',
        status: 'aveugle',
      },
      {
        username: 'Pouder',
        email: 'uert@adonisjs.com',
        password: 'secret123',
        phoneNumber: '0611111111',
        biography: "j'aime le sport",
        location: 'Pérou',
        availability: '16h-17h',
        status: 'malvoyant',
      },
      {
        username: 'Seda',
        email: 'seda@adonisjs.com',
        password: 'sret123jhy',
        phoneNumber: '0687968574',
        biography: 'je suis gentil aussi',
        location: 'Brésil',
        availability: '16h-17h',
        status: 'bénévole',
      },
    ])
  }
}
