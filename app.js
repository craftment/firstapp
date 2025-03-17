// app.js
let isRecording = false;
let recordedChunks = [];
let mediaRecorder;
let videoURLs = []; // 녹화된 동영상 URL을 저장할 배열
let encryptedVideos = []; // 암호화된 동영상 저장 배열

const startRecordBtn = document.getElementById('startRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const videoPlayer = document.getElementById('videoPlayer');
const buyPremiumBtn = document.getElementById('buyPremiumBtn');
const viewSecretGalleryBtn = document.getElementById('viewSecretGalleryBtn');
const secretGallery = document.getElementById('secretGallery');

const encryptionKey = '1234567890123456'; // 16 byte key (예시)

// 암호화 함수 (AES)
async function encryptVideo(blob) {
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(encryptionKey),
        { name: "AES-CBC" },
        false,
        ["encrypt"]
    );
    
    const iv = window.crypto.getRandomValues(new Uint8Array(16)); // Initialization vector
    const encryptedBlob = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv: iv },
        cryptoKey,
        blob
    );

    // 암호화된 영상 블랍
    return new Blob([new DataView(encryptedBlob)], { type: 'video/webm' });
}

// 녹화 시작
startRecordBtn.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = async (event) => {
        recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const encryptedBlob = await encryptVideo(blob);
        const videoURL = URL.createObjectURL(encryptedBlob);
        encryptedVideos.push(videoURL);  // 암호화된 영상 URL 저장
        updateSecretGallery();  // 갤러리 업데이트
        recordedChunks = [];  // 녹화된 데이터를 초기화
    };

    mediaRecorder.start();
    startRecordBtn.disabled = true;
    stopRecordBtn.disabled = false;
    isRecording = true;
});

// 녹화 종료
stopRecordBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    isRecording = false;
});

// 유료 서비스 구매
buyPremiumBtn.addEventListener('click', () => {
    alert('유료 서비스가 활성화되었습니다.');
    // 여기에 유료 서비스 로직 추가
});

// 비밀 갤러리 열기
viewSecretGalleryBtn.addEventListener('click', () => {
    secretGallery.style.display = 'flex';  // 갤러리 표시
});

// 비밀 갤러리 업데이트
function updateSecretGallery() {
    secretGallery.innerHTML = '';  // 기존 갤러리 내용 초기화
    encryptedVideos.forEach((videoURL, index) => {
        const videoThumbnail = document.createElement('div');
        videoThumbnail.classList.add('gallery-item');
        
        // 썸네일 이미지로 비디오 URL을 미리보기
        const img = document.createElement('img');
        img.src = videoURL;
        videoThumbnail.appendChild(img);

        // 클릭 시 비디오 재생
        videoThumbnail.addEventListener('click', () => {
            videoPlayer.src = videoURL;
        });

        secretGallery.appendChild(videoThumbnail);
    });
}
