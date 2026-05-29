import { BlobBackground } from './blob-background.js';

window.addEventListener('DOMContentLoaded', () => {
  // Initialize the reusable bubble background on the #gl container
  new BlobBackground({
    container: '#gl',
  });
});
