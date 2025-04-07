const { PROFESSIONAL_SPECIALIZATIONS } = require('../constants/professionalSpecializations');
const Nutritionist = require('../models/Nutritionist');
const Psychologist = require('../models/Psychologist');
const Trainer = require('../models/Trainer');

/**
 * Verifica se una specializzazione è valida
 * @param {string} specialization
 * @returns {boolean}
 */
function isValidSpecialization(specialization) {
  return Object.values(PROFESSIONAL_SPECIALIZATIONS).includes(specialization);
}

/**
 * Filtra e restituisce solo le specializzazioni valide
 * @param {string[]} specializations
 * @returns {string[]}
 */
function filterValidSpecializations(specializations = []) {
  return specializations.filter(isValidSpecialization);
}

async function assignSpecToProfessional(specializations = [], professionalId) {

     // Per ogni specializzazione, crea la relativa entità (es. Nutritionist, Trainer, ecc.)
             for (const specialization of specializations) {
                if (specialization === PROFESSIONAL_SPECIALIZATIONS.NUTRITIONIST) {
                    const nutritionist = new Nutritionist({
                        professionalId: professionalId,
                    });
                    await nutritionist.save();
                }
                if (specialization === PROFESSIONAL_SPECIALIZATIONS.TRAINER) {
                    const trainer = new Trainer({
                        professionalId: professionalId,
                    });
                    await trainer.save();
                }
                if (specialization === PROFESSIONAL_SPECIALIZATIONS.PSYCHOLOGIST) {
                    const psychologist = new Psychologist({
                        professionalId: professionalId,
                    });
                    await psychologist.save();
                }
            }

}

module.exports = {
  isValidSpecialization,
  filterValidSpecializations,
  assignSpecToProfessional
};