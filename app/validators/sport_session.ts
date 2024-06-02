import vine from '@vinejs/vine'

export const storeSportSessionValidator = vine.compile(
  vine.object({
    // startDate: vine.date({
    //   format: 'yyyy-MM-dd HH:mm:ss',
    // }),
    startDate: vine.date(),
    sportId: vine.number().positive(),
    maxParticipants: vine.number().withoutDecimals().positive(),
    onlyBlindOrVisuallyImpaired: vine.boolean().optional(),
    difficultyLevel: vine.enum(['aucun', 'débutant', 'intérmédiaire', 'confirmé']),
    location: vine.string(),
    isPrivate: vine.boolean().optional(),
    isCanceled: vine.boolean().optional(),
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
