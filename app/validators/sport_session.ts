import vine from '@vinejs/vine'
import Status from '../enums/sport_session.js'
import Level from '../enums/difficulty_level.js'

export const storeSportSessionValidator = vine.compile(
  vine.object({
    // startDate: vine.date({
    //   format: 'yyyy-MM-dd HH:mm:ss',
    // }),
    startDate: vine.date(),
    sportId: vine.number().positive(),
    maxParticipants: vine.number().withoutDecimals().positive(),
    onlyBlindOrVisuallyImpaired: vine.boolean().optional(),
    difficultyLevel: vine
      .enum([Level.AUCUN, Level.DEBUTANT, Level.INTERMEDIAIRE, Level.HAUTNIVEAU])
      .optional(),
    location: vine.string(),
    isPrivate: vine.boolean().optional(),
    status: vine.enum([Status.PENDING, Status.FINISH, Status.CANCELED]).optional(),
  })
)

export const updateSportSessionValidator = vine.compile(
  vine.object({
    sessionId: vine.number().positive().optional(),
    startDate: vine.date().optional(),
    sportId: vine.number().positive().optional(),
    location: vine.string().optional(),
  })
)
