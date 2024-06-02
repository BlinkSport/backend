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
// export const updateSportSessionValidator = vine.object({
//   session_status: vine.enum(['pending', 'offered', 'completed', 'cancelled']).optional(),
//   start_date: vine.date().optional(),
//   //sport_session_name: vine.string().optional(),
//   difficulty_level: vine.enum(['débutant', 'amateur', 'confirmé']).optional(),
//   location: vine.string().optional(),
//   number_of_participants: vine.number().positive().optional(),
//   only_blind_or_visually_impaired: vine.boolean().optional(),
// })
