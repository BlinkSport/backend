import vine from '@vinejs/vine'

export const storeSportValidator = vine.compile(
  vine.object({
    sport_id: vine.number().positive(),
  })
)

export const updateSportValidator = vine.compile(
  vine.object({
    currentSportId: vine.number().positive(),
    newSportId: vine.number().positive(),
  })
)

export const deleteSportValidator = vine.compile(
  vine.object({
    sport_id: vine.number().positive(),
  })
)
