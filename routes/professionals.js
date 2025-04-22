const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Professional = require('../models/discriminators/Professional');
const auth = require('../middleware/auth');
const { filterValidSpecializations, assignSpecToProfessional } = require('../helpers/SpecValidation');
const UserDevices = require('../models/UserDevices');
const UserSettings = require('../models/UserSettings');
const { USER_ROLES } = require('../constants/userRoles');
const authorizeRoles = require('../middleware/authorizedRoles');

//##### GET #####

//GET all professionals - Admin only
router.get('/', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
  try {
      const professionals = await Professional.find().select('-password');
      res.status(200).json(professionals);
  } catch (err) {
      console.error('Error retrieving professionals:', err);
      res.status(500).json({ message: 'Server error'});
  }
});

// GET one professional by ID
router.get('/professional/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Trova il professionista per ID e escludi la password dal risultato
    const professional = await Professional.findById(id).select('-password'); // '-password' esclude la password

    if (!professional) {
      return res.status(404).json({ message: 'Professionista non trovato' });
    }

    res.status(200).json(professional);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// ##### PUT #####

// PUT update professional profile
router.put('/professional/:id', async (req, res) => {
  try {
    const professionalId = req.params.id;

    //verifica che l'utente stia modificando se stesso
    if (req.user._id.toString() !== professionalId) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo profilo' });
    }

    const updatableFields = {
      firstName,
      lastName,
      gender,
      phone,
      biography,
      specializations,
      contactEmail,
      contactPhone,
      languages,
      address,
      professionalExp,
      expStartDate,
      certifications,
      profileImg,
      socialLinks
    } = req.body;

    //se nessun campo valido è presente --> errore 400
    const hasAtLeastOneField = Object.values(updatableFields).some(value=> value !== undefined);
    if (!hasAtLeastOneField) {
      return res.status(400).json({ message: 'Nessun campo valido fornito' });
    }

    const professional = await Professional.findById(professionalId);
    if (!professional) return res.status(404).json({ message: 'Professionista non trovato' });

    //aggiorna solo i campi presenti nel body
    if (firstName) professional.firstName = firstName;
    if (lastName) professional.lastName = lastName;
    if (gender) professional.gender = gender;
    if (phone) professional.phone = phone;
    if (biography) professional.biography = biography;
    if (contactEmail) professional.contactEmail = contactEmail;
    if (contactPhone) professional.contactPhone = contactPhone;
    if (languages) professional.languages = languages;
    if (address) professional.address = address;
    if (professionalExp) professional.professionalExp = professionalExp;
    if (expStartDate) professional.expStartDate = expStartDate;
    if (certifications) professional.certifications = certifications;
    if (profileImg) professional.profileImg = profileImg;
    if (socialLinks) professional.socialLinks = socialLinks;

    //gestione specializzazioni
    if (specializations && specializations.length > 0) {
      const validSpecs = filterValidSpecializations(specializations);
      professional.specializations = validSpecs;
      await assignSpecToProfessional(validSpecs, professionalId);
    }

    await professional.save();

    res.status(200).json({ message: 'Profilo aggiornato con successo', professionalId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante l'aggiornamento del profilo" });
  }
});

// PUT update password
router.put('/professional/:id/password', async (req, res) => {
  try {
    const professionalId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Fornire la vecchia password e la nuova password' });
    }

    //verifica che l'utente stia modificando se stesso
    if (req.user._id.toString() !== professionalId) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo profilo' });
    }

    const professional = await Professional.findById(professionalId);
    if (!professional) return res.status(404).json({ message: 'Professionista non trovato' });

    //verifica vecchia password
    const isMatch = await bcrypt.compare(oldPassword, professional.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Vecchia password non corretta' });
    }

    //gestione nuova password
    professional.password = newPassword;
    await professional.save();

    await UserDevices.deleteMany({user: professionalId});

    res.status(200).json({ message: 'Profilo aggiornato con successo', professionalId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante l'aggiornamento del profilo" });
  }
});

//##### DELETE #####

//DELETE professional
router.delete('/professional/:id', async (req, res) => {
  try {
    const models = {
      nutritionist: require('../models/Nutritionist'),
      trainer: require('../models/Trainer'),
      psychologist: require('../models/Psychologist')
    };
    const professionalId = req.params.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "La password è richiesta per eliminare l'account" });
    }

    if (req.user._id.toString() !== professionalId) {
      return res.status(403).json({ message: 'Non autorizzato a eliminare questo profilo' });
    }

    const professional = await Professional.findById(professionalId);
    if (!professional) return res.status(404).json({ message: 'Professionista non trovato' });

    const isMatch = await bcrypt.compare(password, professional.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password errata. Eliminazione account annullata' });
    }
     // Delete specializations
     for (let specializationName of professional.specializations) {
      const normalized = specializationName.toLowerCase();
      const Model = models[normalized];
      if (Model) {
        await Model.deleteMany({ professional: professional._id });
        console.log(`Eliminati ${normalized} per il professional ${professional._id}`);
      } else {
        console.warn(`Modello per ${normalized} non trovato`);
      }
    }

    await Professional.findByIdAndDelete(professionalId);
    await UserDevices.deleteMany({user: professionalId});
    await UserSettings.deleteMany({user: professionalId});

    res.status(200).json({ message: 'Account professionista eliminato con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante l'eliminazione dell'account" });
  }
});

module.exports = router;