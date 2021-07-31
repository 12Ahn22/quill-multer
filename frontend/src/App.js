import './App.css';
// Quill 에디터 가져오기
import ReactQuill from 'react-quill';
// axios
import axios from 'axios';
import { useMemo, useState } from 'react';

function App() {
  const [value, setValue] = useState('');

  // Quill 에디터에서 사용하고싶은 모듈들을 설정한다.
  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          ['image'],
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        ],
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

  return (
    <div>
      <h1>Quill 에디터 입니다.</h1>
      <ReactQuill
        theme='snow'
        placeholder='플레이스 홀더'
        value={value}
        onChange={setValue}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}

export default App;
