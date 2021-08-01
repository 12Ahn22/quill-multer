# 🔮 Quill 에디터에 이미지 넣기

Quill 에디터로 게시판을 만들 때, 이미지 파일을 처리하는 방법을 정리한 레포지토리이다.

팀 프로젝트를 진행하면서 에디터에서 이미지를 어떻게 저장해야하는 지 너무너무 고생했기 때문에 이렇게 글로 남기고 싶었다.

<br/>

## 왜 이미지를 따로 처리할까?

Quill 에디터에 이미지를 업로드하면 해당 이미지는 **base64**로 변경되어 `<img src='엄청나게 긴 base64 문자열'/>`구조로 에디터 콘텐츠로 존재한다.

에디터 위의 버튼을 클릭하면 현재 **에디터 안에 있는 내용** = **데이터베이스**에 저장할 게시글 콘텐츠를 콘솔창에 출력한다.

<img src="https://user-images.githubusercontent.com/44540726/127743774-791df9bd-a60b-4ccd-8b9f-5a8d39afa70e.png"
       style=" margin:0px auto">

  <p style="font-size:14px; color:#888">
    에디터에 이미지를 올려봤다. <br/>영화- 스탈린이 죽었다. <span style="font-size:10px">제발 봐주세요.🤣</span>
  </p>

**✋ 이게 얼마나 기냐면...**

<img src="https://user-images.githubusercontent.com/44540726/127744036-a12c1435-ad9a-4974-a55b-6e2fda3d6e70.png"
       style=" margin:0px auto">

  <p style="text-align:center; font-size:14px; color:#888">
    ^^..엄청난 base64.. 심지어 Show more..
  </p>

얘를 데이터베이스(MySQL)에 저장하려고하면 데이터베이스가 몹시 놀란다.

너무 길어서 저장되지않는다. 만약 저장이 되더라도 사진 한장이 저정도 길이인데 사진이 여러장이면 ...생각만해도 낭비다.

<br/>

## 그러니 src에 base64가 아니라 URL을 쓰자

자세히 보면 img태그의 src에 base64가 들어있는 걸 알 수있다.

이 base64를 URL로 바꿔 사용한다면 저런 괴랄한 길이의 콘텐츠를 데이터베이스에 저장하는 것이 아니라 짧고 예쁜 HTML 코드를 저장할 수 있을 것이다.

<br/>

## 한번 해보기

### 해야할 것

1. 이미지를 백엔드에 저장한다.
2. 백엔드에 저장한 이미지를 URL로 접근할 수 있도록 한다.
3. 이미지 URL을 에디터의 base64와 바꿔준다.

> 그냥 어딘가에 저장하고 URL만 가져올 수 있으면된다.

> 여기서는 express를 사용해 직접 이미지를 저장하는 백엔드 서버를 만드는 방법을 사용한다.

### 필요한 것

- 이미지를 백엔드에 업로드하기 위한 패키지 `multer`
- 어떻게 에디터 img태그 src값을 변경할 것인지

### 백엔드 세팅하기

_**전체 코드**_

```js
// 패키지 참조
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// app 생성
const app = express();

// 미들웨어 사용
app.use(express.json()); // json 데이터 파서
app.use(express.urlencoded({ extended: false })); // 내부 url 파서 사용
app.use(express.static(path.join(__dirname + '/public'))); // 정적 파일 위치 설정

app.use(cors()); // 우선 cors 무조곤 허용

// 서버 테스트용 '/' 라우터
app.get('/', (req, res) => {
  res.json({ msg: 'OK' });
});

// multer 설정
const upload = multer({
  storage: multer.diskStorage({
    // 저장할 장소
    destination(req, file, cb) {
      cb(null, 'public/uploads');
    },
    // 저장할 이미지의 파일명
    filename(req, file, cb) {
      const ext = path.extname(file.originalname); // 파일의 확장자
      console.log('file.originalname', file.originalname);
      // 파일명이 절대 겹치지 않도록 해줘야한다.
      // 파일이름 + 현재시간밀리초 + 파일확장자명
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  // limits: { fileSize: 5 * 1024 * 1024 } // 파일 크기 제한
});

// 하나의 이미지 파일만 가져온다.
app.post('/img', upload.single('img'), (req, res) => {
  // 해당 라우터가 정상적으로 작동하면 public/uploads에 이미지가 업로드된다.
  // 업로드된 이미지의 URL 경로를 프론트엔드로 반환한다.
  console.log('전달받은 파일', req.file);
  console.log('저장된 파일의 이름', req.file.filename);

  // 파일이 저장된 경로를 클라이언트에게 반환해준다.
  const IMG_URL = `http://localhost:4050/uploads/${req.file.filename}`;
  console.log(IMG_URL);
  res.json({ url: IMG_URL });
});

// 포트는 임의로 4050으로 사용
app.listen(4050, () => {
  console.log('4050번 포트에서 대기 중~');
});
```

#### 미들웨어

```js
// 미들웨어 사용
app.use(express.json()); // json 데이터 파서
app.use(express.urlencoded({ extended: false })); // 내부 url 파서 사용
app.use(express.static(path.join(__dirname + '/public'))); // 정적 파일 위치 설정

app.use(cors()); // 우선 cors 무조곤 허용
```

위 **3가지 미들웨어**를 꼭 사용해야한다.

- `express.json()`
  json 형식을 해석하기 위해서 사용한다.
  이걸 쓰지않으면 `req.body`가 `undefined`로 나온다.
- `express.urlencoded`
  url을 해석하기 위해서 사용한다.
- `express.static(경로)`
  백엔드의 정적 파일 경로를 지정해준다.
  이 경로를 지정해주어야 백엔드에 저장되는 이미지에 URL로 접근할 수 있다.
  public폴더를 static으로 설정한다.
  📁public/uploads에 이미지를 저장한다.
  - 따라서 public 폴더 안에 있는 내용들은 http://백엔드호스트/내용들 로 접근할 수 있다.
  - http://백엔드호스트/📁uploads/이미지.jpg

#### multer 설정하기

이미지 업로드를 위해 `multer`를 설정한다.

- [multer 한국어 DOC](https://github.com/expressjs/multer/blob/master/doc/README-ko.md)

**multer 옵션 설정**

```js
// multer 설정
const upload = multer({
  storage: multer.diskStorage({
    // 저장할 장소
    destination(req, file, cb) {
      cb(null, 'public/uploads');
    },
    // 저장할 이미지의 파일명
    filename(req, file, cb) {
      const ext = path.extname(file.originalname); // 파일의 확장자
      console.log('file.originalname', file.originalname);
      // 파일명이 절대 겹치지 않도록 해줘야한다.
      // 파일이름 + 현재시간밀리초 + 파일확장자명
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  // limits: { fileSize: 5 * 1024 * 1024 } // 파일 크기 제한
});
```

다양한 설정들은 위 링크를 통해 알아보자.
코드에서 사용한 옵션들은 다음과 같다.

- **storage**
  파일이 저장될 위치 / 이름 설정

  - **multer.diskStorage**
    파일을 디스크에 저장하기 위한 기능을 제공한다.
    우리가 사용할 저장소
    - **destination** 이미지를 업로드할 장소
      우리는 📁 public/uploads 에 이미지를 저장한다.
      미리 경로를 만들어 두자
    - **filename** 업로드될 이미지 이름을 설정한다
      파일명이 겹치지않도록 파일이름 + 현재시간밀리초 + 파일확장자 형식으로 저장한다.
  - **limits**
    파일 크기 제한 설정

**multer 라우터 설정**

```js
// 하나의 이미지 파일만 가져온다.
app.post('/img', upload.single('img'), (req, res) => {
  // 해당 라우터가 정상적으로 작동하면 public/uploads에 이미지가 업로드된다.
  // 업로드된 이미지의 URL 경로를 프론트엔드로 반환한다.
  console.log('전달받은 파일', req.file);
  console.log('저장된 파일의 이름', req.file.filename);

  // 파일이 저장된 경로를 클라이언트에게 반환해준다.
  const IMG_URL = `http://localhost:4050/uploads/${req.file.filename}`;
  console.log(IMG_URL);
  res.json({ url: IMG_URL });
});
```

upload는 위에서 만든 multer 설정이다.
한 번에 하나의 이미지만 받으면 되기때문에 `.single(필드네임)`을 사용한다.

받은 파일은 `req.file`에 저장된다.
클라이언트에 이미지 파일의 URL 경로를 반환해준다.
http://localhost:4050/uploads/이미지파일명 으로 접근하는 것은
백엔드 서버의 📁/public/uploads/이미지파일명 에 접근하는 것과 같다.

### 리액트 설정하기

리액트에서 Quill 에디터 설정을 해준다.

Quill 에디터가 자체적으로 이미지를 처리하는 방식을 막고,
내가 임의로 이미지를 처리해주어야한다.

#### 에디터 설정

에디터에서 사용할 모듈들을 설정해준다.
이미지를 직접 처리할 것이기 때문에 이미지는 따로 `handler`를 사용한다

```js
// Quill 에디터에서 사용하고싶은 모듈들을 설정한다.
// useMemo를 사용해 modules를 만들지 않는다면 매 렌더링 마다 modules가 다시 생성된다.
// 그렇게 되면 addrange() the given range isn't in document 에러가 발생한다.
// -> 에디터 내에 글이 쓰여지는 위치를 찾지 못하는듯
const modules = useMemo(() => {
  return {
    toolbar: {
      container: [
        ['image'],
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      ],
      handlers: {
        // 이미지 처리는 우리가 직접 imageHandler라는 함수로 처리할 것이다.
        image: imageHandler,
      },
    },
  };
}, []);
// 위에서 설정한 모듈들 foramts을 설정한다
const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'image',
];
```

> modules는 꼭 useMemo를 사용해야한다.
> 그렇지 않으면addrange() the given range isn't in document 에러가 발생한다.

- `toolbar: container`
  내가 에디터에서 사용할 툴바 목록을 설정한다.
  
  위 코드에서는 이미지, h1~h3, 볼드,이탤릭, 가운데 줄, 언더라인,인용 을 사용한다.
- `toolbar: handlers`
  에디터에게 처리를 맞기지 않고 직접 핸들러 함수를 만들어 처리할 모듈을 설정한다.
  
  위 코드에서는 image처리를 imageHandler라는 변수를 사용해 처리한다.
  
  핸들러를 사용하면 기존 image 버튼을 누르면 아무 반응이 없어진다.
  
  ![무반응](https://user-images.githubusercontent.com/44540726/127761295-26411e97-1de9-4122-af5e-640c4a28d2e3.gif)

  
- `formats`
  위에서 설정한 모듈들의 포맷 설정

#### 리턴되는 JSX문

Quill 에디터에 위에서 설정한 모듈들을 넣어준다.

`value`는 에디터 컨텐츠 값을 저장하는 state

`quillRef`는 에디터에 직접 접근하기 위한 ref

```html
const [value, setValue] = useState(''); // 에디터 속 콘텐츠를 저장하는 state
const quillRef = useRef(); // 에디터 접근을 위한 ref return (
<div>
  <h1>Quill 에디터 입니다.</h1>

  <ReactQuill
    ref="{quillRef}"
    theme="snow"
    placeholder="플레이스 홀더"
    value="{value}"
    onChange="{setValue}"
    modules="{modules}"
    formats="{formats}"
  />
</div>
);
```

위에서 만든 모듈과 포맷들을 넣어준다.

> Quill 에디터 css를 index.html에 링크로 넣어주는걸 잊지말자. css가 없으면 에디터가 출력이 안된다.

`index.html`에 꼭 아래 코드를 넣어주자.

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/react-quill@1.3.3/dist/quill.snow.css"
/>
```

#### 이미지 핸들러 함수

직접 이미지를 처리할 로직을 가지고 있는 함수

이미지를 직접 처리하기로 하면 에디터 툴바에 이미지 클릭 시, 아무런 반응이 일어나지않는다.

그렇기 때문에 이미지를 서버에 저장하고, 서버에 저장된 이미지가 에디터에 표시되는 것 하나부터 열까지 전부 여기서 처리해주면 된다.

**처리 방식**

1. 이미지를 저장할 `input 요소`를 만든다
2. 에디터에서 이미지 버튼을 클릭 시, 만든 input 요소가 클릭되게 한다
3. 클릭된 input 요소에 이미지를 넣는다 = `change` 이벤트 발생
4. `change` 이벤트가 발생할 때마다, 이미지를 백엔드에 저장한다.
5. 백엔드에서 이미지 접근 URL을 돌려 받는다.
6. 받은 URL로 img 요소를 생성한다 `<img src=IMG_URL>`
7. 생성한 img 요소를 현재 에디터 커서 위치에 삽입한다.

위 로직을 실행하면 에디터의 컨텐츠가 간결하고 깔끔해진다. => MySQL에 저장가능

```js
// 이미지 처리를 하는 핸들러
const imageHandler = () => {
  console.log('에디터에서 이미지 버튼을 클릭하면 이 핸들러가 시작됩니다!');

  // 1. 이미지를 저장할 input type=file DOM을 만든다.
  const input = document.createElement('input');
  // 속성 써주기
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click(); // 에디터 이미지버튼을 클릭하면 이 input이 클릭된다.
  // input이 클릭되면 파일 선택창이 나타난다.

  // input에 변화가 생긴다면 = 이미지를 선택
  input.addEventListener('change', async () => {
    console.log('온체인지');
    const file = input.files[0];
    // multer에 맞는 형식으로 데이터 만들어준다.
    const formData = new FormData();
    formData.append('img', file); // formData는 키-밸류 구조
    // 백엔드 multer라우터에 이미지를 보낸다.
    try {
      const result = await axios.post('http://localhost:4050/img', formData);
      console.log('성공 시, 백엔드가 보내주는 데이터', result.data.url);
      const IMG_URL = result.data.url;
      // 이 URL을 img 태그의 src에 넣은 요소를 현재 에디터의 커서에 넣어주면 에디터 내에서 이미지가 나타난다
      // src가 base64가 아닌 짧은 URL이기 때문에 데이터베이스에 에디터의 전체 글 내용을 저장할 수있게된다
      // 이미지는 꼭 로컬 백엔드 uploads 폴더가 아닌 다른 곳에 저장해 URL로 사용하면된다.

      // 이미지 태그를 에디터에 써주기 - 여러 방법이 있다.
      const editor = quillRef.current.getEditor(); // 에디터 객체 가져오기
      // 1. 에디터 root의 innerHTML을 수정해주기
      // editor의 root는 에디터 컨텐츠들이 담겨있다. 거기에 img태그를 추가해준다.
      // 이미지를 업로드하면 -> 멀터에서 이미지 경로 URL을 받아와 -> 이미지 요소로 만들어 에디터 안에 넣어준다.
      // editor.root.innerHTML =
      //   editor.root.innerHTML + `<img src=${IMG_URL} /><br/>`; // 현재 있는 내용들 뒤에 써줘야한다.

      // 2. 현재 에디터 커서 위치값을 가져온다
      const range = editor.getSelection();
      // 가져온 위치에 이미지를 삽입한다
      editor.insertEmbed(range, 'image', IMG_URL);
    } catch (error) {
      console.log('실패했어요ㅠ');
    }
  });
};
```

- `editor = quillRef.current.getEditor();`
  에디터 정보를 가져올 수 있다.
- `const range = editor.getSelection();`
  현재 에디터 커서 위치를 알려준다.
- `editor.insertEmbed(range, 'image', IMG_URL);`
  에디터의 특정 위치에 원하는 요소를 넣어 준다.

## 결과
아주 잘된다. 여러개 이미지도 된다.

![quill이미지처리20210801_151304](https://user-images.githubusercontent.com/44540726/127761272-f645944b-b430-43ec-8b50-e7300bc73d27.gif)

![Untitled](https://user-images.githubusercontent.com/44540726/127762095-d2c11853-2196-40f7-996d-4551eb9092e9.png)

그리고 매우 짧아진 콘텐츠까지 완벽..

