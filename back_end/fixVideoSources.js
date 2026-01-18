/**
 * Fix videoSource for existing uploaded videos
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find all videos with uploaded_ prefix but wrong videoSource
    const result = await Video.updateMany(
      { 
        videoId: /^uploaded_/,
        videoSource: { $ne: 'upload' }
      },
      { 
        $set: { videoSource: 'upload' }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} video(s) to have videoSource: 'upload'`);
    
    // Verify
    const uploadedVideos = await Video.find({ videoId: /^uploaded_/ });
    console.log(`\nTotal uploaded videos: ${uploadedVideos.length}`);
    uploadedVideos.forEach(v => {
      console.log(`- ${v.title} (Source: ${v.videoSource})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
