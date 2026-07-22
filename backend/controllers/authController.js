const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../config/mailer");

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

async function register(req, res) {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or username already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Role is never taken from the request body — every self-registration is a
    // student. Instructor/admin access can only be granted afterwards by an
    // existing admin via updateUserRole.
    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: "student",
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong during registration." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const identifier = (email || "").toString().trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide email/username and password." });
    }

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong during login." });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch your profile." });
  }
}

async function updateMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const {
      firstName, lastName, phone, skill, bio, avatarUrl, coverPhotoUrl, displayName, email, username,
      socialLinks, bankDetails, billingAddress,
    } = req.body;

    if (email !== undefined && email !== user.email) {
      const trimmedEmail = email.trim().toLowerCase();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmedEmail)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
      }
      const existing = await User.findOne({ email: trimmedEmail });
      if (existing && existing._id.toString() !== req.userId) {
        return res.status(400).json({ message: "That email is already in use by another account." });
      }
      user.email = trimmedEmail;
    }

    if (username !== undefined && username !== user.username) {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters." });
      }
      const usernamePattern = /^[a-zA-Z0-9_.]+$/;
      if (!usernamePattern.test(trimmedUsername)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, underscores, and periods." });
      }
      const existing = await User.findOne({ username: trimmedUsername });
      if (existing && existing._id.toString() !== req.userId) {
        return res.status(400).json({ message: "That username is already taken." });
      }
      user.username = trimmedUsername;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (skill !== undefined) user.skill = skill;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (coverPhotoUrl !== undefined) user.coverPhotoUrl = coverPhotoUrl;
    if (displayName !== undefined) user.displayName = displayName;
    if (socialLinks !== undefined) {
      user.socialLinks = { ...(user.socialLinks?.toObject?.() || user.socialLinks || {}), ...socialLinks };
    }
    if (bankDetails !== undefined) {
      user.bankDetails = { ...(user.bankDetails?.toObject?.() || user.bankDetails || {}), ...bankDetails };
    }
    if (billingAddress !== undefined) {
      user.billingAddress = { ...(user.billingAddress?.toObject?.() || user.billingAddress || {}), ...billingAddress };
    }

    await user.save();

    const { password, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update your profile." });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide your current and new password." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update your password." });
  }
}

async function forgotPassword(req, res) {
  try {
    const email = (req.body.email || "").toString().trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Please provide your email address." });
    }

    const user = await User.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (mailError) {
        console.error("Failed to send password reset email:", mailError.message);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.status(500).json({ message: "Could not send the reset email. Please try again later." });
      }
    }

    // Always respond the same way, whether or not the email exists, so we don't leak account info.
    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Your password has been reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not reset your password." });
  }
}

module.exports = { register, login, getMe, updateMe, changePassword, forgotPassword, resetPassword };