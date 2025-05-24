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
    required: ['firstName', 'lastName', 'email', 'password'],
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
          qualifications: { type: 'array', items: { $ref: '#/components/schemas/Qualification' } },
          certifications: { type: 'array', items: { $ref: '#/components/schemas/Certification' } },
          notes: { type: 'array', items: { $ref: '#/components/schemas/ProfessionalNote' } },
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
  // Definizione dello schema Qualification
Qualification: {
  type: 'object',
  properties: {
    degreeTitle: {
      type: 'string',
      description: 'Academic degree (e.g. Diploma, Bachelor\'s Degree, Master\'s Degree, PhD, etc.)',
      example: 'Master\'s Degree'
    },
    institution: {
      type: 'string',
      description: 'Name of the institution that issued the degree',
      example: 'University of Milan'
    },
    fieldOfStudy: {
      type: 'string',
      description: 'Field of study (e.g. Sport Sciences, Nutrition and Food Sciences, etc.)',
      example: 'Sport Sciences'
    },
    startDate: {
      type: 'string',
      format: 'date',
      description: 'Start date of studies',
      example: '2018-09-01'
    },
    completionDate: {
      type: 'string',
      format: 'date',
      description: 'Date when the degree was obtained',
      example: '2021-07-15'
    }
  },
  required: ['degreeTitle', 'institution', 'fieldOfStudy', 'startDate', 'completionDate']
},

// Definizione dello schema Certification
Certification: {
  type: 'object',
  properties: {
    certificationName: {
      type: 'string',
      description: 'Name of the certification',
      example: 'Personal Trainer Certification'
    },
    issuingOrganization: {
      type: 'string',
      description: 'Name of the organization that issued the certification',
      example: 'FIPE'
    },
    level: {
      type: 'string',
      description: 'Level or grade of the certification (e.g. B2, Basic Level, Professional)',
      example: 'Professional'
    },
    certificationId: {
      type: 'string',
      description: 'Official identification number of the certification',
      example: 'PT2023-1234'
    },
    certificationUrl: {
      type: 'string',
      description: 'URL link to the certification',
      example: 'https://certification-verify.org/PT2023-1234'
    },
    issueDate: {
      type: 'string',
      format: 'date',
      description: 'Date when the certification was issued',
      example: '2023-01-15'
    },
    expirationDate: {
      type: 'string',
      format: 'date',
      description: 'Expiration date of the certification (if applicable)',
      example: '2026-01-15'
    }
  },
  required: ['certificationName', 'issuingOrganization', 'issueDate']
},
ProfessionalNote: {
  type: 'object',
  required: ['title', 'content'],
  properties: {
    _id: { type: 'string' },
    title: {
      type: 'string',
      description: 'Note title'
    },
    content: {
      type: 'string',
      description: 'Note content'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Creation date of the note'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Last update date of the note'
    }
  }
},
  // 📅 Appointment schemas
  AppointmentStatus: {
    type: 'string',
    enum: ['available', 'booked', 'confirmed', 'completed', 'cancelled'],
    example: 'available'
  },
  
  Appointment: {
    type: 'object',
    required: ['title', 'startTime', 'endTime', 'professional'],
    properties: {
        _id: { type: 'string' },
        title: { 
            type: 'string',
            example: 'Group Training Session'
        },
        description: {
            type: 'string',
            example: 'High-intensity interval training for beginners'
        },
        startTime: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-20T10:00:00Z'
        },
        endTime: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-20T11:00:00Z'
        },
        professional: {
            type: 'string',
            description: 'Professional ID'
        },
        participants: {
            type: 'array',
            items: {
                type: 'string',
                description: 'User ID'
            }
        },
        maxParticipants: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 10
        },
        status: { $ref: '#/components/schemas/AppointmentStatus' },
        price: {
            type: 'number',
            minimum: 0,
            example: 50.00
        },
        
        // Recurring appointment fields
        isRecurring: {
            type: 'boolean',
            default: false
        },
        recurrencePattern: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly']
        },
        recurrenceInterval: {
            type: 'integer',
            minimum: 1,
            default: 1
        },
        recurrenceEndDate: {
            type: 'string',
            format: 'date-time'
        },
        daysOfWeek: {
            type: 'array',
            items: {
                type: 'integer',
                minimum: 0,
                maximum: 6
            }
        },
        meetingLink: {
            type: 'string',
            format: 'uri',
            example: 'https://meet.stronguru.com/session/123'
        }
    }
  },
  
  CreateAppointmentSlot: {
    type: 'object',
    required: ['title', 'startTime', 'endTime'],
    properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
        maxParticipants: { type: 'integer', minimum: 1, maximum: 100 },
        price: { type: 'number', minimum: 0 },
        
        // Recurring appointment fields
        isRecurring: { type: 'boolean' },
        recurrencePattern: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly']
        },
        recurrenceInterval: {
            type: 'integer',
            minimum: 1
        },
        recurrenceEndDate: {
            type: 'string',
            format: 'date-time'
        },
        daysOfWeek: {
            type: 'array',
            items: {
                type: 'integer',
                minimum: 0,
                maximum: 6
            }
        }
    }
  },
  
  UpdateAppointmentStatus: {
    type: 'object',
    required: ['status'],
    properties: {
        status: { $ref: '#/components/schemas/AppointmentStatus' }
    }
  }
};

