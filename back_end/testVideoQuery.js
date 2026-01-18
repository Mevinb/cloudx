/**
 * Test the query that the API uses
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Test the exact query used by the API
    const query = { isActive: true };
    
    console.log('\nQuery:', query);
    
    // Without populate
    const videosWithoutPopulate = await Video.find(query);
    console.log(`\nVideos found (without populate): ${videosWithoutPopulate.length}`);
    
    // With populate
    try {
      const videosWithPopulate = await Video.find(query)
        .populate('addedBy', 'name email')
        .sort({ createdAt: -1 });
      
      console.log(`Videos found (with populate): ${videosWithPopulate.length}`);
      
      videosWithPopulate.forEach((video, index) => {
        console.log(`\n${index + 1}. ${video.title}`);
        console.log(`   addedBy: ${video.addedBy || 'NULL'}`);
        console.log(`   videoId: ${video.videoId}`);
      });
    } catch (err) {
      console.error('Error with populate:', err.message);
      console.log('\nTrying without populate...');
      
      const videos = await Video.find(query).sort({ createdAt: -1 });
      console.log(`Videos found: ${videos.length}`);
      videos.forEach((video, index) => {
        console.log(`\n${index + 1}. ${video.title}`);
        console.log(`   addedBy ID: ${video.addedBy}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
