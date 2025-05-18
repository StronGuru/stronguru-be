module.exports = {
  // 🔑 Shared schema fragments
  Password: {
    type: 'string',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$',
    description: 'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    example: 'MyP@ssword123',
  },

  Gender: {
    type: 'string',
    enum: ['male', 'female', 'other'],
    example: 'female',
  },

  DateOfBirth: {
    type: 'string',
    format: 'date',
    example: '1990-01-01',
  },

  Phone: {
    type: 'string',
    example: '+393334445556',
    description: 'User phone number',
  },

  // 👤 Base user schema
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      dateOfBirth: { $ref: '#/components/schemas/DateOfBirth' },
      gender: { $ref: '#/components/schemas/Gender' },
      phone: { $ref: '#/components/schemas/Phone' },
    },
  },

  // 🧑‍⚕️ Professional
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
          ambassador: { type: 'boolean' },
        },
      },
    ],
  },

  // 🧘 ClientUser
  ClientUser: {
    allOf: [
      { $ref: '#/components/schemas/User' },
      {
        type: 'object',
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

  // 💻 UserDevice
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

  // ⚙️ UserSettings
  UserSettings: {
    type: 'object',
    properties: {
      user: { type: 'string' },
      darkmode: { type: 'boolean' },
      language: {
        type: 'string',
        enum: ['en', 'it', 'de', 'fr'],
      },
      dateTimeFormat: {
        type: 'string',
        enum: ['12h', '24h'],
      },
      timeZone: { type: 'string' },
    },
  },
};
