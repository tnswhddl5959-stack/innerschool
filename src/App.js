import { useState, useEffect } from "react";

const N="#0f1f3d", M="#2dd4a0", MS="#e6faf4", MM="#a8edcf", AC="#ff6b6b", BG="#f4f6fb", CA="#fff", TX="#1a2540", SO="#5a6a8a", LI="#9aa5c0", BO="#e2e8f4";

const POSTS=[
  {id:1,title:"중간고사 수학 시험 범위 공유",cat:"📚 학업·시험",type:"verified",status:"verified",author:"김민준",date:"2025.10.08",views:234,source:"선생님께서 종례 시간에 직접 공지해주셨습니다.",body:"수학 중간고사 범위는 교과서 1~4단원입니다.\n\n• 1단원: 집합과 명제 전체\n• 2단원: 함수 1~3절\n• 3단원: 수열 전체\n• 4단원: 지수와 로그 1~2절\n\n서술형 30%, 객관식 70%입니다!",fc:0,fcR:[]},
  {id:2,title:"미술 동아리 신입 부원 모집합니다",cat:"🎨 동아리·활동",type:"unverified",status:"unverified",author:"박서연",date:"2025.10.07",views:89,source:"",body:"미술 동아리 '색채'에서 신입 부원을 모집합니다.\n\n모집 인원: 5명\n활동 시간: 매주 화·목 방과 후 2시간\n신청: 댓글로 이름과 학번 남겨주세요!",fc:0,fcR:[]},
  {id:3,title:"내년 수시 학교장 추천 기준 변경됐나요?",cat:"🎓 입시·진로",type:"unverified",status:"unverified",author:"익명",date:"2025.10.06",views:312,source:"",body:"작년이랑 기준이 바뀐 것 같다고 친구한테 들었는데 정확한 정보 아시는 분 있나요?\n학생부 교과 성적 기준이 달라졌다는 얘기도 있어서 혼란스럽습니다ㅠ",fc:2,fcR:["공식 발표가 없어서 미확인 정보인 것 같아요","학교 홈페이지에 기준 변경 공지 없어요"]},
  {id:4,title:"이번 주 목요일 급식 메뉴 변경 안내",cat:"🍱 급식·학교생활",type:"verified",status:"pending",author:"이유나",date:"2025.10.05",views:156,source:"급식실 앞 공지판에서 직접 확인했습니다.",body:"목요일 급식 메뉴가 변경되었습니다.\n\n기존: 카레라이스\n변경: 비빔밥 + 미역국\n\n알레르기: 계란(비빔밥 내 달걀)",fc:0,fcR:[]},
  {id:5,title:"체육대회 날짜 10월 25일 맞나요?",cat:"📅 행사·일정",type:"unverified",status:"unverified",author:"정다현",grade:"1",date:"2025.10.04",views:201,source:"",body:"단톡방에서 10월 25일이라고 하는 사람도 있고 11월 1일이라고 하는 사람도 있어서요. 정확한 날짜 아시는 분 알려주세요!",fc:1,fcR:["학교 홈페이지에는 11월 1일로 나와있어요"]},
];

const INIT_CMT={
  1:[{id:1,author:"박지수",anon:false,text:"감사해요! 4단원도 포함인 줄 몰랐어요",time:"2시간 전"},{id:2,author:"익명",anon:true,text:"서술형 배점도 아시나요?",time:"1시간 전"},{id:3,author:"김민준",anon:false,text:"서술형은 각 10점 3문제래요!",time:"45분 전"}],
  2:[{id:1,author:"이하은",anon:false,text:"신청할게요! 이하은 20240023",time:"3시간 전"}],
  3:[{id:1,author:"익명",anon:true,text:"저도 궁금해요ㅠ",time:"1일 전"},{id:2,author:"최준혁",anon:false,text:"담임 선생님한테 여쭤봤는데 아직 공식 발표 전이래요",time:"20시간 전"}],
};

const ID_LIST=[
  {id:"10208",name:"정하늘",grade:"1학년 2반",date:"2025.10.08",status:"pending"},
  {id:"10412",name:"오지민",grade:"1학년 4반",date:"2025.10.08",status:"pending"},
  {id:"20107",name:"한도현",grade:"2학년 1반",date:"2025.10.07",status:"pending"},
  {id:"20315",name:"김예린",grade:"2학년 3반",date:"2025.10.06",status:"ok"},
  {id:"30203",name:"박찬영",grade:"3학년 2반",date:"2025.10.05",status:"blocked"},
];


const MEAL={
  "5/4":null,
  "5/5":null,
  "5/6":["참쌀밥","배추된장국5.6","제육볶음5.6.10","계란말이1.5","진미채도라지무침5.6.17","깍두기9","대추방울토마토12"],
  "5/7":["김치볶음밥2.5.6.9.10.15","핫도그/케첩1.2.5.6.10.12.15","스크램블에그3","들기름막국수3.5.6","백김치","쥬시쿨에이드2"],
  "5/8":["현미밥","비지찌개5.6.9.10","봉추ST.찜닭5.6.15","가마보꼬볶음5.6.16","검정콩조림5","열무김치9","상하목장요구르트2"],
  "5/11":["보리밥","황태두부국1.5","칠리깐풍새우1.5.6.9.10.12.15","미역줄기볶음5","츄러스1.2.5.6.16","포기김치9"],
  "5/12":["기장밥","콩가루배추국5.6","소고기계란장조림1.5.16","빨간어묵볶음5.6.16","고감콘고로케1.5.6","포기김치9","젤리볼리"],
  "5/13":["치킨마요덮밥(찹쌀밥)","얼큰콩나물국5","치킨마요덮밥재료(치킨까스크램블,김가루)1.2.5.6.15","데리마요소스1.2.5.6","한섬만두1.2.5.6.10.16","볶음김지5.6.9","엠프로키즈요구르트2"],
  "5/14":["찹쌀밥","돈갈비김치찌개5.6.9.10","안심까스/소스1.2.5.6.12.16","베이컨계란찜1.5.6.10","레몬피클5","열무김치9","제리뽀"],
  "5/15":["수수밥","호박된장찌개5.6","LA갈비찜5.6.10","브로콜리들깨무침5.6","건새우마늘쫑볶음5.6.9","깍두기9","사과즙(학교지원)"],
  "5/18":["흑미밥","소고기무국5.6.16","김치삼겹볶음5.6.9.10","콩나물부추무침5","야채춘권5.6","깍두기9"],
  "5/19":["기장밥","육개장1.2.5.6.10.12.16","가자미볼/소스1.5.6.12","우엉잡채5.6.10","도토리묵치커리무침5","포기김치9"],
  "5/20":["찹쌀밥","진미짜장야채소스1.2.5.6.10","순살가라아케치킨1.5.6.10.15.16","한식탕평채1.5.6.16","깍독단무침5","포기김치9","수박"],
  "5/21":["잡곡밥","차돌된장국5.6.16","오징어치즈떡볶음2.5.6.17","새콤오이무침5","스팸버섯볶음5.6.10","총각김치9","허쉬드링크2"],
  "5/22":["차조밥","부대찌개1.2.5.6.9.10.12.16","닭볼고기5.6.15","청경채나물무침5","포기김치9","방울토마토(학교지원)"],
  "5/25":null,
  "5/26":["현미밥","웅심이계란국1.5.6.10.16","명란한떡갈비5.6.7.10.16","진미채조림5.6.17","포기김치9","파인애플"],
  "5/27":["찹쌀밥","하이라이스1.2.5.6.10.12.15","고추장떡볶이5.6","김말이튀김5.6","쫄면야채무침5.6","포기김치9","스위트믹스"],
  "5/28":["찹쌀밥","우렁된장찌개5.6","소고기숙주파채볶음5.6.16","참나물쌈장무침5.6","허니버터알감자1.2.5.6","열무김치9"],
  "5/29":["보조밥","소고기스프2.5.6.15.16","토마토스파게티1.2.5.6.10.12","스노우순살치킨1.2.5.6.10.12.15.16","수제오이피클5","포기김치9","마늘빵2.5.6"],
};
const WIKI=[
  {icon:"🏫",title:"상담실 이용 안내",desc:"예약 방법, 운영 시간, 담당 선생님 안내",ok:true,content:"📍 위치: 본관 1층 107호\n\n⏰ 운영 시간\n평일 09:00~17:00 (점심시간 포함)\n\n📝 예약 방법\n1. 담임 선생님께 상담 신청서 제출\n2. 또는 상담실 앞 예약 노트에 직접 기재\n3. 긴급 상담은 예약 없이 방문 가능\n\n👩‍🏫 담당: 김○○ 선생님 (내선 101)"},
  {icon:"📚",title:"도서관 이용 규칙",desc:"대출 권수, 반납 기한, 연장 방법 안내",ok:true,link:{label:"도서 검색",url:"https://read365.edunet.net/PureScreen/SchoolSearch?schoolName=%EA%B2%BD%EA%B8%B0%EC%B0%BD%EC%A1%B0%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90&provCode=J10&neisCode=J100005831"},content:"📍 위치: 본관 3층\n\n⏰ 운영 시간: 평일 08:00~18:00\n\n📖 대출 규정\n• 1인 최대 3권 대출\n• 대출 기간: 2주\n• 1회 1주 연장 가능\n\n⚠️ 연체 시 연체일수만큼 대출 정지"},
  {icon:"🎨",title:"동아리 목록 & 소개",desc:"전체 동아리 목록, 활동 내용, 담당자 연락처",ok:false,content:"🎨 색채 (미술)\n활동: 회화, 소묘, 전시회 기획\n활동일: 화·목 방과 후\n\n🎵 하모니 (합창)\n활동: 합창, 교내 행사 공연\n활동일: 월·수 방과 후\n\n💻 코딩클럽\n활동: 프로그래밍, 앱 개발\n활동일: 금 방과 후"},
  {icon:"🎓",title:"수시 지원 절차",desc:"학교장추천, 자기소개서, 면접 준비 가이드",ok:false,content:"📋 학교장 추천 전형\n• 추천 기준: 교과 석차등급 평균 2등급 이내\n• 봉사 시간: 50시간 이상 권장\n\n📝 자기소개서 팁\n1. 구체적인 경험과 성장 과정 중심\n2. 학교 활동과 연결\n3. 지원 학과와의 연관성 명확히\n\n🎤 면접: 모의 면접 상담실 활용 가능"},
  {icon:"🏥",title:"보건실 이용 안내",desc:"운영 시간, 구비 약품, 응급 상황 절차",ok:true,content:"📍 위치: 본관 1층 103호\n\n⏰ 운영 시간: 평일 08:30~17:00\n\n💊 구비 약품\n두통약, 소화제, 밴드, 소독약 등\n(처방약은 제공하지 않음)\n\n🚨 응급 상황\n1. 즉시 보건실 방문 또는 담임 선생님께 연락\n2. 심각한 경우 119 신고 후 보호자 연락"},
  {icon:"🍱",title:"급식 알레르기 정보",desc:"알레르기 유발 식품 표시 기준",ok:true,content:"1.난류  2.우유  3.메밀  4.땅콩  5.대두  6.밀  7.고등어  8.게  9.새우  10.돼지고기  11.복숭아  12.토마토  13.아황산류  14.호두  15.닭고기  16.쇠고기  17.오징어  18.조개류(굴,전복,홍합 포함)  19.잣"},
];

const SUB_CATS=["📝 수행평가","📚 학업·시험","🎓 입시 정보","📊 SLAT","🎨 동아리","📅 행사·일정","🍱 급식·학교생활","📢 학교 공지","🙋 질문 게시판"];
const GRADE_CATS={
  "1학년":SUB_CATS,
  "2학년":SUB_CATS,
  "3학년":SUB_CATS,
  "공통":SUB_CATS,
};
const ALL_CATS=["전체",...SUB_CATS];
const CAL={
  1:"🏫 학교장재량휴업일",
  4:"🏫 학교장재량휴업일",
  7:"📝 고3 전국연합학력평가",
  15:"🎽 1·2학년 체육대회 / 3학년 졸업앨범 실내촬영",
  18:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  19:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  20:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  21:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  22:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  23:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  24:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  25:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  26:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  27:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  28:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
  29:"👨‍👩‍👧 학부모 진로 진학 컨설팅",
};

const VQ_INIT=[
  {id:4,title:"이번 주 목요일 급식 메뉴 변경 안내",author:"이유나",cat:"🍱 급식·학교생활",source:"급식실 앞 공지판에서 직접 확인했습니다."},
  {id:999,title:"1학년 영어 수행평가 제출 기한 변경",author:"강민서",cat:"📚 학업·시험",source:"영어 선생님께서 오늘 수업 중에 공지해주셨어요."},
];

function Chip({type,status}){
  if(type==="teacher") return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:"#ede9fe",color:"#5b21b6"}}>👩‍🏫 선생님 인증 정보</span>;
  if(type==="verified"&&status==="verified") return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:MS,color:"#0e8a5f"}}>✅ 확인된 정보</span>;
  if(type==="verified"&&status==="pending")  return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:"#fef3c7",color:"#92400e"}}>🔍 검토 중</span>;
  return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:"#fff7ed",color:"#c2410c"}}>⚠️ 미확인</span>;
}

function Toast({msg}){
  return msg?<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:N,color:"#fff",padding:"11px 22px",borderRadius:10,fontSize:13,fontWeight:500,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>{msg}</div>:null;
}

function Btn({onClick,children,style={}}){
  return <button onClick={onClick} style={{fontFamily:"inherit",cursor:"pointer",border:"none",...style}}>{children}</button>;
}

function Modal({open,onClose,title,children}){
  if(!open)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,padding:24,width:"100%",maxWidth:460,maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{fontSize:17,fontWeight:700,color:TX,marginBottom:18}}>{title}</div>
        {children}
      </div>
    </div>
  );
}

const BG_STYLE={minHeight:"100vh",background:"linear-gradient(135deg,#0f1f3d 0%,#233f7a 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:16};
const BOX_STYLE={background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:22,padding:"40px 32px",width:"100%",maxWidth:400};
const INP_STYLE={width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
const LBL_STYLE={color:"rgba(255,255,255,0.65)",fontSize:12,display:"block",marginBottom:6};

function LoginHeader(){
  return <>
    <div style={{fontFamily:"serif",fontSize:22,fontWeight:800,color:"#2dd4a0"}}>INNERSCHOOL</div>
    <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:28}}>교내 정보격차 해소를 위한 정보 공유 게시판</div>
  </>;
}

function LoginRole({onSelect,onReg}){
  return(
    <div style={BG_STYLE}>
      <div style={BOX_STYLE}>
        <LoginHeader/>
        <div style={{color:"#fff",fontSize:18,fontWeight:700,marginBottom:6}}>로그인</div>
        <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginBottom:22}}>로그인할 계정을 선택해주세요</div>
        <div style={{display:"flex",gap:12,marginBottom:24}}>
          {[{k:"student",i:"🎒",l:"학생"},{k:"teacher",i:"👩‍🏫",l:"선생님"}].map(r=>(
            <div key={r.k} onClick={()=>onSelect(r.k)} style={{flex:1,border:"2px solid rgba(45,212,160,0.3)",borderRadius:14,padding:"22px 12px",textAlign:"center",cursor:"pointer",background:"rgba(255,255,255,0.04)"}}>
              <div style={{fontSize:34,marginBottom:8}}>{r.i}</div>
              <div style={{color:"#fff",fontSize:15,fontWeight:700}}>{r.l}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",color:"rgba(255,255,255,0.45)",fontSize:13}}>
          계정이 없으신가요? <span onClick={onReg} style={{color:"#2dd4a0",fontWeight:600,cursor:"pointer"}}>가입하기</span>
        </div>
      </div>
    </div>
  );
}

function LoginStudent({onBack,onLogin,onReg}){
  const [id,setId]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const handleId=e=>{
    const v=e.target.value.replace(/[^0-9]/g,"");
    if(v.length<=5) setId(v);
  };
  const handle=()=>{
    if(id.length!==5){setErr("학번은 5자리 숫자여야 합니다");return;}
    if(!pw.trim()){setErr("비밀번호를 입력해주세요");return;}
    setErr("");
    onLogin(id,pw);
  };
  return(
    <div style={BG_STYLE}>
      <div style={BOX_STYLE}>
        <LoginHeader/>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:22}}>
          <span onClick={onBack} style={{color:"#2dd4a0",fontSize:13,cursor:"pointer"}}>← 뒤로</span>
          <span style={{color:"#fff",fontSize:18,fontWeight:700}}>🎒 학생 로그인</span>
        </div>
        <div style={{marginBottom:4}}>
          <label style={LBL_STYLE}>학번</label>
          <input value={id} onChange={handleId} placeholder="예: 10101" style={INP_STYLE}/>
        </div>
        <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginBottom:14}}>학년(1) + 반(2자리) + 번호(2자리) · 예: 1학년 1반 1번 → 10101</div>
        <div style={{marginBottom:18}}>
          <label style={LBL_STYLE}>비밀번호</label>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="비밀번호 입력" style={INP_STYLE}/>
        </div>
        {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
        <button onClick={handle} style={{width:"100%",background:"#2dd4a0",color:"#0f1f3d",border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>로그인</button>
        <div style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,0.45)",fontSize:13}}>
          계정이 없으신가요? <span onClick={onReg} style={{color:"#2dd4a0",fontWeight:600,cursor:"pointer"}}>가입하기</span>
        </div>
      </div>
    </div>
  );
}

function LoginTeacher({onBack,onLogin,onReg}){
  const [tName,setTName]=useState("");
  const [tSubject,setTSubject]=useState("국어");
  const [tPw,setTPw]=useState("");
  const [err,setErr]=useState("");
  const handle=()=>{
    if(!tName.trim()){setErr("이름을 입력해주세요");return;}
    if(!tPw.trim()){setErr("비밀번호를 입력해주세요");return;}
    setErr("");
    onLogin(tName,tPw,tSubject);
  };
  return(
    <div style={BG_STYLE}>
      <div style={BOX_STYLE}>
        <LoginHeader/>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:22}}>
          <span onClick={onBack} style={{color:"#2dd4a0",fontSize:13,cursor:"pointer"}}>← 뒤로</span>
          <span style={{color:"#fff",fontSize:18,fontWeight:700}}>👩‍🏫 선생님 로그인</span>
        </div>
        <div style={{marginBottom:14}}>
          <label style={LBL_STYLE}>이름</label>
          <input value={tName} onChange={e=>setTName(e.target.value)} placeholder="성함을 입력하세요" style={INP_STYLE}/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={LBL_STYLE}>담당 교과목</label>
          <select value={tSubject} onChange={e=>setTSubject(e.target.value)} style={INP_STYLE}>
            {["국어","영어","수학","과학","사회","역사","도덕","체육","음악","미술","기술·가정","정보","한문","제2외국어","진로"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{marginBottom:18}}>
          <label style={LBL_STYLE}>비밀번호</label>
          <input type="password" value={tPw} onChange={e=>setTPw(e.target.value)} placeholder="비밀번호 입력" style={INP_STYLE}/>
        </div>
        {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
        <button onClick={handle} style={{width:"100%",background:"#2dd4a0",color:"#0f1f3d",border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>로그인</button>
        <div style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,0.45)",fontSize:13}}>
          계정이 없으신가요? <span onClick={onReg} style={{color:"#2dd4a0",fontWeight:600,cursor:"pointer"}}>가입하기</span>
        </div>
      </div>
    </div>
  );
}

// ── 로그인 라우터 ──
function Login({onLogin,onReg}){
  const [role,setRole]=useState(null);
  if(!role) return <LoginRole onSelect={setRole} onReg={onReg}/>;
  if(role==="student") return <LoginStudent onBack={()=>setRole(null)} onLogin={(id,pw)=>onLogin(id,pw,"student")} onReg={onReg}/>;
  return <LoginTeacher onBack={()=>setRole(null)} onLogin={(name,pw,subject)=>onLogin(name,pw,subject)} onReg={onReg}/>;
}

// 학번 자동 생성
function makeSid(g,r,n){
  return g + String(r).padStart(2,"0") + String(n).padStart(2,"0");
}

const TEACHER_CODE = "changjo2605";
const SUBJECTS = ["국어","영어","수학","과학","사회","역사","도덕","체육","음악","미술","기술·가정","정보","한문","제2외국어","진로"];

// ── 가입 ──
function Register({onDone,onBack}){
  const [role,setRole]=useState(null); // null | "student" | "teacher"
  const [name,setName]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");

  // 학생 전용
  const [grade,setGrade]=useState("1");
  const [room,setRoom]=useState("1");
  const [num,setNum]=useState("1");
  const [preview,setPreview]=useState(null);
  const [agreed,setAgreed]=useState(false);

  // 교사 전용
  const [subject,setSubject]=useState("국어");
  const [code,setCode]=useState("");

  const inp={width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  const lbl={color:"rgba(255,255,255,0.65)",fontSize:12,display:"block",marginBottom:6};
  const handleFile=e=>{const f=e.target.files[0];if(f)setPreview(URL.createObjectURL(f));};
  const sid=makeSid(grade,room,num);
  const rooms=Array.from({length:10},(_,i)=>i+1);
  const nums=Array.from({length:35},(_,i)=>i+1);

  const handleDone=()=>{
    if(!name.trim()){setErr("이름을 입력해주세요");return;}
    if(!pw.trim()){setErr("비밀번호를 입력해주세요");return;}
    if(role==="student"){
      if(!preview){setErr("학생증 사진을 첨부해주세요");return;}
      if(!agreed){setErr("개인정보 수집·이용에 동의해주세요");return;}
      setErr("");onDone({role:"student",name,sid,grade,room,pw});
    } else {
      if(code!==TEACHER_CODE){setErr("인증코드가 올바르지 않습니다");return;}
      setErr("");onDone({role:"teacher",name,subject,pw,id:"T"+Date.now().toString().slice(-4)});
    }
  };

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${N} 0%,#233f7a 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:22,padding:"36px 32px",width:"100%",maxWidth:420,maxHeight:"95vh",overflowY:"auto"}}>
        <div style={{fontFamily:"serif",fontSize:20,fontWeight:800,color:M,marginBottom:2}}>INNERSCHOOL</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:22}}>신규 가입</div>

        {/* 역할 선택 */}
        {!role && <>
          <div style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:16}}>가입할 계정을 선택해주세요</div>
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            {[{k:"student",i:"🎒",l:"학생"},{k:"teacher",i:"👩‍🏫",l:"선생님"}].map(r=>(
              <div key={r.k} onClick={()=>setRole(r.k)} style={{flex:1,border:"2px solid rgba(45,212,160,0.3)",borderRadius:14,padding:"20px 12px",textAlign:"center",cursor:"pointer",background:"rgba(255,255,255,0.04)"}}>
                <div style={{fontSize:32,marginBottom:8}}>{r.i}</div>
                <div style={{color:"#fff",fontSize:15,fontWeight:700}}>{r.l}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.45)",fontSize:13}}>
            이미 계정이 있으신가요? <span onClick={onBack} style={{color:M,fontWeight:600,cursor:"pointer"}}>로그인</span>
          </div>
        </>}

        {/* 학생 가입 폼 */}
        {role==="student" && <>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <span onClick={()=>{setRole(null);setErr("");}} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
            <span style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>🎒 학생으로 가입</span>
          </div>
          <div style={{marginBottom:12}}><label style={lbl}>이름</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="본명을 입력하세요" style={inp}/></div>
          <div style={{marginBottom:4}}>
            <label style={lbl}>학년 · 반 · 번호</label>
            <div style={{display:"flex",gap:6}}>
              <select value={grade} onChange={e=>setGrade(e.target.value)} style={{...inp,flex:1}}><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>
              <select value={room} onChange={e=>setRoom(e.target.value)} style={{...inp,flex:1}}>{rooms.map(n=><option key={n} value={n}>{n}반</option>)}</select>
              <select value={num} onChange={e=>setNum(e.target.value)} style={{...inp,flex:1}}>{nums.map(n=><option key={n} value={n}>{n}번</option>)}</select>
            </div>
          </div>
          <div style={{background:"rgba(45,212,160,0.08)",border:"1px solid rgba(45,212,160,0.15)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span>🪪</span><span>자동 생성된 학번: <strong style={{color:M,fontSize:14}}>{sid}</strong></span>
          </div>
          <div style={{marginBottom:14}}><label style={lbl}>비밀번호</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} style={inp}/></div>
          <div style={{marginBottom:14}}>
            <label style={lbl}>학생증 사진 <span style={{color:M}}>*필수</span></label>
            <label style={{display:"block",border:`2px dashed rgba(45,212,160,${preview?0.6:0.3})`,borderRadius:10,padding:preview?6:18,textAlign:"center",cursor:"pointer"}}>
              {preview?<img src={preview} alt="" style={{width:"100%",maxHeight:110,objectFit:"cover",borderRadius:8}}/>:<><div style={{fontSize:26,marginBottom:6}}>🪪</div><div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}><span style={{color:M,fontWeight:600}}>클릭하여 첨부</span><br/>JPG, PNG 형식</div></>}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
            </label>
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"14px",marginBottom:14}}>
            <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,fontWeight:600,marginBottom:8}}>📋 개인정보 수집·이용 동의</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,lineHeight:1.7,marginBottom:10}}>
              <strong style={{color:"rgba(255,255,255,0.7)"}}>수집 항목:</strong> 학생증 사진, 이름, 학번<br/>
              <strong style={{color:"rgba(255,255,255,0.7)"}}>수집 목적:</strong> 재학생 여부 확인<br/>
              <strong style={{color:"rgba(255,255,255,0.7)"}}>보유 기간:</strong> 총관리자 검토 완료 즉시 삭제<br/>
              <strong style={{color:"rgba(255,255,255,0.7)"}}>제3자 제공:</strong> 없음 (총관리자 외 열람 불가)
            </div>
            <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:10}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{width:16,height:16,accentColor:M}}/>
                <span style={{color:"rgba(255,255,255,0.75)",fontSize:12,fontWeight:500}}>위 개인정보 수집·이용에 동의합니다 <span style={{color:M}}>*필수</span></span>
              </label>
            </div>
          </div>
          {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"8px 12px"}}>{err}</div>}
          <Btn onClick={handleDone} style={{width:"100%",background:agreed?M:"rgba(45,212,160,0.3)",color:N,borderRadius:10,padding:13,fontSize:15,fontWeight:700}}>가입하기</Btn>
        </>}

        {/* 교사 가입 폼 */}
        {role==="teacher" && <>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <span onClick={()=>{setRole(null);setErr("");}} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
            <span style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>👩‍🏫 선생님으로 가입</span>
          </div>
          <div style={{marginBottom:12}}><label style={lbl}>이름</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="성함을 입력하세요" style={inp}/></div>
          <div style={{marginBottom:14}}>
            <label style={lbl}>담당 교과목</label>
            <select value={subject} onChange={e=>setSubject(e.target.value)} style={inp}>
              {SUBJECTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{marginBottom:14}}><label style={lbl}>비밀번호</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} style={inp}/></div>
          <div style={{marginBottom:6}}><label style={lbl}>교사 인증코드 <span style={{color:M}}>*필수</span></label><input type="password" value={code} onChange={e=>setCode(e.target.value)} placeholder="인증코드를 입력하세요" style={inp}/></div>
          {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"8px 12px"}}>{err}</div>}
          <Btn onClick={handleDone} style={{width:"100%",background:M,color:N,borderRadius:10,padding:13,fontSize:15,fontWeight:700}}>가입하기</Btn>
        </>}
      </div>
    </div>
  );
}

// ── 프로필 페이지 ──
function ProfilePage({user,isTeacher,isAdmin,accounts,setAccounts,setUser,toast_}){
  const [tab,setTab]=useState("info");
  const [newName,setNewName]=useState(user.name);
  const [newSubject,setNewSubject]=useState(user.room||"국어");
  const [curPw,setCurPw]=useState("");
  const [newPw,setNewPw]=useState("");
  const [confirmPw,setConfirmPw]=useState("");
  const [err,setErr]=useState("");
  const [ok,setOk]=useState("");

  const inp={width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:10,padding:"11px 14px",fontSize:14,outline:"none",color:TX,fontFamily:"inherit",boxSizing:"border-box"};
  const lbl={fontSize:12,fontWeight:500,color:SO,display:"block",marginBottom:6};

  const saveInfo=async()=>{
    if(!newName.trim()){setErr("이름을 입력해주세요");setOk("");return;}
    const base=accounts;
    const oldAcc=base.find(a=>a.id===user.id);
    if(!oldAcc){setErr("계정을 찾을 수 없어요");return;}
    const newAcc=isTeacher
      ?{...oldAcc,name:newName.trim(),subject:newSubject}
      :{...oldAcc,name:newName.trim()};
    const updated=[...base.filter(a=>a.id!==user.id),newAcc];
    // Storage에 저장 (delete 후 set)
    await writeStorage("accs",updated);
    setAccounts(updated);
    const newUser={...user,name:newName.trim(),...(isTeacher?{room:newSubject}:{})};
    setUser(newUser);
    setErr("");setOk("정보가 수정되었어요 ✅");
  };

  const savePw=async()=>{
    const base=accounts;
    const oldAcc=base.find(a=>a.id===user.id);
    if(!oldAcc){setErr("계정 정보를 찾을 수 없어요");setOk("");return;}
    if(oldAcc.pw!==curPw){setErr("현재 비밀번호가 일치하지 않아요");setOk("");return;}
    if(!newPw.trim()){setErr("새 비밀번호를 입력해주세요");setOk("");return;}
    if(newPw!==confirmPw){setErr("새 비밀번호가 서로 일치하지 않아요");setOk("");return;}
    if(newPw.length<4){setErr("비밀번호는 4자 이상이어야 해요");setOk("");return;}
    const newAcc={...oldAcc,pw:newPw};
    const updated=[...base.filter(a=>a.id!==user.id),newAcc];
    await writeStorage("accs",updated);
    setAccounts(updated);
    setCurPw("");setNewPw("");setConfirmPw("");
    setErr("");setOk("비밀번호가 변경되었어요 ✅");
  };

  return(
    <div>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:21,fontWeight:700}}>내 계정</h1>
        <p style={{color:SO,fontSize:13,marginTop:3}}>계정 정보를 확인하고 수정하세요</p>
      </div>

      {/* 프로필 카드 */}
      <div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`,marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${M},#1a9e76)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:N,flexShrink:0}}>{user.name[0]}</div>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:TX,marginBottom:3}}>{user.name}</div>
          <div style={{fontSize:13,color:SO}}>
            {isAdmin?"총관리자":isTeacher?user.room+" 선생님":user.grade+" "+user.room}
          </div>
          <div style={{fontSize:12,color:LI,marginTop:2}}>ID: {user.id}</div>
        </div>
      </div>

      {/* 탭 */}
      <div style={{display:"flex",gap:3,background:BG,padding:3,borderRadius:10,marginBottom:16}}>
        {[{k:"info",l:"✏️ 정보 수정"},{k:"pw",l:"🔑 비밀번호 변경"}].map(t=>(
          <Btn key={t.k} onClick={()=>{setTab(t.k);setErr("");setOk("");}} style={{flex:1,padding:"9px",borderRadius:8,fontSize:13,fontWeight:tab===t.k?700:500,color:tab===t.k?N:SO,background:tab===t.k?CA:"transparent"}}>
            {t.l}
          </Btn>
        ))}
      </div>

      {/* 정보 수정 탭 */}
      {tab==="info"&&(
        <div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`}}>
          <div style={{marginBottom:14}}>
            <label style={lbl}>이름</label>
            <input value={newName} onChange={e=>setNewName(e.target.value)} style={inp}/>
          </div>
          {isTeacher&&(
            <div style={{marginBottom:14}}>
              <label style={lbl}>담당 교과목</label>
              <select value={newSubject} onChange={e=>setNewSubject(e.target.value)} style={inp}>
                {["국어","영어","수학","과학","사회","역사","도덕","체육","음악","미술","기술·가정","정보","한문","제2외국어","진로"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          {!isTeacher&&(
            <div style={{marginBottom:14}}>
              <label style={lbl}>학번</label>
              <input value={user.id} disabled style={{...inp,opacity:0.5,cursor:"not-allowed"}}/>
              <div style={{fontSize:11,color:LI,marginTop:5}}>학번은 변경할 수 없어요</div>
            </div>
          )}
          {err&&<div style={{color:"#c2410c",fontSize:12,marginBottom:10,background:"#fff7ed",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
          {ok&&<div style={{color:"#0e8a5f",fontSize:12,marginBottom:10,background:MS,borderRadius:7,padding:"7px 11px"}}>{ok}</div>}
          <Btn onClick={saveInfo} style={{width:"100%",background:N,color:"#fff",borderRadius:10,padding:12,fontSize:14,fontWeight:700}}>저장하기</Btn>
        </div>
      )}

      {/* 비밀번호 변경 탭 */}
      {tab==="pw"&&(
        <div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`}}>
          <div style={{marginBottom:14}}>
            <label style={lbl}>현재 비밀번호</label>
            <input type="password" value={curPw} onChange={e=>setCurPw(e.target.value)} placeholder="현재 비밀번호 입력" style={inp}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={lbl}>새 비밀번호</label>
            <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="새 비밀번호 입력 (4자 이상)" style={inp}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={lbl}>새 비밀번호 확인</label>
            <input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="새 비밀번호 다시 입력" style={inp}/>
          </div>
          {err&&<div style={{color:"#c2410c",fontSize:12,marginBottom:10,background:"#fff7ed",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
          {ok&&<div style={{color:"#0e8a5f",fontSize:12,marginBottom:10,background:MS,borderRadius:7,padding:"7px 11px"}}>{ok}</div>}
          <Btn onClick={savePw} style={{width:"100%",background:N,color:"#fff",borderRadius:10,padding:12,fontSize:14,fontWeight:700}}>비밀번호 변경</Btn>

        </div>
      )}
    </div>
  );
}

const INIT_ACCOUNTS=[
  {role:"student",id:"11025",name:"이윤진",pw:"100130",grade:"1",room:"10"},
  {role:"teacher",id:"T0001",name:"테스트",pw:"1234",subject:"도덕"},
];

async function storageGet(key){
  try{const r=await window.storage.get(key);return r?JSON.parse(r.value):null;}catch{return null;}
}
async function storageSet(key,val){
  try{await window.storage.set(key,JSON.stringify(val));}catch{}
}
async function storageDel(key){
  try{await window.storage.delete(key);}catch{}
}

// ── Storage 직접 읽기/쓰기 ──
async function readStorage(key){
  try{const r=await window.storage.get(key);return r?JSON.parse(r.value):null;}catch{return null;}
}
async function writeStorage(key,val){
  try{
    await window.storage.delete(key);
    await window.storage.set(key,JSON.stringify(val));
  }catch{}
}

// ── 메인 앱 ──
export default function App(){
  const [scr,setScr]=useState("loading");
  const [isAdmin,setIsAdmin]=useState(false);
  const [user,setUser]=useState({name:"",id:"",grade:"",room:""});
  const [page,setPage]=useState("board");
  const [sidebar,setSidebar]=useState(false);
  const [isTeacher,setIsTeacher]=useState(false);
  const [accounts,setAccounts]=useState(INIT_ACCOUNTS);
  const [posts,setPosts]=useState(POSTS);
  const [cmts,setCmts]=useState(INIT_CMT);
  const [idList,setIdList]=useState(ID_LIST);
  const [vq,setVq]=useState(VQ_INIT);
  const [gradTab,setGradTab]=useState("전체");
  const [cat,setCat]=useState("전체");
  const [curPost,setCurPost]=useState(null);
  const [curWiki,setCurWiki]=useState(null);
  const [adminTab,setAdminTab]=useState("id");
  const [toast,setToast]=useState("");
  const [wModal,setWModal]=useState(false);
  const [wType,setWType]=useState(null);
  const [wCat,setWCat]=useState("📚 학업·시험");
  const [wGrade,setWGrade]=useState("공통");
  const [wTitle,setWTitle]=useState("");
  const [wBody,setWBody]=useState("");
  const [wSrc,setWSrc]=useState("");
  const [cText,setCText]=useState("");
  const [anon,setAnon]=useState(false);
  const [fcModal,setFcModal]=useState(false);
  const [fcTarget,setFcTarget]=useState(null);
  const [fcText,setFcText]=useState("");

  const toast_=msg=>{setToast(msg);setTimeout(()=>setToast(""),2600);};

  // 앱 시작: Storage에서 accounts + 세션 복원
  useEffect(()=>{
    (async()=>{
      const savedAcc=await readStorage("accs");
      const list=(savedAcc&&savedAcc.length>0)?savedAcc:INIT_ACCOUNTS;
      setAccounts(list);

      const sess=await readStorage("sess");
      if(sess&&sess.userId){
        // 세션의 userId로 최신 계정 찾기
        const acc=list.find(a=>a.id===sess.userId);
        if(acc){
          setIsAdmin(acc.id==="11025");
          setIsTeacher(acc.role==="teacher");
          if(acc.role==="teacher"){
            setUser({name:acc.name,id:acc.id,grade:"교사",room:acc.subject||""});
          } else {
            setUser({name:acc.name,id:acc.id,grade:acc.grade+"학년",room:acc.room+"반"});
          }
          setScr("app");
          return;
        }
      }
      setScr("login");
    })();
  },[]);

  const goPage=p=>{setPage(p);setSidebar(false);setCurWiki(null);};

  const doLogin=async(idOrName,pw,roleOrSubject)=>{
    // 항상 Storage에서 최신 accounts 읽기
    const savedAcc=await readStorage("accs");
    const list=(savedAcc&&savedAcc.length>0)?savedAcc:INIT_ACCOUNTS;
    setAccounts(list);

    let acc;
    if(roleOrSubject==="student"){
      acc=list.find(a=>a.role==="student"&&a.id===idOrName&&a.pw===pw);
      if(!acc){alert("학번 또는 비밀번호가 일치하지 않습니다.");return;}
      setIsAdmin(acc.id==="11025");
      setIsTeacher(false);
      setUser({name:acc.name,id:acc.id,grade:acc.grade+"학년",room:acc.room+"반"});
    } else {
      acc=list.find(a=>a.role==="teacher"&&a.name===idOrName&&a.pw===pw&&a.subject===roleOrSubject);
      if(!acc){alert("이름, 비밀번호 또는 교과목이 일치하지 않습니다.");return;}
      setIsAdmin(false);
      setIsTeacher(true);
      setUser({name:acc.name,id:acc.id,grade:"교사",room:acc.subject||""});
    }
    // 세션에 userId만 저장 (이름X — 나중에 accounts에서 항상 최신 정보 읽음)
    await writeStorage("sess",{userId:acc.id});
    setScr("app");setPage("board");
  };
  const doReg=async(info)=>{
    setIsAdmin(false);
    setIsTeacher(info.role==="teacher");
    // 현재 Storage의 최신 accounts 읽기
    const savedAccounts=await readStorage("accs");
    const base=(savedAccounts&&savedAccounts.length>0)?savedAccounts:accounts;
    let updated;
    if(info.role==="teacher"){
      const tid="T"+Date.now().toString().slice(-4);
      updated=[...base,{role:"teacher",id:tid,name:info.name,pw:info.pw,subject:info.subject}];
      setAccounts(updated);
      await writeStorage("accs",updated);
      setUser({name:info.name||"선생님",id:tid,grade:"교사",room:info.subject||""});
      setIdList(prev=>[{id:tid,name:(info.name||"선생님")+" 선생님",grade:"교사 · "+info.subject,date:"방금 전",status:"pending",isTeacher:true},...prev]);
    } else {
      updated=[...base,{role:"student",id:info.sid,name:info.name,pw:info.pw,grade:info.grade,room:info.room}];
      setAccounts(updated);
      await writeStorage("accs",updated);
      setUser({name:info.name||"새학생",id:info.sid||"10101",grade:info.grade+"학년",room:info.room+"반"});
      setIdList(prev=>[{id:info.sid||"10101",name:info.name||"새학생",grade:info.grade+"학년 "+info.room+"반",date:"방금 전",status:"pending",isTeacher:false},...prev]);
    }
    // 세션에 userId 저장
    const newId=info.role==="teacher"?updated[updated.length-1].id:info.sid;
    await writeStorage("sess",{userId:newId});
    setScr("app");setPage("board");
    toast_(info.role==="teacher"?"가입 완료! 바로 이용하실 수 있어요 👩‍🏫":"가입 완료! 바로 이용하실 수 있어요 😊");
  };

  const filtered=posts.filter(p=>{
    const catOk=cat==="전체"||p.cat===cat;
    const gradOk=gradTab==="전체"||
      (gradTab==="공통"&&p.grade==="공통")||
      (gradTab!=="공통"&&(p.grade===gradTab.replace("학년","")||p.grade==="공통"));
    return catOk&&gradOk;
  });
  const pending=idList.filter(r=>r.status==="pending").length+vq.length+posts.filter(p=>p.fc>0).length;

  const submitPost=()=>{
    if(!isTeacher&&!wType){toast_("유형을 선택해주세요");return;}
    if(!wTitle.trim()||!wBody.trim()){toast_("제목과 내용을 입력해주세요");return;}
    if(!isTeacher&&wType==="verified"&&!wSrc.trim()){toast_("확인 근거를 입력해주세요");return;}
    const postGrade=isTeacher?wGrade:user.grade.replace("학년","");
    const np=isTeacher
      ?{id:Date.now(),title:wTitle.trim(),cat:wCat,type:"teacher",status:"teacher",author:user.name,grade:postGrade,date:"방금 전",views:0,source:"",body:wBody.trim(),fc:0,fcR:[]}
      :{id:Date.now(),title:wTitle.trim(),cat:wCat,type:wType,status:wType==="verified"?"pending":"unverified",author:user.name,grade:postGrade,date:"방금 전",views:0,source:wSrc.trim(),body:wBody.trim(),fc:0,fcR:[]};
    setPosts(p=>[np,...p]);
    if(!isTeacher&&wType==="verified") setVq(q=>[{id:np.id,title:np.title,author:user.name,cat:wCat,source:np.source},...q]);
    setWModal(false);setWType(null);setWTitle("");setWBody("");setWSrc("");
    toast_(isTeacher?"게시됐어요! 선생님 인증 배지가 자동으로 부여됩니다 👩\u200d🏫":wType==="verified"?"게시됐어요! 총관리자 검토 후 배지가 부여됩니다 ✅":"게시됐어요! 미검증 배너가 표시됩니다");
  };

  const submitCmt=()=>{
    if(!cText.trim()){toast_("댓글을 입력해주세요");return;}
    const nc={id:Date.now(),author:user.name,anon,text:cText.trim(),time:"방금 전"};
    setCmts(p=>({...p,[curPost.id]:[...(p[curPost.id]||[]),nc]}));
    setCText("");toast_("댓글이 등록됐어요!");
  };

  const submitFc=()=>{
    if(!isTeacher&&!fcText.trim()){toast_("사유를 입력해주세요");return;}
    const entry=isTeacher
      ?`[👩‍🏫 ${user.name} 선생님 확인]${fcText.trim()?" "+fcText.trim():""}`
      :fcText.trim();
    setPosts(p=>p.map(x=>x.id===fcTarget?{...x,fc:x.fc+1,fcR:[...x.fcR,entry]}:x));
    if(curPost?.id===fcTarget) setCurPost(p=>({...p,fc:p.fc+1,fcR:[...(p.fcR||[]),entry]}));
    setFcModal(false);setFcText("");
    toast_(isTeacher?"사실 확인이 등록됐어요 ✅":"사실 확인 요청이 접수됐어요");
  };

  const verifyPost=id=>{
    setPosts(p=>p.map(x=>x.id===id?{...x,status:"verified"}:x));
    setVq(q=>q.filter(v=>v.id!==id));
    toast_("✅ 확인된 정보 배지가 부여됐어요!");
  };

  const s={fontFamily:"'Noto Sans KR',sans-serif",fontSize:14};

  if(scr==="loading") return <div style={{minHeight:"100vh",background:"#0f1f3d",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#2dd4a0",fontSize:18,fontWeight:700}}>INNERSCHOOL</div></div>;
  if(scr==="login") return <Login onLogin={doLogin} onReg={()=>setScr("register")} accounts={accounts}/>;
  if(scr==="register") return <Register onDone={doReg} onBack={()=>setScr("login")}/>;

  const navs=[{k:"board",i:"📋",l:"정보 게시판"},{k:"wiki",i:"📖",l:"교내 위키"},{k:"calendar",i:"📅",l:"공유 캘린더"},{k:"meal",i:"🍱",l:"이달의 급식"},{k:"profile",i:"👤",l:"내 계정"}];

  return(
    <div style={{...s,minHeight:"100vh",background:BG,color:TX}}>
      {/* 워터마크 */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9990,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:13,color:"rgba(15,31,61,0.05)",transform:"rotate(-35deg)",whiteSpace:"nowrap",letterSpacing:2,fontWeight:600,userSelect:"none"}}>{user.id} {user.name} · INNERSCHOOL 교내전용</div>
      </div>

      {/* 사이드바 오버레이 */}
      {sidebar&&<div onClick={()=>setSidebar(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:99}}/>}

      {/* 사이드바 */}
      <aside style={{width:240,background:N,minHeight:"100vh",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,zIndex:100,transform:sidebar?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease",boxShadow:sidebar?"4px 0 24px rgba(0,0,0,0.2)":"none"}}>
        <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"serif",fontSize:19,fontWeight:800,color:M}}>INNERSCHOOL</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:1}}>교내 정보공유 플랫폼</div>
          </div>
          <Btn onClick={()=>setSidebar(false)} style={{background:"rgba(255,255,255,0.08)",borderRadius:8,width:32,height:32,color:"rgba(255,255,255,0.6)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Btn>
        </div>
        <div onClick={()=>goPage("profile")} style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${M},#1a9e76)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:N,flexShrink:0}}>{user.name[0]}</div>
          <div>
            <div style={{color:"#fff",fontSize:13,fontWeight:600}}>{user.name}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{user.grade==="교사"?user.room+" 선생님":isAdmin?"총관리자 · "+user.grade+" "+user.room:user.grade+" "+user.room}</div>
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 10px",overflowY:"auto"}}>
          <div style={{color:"rgba(255,255,255,0.25)",fontSize:10,fontWeight:600,letterSpacing:1,padding:"0 8px",marginBottom:6,marginTop:4}}>메인</div>
          {navs.map(n=>(
            <div key={n.k} onClick={()=>goPage(n.k)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 10px",borderRadius:10,color:page===n.k?M:"rgba(255,255,255,0.6)",background:page===n.k?"rgba(45,212,160,0.15)":"transparent",fontSize:14,fontWeight:500,cursor:"pointer",marginBottom:2}}>
              <span style={{fontSize:16,width:20,textAlign:"center"}}>{n.i}</span>{n.l}
            </div>
          ))}
          {isAdmin&&<>
            <div style={{color:"rgba(255,255,255,0.25)",fontSize:10,fontWeight:600,letterSpacing:1,padding:"0 8px",marginBottom:6,marginTop:14}}>관리자</div>
            <div onClick={()=>goPage("admin")} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 10px",borderRadius:10,color:page==="admin"?M:"rgba(255,255,255,0.6)",background:page==="admin"?"rgba(45,212,160,0.15)":"transparent",fontSize:14,fontWeight:500,cursor:"pointer"}}>
              <span style={{fontSize:16,width:20,textAlign:"center"}}>⚙️</span>관리자 대시보드
              {pending>0&&<span style={{marginLeft:"auto",background:AC,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10}}>{pending}</span>}
            </div>
          </>}
        </nav>
        <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          <Btn onClick={async()=>{await writeStorage("sess",null);setScr("login");}} style={{width:"100%",background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:10,padding:10,color:"#ff8a8a",fontSize:13}}>로그아웃</Btn>
        </div>
      </aside>

      {/* 상단 헤더 */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:52,background:N,display:"flex",alignItems:"center",padding:"0 14px",zIndex:98,boxShadow:"0 2px 10px rgba(15,31,61,0.15)"}}>
        <Btn onClick={()=>setSidebar(true)} style={{background:"rgba(255,255,255,0.08)",borderRadius:9,width:38,height:38,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}>
          {[0,1,2].map(i=><div key={i} style={{width:18,height:2,background:M,borderRadius:2}}/>)}
        </Btn>
        <div style={{fontFamily:"serif",fontSize:16,fontWeight:800,color:M,marginLeft:12}}>INNERSCHOOL</div>
        {isAdmin&&pending>0&&<span style={{marginLeft:"auto",background:AC,color:"#fff",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:10}}>{pending}건 대기</span>}
      </div>

      {/* 콘텐츠 */}
      <main style={{padding:"68px 14px 32px",minHeight:"100vh"}}>

        {/* ── 게시판 ── */}
        {page==="board"&&(
          <div>
            <div style={{marginBottom:14}}>
              <h1 style={{fontSize:21,fontWeight:700}}>정보 게시판</h1>
              <p style={{color:SO,fontSize:13,marginTop:3}}>우리 학교의 모든 정보를 한 곳에서</p>
            </div>
            <div style={{background:`linear-gradient(135deg,${N},#233f7a)`,borderRadius:12,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>📢</span>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:M,letterSpacing:0.5,marginBottom:2}}>긴급 공지</div>
                <div style={{color:"#fff",fontSize:13,fontWeight:600}}>2학기 중간고사 — 10월 14~18일</div>
              </div>
            </div>

            {/* 학년 탭 */}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {["전체","1학년","2학년","3학년","공통"].map(g=>(
                <Btn key={g} onClick={()=>{setGradTab(g);setCat("전체");}} style={{padding:"7px 14px",borderRadius:18,border:`1.5px solid ${gradTab===g?N:BO}`,background:gradTab===g?N:CA,color:gradTab===g?"#fff":SO,fontSize:13,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>
                  {g}
                </Btn>
              ))}
            </div>

            {/* 세부 카테고리 탭 */}
            <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
              {(gradTab==="전체"
                ? ["전체",...new Set(Object.values(GRADE_CATS).flat())]
                : ["전체",...(GRADE_CATS[gradTab]||[])]
              ).map(c=>(
                <Btn key={c} onClick={()=>setCat(c)} style={{padding:"5px 12px",borderRadius:16,border:`1.5px solid ${cat===c?M:BO}`,background:cat===c?M:CA,color:cat===c?N:SO,fontSize:12,fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>
                  {c}
                </Btn>
              ))}
            </div>
            <Btn onClick={()=>{setWType(null);setWTitle("");setWBody("");setWSrc("");setWModal(true);}} style={{display:"flex",alignItems:"center",gap:6,background:M,color:N,borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:700,marginBottom:14}}>
              ✏️ 글쓰기
            </Btn>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.map(p=>(
                <div key={p.id} onClick={()=>{setCurPost(p);setPage("detail");}} style={{background:CA,borderRadius:12,padding:"16px",border:`1px solid ${BO}`,cursor:"pointer",boxShadow:"0 1px 8px rgba(15,31,61,0.06)"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
                    <Chip type={p.type} status={p.status}/>
                    <div style={{fontSize:14,fontWeight:600,color:TX,flex:1,lineHeight:1.4}}>{p.title}</div>
                  </div>
                  {p.type==="unverified"&&<div style={{background:"#fff7ed",borderLeft:"3px solid #f59e0b",borderRadius:"0 6px 6px 0",padding:"6px 10px",fontSize:11,color:"#92400e",marginBottom:6}}>⚠️ 미검증 정보입니다. 주의하세요.</div>}
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:LI,flexWrap:"wrap"}}>
                    <span style={{background:BG,padding:"2px 7px",borderRadius:4,color:SO}}>{p.cat}</span>
                    <span>{p.author} · {p.grade==="공통"?"공통":p.grade+"학년"}</span>
                    <span>{p.date}</span>
                    {isAdmin&&p.fc>0&&<span style={{color:AC,fontWeight:700}}>🚨 {p.fc}건</span>}
                    <span style={{marginLeft:"auto"}}>👁{p.views} 💬{(cmts[p.id]||[]).length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 게시글 상세 ── */}
        {page==="detail"&&curPost&&(
          <div>
            <Btn onClick={()=>setPage("board")} style={{display:"flex",alignItems:"center",gap:4,background:BG,color:SO,border:`1.5px solid ${BO}`,borderRadius:8,padding:"7px 14px",fontSize:13,marginBottom:16}}>← 목록으로</Btn>
            <div style={{background:CA,borderRadius:12,padding:"20px 16px",border:`1px solid ${BO}`,marginBottom:12}}>
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}><Chip type={curPost.type} status={curPost.status}/></div>
              <div style={{fontSize:18,fontWeight:700,color:TX,lineHeight:1.4,marginBottom:10}}>{curPost.title}</div>
              <div style={{display:"flex",gap:12,fontSize:11,color:LI,marginBottom:12,flexWrap:"wrap"}}>
                <span>👤 {curPost.author} · {curPost.grade==="공통"?"공통":curPost.grade+"학년"}</span><span>📅 {curPost.date}</span><span>👁 {curPost.views}</span>
              </div>
              {curPost.type==="unverified"&&<div style={{background:"#fff7ed",borderLeft:"3px solid #f59e0b",borderRadius:"0 8px 8px 0",padding:"8px 12px",fontSize:12,color:"#92400e",marginBottom:12}}>⚠️ 미검증 정보입니다. 출처를 직접 확인하세요.</div>}
              <div style={{fontSize:14,lineHeight:1.9,color:TX,padding:"14px 0",borderTop:`1px solid ${BO}`,borderBottom:`1px solid ${BO}`,whiteSpace:"pre-line"}}>{curPost.body}</div>
              {curPost.source&&<div style={{background:MS,border:`1px solid ${MM}`,borderRadius:9,padding:"12px 14px",fontSize:13,color:"#0e7a5a",marginTop:12}}><div style={{fontSize:11,fontWeight:700,marginBottom:3}}>📎 확인 근거</div>{curPost.source}</div>}
              {isAdmin&&curPost.fc>0&&<div style={{background:"#fee2e2",borderRadius:9,padding:"10px 14px",marginTop:10}}>
                <div style={{fontSize:13,color:"#991b1b",fontWeight:700,marginBottom:6}}>🚨 사실확인 요청 {curPost.fc}건</div>
                {curPost.fcR.map((r,i)=><div key={i} style={{fontSize:12,color:"#7f1d1d",background:"rgba(255,255,255,0.5)",borderRadius:5,padding:"5px 9px",marginBottom:3}}>"{r}"</div>)}
              </div>}
              {curPost.type!=="teacher"&&(
                isTeacher
                  ?<Btn onClick={()=>{setFcTarget(curPost.id);setFcText("");setFcModal(true);}} style={{marginTop:14,display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,background:"#ede9fe",color:"#5b21b6",border:"1.5px solid #c4b5fd",fontSize:13}}>✅ 사실 확인 체크</Btn>
                  :<Btn onClick={()=>{setFcTarget(curPost.id);setFcText("");setFcModal(true);}} style={{marginTop:14,display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,background:"#fff7ed",color:"#c2410c",border:"1.5px solid #fed7aa",fontSize:13}}>🚨 사실 확인 요청</Btn>
              )}
            </div>
            {/* 댓글 */}
            <div style={{background:CA,borderRadius:12,padding:"18px 16px",border:`1px solid ${BO}`}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>💬 댓글 <span style={{color:SO,fontWeight:400,fontSize:12}}>({(cmts[curPost.id]||[]).length}개)</span></div>
              {(cmts[curPost.id]||[]).length===0&&<div style={{color:LI,fontSize:13,paddingBottom:12}}>아직 댓글이 없어요. 첫 댓글을 남겨보세요!</div>}
              {(cmts[curPost.id]||[]).map(c=>(
                <div key={c.id} style={{padding:"12px 0",borderBottom:`1px solid ${BO}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:c.anon?"linear-gradient(135deg,#94a3b8,#64748b)":"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{c.anon?"익":c.author[0]}</div>
                    <span style={{fontSize:13,fontWeight:600}}>{c.anon?"익명":c.author}</span>
                    <span style={{fontSize:11,color:LI,marginLeft:"auto"}}>{c.time}</span>
                    {isAdmin&&<Btn onClick={()=>{setCmts(p=>({...p,[curPost.id]:(p[curPost.id]||[]).filter(x=>x.id!==c.id)}));toast_("댓글 삭제됐어요");}} style={{fontSize:11,color:AC,background:"none",padding:0}}>🗑</Btn>}
                  </div>
                  <div style={{fontSize:13,color:TX,lineHeight:1.6,paddingLeft:33}}>{c.text}</div>
                </div>
              ))}
              <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${BO}`}}>
                <label style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:SO,marginBottom:8,cursor:"pointer"}}>
                  <input type="checkbox" checked={anon} onChange={e=>setAnon(e.target.checked)} style={{accentColor:N}}/>익명으로 작성
                </label>
                <textarea value={cText} onChange={e=>setCText(e.target.value)} rows={3} placeholder="댓글을 입력하세요 🙏" style={{width:"100%",border:`1.5px solid ${BO}`,borderRadius:9,padding:"10px 12px",fontSize:13,resize:"none",outline:"none",color:TX,background:BG,fontFamily:"inherit",boxSizing:"border-box"}}/>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}>
                  <Btn onClick={submitCmt} style={{background:N,color:"#fff",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600}}>댓글 등록</Btn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 위키 목록 ── */}
        {page==="wiki"&&!curWiki&&(
          <div>
            <div style={{marginBottom:16}}><h1 style={{fontSize:21,fontWeight:700}}>교내 위키</h1><p style={{color:SO,fontSize:13,marginTop:3}}>학교의 모든 제도와 자원을 찾아보세요</p></div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {WIKI.map((w,i)=>(
                <div key={i} onClick={()=>setCurWiki(w)} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:30,flexShrink:0}}>{w.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:700,color:TX,marginBottom:3}}>{w.title}</div>
                    <div style={{fontSize:12,color:SO}}>{w.desc}</div>
                    <span style={{display:"inline-block",marginTop:6,padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:w.ok?MS:"#fef3c7",color:w.ok?"#0e8a5f":"#92400e"}}>{w.ok?"✅ 교사 인증":"📝 학생 작성"}</span>
                  </div>
                  <span style={{fontSize:16,color:LI,flexShrink:0}}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 위키 상세 ── */}
        {page==="wiki"&&curWiki&&(
          <div>
            <Btn onClick={()=>setCurWiki(null)} style={{display:"flex",alignItems:"center",gap:4,background:BG,color:SO,border:`1.5px solid ${BO}`,borderRadius:8,padding:"7px 14px",fontSize:13,marginBottom:16}}>← 위키 목록으로</Btn>
            <div style={{background:CA,borderRadius:12,padding:"20px 16px",border:`1px solid ${BO}`}}>
              <div style={{fontSize:34,marginBottom:10}}>{curWiki.icon}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                <h1 style={{fontSize:19,fontWeight:700,color:TX}}>{curWiki.title}</h1>
              </div>
              <span style={{display:"inline-block",padding:"3px 9px",borderRadius:5,fontSize:11,fontWeight:700,background:curWiki.ok?MS:"#fef3c7",color:curWiki.ok?"#0e8a5f":"#92400e",marginBottom:10}}>{curWiki.ok?"✅ 교사 인증":"📝 학생 작성"}</span>
              <p style={{fontSize:13,color:SO,marginBottom:16}}>{curWiki.desc}</p>
              <div style={{borderTop:`1px solid ${BO}`,paddingTop:16,fontSize:14,lineHeight:1.9,color:TX,whiteSpace:"pre-line"}}>{curWiki.content}</div>
              {curWiki.link&&(
                <a href={curWiki.link.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:14,background:N,color:"#fff",borderRadius:9,padding:"10px 18px",fontSize:13,fontWeight:600,textDecoration:"none"}}>
                  🔗 {curWiki.link.label}
                </a>
              )}
              {curWiki.ok&&<div style={{marginTop:16,background:MS,border:`1px solid ${MM}`,borderRadius:9,padding:"11px 14px",fontSize:12,color:"#0e7a5a"}}>✅ 교사가 직접 검토하고 인증한 공식 정보입니다.</div>}
            </div>
          </div>
        )}

        {/* ── 캘린더 ── */}
        {page==="calendar"&&(()=>{
          const days=["일","월","화","수","목","금","토"];
          const blanks=5; // 5월 1일 = 금요일
          const evInfo={
            1:"재량휴업", 4:"재량휴업",
            7:"학력평가",
            15:"체육대회",
            18:"진로컨설팅",19:"진로컨설팅",20:"진로컨설팅",
            21:"진로컨설팅",22:"진로컨설팅",23:"진로컨설팅",
            24:"진로컨설팅",25:"진로컨설팅",26:"진로컨설팅",
            27:"진로컨설팅",28:"진로컨설팅",29:"진로컨설팅",
          };
          const cellStyle={
            padding:"5px 0 4px",
            minHeight:52,
            background:CA,
            borderRight:`1px solid ${BO}`,
            borderBottom:`1px solid ${BO}`,
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            gap:3,
          };
          return(
            <div>
              <div style={{marginBottom:14}}>
                <h1 style={{fontSize:21,fontWeight:700}}>공유 캘린더</h1>
                <p style={{color:SO,fontSize:13,marginTop:3}}>2026년 5월</p>
              </div>
              <div style={{background:CA,borderRadius:14,border:`1px solid ${BO}`,overflow:"hidden",boxShadow:"0 1px 8px rgba(15,31,61,0.06)"}}>
                {/* 요일 헤더 */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:N}}>
                  {days.map(d=>(
                    <div key={d} style={{textAlign:"center",padding:"9px 0",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>
                      {d}
                    </div>
                  ))}
                </div>
                {/* 날짜 */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
                  {Array.from({length:blanks}).map((_,i)=>(
                    <div key={`b${i}`} style={{...cellStyle,background:"#fafafa"}}/>
                  ))}
                  {Array.from({length:31},(_,i)=>i+1).map(d=>{
                    const ev=evInfo[d];
                    const holiday=d===1||d===4;
                    return(
                      <div key={d} style={cellStyle}>
                        <div style={{fontSize:12,fontWeight:600,color:holiday?"#ef4444":TX}}>
                          {d}
                        </div>
                        {ev&&(
                          <div style={{background:N,color:"#fff",borderRadius:3,padding:"1px 4px",fontSize:7,fontWeight:600,lineHeight:1.5,textAlign:"center",width:"90%",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                            {ev}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 일정 목록 */}
              <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:6}}>
                {[
                  {d:"5월 1일·4일",label:"🏫 학교장재량휴업일"},
                  {d:"5월 7일",    label:"📝 고3 전국연합학력평가"},
                  {d:"5월 15일",   label:"🎽 1·2학년 체육대회 / 3학년 졸업앨범 실내촬영"},
                  {d:"5월 18~29일",label:"👨‍👩‍👧 학부모 진로 진학 컨설팅"},
                ].map((x,i)=>(
                  <div key={i} style={{background:CA,border:`1px solid ${BO}`,borderRadius:10,padding:"11px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{fontSize:12,fontWeight:700,color:N,whiteSpace:"nowrap",paddingTop:1,minWidth:72}}>{x.d}</div>
                    <div style={{fontSize:13,color:TX,lineHeight:1.5}}>{x.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── 내 계정 ── */}
        {page==="profile"&&<ProfilePage user={user} isTeacher={isTeacher} isAdmin={isAdmin} accounts={accounts} setAccounts={setAccounts} setUser={setUser} toast_={toast_}/>}

        {/* ── 이달의 급식 ── */}
        {page==="meal"&&(()=>{
          const weeks=[
            {label:"1주차",days:[{d:"5/4",day:"월"},{d:"5/5",day:"화"},{d:"5/6",day:"수"},{d:"5/7",day:"목"},{d:"5/8",day:"금"}]},
            {label:"2주차",days:[{d:"5/11",day:"월"},{d:"5/12",day:"화"},{d:"5/13",day:"수"},{d:"5/14",day:"목"},{d:"5/15",day:"금"}]},
            {label:"3주차",days:[{d:"5/18",day:"월"},{d:"5/19",day:"화"},{d:"5/20",day:"수"},{d:"5/21",day:"목"},{d:"5/22",day:"금"}]},
            {label:"4주차",days:[{d:"5/25",day:"월"},{d:"5/26",day:"화"},{d:"5/27",day:"수"},{d:"5/28",day:"목"},{d:"5/29",day:"금"}]},
          ];
          const today="5/20";
          return(
            <div>
              <div style={{marginBottom:14}}>
                <h1 style={{fontSize:21,fontWeight:700}}>🍱 이달의 급식</h1>
                <p style={{color:SO,fontSize:13,marginTop:3}}>2026년 5월 · 세종캐터링 제공</p>
              </div>

              {weeks.map((w,wi)=>(
                <div key={wi} style={{marginBottom:16}}>
                  <div style={{fontSize:13,fontWeight:700,color:SO,marginBottom:8,paddingLeft:2}}>{w.label}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {w.days.map(({d,day})=>{
                      const menu=MEAL[d];
                      const isToday=d===today;
                      return(
                        <div key={d} style={{background:isToday?"#f0fdf9":CA,border:`1px solid ${isToday?M:BO}`,borderRadius:12,padding:"12px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:menu?8:0}}>
                            <span style={{background:isToday?M:N,color:"#fff",borderRadius:6,padding:"2px 10px",fontSize:12,fontWeight:700}}>{day}</span>
                            <span style={{fontSize:13,fontWeight:700,color:isToday?M:TX}}>5월 {d.split("/")[1]}일</span>
                            {isToday&&<span style={{fontSize:11,color:M,fontWeight:600}}>오늘</span>}
                          </div>
                          {menu
                            ?<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                              {menu.map((item,i)=>(
                                <span key={i} style={{background:BG,border:`1px solid ${BO}`,borderRadius:5,padding:"3px 8px",fontSize:12,color:TX}}>
                                  {item.replace(/[\d.]+$/,"")}
                                </span>
                              ))}
                            </div>
                            :<div style={{fontSize:12,color:LI}}>휴업일</div>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── 관리자 ── */}
        {page==="admin"&&isAdmin&&(
          <div>
            <div style={{marginBottom:16}}><h1 style={{fontSize:21,fontWeight:700}}>⚙️ 관리자 대시보드</h1><p style={{color:SO,fontSize:13,marginTop:3}}>총관리자 전용 페이지</p></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
              {[{i:"🪪",n:idList.filter(r=>r.status==="pending").length,l:"학생증 대기",c:"#f59e0b"},{i:"✅",n:vq.length,l:"인증 대기",c:"#16a34a"},{i:"🚨",n:posts.filter(p=>p.fc>0).length,l:"사실확인 요청",c:AC},{i:"👥",n:142,l:"전체 가입자",c:N}].map((s,i)=>(
                <div key={i} style={{background:CA,borderRadius:12,padding:"16px",border:`1px solid ${BO}`}}>
                  <div style={{fontSize:20,marginBottom:6}}>{s.i}</div>
                  <div style={{fontSize:26,fontWeight:800,color:s.c,fontFamily:"serif"}}>{s.n}</div>
                  <div style={{fontSize:11,color:SO,marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* 탭 */}
            <div style={{display:"flex",gap:3,background:BG,padding:3,borderRadius:10,marginBottom:16,overflowX:"auto"}}>
              {[{k:"id",l:"🪪 학생증"},{k:"verify",l:"✅ 인증"},{k:"fc",l:"🚨 사실확인"},{k:"users",l:"👥 사용자"}].map(t=>(
                <Btn key={t.k} onClick={()=>setAdminTab(t.k)} style={{flex:1,padding:"8px 4px",textAlign:"center",borderRadius:8,fontSize:12,fontWeight:adminTab===t.k?700:500,color:adminTab===t.k?N:SO,background:adminTab===t.k?"#fff":"transparent",whiteSpace:"nowrap"}}>
                  {t.l}
                </Btn>
              ))}
            </div>

            {/* 학생증 검토 */}
            {adminTab==="id"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {idList.map(r=>(
                  <div key={r.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700}}>{r.name}</div>
                        <div style={{fontSize:12,color:SO}}>{r.grade} · {r.id} · {r.date}</div>
                      </div>
                      <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:r.status==="pending"?"#fef3c7":r.status==="ok"?"#dcfce7":"#fee2e2",color:r.status==="pending"?"#92400e":r.status==="ok"?"#166534":"#991b1b"}}>
                        {r.status==="pending"?"검토 대기":r.status==="ok"?"승인됨":"차단됨"}
                      </span>
                    </div>
                    <div style={{background:BG,border:`1px dashed ${BO}`,borderRadius:8,padding:"10px",textAlign:"center",fontSize:12,color:LI,marginBottom:r.status==="pending"?10:0,cursor:"pointer"}} onClick={()=>toast_("학생증 사진 확대 보기 (실제 구현 시 이미지 표시)")}>🪪 학생증 사진 보기</div>
                    {r.status==="pending"&&(
                      <div style={{display:"flex",gap:8}}>
                        <Btn onClick={()=>{setIdList(p=>p.map(x=>x.id===r.id?{...x,status:"ok"}:x));toast_(`${r.name} 승인됐어요 ✅`);}} style={{flex:1,background:"#dcfce7",color:"#166534",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>✅ 승인</Btn>
                        <Btn onClick={()=>{setIdList(p=>p.map(x=>x.id===r.id?{...x,status:"blocked"}:x));toast_(`${r.name} 차단됐어요 🚫`);}} style={{flex:1,background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>🚫 차단</Btn>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 정보 인증 */}
            {adminTab==="verify"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {vq.length===0&&<div style={{background:CA,borderRadius:12,padding:"24px",textAlign:"center",color:LI,border:`1px solid ${BO}`}}>검토할 항목이 없어요 🎉</div>}
                {vq.map(v=>(
                  <div key={v.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`}}>
                    <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{v.title}</div>
                    <div style={{fontSize:12,color:SO,marginBottom:4}}>{v.author} · {v.cat}</div>
                    <div style={{background:MS,border:`1px solid ${MM}`,borderRadius:7,padding:"8px 11px",fontSize:12,color:"#0e7a5a",marginBottom:10}}>📎 "{v.source}"</div>
                    <Btn onClick={()=>verifyPost(v.id)} style={{width:"100%",background:MS,color:"#0e8a5f",borderRadius:8,padding:"9px",fontSize:13,fontWeight:600}}>✅ 확인된 정보 승인</Btn>
                  </div>
                ))}
              </div>
            )}

            {/* 사실확인 */}
            {adminTab==="fc"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {posts.filter(p=>p.fc>0).length===0&&<div style={{background:CA,borderRadius:12,padding:"24px",textAlign:"center",color:LI,border:`1px solid ${BO}`}}>접수된 요청이 없어요 🎉</div>}
                {posts.filter(p=>p.fc>0).map(p=>(
                  <div key={p.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`}}>
                    <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{p.title}</div>
                    <div style={{fontSize:13,color:AC,fontWeight:700,marginBottom:6}}>요청 {p.fc}건</div>
                    {p.fcR.map((r,i)=><div key={i} style={{fontSize:12,color:SO,background:BG,borderRadius:6,padding:"5px 9px",marginBottom:4}}>· {r}</div>)}
                    <div style={{display:"flex",gap:8,marginTop:10}}>
                      <Btn onClick={()=>{setPosts(q=>q.map(x=>x.id===p.id?{...x,status:"blinded",fc:0,fcR:[]}:x));toast_("블라인드 처리됐어요");}} style={{flex:1,background:"#fff7ed",color:"#c2410c",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>🙈 블라인드</Btn>
                      <Btn onClick={()=>{setPosts(q=>q.map(x=>x.id===p.id?{...x,fc:0,fcR:[]}:x));toast_("정상 처리됐어요 ✅");}} style={{flex:1,background:MS,color:"#0e8a5f",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>✅ 정상 처리</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 사용자 관리 */}
            {adminTab==="users"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[{id:"20240001",name:"이윤진",grade:"1학년 3반",role:"총관리자",status:"ok"},...idList.filter(r=>r.id!=="20240001").map(r=>({...r,role:"일반 학생"}))].map(u=>(
                  <div key={u.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700}}>{u.name}</div>
                      <div style={{fontSize:12,color:SO}}>{u.grade} · {u.role}</div>
                      <span style={{display:"inline-block",marginTop:4,padding:"2px 8px",borderRadius:5,fontSize:11,fontWeight:700,background:u.status==="ok"?"#dcfce7":u.status==="pending"?"#fef3c7":"#fee2e2",color:u.status==="ok"?"#166534":u.status==="pending"?"#92400e":"#991b1b"}}>
                        {u.status==="ok"?"정상":u.status==="pending"?"검토 중":"차단됨"}
                      </span>
                    </div>
                    {u.status!=="blocked"
                      ?<Btn onClick={()=>{setIdList(p=>p.map(r=>r.id===u.id?{...r,status:"blocked"}:r));toast_(`${u.name} 차단됐어요 🚫`);}} style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600}}>🚫 차단</Btn>
                      :<Btn onClick={()=>{setIdList(p=>p.map(r=>r.id===u.id?{...r,status:"ok"}:r));toast_(`${u.name} 복구됐어요 ✅`);}} style={{background:"#dcfce7",color:"#166534",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600}}>✅ 복구</Btn>
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 글쓰기 모달 */}
      <Modal open={wModal} onClose={()=>setWModal(false)} title="✏️ 새 글 작성">
        {isTeacher&&(
          <div style={{background:"#ede9fe",border:"1px solid #c4b5fd",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#5b21b6",marginBottom:14}}>👩‍🏫 선생님 계정으로 게시하면 <strong>'선생님 인증 정보'</strong> 배지가 자동으로 부여되며 별도 검토가 필요 없습니다.</div>
        )}
        {!isTeacher&&<div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:500,color:SO,marginBottom:8}}>정보 유형 선택 *</div>
          <div style={{display:"flex",gap:8}}>
            {[{k:"verified",i:"✅",l:"확인된 정보",d:"출처 근거 입력 필요"},{k:"unverified",i:"⚠️",l:"미확인 정보",d:"출처 없이 올릴 수 있음"}].map(t=>(
              <div key={t.k} onClick={()=>setWType(t.k)} style={{flex:1,border:`2px solid ${wType===t.k?(t.k==="verified"?M:"#f59e0b"):BO}`,borderRadius:10,padding:"12px 8px",textAlign:"center",cursor:"pointer",background:wType===t.k?(t.k==="verified"?MS:"#fff7ed"):"#fff"}}>
                <div style={{fontSize:20,marginBottom:4}}>{t.i}</div>
                <div style={{fontSize:12,fontWeight:700,color:TX,marginBottom:2}}>{t.l}</div>
                <div style={{fontSize:10,color:SO}}>{t.d}</div>
              </div>
            ))}
          </div>
        </div>}
        {!isTeacher&&wType==="verified"&&(
          <div style={{marginBottom:14}}>
            <div style={{background:MS,border:`1px solid ${MM}`,borderRadius:8,padding:"9px 11px",fontSize:12,color:"#0e7a5a",marginBottom:8}}>💡 텍스트만으로도 입력 가능해요.<br/>예: "선생님께서 종례 시간에 공지해주셨습니다."</div>
            <div style={{fontSize:12,color:SO,marginBottom:6}}>확인 근거 *</div>
            <textarea value={wSrc} onChange={e=>setWSrc(e.target.value)} rows={3} placeholder="이 정보를 어떻게 확인하셨나요?" style={{width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:9,padding:"10px 12px",fontSize:13,outline:"none",color:TX,fontFamily:"inherit",resize:"none",boxSizing:"border-box"}}/>
          </div>
        )}
        {isTeacher&&<div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:SO,marginBottom:6}}>대상 학년</div>
          <select value={wGrade} onChange={e=>setWGrade(e.target.value)} style={{width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:9,padding:"10px 12px",fontSize:13,outline:"none",color:TX,fontFamily:"inherit"}}>
            <option value="공통">공통 (전체 학년)</option>
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
          </select>
        </div>}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:SO,marginBottom:6}}>카테고리</div>
          <select value={wCat} onChange={e=>setWCat(e.target.value)} style={{width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:9,padding:"10px 12px",fontSize:13,outline:"none",color:TX,fontFamily:"inherit"}}>
            {ALL_CATS.filter(c=>c!=="전체").map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:SO,marginBottom:6}}>제목</div>
          <input value={wTitle} onChange={e=>setWTitle(e.target.value)} placeholder="제목을 입력하세요" style={{width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:9,padding:"10px 12px",fontSize:13,outline:"none",color:TX,fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:4}}>
          <div style={{fontSize:12,color:SO,marginBottom:6}}>내용</div>
          <textarea value={wBody} onChange={e=>setWBody(e.target.value)} rows={5} placeholder="내용을 입력하세요" style={{width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:9,padding:"10px 12px",fontSize:13,outline:"none",color:TX,fontFamily:"inherit",resize:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
          <Btn onClick={()=>setWModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
          <Btn onClick={submitPost} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>게시하기</Btn>
        </div>
      </Modal>

      {/* 사실확인 모달 */}
      <Modal open={fcModal} onClose={()=>setFcModal(false)} title={isTeacher?"✅ 사실 확인 체크":"🚨 사실 확인 요청"}>
        <p style={{fontSize:13,color:SO,marginBottom:16}}>{isTeacher?"이 게시글의 내용이 사실임을 확인합니다. 추가로 전달할 내용이 있다면 아래에 입력해주세요.":"사실과 다르다고 생각하시나요? 구체적인 사유를 입력해주세요. 총관리자가 요청 수와 내용을 확인 후 직접 처리합니다."}</p>
        <div style={{fontSize:12,color:SO,marginBottom:6}}>사실과 다른 내용 *</div>
        <textarea value={fcText} onChange={e=>setFcText(e.target.value)} rows={4} placeholder={isTeacher?"추가로 할 말이 있으면 입력하세요 (선택사항)":"예: 시험 범위가 실제로는 2단원까지라고 선생님께서 말씀하셨습니다."} style={{width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:9,padding:"10px 12px",fontSize:13,outline:"none",color:TX,fontFamily:"inherit",resize:"none",boxSizing:"border-box",marginBottom:16}}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setFcModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
          <Btn onClick={submitFc} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>요청 제출</Btn>
        </div>
      </Modal>

      <Toast msg={toast}/>
    </div>
  );
}
