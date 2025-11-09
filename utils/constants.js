export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const VEHICLE_CATEGORIES = ['Sedan', 'SUV', 'Electric', 'Van'];
export const VEHICLE_TYPES = ['Electric', 'Gasoline', 'Diesel', 'Hybrid'];
export const AVAILABILITY_STATUS = ['Available', 'Booked'];
export const BOOKING_STATUS = ['pending', 'confirmed', 'cancelled'];
export const USER_ROLES = ['user', 'admin'];

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 100
};

export const CORS_OPTIONS = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};