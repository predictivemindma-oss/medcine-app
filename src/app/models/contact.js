import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  contactId: { 
    type: Number, 
    unique: true 
  },
  prenom: {
    type: String,
    required: [true, "Le prénom est requis"],
    trim: true
  },
  nom: {
    type: String,
    required: [true, "Le nom est requis"],
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  numero: {
    type: String,
    trim: true
  },
  service: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  presence: {
    type: String,
    enum: ["en cours", "confirmé", "annulé"],
    default: "en cours",
  },
    

}, {
  timestamps: true 
});

// ⚡ Middleware corrigé pour l'auto-incrémentation
contactSchema.pre("save", async function (next) {
  try {
    // Only generate contactId if it doesn't exist
    if (!this.contactId) {
      const lastContact = await mongoose.model("Contact")
        .findOne()
        .sort({ contactId: -1 })
        .select("contactId");
      
      this.contactId = lastContact ? lastContact.contactId + 1 : 1;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Export avec vérification plus robuste
let Contact;
if (mongoose.models.Contact) {
  Contact = mongoose.models.Contact;
} else {
  Contact = mongoose.model("Contact", contactSchema);
}

export default Contact;