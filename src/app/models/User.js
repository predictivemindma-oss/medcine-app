import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// ⚠️ SUPPRIMEZ ces lignes si elles existent :
// userSchema.pre('save', function(next) {
//   if (this.isModified('password')) {
//     // Quelque chose qui modifie le password
//   }
//   next();
// });

export default mongoose.models.User || mongoose.model("User", userSchema);