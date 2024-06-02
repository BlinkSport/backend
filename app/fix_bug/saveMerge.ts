import type { HttpContext } from '@adonisjs/core/http'
import SportSession from '#models/sport_session'
import SessionMember from '#models/session_member'
import { joinSportSessionValidator } from '#validators/session_member'
import { messages } from '@vinejs/vine/defaults'

export default class HandleSessionMembersController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async joinSession({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const { sessionId } = await request.validateUsing(joinSportSessionValidator)

      // Vérifier si l'utilisateur n'est pas membre dans une autre session à la même date
      const sessionToJoin = await SportSession.findOrFail(sessionId)
      const conflictingSession = await SessionMember.query()
        .where('userId', user.id)
        .andWhere('isAccepted', true)
        .andWhereHas('session', (query) => {
          query.where('startDate', sessionToJoin.startDate)
        })
        .first()

      // s'il est admin dans une autre session qui a lieu le même jour
      if (conflictingSession && conflictingSession.sessionId !== sessionId) {
        return response.badRequest({
          message: "Vous êtes déjà membre d'une autre session à la même date.",
        })
        // return response.json(conflictingSession)
      }

      // On vérifie si l'utilisateur est déjà admin de cette session
      const isAlreadyMember = await SessionMember.query()
        .where('userId', user.id)
        .andWhere('sessionId', sessionId)
        .andWhere('isAccepted', true)
        .first()

      if (isAlreadyMember) {
        return response.badRequest({
          message: 'Vous êtes déjà membre de cette session.',
        })
      }

      // Vérifier si l'utilisateur a déjà envoyé une demande pour cette session
      const existingRequest = await SessionMember.query()
        .where('userId', user.id)
        .andWhere('sessionId', sessionId)
        .first()

      // Si un user membre envoie 2 fois une demande accepté ou en cours
      if (existingRequest) {
        // Si l'user est déjà membre
        if (existingRequest.isAccepted) {
          return response.badRequest({
            message: 'Vous faites déjà partie de cette session.',
          })
          // Si l'user a une demande en cours
        } else {
          return response.badRequest({
            message: 'Vous avez déjà envoyé une demande pour rejoindre cette session.',
          })
        }
      }

      // Ajouter l'utilisateur comme demande de rejoindre la session
      await SessionMember.create({
        sessionId: sessionId,
        userId: user.id,
        isAdmin: false,
      })

      return response.ok({ message: 'Votre demande pour rejoindre la session a été envoyée.' })
    } catch (error) {
      console.error('Erreur lors de la validation ou de la requête :', error)
      return response.badGateway({ message: error.message })
    }
  }

  /**
   * Show individual record
   */
  async acceptNewMember({ request, auth, response }: HttpContext) {
    const adminUserId = auth.user?.id

    if (!adminUserId) {
      return response.unauthorized({ message: 'User not authenticated' })
    }

    try {
      const { sessionId, userId } = request.only(['sessionId', 'userId'])

      // Vérifier si l'utilisateur actuel est administrateur de la session
      const isAdmin = await SessionMember.query()
        .where('sessionId', sessionId)
        .andWhere('userId', adminUserId)
        .andWhere('isAdmin', true)
        .first()

      if (!isAdmin) {
        return response.unauthorized({
          message: 'Vous devez être administrateur de la session pour accepter un membre.',
        })
      }

      // Trouver le membre de la session avec isAccepted: false
      const sessionMember = await SessionMember.query()
        .where('sessionId', sessionId)
        .andWhere('userId', userId)
        .andWhere('isAccepted', false)
        .firstOrFail()

      // Log pour vérifier l'enregistrement récupéré
      console.log('Membre de la session avant modification:', sessionMember)

      // Utiliser .merge() pour mettre à jour isAccepted et .save() pour enregistrer
      sessionMember.merge({ isAccepted: true })
      await sessionMember.save()

      // Log pour vérifier l'enregistrement après modification
      console.log('Membre de la session après modification:', sessionMember)

      return response.ok({ message: 'Membre accepté avec succès.' })
    } catch (error) {
      console.error('Erreur lors de la validation ou de la requête :', error)
      return response.badGateway({ message: error.message })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async deleteUser({ request, auth, response }: HttpContext) {
    const adminUserId = auth.user?.id

    if (!adminUserId) {
      return response.unauthorized({ message: 'User not authenticated' })
    }

    try {
      const { sessionId, userId } = request.only(['sessionId', 'userId'])

      // Vérifier si l'utilisateur actuel est administrateur de la session
      const isAdmin = await SessionMember.query()
        .where('sessionId', sessionId)
        .andWhere('userId', adminUserId)
        .andWhere('isAdmin', true)
        .first()

      if (!isAdmin) {
        return response.unauthorized({
          message: 'Vous devez être administrateur de la session pour refuser un membre.',
        })
      }

      // On trouve puis on supprime le membre de la session
      const sessionMember = await SessionMember.query()
        .where('sessionId', sessionId)
        .andWhere('userId', userId)
        .first()

      console.log('sessionMember:', sessionMember)

      if (!sessionMember) {
        return response.notFound({ message: 'Membre non trouvé.' })
      }

      await sessionMember.delete()

      return response.ok({ message: 'Utilisateur supprimée avec succès.' })
    } catch (error) {
      return response.badGateway({ message: error.message })
    }
  }
}
