const { patch } = require("../modules/professionals/routes");

module.exports = {
  '/professionals': {
    get: {
      summary: 'Retrieve all registered professionals',
      tags: ['Professional'],
      description: 'Returns a list of all professionals.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of professionals successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Professional' },
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/professionals/{id}': {
    get: {
      summary: 'Get professional by ID (excluding password)',
      tags: ['Professional'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        }
      ],
      responses: {
        200: {
          description: 'Professional successfully retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Professional' },
            },
          },
        },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' },
      },
    },

    patch: {
      summary: 'Update professional profile (excluding password)',
      tags: ['Professional'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { $ref: '#/components/schemas/Phone' },
                gender: { $ref: '#/components/schemas/Gender' },
                contactEmail: {
                  type: 'string',
                  format: 'email',
                  example: 'studio@pro.it',
                },
                contactPhone: { type: 'string', example: '+393331112233' },
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
                languages: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['it', 'en'],
                },
                qualifications: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Qualification' }
                },
                certifications: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Certification' }
                },
                socialLinks: {
                  type: 'object',
                  properties: {
                    instagram: { type: 'string', example: 'https://instagram.com/pro' },
                    linkedin: { type: 'string' },
                    facebook: { type: 'string' },
                    other: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Professional profile updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  professionalId: { type: 'string' },
                },
              },
            },
          },
        },
        400: { description: 'Bad request - Invalid data' },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to update this profile' },
        404: { description: 'Professional not found' },
        422: { description: 'Validation error' },
        500: { description: 'Internal server error' },
      },
    },

    delete: {
      summary: 'Delete professional account',
      tags: ['Professional'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['password'],
              properties: {
                password: {
                  type: 'string',
                  description: 'Current password for confirmation'
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Account deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid or password mismatch' },
        403: { description: 'Forbidden – Not authorized to delete this account' },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/professionals/{professionalId}/qualifications': {
    get: {
      summary: 'Get all qualifications for a professional',
      tags: ['Professional Qualifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
      ],
      responses: {
        200: {
          description: 'List of qualifications successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Qualification',
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to view these qualifications' },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' },
      },
    },
    post: {
      summary: 'Add a new qualification for a professional',
      tags: ['Professional Qualifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Qualification',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Qualification added successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Qualification',
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to add qualifications for this professional' },
        404: { description: 'Professional not found' },
        422: { description: 'Validation error' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/professionals/{professionalId}/qualifications/{qualificationId}': {
    get: {
      summary: 'Get a specific qualification by ID',
      tags: ['Professional Qualifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
        {
          name: 'qualificationId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Qualification's ID",
        },
      ],
      responses: {
        200: {
          description: 'Qualification successfully retrieved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Qualification',
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to view this qualification' },
        404: { description: 'Professional or qualification not found' },
        500: { description: 'Internal server error' },
      },
    },
    put: {
      summary: 'Update a specific qualification',
      tags: ['Professional Qualifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
        {
          name: 'qualificationId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Qualification's ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Qualification',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Qualification updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Qualification',
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to update this qualification' },
        404: { description: 'Professional or qualification not found' },
        422: { description: 'Validation error' },
        500: { description: 'Internal server error' },
      },
    },
    delete: {
      summary: 'Delete a specific qualification',
      tags: ['Professional Qualifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
        {
          name: 'qualificationId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Qualification's ID",
        },
      ],
      responses: {
        200: {
          description: 'Qualification deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to delete this qualification' },
        404: { description: 'Professional or qualification not found' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/professionals/{professionalId}/certifications': {
    get: {
      summary: 'Get all certifications for a professional',
      tags: ['Professional Certifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
      ],
      responses: {
        200: {
          description: 'List of certifications successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Certification',
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to view these certifications' },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' },
      },
    },
    post: {
      summary: 'Add a new certification for a professional',
      tags: ['Professional Certifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Certification',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Certification added successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Certification',
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to add certifications for this professional' },
        404: { description: 'Professional not found' },
        422: { description: 'Validation error' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/professionals/{professionalId}/certifications/{certificationId}': {
    get: {
      summary: 'Get a specific certification by ID',
      tags: ['Professional Certifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
        {
          name: 'certificationId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Certification's ID",
        },
      ],
      responses: {
        200: {
          description: 'Certification successfully retrieved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Certification',
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to view this certification' },
        404: { description: 'Professional or certification not found' },
        500: { description: 'Internal server error' },
      },
    },
    put: {
      summary: 'Update a specific certification',
      tags: ['Professional Certifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
        {
          name: 'certificationId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Certification's ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Certification',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Certification updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Certification',
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to update this certification' },
        404: { description: 'Professional or certification not found' },
        422: { description: 'Validation error' },
        500: { description: 'Internal server error' },
      },
    },
    delete: {
      summary: 'Delete a specific certification',
      tags: ['Professional Certifications'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
        {
          name: 'certificationId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Certification's ID",
        },
      ],
      responses: {
        200: {
          description: 'Certification deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Not authorized to delete this certification' },
        404: { description: 'Professional or certification not found' },
        500: { description: 'Internal server error' },
      },
    },
  },
  '/professionals/{professionalId}/notes': {
    get: {
      summary: 'Get all personal notes',
      tags: ['Professional Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID"
        }
      ],
      responses: {
        200: {
          description: 'List of personal notes successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/ProfessionalNote' }
              }
            }
          }
        },
        401: { description: 'Unauthorized - JWT missing or invalid' },
        403: { description: 'Forbidden - User not authorized to access these notes' },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' }
      }
    },
    post: {
      summary: 'Create a new personal note',
      tags: ['Professional Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID"
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'content'],
              properties: {
                title: {
                  type: 'string',
                  description: 'Note title'
                },
                content: {
                  type: 'string',
                  description: 'Note content'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Personal note created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfessionalNote' }
            }
          }
        },
        401: { description: 'Unauthorized - JWT missing or invalid' },
        403: { description: 'Forbidden - User not authorized to create notes' },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' }
      }
    }
  },

  '/professionals/{professionalId}/notes/{noteId}': {
    get: {
      summary: 'Get a specific personal note',
      tags: ['Professional Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID"
        },
        {
          name: 'noteId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Note ID'
        }
      ],
      responses: {
        200: {
          description: 'Personal note successfully retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfessionalNote' }
            }
          }
        },
        401: { description: 'Unauthorized - JWT missing or invalid' },
        403: { description: 'Forbidden - User not authorized to access this note' },
        404: { description: 'Professional or note not found' },
        500: { description: 'Internal server error' }
      }
    },
    put: {
      summary: 'Update a personal note',
      tags: ['Professional Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID"
        },
        {
          name: 'noteId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Note ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Note title'
                },
                content: {
                  type: 'string',
                  description: 'Note content'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Personal note updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfessionalNote' }
            }
          }
        },
        401: { description: 'Unauthorized - JWT missing or invalid' },
        403: { description: 'Forbidden - User not authorized to update this note' },
        404: { description: 'Professional or note not found' },
        500: { description: 'Internal server error' }
      }
    },
    delete: {
      summary: 'Delete a personal note',
      tags: ['Professional Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'professionalId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID"
        },
        {
          name: 'noteId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Note ID'
        }
      ],
      responses: {
        204: { description: 'Personal note deleted successfully' },
        401: { description: 'Unauthorized - JWT missing or invalid' },
        403: { description: 'Forbidden - User not authorized to delete this note' },
        404: { description: 'Professional or note not found' },
        500: { description: 'Internal server error' }
      }
    }
  }
};