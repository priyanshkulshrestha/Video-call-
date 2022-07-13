socket = io('/')

videoGrid = document.getElementById('video-grid');

myPeer = new Peer(undefined, {
    host: '127.0.0.1',
    secure: false,
    port: '3001'
})

myVideo = document.createElement('video')
myVideo.muted = true
var peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call',call => {
        call.answer(stream)
        video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })


    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    })

})

socket.on('user-disconnected',userId => {
    // console.log(userId);
    if(peers[userId]) peers[userId].close();
})


myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

// socket.emit('join-room',ROOM_ID, 10);

// socket.on('user-connected', userId => {
//     console.log('user conected: ' + userId);
// })


function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video');
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}