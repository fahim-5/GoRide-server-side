import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';

dotenv.config();

const newVehicles = [
  {
    vehicleName: "BMW X5",
    owner: "Mark Henry",
    category: "SUV",
    pricePerDay: 180,
    location: "Dhaka, Banani",
    availability: "Available",
    description: "Luxury SUV with powerful performance and elegant design.",
    coverImage: "https://images.unsplash.com/photo-1614607242093-98b9e5b11b5e",
    userEmail: "mark@example.com",
    createdAt: "2025-11-02T10:00:00.000Z"
  },
  {
    vehicleName: "Audi A6",
    owner: "Olivia Parker",
    category: "Sedan",
    pricePerDay: 140,
    location: "Chittagong, Nasirabad",
    availability: "Available",
    description: "Business-class luxury sedan for executive comfort.",
    coverImage: "https://images.unsplash.com/photo-1605559424843-9e4b78d7e5e4",
    userEmail: "olivia@example.com",
    createdAt: "2025-11-02T12:30:00.000Z"
  },
  {
    vehicleName: "Jeep Wrangler",
    owner: "Ethan Walker",
    category: "SUV",
    pricePerDay: 110,
    location: "Sylhet, Zindabazar",
    availability: "Available",
    description: "Adventure-ready off-roader for all terrains.",
    coverImage: "https://images.unsplash.com/photo-1605559424210-9e8b78d7e5d9",
    userEmail: "ethan@example.com",
    createdAt: "2025-11-02T14:10:00.000Z"
  },
  {
    vehicleName: "Hyundai Sonata",
    owner: "Nora Davis",
    category: "Sedan",
    pricePerDay: 70,
    location: "Rajshahi, City Point",
    availability: "Available",
    description: "Smooth, quiet ride ideal for urban travel.",
    coverImage: "https://images.unsplash.com/photo-1598133894008-4cf8e6d4c53f",
    userEmail: "nora@example.com",
    createdAt: "2025-11-02T16:20:00.000Z"
  },
  {
    vehicleName: "Kia Sportage",
    owner: "Liam Brown",
    category: "SUV",
    pricePerDay: 95,
    location: "Dhaka, Mirpur",
    availability: "Available",
    description: "Compact SUV combining performance and comfort.",
    coverImage: "https://images.unsplash.com/photo-1619534038471-89cb8193d39c",
    userEmail: "liam@example.com",
    createdAt: "2025-11-03T09:15:00.000Z"
  },
  {
    vehicleName: "Chevrolet Camaro",
    owner: "Sophia Turner",
    category: "Sedan", 
    pricePerDay: 200,
    location: "Dhaka, Bashundhara",
    availability: "Available",
    description: "High-performance car with a bold design.",
    coverImage: "https://images.unsplash.com/photo-1605559424008-9e8b78d7e5e9",
    userEmail: "sophia@example.com",
    createdAt: "2025-11-03T13:40:00.000Z"
  },
  {
    vehicleName: "Toyota Corolla Cross",
    owner: "Ismail Rahman",
    category: "SUV", 
    pricePerDay: 85,
    location: "Khulna, Khalishpur",
    availability: "Available",
    description: "Smart compact SUV with hybrid performance.",
    coverImage: "https://images.unsplash.com/photo-1605559424598-9e8b78d7e5b3",
    userEmail: "ismail@example.com",
    createdAt: "2025-11-03T15:30:00.000Z"
  },
  {
    vehicleName: "Range Rover Evoque",
    owner: "Lucas Green",
    category: "SUV", 
    pricePerDay: 190,
    location: "Dhaka, Baridhara",
    availability: "Available",
    description: "Luxury compact SUV with refined elegance.",
    coverImage: "https://images.unsplash.com/photo-1612113250639-6dbe1e994c2e",
    userEmail: "lucas@example.com",
    createdAt: "2025-11-04T09:45:00.000Z"
  },
  {
    vehicleName: "Volkswagen Golf",
    owner: "Emma Wilson",
    category: "Sedan", 
    pricePerDay: 65,
    location: "Chittagong, GEC Circle",
    availability: "Available",
    description: "Practical, modern sedan perfect for city life.",
    coverImage: "https://images.unsplash.com/photo-1605559424382-9e8b78d7e5b2",
    userEmail: "emma@example.com",
    createdAt: "2025-11-04T11:10:00.000Z"
  },
  {
    vehicleName: "Lexus RX 350",
    owner: "Ariana Blake",
    category: "SUV", 
    pricePerDay: 175,
    location: "Sylhet, Ambarkhana",
    availability: "Available",
    description: "Sophisticated SUV blending luxury and performance.",
    coverImage: "https://images.unsplash.com/photo-1605559424060-9e8b78d7e5d7",
    userEmail: "ariana@example.com",
    createdAt: "2025-11-04T14:25:00.000Z"
  }
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  console.log('--- Starting Database Seeding ---');
  await connectDB();

  try {
    // 🔹 Keep old data, only add new
    const insertedVehicles = await Vehicle.insertMany(newVehicles);
    console.log(`✨ Added ${insertedVehicles.length} new vehicles successfully!`);

    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  } catch (error) {
    console.error('❌ Data seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
