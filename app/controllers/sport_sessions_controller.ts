import type { HttpContext } from '@adonisjs/core/http'
import { storeSportSessionValidator } from '#validators/sport_session'
import SportSession from '#models/sport_session'
import SessionMember from '#models/session_member'
import Sport from '#models/sport'

export default class SportSessionsController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    //const user = auth.user!

    // je souhaite récupérer toutes les sessions
    const sportSession = await SportSession.all()
    return response.json(sportSession)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const payload = await request.validateUsing(storeSportSessionValidator)

      // Vérifier si le sport existe
      const sport = await Sport.findOrFail(payload.sportId)
      if (!sport) {
        response.badRequest({ message: 'Sport non trouvé' })
      }

      // On créer une nouvelle session de sport avec le nom du sport
      const sportSession = await SportSession.create(payload)

      // On ajoute l'user comme membre de la session
      await SessionMember.create({
        sessionId: sportSession.id,
        userId: user.id,
        isAdmin: true,
        isAccepted: true,
      })
      return response.ok({ message: 'Nouvelle session de sport ajouté avec succès.' })
    } catch (error) {
      return response.badGateway({ message: error.message })
    }
  }

  /**
   * Show individual record
   */
  //async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  //async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  //async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  //async destroy({ params }: HttpContext) {}
}
