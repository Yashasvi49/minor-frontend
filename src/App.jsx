// import './App.css';
// import Sidebar from './components/Sidebar';
// import CameraArea from './components/CameraArea';
// import StatusPanel from './components/StatusPanel';
// import Controls from './components/Controls';
// import Notes from './pages/Notes';
// import History from './pages/History';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// function App() {
//   return (
//     <Router>
//       <div className="app">
//         <Sidebar />
//         <Routes>
//           <Route 
//             path="/notes" 
//             element={<Notes />} 
//           />
//           <Route 
//             path="/history" 
//             element={<History />} 
//           />
//           <Route 
//             path="/" 
//             element={
//               <>
//                 <CameraArea />
//                 <div className="right-panel">
//                   <div className="right-top-panel">
//                     <StatusPanel />
//                   </div>
//                   <div className="right-bottom-panel">
//                     <Controls />
//                   </div>
//                 </div>
//               </>
//             } 
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
// import './App.css';
// import { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import Sidebar from './components/Sidebar';
// import CameraArea from './components/CameraArea';
// import StatusPanel from './components/StatusPanel';
// import Controls from './components/Controls';
// import Notes from './pages/Notes';
// import History from './pages/History';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// function App() {
//   const [cameraActive, setCameraActive] = useState(false);
//   const [currentStatus, setCurrentStatus] = useState('INACTIVE');
//   const [socket, setSocket] = useState(null);
//   const [alertHistory, setAlertHistory] = useState([]);

//   useEffect(() => {
//     // Initialize socket connection
//     const newSocket = io('http://localhost:5000');
//     setSocket(newSocket);

//     // Listen for status updates
//     newSocket.on('status_update', (data) => {
//       setCurrentStatus(data.status);
      
//       // Add to alert history if it's a drowsy or sleeping alert
//       if (data.status === 'DROWSY' || data.status === 'SLEEPING') {
//         const alertTime = new Date(data.timestamp * 1000).toLocaleTimeString('en-US', {
//           hour12: false,
//           hour: '2-digit',
//           minute: '2-digit'
//         });
        
//         setAlertHistory(prev => [...prev, {
//           id: Date.now(),
//           type: data.status,
//           time: alertTime,
//           timestamp: data.timestamp
//         }]);
//       }
//     });

//     // Cleanup on unmount
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   const startCamera = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/start_camera', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         setCameraActive(true);
//         setCurrentStatus('STARTING');
//         console.log('Camera started successfully');
//       } else {
//         console.error('Failed to start camera:', result.message);
//         alert('Failed to start camera: ' + result.message);
//       }
//     } catch (error) {
//       console.error('Error starting camera:', error);
//       alert('Error starting camera. Make sure the backend server is running.');
//     }
//   };

//   const stopCamera = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/stop_camera', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         setCameraActive(false);
//         setCurrentStatus('INACTIVE');
//         console.log('Camera stopped successfully');
//       } else {
//         console.error('Failed to stop camera:', result.message);
//       }
//     } catch (error) {
//       console.error('Error stopping camera:', error);
//     }
//   };

//   return (
//     <Router>
//       <div className="app">
//         <Sidebar />
//         <Routes>
//           <Route  
//             path="/notes" 
//             element={<Notes />} 
//           />
//           <Route  
//             path="/history" 
//             element={<History alertHistory={alertHistory} />} 
//           />
//           <Route  
//             path="/" 
//             element={
//               <>
//                 <CameraArea 
//                   cameraActive={cameraActive} 
//                   currentStatus={currentStatus}
//                 />
//                 <div className="right-panel">
//                   <div className="right-top-panel">
//                     <StatusPanel 
//                       currentStatus={currentStatus}
//                       alertHistory={alertHistory.slice(-4)} // Show last 4 alerts
//                     />
//                   </div>
//                   <div className="right-bottom-panel">
//                     <Controls 
//                       cameraActive={cameraActive}
//                       onStartCamera={startCamera}
//                       onStopCamera={stopCamera}
//                     />
//                   </div>
//                 </div>
//               </>
//             } 
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
// 
import './App.css';
import Sidebar from './components/Sidebar';
import CameraArea from './components/CameraArea';
import StatusPanel from './components/StatusPanel';
import Controls from './components/Controls';
import Notes from './pages/Notes';
import History from './pages/History';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

function App() {
  const [cameraActive, setCameraActive] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('INACTIVE');
  const [alertSound, setAlertSound] = useState(null);
  const [processedImageData, setProcessedImageData] = useState(null);
  const intervalRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const sleepStartTime = useRef(null);
  const audioIntervalRef = useRef(null);

  // Initialize alert sound
  useEffect(() => {
    const audio = new Audio();
    audio.src = '/sleeping.mp3';
    audio.preload = 'auto';
    audio.loop = true; // Make the sound loop
    setAlertSound(audio);

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Handle sleep detection with 5-second threshold
  useEffect(() => {
    if (currentStatus === 'SLEEPING !!!') {
      if (!sleepStartTime.current) {
        sleepStartTime.current = Date.now();
        sleepTimerRef.current = setTimeout(() => {
          if (alertSound) {
            alertSound.play().catch(e => console.log('Could not play alert sound:', e));
            
            // Create a visual alert
            const visualAlert = () => {
              document.body.style.backgroundColor = document.body.style.backgroundColor === 'red' ? '#242424' : 'red';
            };
            
            // Flash the screen every 500ms
            audioIntervalRef.current = setInterval(visualAlert, 500);
          }
        }, 5000);
      }
    } else {
      // Clear all alerts when not sleeping
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      if (alertSound) {
        alertSound.pause();
        alertSound.currentTime = 0;
      }
      document.body.style.backgroundColor = '#242424'; // Reset background color
      sleepStartTime.current = null;
    }

    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
      if (alertSound) {
        alertSound.pause();
        alertSound.currentTime = 0;
      }
      document.body.style.backgroundColor = '#242424';
    };
  }, [currentStatus, alertSound]);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      setCurrentStatus('ACTIVE');

      // Start continuous processing
      intervalRef.current = setInterval(async () => {
        const webcamElement = document.querySelector('video');
        if (!webcamElement) return;

        const canvas = document.createElement('canvas');
        canvas.width = webcamElement.videoWidth;
        canvas.height = webcamElement.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(webcamElement, 0, 0);
        
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
        
        const formData = new FormData();
        formData.append('image', blob);

        try {
          const response = await fetch('http://localhost:5001/api/detect', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('API response:', data);
          
          setCurrentStatus(data.status || 'UNKNOWN');
          if (data.image) {
            setProcessedImageData(data.image);
          }
        } catch (error) {
          console.error('API error:', error);
          setCurrentStatus('DETECTION_ERROR');
        }
      }, 3000);

    } catch (error) {
      console.error('Camera error:', error);
      setCurrentStatus('CAMERA_ERROR');
      alert(`Could not access camera: ${error.message}`);
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    setCameraActive(false);
    setCurrentStatus('INACTIVE');
    setProcessedImageData(null);
    sleepStartTime.current = null;
  };

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <Routes>
          <Route 
            path="/notes" 
            element={<Notes />} 
          />
          <Route 
            path="/history" 
            element={<History />} 
          />
          <Route 
            path="/" 
            element={
              <>
                <CameraArea 
                  cameraActive={cameraActive}
                  currentStatus={currentStatus}
                  processedImageData={processedImageData}
                />
                <div className="right-panel">
                  <div className="right-top-panel">
                    <StatusPanel 
                      currentStatus={currentStatus}
                      cameraActive={cameraActive}
                    />
                  </div>
                  <div className="right-bottom-panel">
                    <Controls 
                      cameraActive={cameraActive}
                      onStartCamera={startCamera}
                      onStopCamera={stopCamera}
                    />
                  </div>
                </div>
              </>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;