module.exports = {
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', description: 'Unique identifier of the user' },
      firstName: { type: 'string', description: 'First name of the user' },
      lastName: { type: 'string', description: 'Last name of the user' },
      email: { type: 'string', description: 'Email address' },
      role: { type: 'string', description: 'User role (e.g., admin, professional, user)' },
      dateOfBirth: { type: 'string', format: 'date', description: 'Date of birth' },
      gender: { type: 'string', description: 'Gender' },
      phone: { type: 'string', description: 'Phone number' },
    },
  },

  Professional: {
    allOf: [
      { $ref: '#/components/schemas/User' },
      {
        type: 'object',
        properties: {
          specializations: { type: 'array', items: { type: 'string' } },
          contactEmail: { type: 'string' },
          pIva: { type: 'string' },
          taxCode: { type: 'string' },
          languages: { type: 'array', items: { type: 'string' } },
          expStartDate: { type: 'string', format: 'date' },
          professionalExp: { type: 'array', items: { type: 'string' } },
          certifications: { type: 'array', items: { type: 'string' } },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              cap: { type: 'string' },
              province: { type: 'string' },
              country: { type: 'string' },
            },
          },
          socialLinks: {
            type: 'object',
            properties: {
              instagram: { type: 'string' },
              linkedin: { type: 'string' },
              facebook: { type: 'string' },
              other: { type: 'string' },
            },
          },
          ambassador: {
            type: 'boolean',
            description: 'Indicates whether the professional is an ambassador',
          },
        },
      },
    ],
  },

  ClientUser: {
    allOf: [
      { $ref: '#/components/schemas/User' },
      {
        type: 'object',
        description: 'ClientUser-specific properties',
        properties: {
          healthData: {
            type: 'object',
            properties: {
              height: { type: 'number' }, 
              weight: { type: 'number' },
            },
          },
          fitnessLevel: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
          goals: {
            type: 'array',
            items: { type: 'string' },
            enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility'],
          },
          activityLevel: {
            type: 'string',
            enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
          },
          preferences: {
            type: 'array',
            items: { type: 'string' },
            enum: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
          },
          currentSports: {
            type: 'array',
            items: { type: 'string' },
          },
          competitiveLevel: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
        },
      },
    ],
  },
  

  UserDevice: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      user: { type: 'string' },
      ipAddress: { type: 'string' },
      lastAccessed: { type: 'string', format: 'date-time' },
      userAgent: { type: 'string' },
      refreshToken: { type: 'string' },
      deviceType: { type: 'string' },
      isActive: { type: 'boolean' },
    },
  },
};
