// userRoute.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Schemas/userSchema');

// Search users endpoint 
// http://localhost:3000/api/users/find?q=John
router.get('/find', async (req, res) => {
  try {
    try {
      const searchString = req.query.q;
      // Use regex to find users matching the search string across all fields

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find({
        $or: [
          { name: { $regex: searchString, $options: 'i' } },
          { email: { $regex: searchString, $options: 'i' } },
          { mobile: { $regex: searchString, $options: 'i' } },
          { gender: { $regex: searchString, $options: 'i' } },
          { city: { $regex: searchString, $options: 'i' } },
          { skills: { $regex: searchString, $options: 'i' } },
          { socialmediaurl: { $regex: searchString, $options: 'i' } }
          // Uses $regex operator in MongoDB to perform a case-insensitive regex search ($options: 'i') across multiple fields (name, email, mobile, etc.).
          // The $or operator allows searching across multiple fields and returns users that match any of the conditions.
        ]
      });

      res.status(200).json({
        page,
        limit,
        users
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//  find by id 
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get paginated users endpoint
// http://localhost:3000/api/users?page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      users
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Filter users endpoint 
// http://localhost:3000/api/users/filter

router.post('/filter', async (req, res) => {
  try {
    const filter = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  

    // Convert filter values to regex for partial and case-insensitive matching
    const query = {};
    for (const key in filter) {
      if (filter[key]) {
        query[key] = new RegExp(filter[key], 'i');
      }
    }

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      page,
      limit,
      users
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get all user
// http://localhost:3000/api/users
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find();
    res.status(200).json({
      page,
      limit,
      users
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      ...req.body,
      password: hashedPassword
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the email is being updated and if it is unique
    if (req.body.email && req.body.email !== user.email) {

      const existingUser = await User.findOne({ email: req.body.email });

      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Hash the password if it's being updated
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Update user details
    Object.keys(req.body).forEach(key => {
      user[key] = req.body[key];
    });

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Find the user by ID and delete
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;