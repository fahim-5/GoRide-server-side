const mongoose = require("mongoose");

const uri = "mongodb+srv://fahimbafu_db_user:Fahim1234@cluster0.zruszch.mongodb.net/goride?retryWrites=true&w=majority";

mongoose.connect(uri, {
  ssl: true,
  tlsAllowInvalidCertificates: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB successfully!");
  process.exit(0);
})
.catch(err => {
  console.error("❌ Connection failed:", err.message);
  process.exit(1);
});
