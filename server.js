// server.js - 백엔드 서버 코드
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// CORS 설정 (프론트엔드와 백엔드가 다른 도메인에 있는 경우)
app.use(cors());

// JSON 파싱 미들웨어
app.use(express.json());

// 정적 파일 제공 (프론트엔드 파일을 백엔드와 함께 배포하는 경우)
app.use(express.static(path.join(__dirname, 'public')));

// 파일 저장 경로
const dataDir = path.join(__dirname, 'data');
const csvFilePath = path.join(dataDir, 'seongbhin.csv');
const lastUpdateFilePath = path.join(dataDir, 'lastUpdate.json');

// 데이터 디렉토리 생성
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 마지막 업데이트 시간 초기화 (파일이 없는 경우)
if (!fs.existsSync(lastUpdateFilePath)) {
  fs.writeFileSync(lastUpdateFilePath, JSON.stringify({ timestamp: new Date().toISOString() }));
}

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dataDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'seongbhin.csv');
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // CSV 파일만 허용
    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      return cb(new Error('CSV 파일만 업로드 가능합니다.'), false);
    }
    cb(null, true);
  }
});

// CSV 파일을 JSON으로 변환하는 함수
async function csvToJson(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    // 파일이 존재하는지 확인
    if (!fs.existsSync(filePath)) {
      return reject(new Error('CSV 파일이 존재하지 않습니다.'));
    }
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// 마지막 업데이트 시간 갱신 함수
function updateLastUpdateTime() {
  const updateInfo = {
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(lastUpdateFilePath, JSON.stringify(updateInfo));
}

// 마지막 업데이트 시간 가져오기
function getLastUpdateTime() {
  try {
    const data = fs.readFileSync(lastUpdateFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('업데이트 시간 읽기 오류:', error);
    return { timestamp: new Date().toISOString() };
  }
}

// API 라우트

// 데이터 가져오기
app.get('/api/data', async (req, res) => {
  try {
    const data = await csvToJson(csvFilePath);
    res.json({ data });
  } catch (error) {
    console.error('데이터 읽기 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 파일 업로드
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '업로드된 파일이 없습니다.' });
    }
    
    // 마지막 업데이트 시간 갱신
    updateLastUpdateTime();
    
    res.json({
      message: '파일이 성공적으로 업로드되었습니다.',
      file: req.file.originalname
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 마지막 업데이트 시간 가져오기
app.get('/api/lastUpdate', (req, res) => {
  const updateInfo = getLastUpdateTime();
  res.json(updateInfo);
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});