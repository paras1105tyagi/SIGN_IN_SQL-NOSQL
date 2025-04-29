const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    deletionToken: { type: String },
    deletionTokenExpires: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
// Add pre-save middleware to ensure age is set
UserSchema.pre('save', function(next) {
    if (this.isNew && !this.age) {
        this.age = 0; // Set a default value if age is not provided
    }
    next();
});
