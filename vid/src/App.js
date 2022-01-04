import React, { useRef, useState } from 'react';
import './App.css';
import axios from 'axios'

import * as Chime from 'amazon-chime-sdk-js';

function App() {
  const [meetingResponse, setMeetingResponse] = useState()
  const [attendeeResponse, setAttendeeResponse] = useState()
  const [callCreated, setCallCreated] = useState(false)
  const videoElement = useRef()

  const startCall = async () => {
    const response = await axios.get('http://localhost:5000/meeting')
    console.log(response)
    setMeetingResponse(response.data.meetingResponse)
    setAttendeeResponse(response.data.attendee)
    setCallCreated(true)
  }

  const joinVideoCall = async () => {

    const logger = new Chime.ConsoleLogger('ChimeMeetingLogs', Chime.LogLevel.INFO);
    const deviceController = new Chime.DefaultDeviceController(logger);
    const configuration = new Chime.MeetingSessionConfiguration(meetingResponse, attendeeResponse);
    const meetingSession = new Chime.DefaultMeetingSession(configuration, logger, deviceController);
  
    // console.log(meetingSession)
    
  const observer = {
  
    audioVideoDidStart: () => {
      meetingSession.audioVideo.startLocalVideoTile().navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
    },
    audioVideoDidStartConnecting: () => {

    },
    videoTileDidUpdate: tileState => {
      meetingSession.audioVideo.bindVideoElement(tileState.titleId, videoElement.current);
    }
  }

  meetingSession.audioVideo.addObserver(observer)
  const firstVideoDeviceId = (await meetingSession.audioVideo.listVideoInputDevices())[0].deviceId;
  await meetingSession.audioVideo.chooseAudioInputDevice(firstVideoDeviceId);
  meetingSession.audioVideo.start();
}

return (
  <div className="App">
      <header className="App-header">
        <video ref={videoElement}></video>
        <button disabled={!callCreated} onClick={joinVideoCall}> join call</button>
        <button onClick={startCall}>start call</button>
      </header>
    </div>
)
}
// import React from 'react'
// class App extends React.Component {
//   constructor(props) {
//     super(props);
//     this.myRef = React.createRef();
//   }
//   render() {
//     return <div ref={this.myRef} />;
//   }
// }

export default App