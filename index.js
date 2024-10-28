const Queue = require('bull');
const express = require('express');
const app = express();

// Create a queue for processing jobs
const jobQueue = new Queue('jobQueue', process.env.REDIS_URL);

// Define a processor to handle each job in the queue
jobQueue.process(async (job) => {
  // Perform task with job data
  console.log('Processing job:', job.data);
  // Simulate a task
  return new Promise((resolve) => setTimeout(resolve, 1000));
});

// Add new jobs to the queue when receiving a request
app.post('/add-job', (req, res) => {
  const jobData = { task: 'Example job data' };
  jobQueue.add(jobData); // Add a job to the queue with `jobData`
  res.json({ status: 'Job added to queue' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
