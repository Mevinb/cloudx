/**
 * Quick script to check videos in database
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const videos = await Video.find({});
    
    console.log(`\nTotal videos in database: ${videos.length}\n`);
    
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Video ID: ${video.videoId}`);
      console.log(`   Video Source: ${video.videoSource || 'NOT SET'}`);
      console.log(`   URL: ${video.youtubeUrl}`);
      console.log(`   Is Active: ${video.isActive}`);
      console.log(`   Created: ${video.createdAt}\n`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
