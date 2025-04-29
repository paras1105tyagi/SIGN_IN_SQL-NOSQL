const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // MongoDB model
const SQLUser = require("../models/sql/User"); // SQL model
const { sendVerificationEmail, sendDeletionConfirmationEmail } = require("../utils/emailService");
const { 
  generateVerificationToken, 
  generateVerificationTokenExpiry,
  generateDeletionToken,
  generateDeletionTokenExpiry
} = require("../utils/tokenService");

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, email, password, age } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token and expiry
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = generateVerificationTokenExpiry();

    // Save to MongoDB
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      age,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });
    await newUser.save();

    // Save to SQL
    await SQLUser.create({ 
      username, 
      email, 
      password: hashedPassword,
      age,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, newUser._id);
    
    if (!emailSent) {
      console.warn(`Could not send verification email to ${email}. Please check email configuration.`);
      return res.status(201).json({ 
        message: "User created successfully, but verification email could not be sent. Please check your email configuration.",
        emailSent: false
      });
    }

    res.status(201).json({ 
      message: "User created successfully. Please check your email to verify your account.",
      emailSent: true
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Verify Email Route
router.get("/verify-email/:userId/:token", async (req, res) => {
  const { userId, token } = req.params;
  
  try {
    console.log(`Verification attempt for userId: ${userId}, token: ${token}`);
    
    // Find user in MongoDB
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return res.status(400).json({ message: "Invalid verification link" });
    }

    console.log(`User found: ${user.email}, isVerified: ${user.isVerified}`);
    console.log(`Stored token: ${user.verificationToken}`);
    console.log(`Token expiry: ${user.verificationTokenExpires}`);
    
    // If already verified, return success
    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified. You can now login." });
    }
    
    // Check if token is valid and not expired
    const tokenMatches = user.verificationToken === token;
    if (!tokenMatches) {
      console.log('Token mismatch');
      return res.status(400).json({ message: "Invalid verification token" });
    }
    
    const isExpired = user.verificationTokenExpires < Date.now();
    if (isExpired) {
      console.log('Token expired');
      return res.status(400).json({ message: "Verification token has expired" });
    }
    
    // Update MongoDB user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    console.log(`User verified in MongoDB: ${user.email}`);
    
    // Update SQL user
    await SQLUser.update(
      { 
        isVerified: true, 
        verificationToken: null, 
        verificationTokenExpires: null 
      },
      { 
        where: { email: user.email } 
      }
    );
    
    console.log(`User verified in SQL DB: ${user.email}`);
    
    return res.status(200).json({ message: "Email verified successfully. You can now login." });
  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ message: "Server error during email verification" });
  }
});

// Signin Route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        message: "Please verify your email before signing in.",
        isVerified: false
      });
    }

    res.status(200).json({ 
      message: "Login successful", 
      user: { username: user.username, email: user.email, isVerified: user.isVerified }
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error during signin" });
  }
});

// Request account deletion
router.post("/request-deletion", async (req, res) => {
  const { email } = req.body;
  
  try {
    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    
    // Generate deletion token and expiry
    const deletionToken = generateDeletionToken();
    const deletionTokenExpires = generateDeletionTokenExpiry();
    
    // Update MongoDB user
    user.deletionToken = deletionToken;
    user.deletionTokenExpires = deletionTokenExpires;
    await user.save();
    
    // Update SQL user 
    await SQLUser.update(
      { 
        deletionToken: deletionToken, 
        deletionTokenExpires: deletionTokenExpires 
      },
      { 
        where: { email: user.email } 
      }
    );
    
    // Send deletion confirmation email
    await sendDeletionConfirmationEmail(email, deletionToken, user._id);
    
    return res.status(200).json({ 
      message: "Account deletion request received. Please check your email to confirm." 
    });
  } catch (err) {
    console.error("Account deletion request error:", err);
    return res.status(500).json({ message: "Server error during account deletion request" });
  }
});

// Confirm account deletion
router.get("/confirm-deletion/:userId/:token", async (req, res) => {
  const { userId, token } = req.params;
  
  try {
    console.log(`Deletion confirmation attempt for userId: ${userId}, token: ${token}`);
    
    // Find user in MongoDB
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found with ID: ${userId} - may have been already deleted`);
      // This could happen if the link is clicked twice
      return res.status(400).json({ message: "Invalid deletion link" });
    }
    
    console.log(`User found: ${user.email}`);
    console.log(`Stored deletion token: ${user.deletionToken}`);
    console.log(`Token expiry: ${user.deletionTokenExpires}`);
    
    // Check if token is valid and not expired
    const tokenMatches = user.deletionToken === token;
    if (!tokenMatches) {
      console.log('Deletion token mismatch');
      return res.status(400).json({ message: "Invalid deletion token" });
    }
    
    const isExpired = user.deletionTokenExpires < Date.now();
    if (isExpired) {
      console.log('Deletion token expired');
      return res.status(400).json({ message: "Deletion token has expired" });
    }
    
    // Get email for SQL deletion
    const userEmail = user.email;
    const username = user.username;
    
    console.log(`Proceeding with deletion for user: ${username} (${userEmail})`);
    
    try {
      // Delete from MongoDB
      await User.findByIdAndDelete(userId);
      console.log(`User deleted from MongoDB: ${userEmail}`);
      
      // Delete from SQL
      const sqlResult = await SQLUser.destroy({ where: { email: userEmail } });
      console.log(`SQL deletion result: ${sqlResult} rows affected`);
      
      return res.status(200).json({ 
        message: "Account deleted successfully",
        username,
        email: userEmail
      });
    } catch (deleteErr) {
      console.error("Error during user deletion process:", deleteErr);
      return res.status(500).json({ message: "Error occurred while deleting the account" });
    }
  } catch (err) {
    console.error("Account deletion error:", err);
    return res.status(500).json({ message: "Server error during account deletion" });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  
  try {
    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    
    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    
    // Generate new verification token and expiry
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = generateVerificationTokenExpiry();
    
    // Update MongoDB user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();
    
    // Update SQL user
    await SQLUser.update(
      { 
        verificationToken: verificationToken, 
        verificationTokenExpires: verificationTokenExpires 
      },
      { 
        where: { email: user.email } 
      }
    );
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken, user._id);
    
    return res.status(200).json({ 
      message: "Verification email resent. Please check your email." 
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    return res.status(500).json({ message: "Server error during resend verification" });
  }
});

// User info endpoint - Get user by ID
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Find user in MongoDB but don't return sensitive data
    const user = await User.findById(userId).select('-password -verificationToken -deletionToken');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    return res.status(200).json({
      username: user.username,
      email: user.email,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.error("User fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
