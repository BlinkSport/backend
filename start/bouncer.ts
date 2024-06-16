// start/bouncer.ts

import SportSessionPolicy from '#policies/sportsession_author_policy'
import { Bouncer } from '@adonisjs/bouncer'

Bouncer.define('updateSportSession', (user: any, sessionId: number) => {
  return SportSessionPolicy.isAdmin(user, sessionId)
})
