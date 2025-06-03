// Configuration
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// // Camera Service with improved error handling and state management
// const cameraService = {
//   // Internal state to track camera status
//   state: {
//     isCameraActive: false,
//     videoFeed: null,
//     lastDetectionResult: null,
//     alertHistory: []
//   },

//   /**
//    * Start the camera
//    * @returns {Promise<Object>} Camera start response
//    */
//   startCamera: async function() {
//     try {
//       console.log('CameraService: Attempting to start camera...');
      
//       // Perform health check first
//       const healthCheck = await fetch(`${BACKEND_URL}/health`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!healthCheck.ok) {
//         throw new Error('Backend server is not responding');
//       }
      
//       // Log health check response
//       const healthData = await healthCheck.json();
//       console.log('CameraService: Health check response:', healthData);
      
//       // Check if required dependencies are loaded
//       if (!healthData.dlib_loaded) {
//         throw new Error('Dlib face detection models are not loaded on the server');
//       }
      
//       // If camera is already active according to backend, sync state
//       if (healthData.camera_active) {
//         console.log('CameraService: Camera already active from health check');
//         this.state.isCameraActive = true;
//         this.state.videoFeed = `${BACKEND_URL}/video_feed`;
//         return { status: 'success', message: 'Camera already running' };
//       }
      
//       // Attempt to start camera
//       const response = await fetch(`${BACKEND_URL}/start_camera`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       // Parse response
//       const data = await response.json();
      
//       // Check if request was successful
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to start camera');
//       }
      
//       // Update internal state
//       this.state.isCameraActive = true;
//       this.state.videoFeed = `${BACKEND_URL}/video_feed`;
      
//       console.log('CameraService: Camera started successfully', data);
//       return { status: 'success', message: data.message || 'Camera started successfully' };
//     } catch (error) {
//       // Log full error details
//       console.error('CameraService: Detailed camera start error:', {
//         message: error.message,
//         stack: error.stack,
//         name: error.name
//       });
      
//       // Reset internal state
//       this.state.isCameraActive = false;
//       this.state.videoFeed = null;
      
//       // Rethrow to allow caller to handle the error
//       throw error;
//     }
//   },

//   /**
//    * Stop the camera
//    * @returns {Promise<Object>} Camera stop response
//    */
//   stopCamera: async function() {
//     try {
//       console.log('CameraService: Attempting to stop camera...');
      
//       const response = await fetch(`${BACKEND_URL}/stop_camera`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to stop camera');
//       }
      
//       // Reset internal state
//       this.state.isCameraActive = false;
//       this.state.videoFeed = null;
//       this.state.lastDetectionResult = null;
      
//       console.log('CameraService: Camera stopped successfully', data);
//       return { status: 'success', message: data.message || 'Camera stopped successfully' };
//     } catch (error) {
//       console.error('CameraService: Error stopping camera:', {
//         message: error.message,
//         stack: error.stack,
//         name: error.name
//       });
//       throw error;
//     }
//   },

//   /**
//    * Get current camera status from backend
//    * @returns {Promise<Object>} Current status
//    */
//   getCameraStatus: async function() {
//     try {
//       const response = await fetch(`${BACKEND_URL}/camera_status`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to get camera status');
//       }
      
//       // Update internal state based on backend response
//       this.state.isCameraActive = data.active;
//       if (data.active) {
//         this.state.videoFeed = `${BACKEND_URL}/video_feed`;
//       } else {
//         this.state.videoFeed = null;
//       }
      
//       return data;
//     } catch (error) {
//       console.error('CameraService: Error getting camera status:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get current frame with detection results
//    * @returns {Promise<Object>} Current frame and status
//    */
//   getCurrentFrame: async function() {
//     try {
//       const response = await fetch(`${BACKEND_URL}/current_frame`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to get current frame');
//       }
      
//       // Store last detection result
//       if (data.status !== 'INACTIVE') {
//         this.state.lastDetectionResult = {
//           status: data.status,
//           timestamp: data.timestamp
//         };
//       }
      
//       return data;
//     } catch (error) {
//       console.error('CameraService: Error getting current frame:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get alert history
//    * @returns {Promise<Array>} Alert history
//    */
//   getAlerts: async function() {
//     try {
//       const response = await fetch(`${BACKEND_URL}/alerts`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to get alerts');
//       }
      
//       this.state.alertHistory = data.alerts || [];
//       return data.alerts || [];
//     } catch (error) {
//       console.error('CameraService: Error getting alerts:', error);
//       throw error;
//     }
//   },

//   /**
//    * Clear alert history
//    * @returns {Promise<Object>} Clear alerts response
//    */
//   clearAlerts: async function() {
//     try {
//       const response = await fetch(`${BACKEND_URL}/clear_alerts`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to clear alerts');
//       }
      
//       this.state.alertHistory = [];
//       return data;
//     } catch (error) {
//       console.error('CameraService: Error clearing alerts:', error);
//       throw error;
//     }
//   },

//   /**
//    * Get the video feed URL
//    * @returns {string|null} Video feed URL or null if camera is not active
//    */
//   getVideoFeed: function() {
//     console.log('CameraService: Getting video feed', this.state.videoFeed);
//     return this.state.videoFeed;
//   },

//   /**
//    * Get the last detection result
//    * @returns {Object|null} Last detection result
//    */
//   getLastDetectionResult: function() {
//     return this.state.lastDetectionResult;
//   },

//   /**
//    * Check if camera is currently active
//    * @returns {boolean} Camera active status
//    */
//   isCameraActive: function() {
//     console.log('CameraService: Checking camera active status', this.state.isCameraActive);
//     return this.state.isCameraActive;
//   },

//   /**
//    * Get cached alert history
//    * @returns {Array} Alert history
//    */
//   getCachedAlerts: function() {
//     return this.state.alertHistory;
//   }
// };

// export { cameraService };
export async function detectDrowsiness(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:5001/api/detect', {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error('Failed to detect drowsiness');
  }
  return await response.json();
}
