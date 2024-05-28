import type { HttpContext } from '@adonisjs/core/http'
import {
  storeSportValidator,
  updateSportValidator,
  deleteSportValidator,
} from '#validators/loved_sport'
//import Sport from '#models/sport'
import SportLovedByUser from '#models/sport_loved_by_user'

export default class UserFavoriteSportsController {
  /**
   * Récupère les sports préférés de l'utilisateur
   */
  async index({ auth, response }: HttpContext) {
    // Récupère l'utilisateur actuellement authentifié à partir de l'objet auth fourni par le contexte HTTP.
    const user = auth.user! // L'opérateur non-null assertion (!) est utilisé pour indiquer au compilateur TypeScript que l'utilisateur est garanti
    // d'être présent, grâce à une protection d'authentification mise en place sur la route ou le middleware.

    // Effectue une requête sur la table 'sport_loved_by_users' pour trouver les sports préférés par l'utilisateur authentifié.
    // La clause.where('user_id', user.id) filtre les résultats pour ne conserver que les enregistrements correspondant à l'ID de l'utilisateur.
    // La méthode.preload('sport') charge automatiquement les détails du sport associé à chaque enregistrement,
    // ce qui permet d'avoir facilement accès aux informations du sport directement depuis l'objet 'lovedSports'.
    // Cette opération asynchrone est attendue avec await pour s'assurer que la requête est complétée avant de continuer.
    const lovedSports = await SportLovedByUser.query().where('user_id', user.id).preload('sport')
    return response.json(lovedSports)
  }

  /**
   * Ajoute un sport préféré
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!

    const payload = await request.validateUsing(storeSportValidator)
    // Extrait la valeur du paramètre 'sport_id' de la chaîne de requête HTTP et l'affecte à la constante 'sportId'.
    const sportId = payload.sport_id

    // On vérifie si l'utilisateur a déjà atteint la limite de 5 sports préférés
    const lovedSportsCount = await SportLovedByUser.query()
      .where('user_id', user.id)
      .count('* as total') // compte le nombre d'enregistrement qui respecte la condition where()

    if (lovedSportsCount.length > 0 && lovedSportsCount.length >= 5) {
      return response.badRequest({ message: 'Vous ne pouvez pas avoir plus de 5 sports préférés.' })
    }

    // On vérifie si le sport est déjà aimé par l'utilisateur
    const existingSport = await SportLovedByUser.query()
      .where('user_id', user.id)
      .andWhere('sport_id', sportId)
      // Retourne le premier enregistrement qui correspond aux critères de la requête,
      // ou null si aucun enregistrement correspondant n'est trouvé
      .first()

    // Si le sport est déjà aimé par l'user
    if (existingSport) {
      return response.badRequest({ message: 'Vous aimez déjà ce sport.' })
    }

    // On ajoute le nouveau sport préféré
    await SportLovedByUser.create({
      userId: user.id, // Use user_id as it matches the database field
      sportId: sportId,
    })

    return response.json({ message: 'Sport ajouté avec succès.' })
  }

  /**
   * Remplace un sport préféré par l'user par un nouveau sport préféré
   */
  async update({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const payload = await request.validateUsing(updateSportValidator)

      const { currentSportId, newSportId } = payload

      // Définir la requête de base pour le sport à remplacer
      const baseQuery = SportLovedByUser.query()
        .where('user_id', user.id)
        .andWhere('sport_id', currentSportId)

      // Vérifie si le sport à remplacer appartient bien à l'utilisateur
      const sportToReplace = await baseQuery.first()

      // Si le sport à remplacer n'est pas trouvé, renvoie une réponse d'erreur
      if (!sportToReplace) {
        return response.notFound({ message: 'Sport non trouvé.' })
      }

      // Vérifie si le nouveau sport est déjà aimé par l'utilisateur
      const existingSport = await SportLovedByUser.query()
        .where('user_id', user.id)
        .andWhere('sport_id', newSportId)
        .first()

      // Si l'utilisateur aime déjà ce sport, renvoie une réponse d'erreur
      if (existingSport) {
        return response.badRequest({ message: 'Vous aimez déjà ce sport.' })
      }

      // On remplace le sport préféré
      await baseQuery.update({ sport_id: newSportId })

      return response.json({ message: 'Sport remplacé avec succès.' })
    } catch (error) {
      console.error('Erreur lors du remplacement du sport:', error)
      return response.internalServerError({
        message: 'Impossible de remplacer le sport.',
        error: error.message,
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const payload = await request.validateUsing(deleteSportValidator)
      const sportId = payload.sport_id

      // Vérifie si le sport à supprimer appartient bien à l'utilisateur
      const sportToDelete = await SportLovedByUser.query()
        .where('user_id', user.id)
        .andWhere('sport_id', sportId)
        .first()

      if (!sportToDelete) {
        return response.notFound({ message: 'Sport non trouvé.' })
      }
      await sportToDelete.delete()
      return response.json({ message: 'Sport supprimé avec succès.' })
    } catch (error) {
      return response.internalServerError({
        message: 'Impossible de supprimer le sport.',
        error: error.message,
      })
    }
  }
}
