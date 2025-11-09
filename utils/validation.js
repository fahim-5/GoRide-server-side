import Joi from 'joi';

export const vehicleValidationSchema = Joi.object({
  vehicleName: Joi.string().trim().required().min(2).max(100),
  owner: Joi.string().trim().required().min(2).max(50),
  category: Joi.string().valid('Sedan', 'SUV', 'Electric', 'Van').required(),
  pricePerDay: Joi.number().min(1).max(10000).required(),
  location: Joi.string().trim().required().min(2).max(100),
  availability: Joi.string().valid('Available', 'Booked').default('Available'),
  description: Joi.string().trim().required().min(10).max(1000),
  coverImage: Joi.string().uri().required(),
  userEmail: Joi.string().email().required(),
  categories: Joi.string().valid('Electric', 'Gasoline', 'Diesel', 'Hybrid').required()
});

export const bookingValidationSchema = Joi.object({
  vehicleId: Joi.string().hex().length(24).required(),
  userEmail: Joi.string().email().required(),
  startDate: Joi.date().greater('now').required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  notes: Joi.string().trim().max(500).allow('')
});

export const userValidationSchema = Joi.object({
  displayName: Joi.string().trim().min(2).max(50),
  phoneNumber: Joi.string().trim().pattern(/^\+?[\d\s-()]+$/),
  address: Joi.object({
    street: Joi.string().trim().max(100),
    city: Joi.string().trim().max(50),
    state: Joi.string().trim().max(50),
    zipCode: Joi.string().trim().max(20)
  })
});

export const authValidationSchema = Joi.object({
  token: Joi.string().required()
});

export const validateObject = (schema, object) => {
  return schema.validate(object, { abortEarly: false });
};