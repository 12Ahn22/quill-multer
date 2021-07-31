# 🔮 Quill 에디터에 이미지 넣기

Quill 에디터로 게시판을 만들 때, 이미지 파일을 처리하는 방법을 정리한 레포지토리이다.
팀 프로젝트를 진행하면서 에디터에서 이미지를 어떻게 저장해야하는 지 너무너무 고생했기 때문에 이렇게 글로 남기고 싶었다.

<br/>
## 왜 이미지를 따로 처리할까?

Quill 에디터에 이미지를 업로드하면 해당 이미지는 **base64**로 변경되어 `<img src='엄청나게 긴 base64 문자열'/>`구조로 에디터 콘텐츠로 존재한다.

  <p style="display:block; text-align:center; font-size:20px; color:#555; margin:40px">✋ 이게 얼마나 기냐면...</p>

에디터 위의 버튼을 클릭하면 현재 **에디터 안에 있는 내용** = **데이터베이스**에 저장할 게시글 콘텐츠를 콘솔창에 출력한다.

<figure style="display:block; text-align:center;">
  <img src="https://user-images.githubusercontent.com/44540726/127743774-791df9bd-a60b-4ccd-8b9f-5a8d39afa70e.png"
       style=" margin:0px auto">
  <figcaption style="text-align:center; font-size:14px; color:#888">
    에디터에 이미지를 올려봤다. <br/>영화- 스탈린이 죽었다. <span style="font-size:10px">제발 봐주세요.🤣</span>
  </figcaption>
</figure>

**당연히 결과는..?**

<figure style="display:block; text-align:center;">
  <img src="https://user-images.githubusercontent.com/44540726/127744036-a12c1435-ad9a-4974-a55b-6e2fda3d6e70.png"
       style=" margin:0px auto">
  <figcaption style="text-align:center; font-size:14px; color:#888">
    ^^..엄청난 base64.. 심지어 Show more..
  </figcaption>
</figure>

얘를 데이터베이스(MySQL)에 저장하려고하면 데이터베이스가 몹시 놀란다.
너무 길어서 저장되지않는다. 만약 저장이 되더라도 사진 한장이 저정도 길이인데 사진이 여러장이면 ...생각만해도 낭비다.

<br/>
## 그러니 src에 base64가 아니라 URL을 쓰자
자세히 보면 img태그의 src에 base64가 들어있는 걸 알 수있다.
이 base64를 URL로 바꿔 사용한다면 저런 괴랄한 길이의 콘텐츠를 데이터베이스에 저장하는 것이 아니라 짧고 예쁜 HTML 코드를 저장할 수 있을 것이다.

<br/>
## 한번 해보기
#### 해야할 것
1. 이미지를 백엔드에 저장한다.
2. 백엔드에 저장한 이미지를 URL로 접근할 수 있도록 한다.
3. 이미지 URL을 에디터의 base64와 바꿔준다.
> 그냥 어딘가에 저장하고 URL만 가져올 수 있으면된다.
여기서는 express를 사용해 직접 이미지를 저장하는 백엔드 서버를 만드는 방법을 사용한다.

#### 필요한 것

- 이미지를 백엔드에 업로드하기 위한 패키지 `multer`
- 어떻게 에디터 img태그 src값을 변경할 것인지

#### 백엔드 세팅하기
