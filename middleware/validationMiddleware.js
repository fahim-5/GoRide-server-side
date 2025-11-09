import Joi from 'joi';

export const validateVehicle = (req, res, next) => {
  const schema = Joi.object({
    vehicleName: Joi.string().trim().required().min(2).max(100),
    owner: Joi.string().trim().required().min(2).max(50),
    category: Joi.string().valid('Sedan', 'SUV', 'Electric', 'Van').required(),
    pricePerDay: Joi.number().min(1).max(10000).required(),
    location: Joi.string().trim().required().min(2).max(100),
    availability: Joi.string().valid('Available', 'Booked').default('Available'),
    description: Joi.string().trim().required().min(10).max(500),
    coverImage: Joi.string().uri().required(),
    userEmail: Joi.string().email().required(),
    categories: Joi.string().valid('Electric', 'Gasoline', 'Diesel', 'Hybrid').required()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

export const validateBooking = (req, res, next) => {
  const schema = Joi.object({
    vehicleId: Joi.string().hex().length(24).required(),
    userEmail: Joi.string().email().required(),
    startDate: Joi.date().iso().greater('now').required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    notes: Joi.string().trim().max(500).optional().allow('')
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};

export const validateUser = (req, res, next) => {
  const schema = Joi.object({
    uid: Joi.string().required(),
    email: Joi.string().email().required(),
    displayName: Joi.string().trim().required().min(2).max(50),
    photoURL: Joi.string().uri().optional().allow(''),
    phoneNumber: Joi.string().trim().optional().allow(''),
    address: Joi.object({
      street: Joi.string().trim().optional().allow(''),
      city: Joi.string().trim().optional().allow(''),
      state: Joi.string().trim().optional().allow(''),
      zipCode: Joi.string().trim().optional().allow('')
    }).optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  
  next();
};