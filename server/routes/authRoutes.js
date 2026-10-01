import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

// ======================================================
// REGISTER
// ======================================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      role,
      password,
      confirmPassword,
    } = req.body;

    // ------------------------------------------
    // Check required fields
    // ------------------------------------------

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ------------------------------------------
    // Validate role
    // ------------------------------------------

    const allowedRoles = ["citizen", "worker"];
    const cleanRole = role.trim().toLowerCase();

    if (!allowedRoles.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid role",
      });
    }

    // ------------------------------------------
    // Clean input
    // ------------------------------------------

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();

    // ------------------------------------------
    // Validate email
    // ------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // ------------------------------------------
    // Validate phone
    // ------------------------------------------

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number must contain exactly 10 digits",
      });
    }

    // ------------------------------------------
    // Validate address
    // ------------------------------------------

    if (cleanAddress.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid address",
      });
    }

    // ------------------------------------------
    // Validate password
    // ------------------------------------------

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      });
    }

    // ------------------------------------------
    // Confirm password
    // ------------------------------------------

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // ------------------------------------------
    // Check existing email
    // ------------------------------------------

    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // ------------------------------------------
    // Check existing phone
    // ------------------------------------------

    const existingPhone = await User.findOne({
      phone: cleanPhone,
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    // ------------------------------------------
    // Hash password
    // ------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ------------------------------------------
    // Create user in MySQL
    // ------------------------------------------

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      address: cleanAddress,
      password: hashedPassword,
      role: cleanRole,
    });

    // ==================================================
    // SEND WELCOME EMAIL
    // ==================================================

    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to EcoTrack!",
        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              color: #333333;
              line-height: 1.6;
            "
          >

            <div
              style="
                text-align: center;
                padding: 20px;
                background-color: #006948;
                border-radius: 8px 8px 0 0;
              "
            >
              <h1
                style="
                  color: white;
                  margin: 0;
                  font-size: 28px;
                "
              >
                Welcome to EcoTrack!
              </h1>
            </div>

            <div
              style="
                border: 1px solid #dddddd;
                border-top: none;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              "
            >

              <h2 style="color: #006948;">
                Hello ${user.name}!
              </h2>

              <p>
                Thank you for registering with
                <strong>EcoTrack</strong>.
              </p>

              <p>
                Your account has been successfully
                created and you are now part of the
                EcoTrack community.
              </p>

              <p>
                We are happy to have you with us.
                EcoTrack helps citizens and municipal
                workers manage waste more efficiently
                and contribute to a cleaner environment.
              </p>

              <div
                style="
                  background-color: #f4f8f6;
                  padding: 15px;
                  border-left: 4px solid #006948;
                  margin: 20px 0;
                "
              >
                <p style="margin: 0;">
                  <strong>Registered Email:</strong>
                  ${user.email}
                </p>

                <p style="margin: 5px 0 0 0;">
                  <strong>Account Role:</strong>
                  ${user.role}
                </p>
              </div>

              <p>
                Thank you for choosing EcoTrack and
                for being a part of our mission to
                keep our communities cleaner.
              </p>

              <p>
                We look forward to having you with us!
              </p>

              <p>
                Regards,<br />
                <strong>EcoTrack Team</strong>
              </p>

            </div>

          </div>
        `,
      });

      console.log(
        `Welcome email sent successfully to ${user.email}`
      );

    } catch (emailError) {

      // ------------------------------------------
      // Email error should NOT undo registration
      // ------------------------------------------

      console.error(
        "Welcome email could not be sent:",
        emailError
      );
    }

    // ------------------------------------------
    // Registration response
    // ------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });

  } catch (error) {

    console.error("Registration error:", error);

    // Handle MySQL duplicate errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message:
          "Email or phone number is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// ======================================================
// LOGIN
// ======================================================

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // ------------------------------------------
    // Check required fields
    // ------------------------------------------

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email/phone and password are required",
      });
    }

    // ------------------------------------------
    // Clean identifier
    // ------------------------------------------

    const value = identifier.trim();

    // ------------------------------------------
    // Determine email or phone
    // ------------------------------------------

    const isEmail = value.includes("@");

    let user;

    if (isEmail) {
      user = await User.findOne({
        email: value.toLowerCase(),
      });
    } else {
      user = await User.findOne({
        phone: value,
      });
    }

    // ------------------------------------------
    // User not found
    // ------------------------------------------

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password",
      });
    }

    // ------------------------------------------
    // Compare password
    // ------------------------------------------

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password",
      });
    }

    // ------------------------------------------
    // Check JWT secret
    // ------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing in .env"
      );

      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // ------------------------------------------
    // Generate JWT
    // ------------------------------------------

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ------------------------------------------
    // Login successful
    // ------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });

  } catch (error) {

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// ======================================================
// UPDATE PROFILE
// ======================================================

router.put(
  "/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        address,
      } = req.body;

      // ------------------------------------------
      // Check required fields
      // ------------------------------------------

      if (
        !name ||
        !email ||
        !phone ||
        !address
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // ------------------------------------------
      // Clean input
      // ------------------------------------------

      const cleanName = name.trim();
      const cleanEmail = email
        .toLowerCase()
        .trim();
      const cleanPhone = phone.trim();
      const cleanAddress = address.trim();

      // ------------------------------------------
      // Validate email
      // ------------------------------------------

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address",
        });
      }

      // ------------------------------------------
      // Validate phone
      // ------------------------------------------

      const phoneRegex = /^[0-9]{10}$/;

      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must contain exactly 10 digits",
        });
      }

      // ------------------------------------------
      // Validate address
      // ------------------------------------------

      if (cleanAddress.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid address",
        });
      }

      // ------------------------------------------
      // Find logged-in user
      // ------------------------------------------

      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // ------------------------------------------
      // Check duplicate email
      // ------------------------------------------

      const existingEmail =
        await User.findOne({
          email: cleanEmail,
        });

      if (
        existingEmail &&
        existingEmail._id !== user._id
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email is already registered by another user",
        });
      }

      // ------------------------------------------
      // Check duplicate phone
      // ------------------------------------------

      const existingPhone =
        await User.findOne({
          phone: cleanPhone,
        });

      if (
        existingPhone &&
        existingPhone._id !== user._id
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Phone is already registered by another user",
        });
      }

      // ------------------------------------------
      // Update profile
      // ------------------------------------------

      user.name = cleanName;
      user.email = cleanEmail;
      user.phone = cleanPhone;
      user.address = cleanAddress;

      // ------------------------------------------
      // Save to MySQL
      // ------------------------------------------

      console.log(
        "RESET TOKEN BEFORE SAVE:",
        user.resetPasswordToken
      );

      console.log(
        "RESET EXPIRY BEFORE SAVE:",
        user.resetPasswordExpires
      );

      await user.save();

      // ------------------------------------------
      // Return updated user
      // ------------------------------------------

      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
      });

    } catch (error) {

      console.error(
        "Profile update error:",
        error
      );

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          message:
            "Email or phone number is already registered",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Server error while updating profile",
      });
    }
  }
);

// ======================================================
// CHANGE PASSWORD
// ======================================================

router.put(
  "/change-password",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = req.body;

      // ------------------------------------------
      // Check required fields
      // ------------------------------------------

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All password fields are required",
        });
      }

      // ------------------------------------------
      // Check confirmation
      // ------------------------------------------

      if (
        newPassword !== confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New passwords do not match",
        });
      }

      // ------------------------------------------
      // Check password length
      // ------------------------------------------

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message:
            "New password must contain at least 8 characters",
        });
      }

      // ------------------------------------------
      // Find user
      // ------------------------------------------

      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // ------------------------------------------
      // Verify current password
      // ------------------------------------------

      const passwordMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          message:
            "Current password is incorrect",
        });
      }

      // ------------------------------------------
      // Prevent same password
      // ------------------------------------------

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from your current password",
        });
      }

      // ------------------------------------------
      // Hash new password
      // ------------------------------------------

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      // ------------------------------------------
      // Update password
      // ------------------------------------------

      user.password = hashedPassword;

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Password changed successfully",
      });

    } catch (error) {

      console.error(
        "Change password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error while changing password",
      });
    }
  }
);

// ======================================================
// FORGOT PASSWORD
// ======================================================

router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const { email } = req.body;

      // ------------------------------------------
      // Check email
      // ------------------------------------------

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      // ------------------------------------------
      // Find user in MySQL
      // ------------------------------------------

      const user = await User.findOne({
        email: normalizedEmail,
      });

      /*
        Return the same response whether
        the email exists or not.
      */

      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            "If an account exists with this email, a password reset link has been sent.",
        });
      }

      // ------------------------------------------
      // Generate reset token
      // ------------------------------------------

      const resetToken =
        crypto.randomBytes(32).toString("hex");

      // ------------------------------------------
      // Token expires in 15 minutes
      // ------------------------------------------

      const resetTokenExpiry =
        Date.now() + 15 * 60 * 1000;

      // ------------------------------------------
      // Save reset token in MySQL
      // ------------------------------------------

      user.resetPasswordToken =
        resetToken;

      user.resetPasswordExpires =
        new Date(resetTokenExpiry);

      await user.save();

      // ------------------------------------------
      // Create frontend reset URL
      // ------------------------------------------

      const resetUrl =
         `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // ------------------------------------------
      // Send reset email
      // ------------------------------------------

      await sendEmail({
        to: user.email,
        subject:
          "EcoTrack Password Reset",

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
            "
          >

            <h2 style="color: #006948;">
              EcoTrack Password Reset
            </h2>

            <p>
              Hello ${user.name},
            </p>

            <p>
              We received a request to reset
              your EcoTrack password.
            </p>

            <p>
              Click the button below to create
              a new password:
            </p>

            <p>
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 12px 20px;
                  background-color: #006948;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>
            </p>

            <p>
              This link will expire in 15 minutes.
            </p>

            <p>
              If you did not request a password
              reset, you can safely ignore this email.
            </p>

            <p>
              Regards,<br />
              EcoTrack Team
            </p>

          </div>
        `,
      });

      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });

    } catch (error) {

      console.error(
        "Forgot password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to process password reset request",
      });
    }
  }
);

// ======================================================
// RESET PASSWORD
// ======================================================

router.post(
  "/reset-password",
  async (req, res) => {
    try {
      const {
        token,
        password,
        confirmPassword,
      } = req.body;

      // ------------------------------------------
      // Check required fields
      // ------------------------------------------

      if (
        !token ||
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Token, password and confirm password are required",
        });
      }

      // ------------------------------------------
      // Check password match
      // ------------------------------------------

      if (
        password !== confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Passwords do not match",
        });
      }

      // ------------------------------------------
      // Check password length
      // ------------------------------------------

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 8 characters",
        });
      }

      // ------------------------------------------
      // Find user using reset token
      // ------------------------------------------

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: {
          $gt: new Date(),
        },
      });

      // ------------------------------------------
      // Invalid or expired token
      // ------------------------------------------

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "Password reset link is invalid or has expired",
        });
      }

      // ------------------------------------------
      // Hash new password
      // ------------------------------------------

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // ------------------------------------------
      // Update password
      // ------------------------------------------

      user.password = hashedPassword;

      // ------------------------------------------
      // Remove reset token
      // ------------------------------------------

      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      // ------------------------------------------
      // Save to MySQL
      // ------------------------------------------

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Password reset successfully. You can now login with your new password.",
      });

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reset password",
      });
    }
  }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

export default router;