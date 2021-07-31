// 패키지 참조
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// app 생성
const app = express();

// 미들웨어 사용
app.use(express.urlencoded({ extended: false })); // url 해석
app.use(express.json()); // json 해석
app.use(express.static(path.join(__dirname + '/public'))); // 정적 파일 위치 설정

app.use(cors()); // 우선 cors 무조곤 허용

// 서버 테스트용 '/' 라우터
app.get('/', (req, res) => {
  res.json({ msg: 'OK' });
});

app.listen(4050, () => {
  console.log('4050번 포트에서 대기 중~');
});
