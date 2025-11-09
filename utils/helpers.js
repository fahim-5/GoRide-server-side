import { differenceInDays } from 'date-fns';

export const calculateTotalPrice = (startDate, endDate, pricePerDay) => {
  const days = differenceInDays(new Date(endDate), new Date(startDate));
  return Math.max(1, days) * pricePerDay;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateBookingId = () => {
  return `BK${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};

export const sanitizeObject = (obj, allowedFields) => {
  const sanitized = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      sanitized[key] = obj[key];
    }
  });
  return sanitized;
};

export const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    currentPage: page,
    totalPages: Math.ceil(array.length / limit),
    totalItems: array.length,
    hasNext: endIndex < array.length,
    hasPrev: page > 1
  };
};