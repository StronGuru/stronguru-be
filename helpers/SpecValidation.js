const SPECIALIZATION_MODELS = require("./roleModelMap")
const { PROFESSIONAL_SPECIALIZATIONS } = require('../constants/professionalSpecializations');

/**
 * Verifica se una specializzazione è valida (case insensitive, trim)
 * @param {string} specialization
 * @returns {boolean}
 */
function isValidSpecialization(specialization) {
    if (typeof specialization !== 'string' || specialization.length == 0) return false;
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
              console.log(specialization);
                const Model = SPECIALIZATION_MODELS[specialization];
                console.log(Model);

                if (!Model) {
                    console.warn(`Specializzazione non gestita: ${specialization}`);
                    continue;
                }

                const exists = await Model.findOne({ professional: professionalId});
                if (!exists) {
                    await new Model({ professional: professionalId}).save();
                } else {
                    console.log(`Già esistente: ${specialization} per professional ${professionalId}`);
                }
            }

}

module.exports = {
  isValidSpecialization,
  filterValidSpecializations,
  assignSpecToProfessional
};