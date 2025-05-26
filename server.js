const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/votingApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'admin'],required:true

  }
});

const User = mongoose.model('User', userSchema);
const feedbackSchema = new mongoose.Schema({
  feedbackType: String,
  organization: String,
  name: String,
  email: String,
  feedbackTitle: String,
  feedbackContent: String,
  rating: Number,
  anonymous: Boolean,
  public: Boolean,
  dateSubmitted: { type: Date, default: Date.now },
});

// Create Feedback Model
const Feedback = mongoose.model('Feedback', feedbackSchema);



const voteSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  votes: [
      {
          position: { type: String, required: true },
          candidateId: { type: Number, required: true }
      }
  ]
});

const Vote = mongoose.model('Vote', voteSchema);


const nominationSchema = new mongoose.Schema({
  fullName: String,
  studentId: String,
  email: String,
  club: String,
  position: String,
  manifesto: String,
  approved: { type: Boolean, default: false } // <-- add this line
});

const Nomination = mongoose.model('Nomination', nominationSchema);

// ===================== ROUTES =====================

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.role !== role) return res.status(403).json({ message: "Role mismatch" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({ message: "Login successful", token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post('/submit-feedback', async (req, res) => {
  try {
      const feedbackData = req.body;

      // Create new feedback document
      const newFeedback = new Feedback(feedbackData);

      // Save to database
      await newFeedback.save();

      // Respond with success
      res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Failed to submit feedback. Please try again later.' });
  }
});

app.post('/submit-vote', async (req, res) => {
  const { voterId, votes } = req.body;
  console.log('Received vote submission:', req.body);  // Debugging log

  // Check if the voter already voted
  const existingVote = await Vote.findOne({ voterId });

  if (existingVote) {
      console.log("Voter has already voted.");  // Debugging log
      return res.status(400).json({ message: "You have already voted." });
  }

  // Save the vote
  const newVote = new Vote({ voterId, votes });

  try {
      await newVote.save();
      console.log("Vote saved successfully.");  // Debugging log
      res.status(200).json({ message: "Vote submitted successfully." });
  } catch (err) {
      console.error("Error saving vote:", err);  // Debugging log
      res.status(500).json({ message: "An error occurred while submitting the vote." });
  }
});

// API to get the candidates for an organization


app.post('/submit-nomination', async (req, res) => {
  try {
    const {
      fullName,
      studentId,
      email,
      club,
      position,
      manifesto,
    } = req.body;

    const nomination = new Nomination({
      fullName,
      studentId,
      email,
      club,
      position,
      manifesto,
    });

    await nomination.save();
    res.json({ message: 'Nomination saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

    
// Static file serving for images

app.post('/submit-vote', async (req, res) => {
  const { voterId, votes } = req.body;

  // Check if the voter already voted
  const existingVote = await Vote.findOne({ voterId });

  if (existingVote) {
      return res.status(400).json({ message: "You have already voted." });
  }

  // Save the vote
  const newVote = new Vote({ voterId, votes });

  try {
      await newVote.save();
      res.status(200).json({ message: "Vote submitted successfully." });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "An error occurred while submitting the vote." });
  }
});
app.get('/nominations', async (req, res) => {
  try {
    const nominations = await Nomination.find();
    res.status(200).json(nominations);
  } catch (err) {
    console.error("Error fetching nominations:", err);
    res.status(500).json({ message: "Failed to fetch nominations" });
  }
});
app.put('/nominations/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await Nomination.findByIdAndUpdate(id, { approved: true });
    res.status(200).json({ message: "Nomination approved" });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ message: "Error approving nomination" });
  }
});

// Delete a nomination
app.delete('/nominations/reject', async (req, res) => {
  try {
    const { id } = req.params;
    await Nomination.findByIdAndDelete(id);
    res.status(200).json({ message: "Nomination deleted" });
  } catch (err) {
    console.error("Deletion error:", err);
    res.status(500).json({ message: "Error deleting nomination" });
  }
});


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
