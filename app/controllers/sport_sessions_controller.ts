import type { HttpContext } from '@adonisjs/core/http'
import { storeSportSessionValidator, updateSportSessionValidator } from '#validators/sport_session'
import SportSession from '#models/sport_session'
import SessionMember from '#models/session_member'
import Sport from '#models/sport'
import { DateTime } from 'luxon'
import Status from '../enums/sport_session.js'
import UserStatus from '../enums/user.js'

export default class SportSessionsController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user!

    try {
      const now = DateTime.now().toFormat('yyyy-MM-dd')

      // Obtenir toutes les sessions valides
      const sportSessionsQuery = SportSession.query()
        .where('status', Status.PENDING)
        .andWhere('isPrivate', false)
        .whereRaw('DATE(start_date) > ?', [now])
        // On vérifie qu'il reste des places disponibles dans les sessions
        .whereRaw(
          '(SELECT COUNT(*) FROM session_members WHERE session_members.session_id = sport_sessions.id) < sport_sessions.max_participants'
        )

      // Ajouter condition pour onlyBlindOrVisuallyImpaired en fonction du statut de l'utilisateur
      if (user.status === UserStatus.VALIDE) {
        sportSessionsQuery.where('onlyBlindOrVisuallyImpaired', false)
      } else if (user.status === UserStatus.AVEUGLE || user.status === UserStatus.MALVOYANT) {
        sportSessionsQuery.where('onlyBlindOrVisuallyImpaired', true)
      }

      // Exécuter la requête et précharger les membres
      const sportSessions = await sportSessionsQuery.preload('members')

      return response.json(sportSessions)
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions :', error)
      return response.badGateway({ message: error.message })
    }
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

      // Vérifier que startDate est défini
      if (payload.startDate) {
        // Vérifier si la nouvelle date de début n'est pas déjà passée et différente de la date actuelle
        const now = DateTime.now()

        const startDate = DateTime.fromJSDate(new Date(payload.startDate))

        // si la date est passé
        if (startDate < now) {
          return response.badRequest({
            message: "La date de session doit être au-delà d'aujourd'hui.",
          })
        }
      }

      // On convertit la date de début en date sans l'heure pour comparer uniquement les jours
      const startDateOnly = DateTime.fromJSDate(payload.startDate).toFormat('yyyy-MM-dd')

      // Vérifier si l'utilisateur a déjà une session à la même date
      const existingSession = await SportSession.query()
        .whereHas('members', (builder) => {
          builder.where('userId', user.id).andWhere('isAdmin', true)
        })
        .andWhereRaw('DATE(start_date) = ?', [startDateOnly])
        .first()

      if (existingSession) {
        return response.badRequest({
          message: 'Vous avez déjà créé une session de sport ce jour-là.',
        })
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
   * Update de la session de sport
   */
  async update({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const { sessionId, startDate, sportId, location } = await request.validateUsing(
        updateSportSessionValidator
      )

      // On récupère la session de sport qui doit être update
      const sportSession = await SportSession.findOrFail(sessionId)

      // On vérifie si l'utilisateur est administrateur de la session
      const isAdmin = await SessionMember.query()
        .where('sessionId', sportSession.id)
        .andWhere('userId', user.id)
        .andWhere('isAdmin', true)
        .first()

      if (!isAdmin) {
        return response.unauthorized({
          message: 'Vous devez être administrateur de la session pour la modifier.',
        })
      }

      // On convertit satrtDate en objet Date puis en DateTime pour pouvoir effectuer des calcules par la suite
      if (startDate) {
        // Vérifier si la nouvelle date de début n'est pas déjà passée et différente de la date actuelle
        const now = DateTime.now()

        const newStartDate = DateTime.fromJSDate(new Date(startDate))
        const diffInMinutes = newStartDate.diff(now, 'minutes').minutes

        if (diffInMinutes <= 60) {
          return response.badRequest({
            message: 'Vous ne pouvez pas modifier la session moins de 1 heure avant le début.',
          })
        }

        // si la date est passé
        if (newStartDate <= now) {
          return response.badRequest({
            message: "La nouvelle date de session doit être au-delà d'aujourd'hui.",
          })
        }
        sportSession.startDate = newStartDate.toJSDate()
      }

      // Update des champs autorisés
      if (sportId !== undefined) {
        sportSession.sportId = sportId
      }
      if (location !== undefined) {
        sportSession.location = location
      }

      await sportSession.save()

      return response.ok({ message: 'Session mise à jour avec succès.', data: sportSession })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session :', error)
      return response.badGateway({ message: error.message })
    }
  }

  /**
   * Supression de la session de sport
   */
  async destroy({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const { sessionId } = request.only(['sessionId'])

      // On récupère la session de sport à supprimer
      const sportSession = await SportSession.findOrFail(sessionId)

      // On vérifie que l'utilisateur est admin de la session
      const isAdmin = await SessionMember.query()
        .where('sessionId', sportSession.id)
        .andWhere('userId', user.id)
        .andWhere('isAdmin', true)
        .first()

      if (!isAdmin) {
        return response.unauthorized({
          message: 'Vous devez être administrateur de la session pour la supprimer.',
        })
      }

      // On supprime la session
      await sportSession.delete()
      return response.ok({ message: 'Session supprimée avec succès.' })
    } catch (error) {
      console.error('Erreur lors de la suppression de la session :', error)
      return response.badGateway({ message: error.message })
    }
  }
}
