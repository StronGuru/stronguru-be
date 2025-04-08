const { PROFESSIONAL_SPECIALIZATIONS } = require('../constants/professionalSpecializations');
const Nutritionist = require('../models/Nutritionist');
const Psychologist = require('../models/Psychologist');
const Trainer = require('../models/Trainer');

/**
 * Verifica se una specializzazione è valida (case insensitive, trim)
 * @param {string} specialization
 * @returns {boolean}
 */
function isValidSpecialization(specialization) {
    if (typeof specialization !== 'string') return false;
    const normalized = specialization.trim().toLowerCase();
    return Object.values(PROFESSIONAL_SPECIALIZATIONS).includes(normalized);
  }
  
  /**
   * Filtra e restituisce solo le specializzazioni valide, normalizzate
   * @param {string[]} specializations
   * @returns {string[]}
   */
  function filterValidSpecializations(specializations = []) {
    return specializations
      .map(s => s.trim().toLowerCase())
      .filter(isValidSpecialization);
  }
  

async function assignSpecToProfessional(specializations = [], professionalId) {

     // Per ogni specializzazione, crea e assegna la relativa entità (es. Nutritionist, Trainer, ecc.)
             for (const specialization of specializations) {
                if (specialization === PROFESSIONAL_SPECIALIZATIONS.NUTRITIONIST) {
                    const nutritionist = new Nutritionist({
                        professional: professionalId,
                    });
                    await nutritionist.save();
                }
                if (specialization === PROFESSIONAL_SPECIALIZATIONS.TRAINER) {
                    const trainer = new Trainer({
                        professional: professionalId,
                    });
                    await trainer.save();
                }
                if (specialization === PROFESSIONAL_SPECIALIZATIONS.PSYCHOLOGIST) {
                    const psychologist = new Psychologist({
                        professional: professionalId,
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