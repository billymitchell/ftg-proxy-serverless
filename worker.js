const Queue = require('bull');

const jobQueue = new Queue('jobQueue', process.env.REDIS_URL);

// Process each job in the queue
jobQueue.process(async (job) => {
  console.log('Worker processing job:', job.data);
  // Simulate a task
  return new Promise((resolve) => setTimeout(resolve, 1000));
});
