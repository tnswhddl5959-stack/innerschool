/* eslint-disable */
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";

// ── Firebase 설정 ──
const fb = initializeApp({
  apiKey: "AIzaSyDJQ003TtRZwL9LQM0YMPH9GKaqSmMnh_g",
  authDomain: "innerschool-9589a.firebaseapp.com",
  projectId: "innerschool-9589a",
  storageBucket: "innerschool-9589a.firebasestorage.app",
  messagingSenderId: "877561889584",
  appId: "1:877561889584:web:a6f04a0f32e1548a5d3ef5"
});
const db = getFirestore(fb);

// ── Firebase 헬퍼 (모든 데이터 Firebase에 저장) ──
const fbGet = async (key) => {
  try { const d = await getDoc(doc(db,"kv",key)); return d.exists() ? d.data().v : null; }
  catch { return null; }
};
const fbSet = async (key, val) => {
  try { await setDoc(doc(db,"kv",key), {v: val}); } catch(e) { console.error("fbSet",e); }
};
const fbDel = async (key) => {
  try { await deleteDoc(doc(db,"kv",key)); } catch {}
};

// ── 색상 ──
const N="#0f1f3d", M="#2dd4a0", MS="#e6faf4", MM="#a8edcf",
      AC="#ff6b6b", BG="#f4f6fb", CA="#fff",
      TX="#1a2540", SO="#5a6a8a", LI="#9aa5c0", BO="#e2e8f4";

// ── 비속어 필터 ──
const BAD=["씨발","시발","씨팔","시팔","개새끼","새끼","병신","지랄","미친놈","미친년","꺼져","닥쳐","존나","개소리","찐따","멍청이","바보새끼","개년","보지","자지","섹스","개같은","썅","개쓰레기","ㅅㅂ","ㅂㅅ","ㄱㅅㄲ","fuck","shit","bitch","asshole","bastard"];
const hasBad = (t) => { if(!t) return false; const s=t.toLowerCase().replace(/ /g,""); return BAD.some(w=>s.includes(w)); };

// ── 정적 데이터 ──
const INIT_ACCOUNTS = [
  {role:"student", id:"11025", name:"이윤진", pw:"100130", grade:"1", room:"10", status:"ok"},
  {role:"teacher", id:"T0001", name:"테스트",  pw:"1234",   subject:"도덕", status:"ok"},
];

const INIT_WIKI = [
  {icon:"🏫",title:"상담실 이용 안내",desc:"",ok:true,
   content:"📍 위치: 본관 1층 107호\n\n⏰ 운영 시간\n평일 09:00~17:00 (점심시간 포함)\n\n📝 예약 방법\n1. 담임 선생님께 상담 신청서 제출\n2. 또는 상담실 앞 예약 노트에 직접 기재\n3. 긴급 상담은 예약 없이 방문 가능\n\n👩‍🏫 담당: 김○○ 선생님 (내선 101)"},
  {icon:"📚",title:"도서관 이용 규칙",desc:"",ok:true,
   link:{label:"도서 검색",url:"https://read365.edunet.net/PureScreen/SchoolSearch?schoolName=%EA%B2%BD%EA%B8%B0%EC%B0%BD%EC%A1%B0%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90&provCode=J10&neisCode=J100005831"},
   content:"📍 위치: 본관 3층\n\n⏰ 운영 시간: 평일 08:00~18:00\n\n📖 대출 규정\n• 1인 최대 3권 대출\n• 대출 기간: 2주\n• 1회 1주 연장 가능\n\n⚠️ 연체 시 연체일수만큼 대출 정지"},
  {icon:"🎨",title:"동아리 목록 & 소개",desc:"",ok:false,
   content:"🎨 색채 (미술)\n활동: 회화, 소묘, 전시회 기획\n활동일: 화·목 방과 후\n\n🎵 하모니 (합창)\n활동: 합창, 교내 행사 공연\n활동일: 월·수 방과 후\n\n💻 코딩클럽\n활동: 프로그래밍, 앱 개발\n활동일: 금 방과 후"},
  {icon:"🎓",title:"수시 지원 절차",desc:"",ok:false,
   content:"📋 학교장 추천 전형\n• 추천 기준: 교과 석차등급 평균 2등급 이내\n• 봉사 시간: 50시간 이상 권장\n\n📝 자기소개서 팁\n1. 구체적인 경험과 성장 과정 중심\n2. 학교 활동과 연결\n3. 지원 학과와의 연관성 명확히\n\n🎤 면접: 모의 면접 상담실 활용 가능"},
  {icon:"🏥",title:"보건실 이용 안내",desc:"",ok:true,
   content:"📍 위치: 본관 1층 103호\n\n⏰ 운영 시간: 평일 08:30~17:00\n\n💊 구비 약품\n두통약, 소화제, 밴드, 소독약 등\n(처방약은 제공하지 않음)\n\n🚨 응급 상황\n1. 즉시 보건실 방문 또는 담임 선생님께 연락\n2. 심각한 경우 119 신고 후 보호자 연락"},
  {icon:"🍱",title:"급식 알레르기 정보",desc:"",ok:true,
   content:"1.난류  2.우유  3.메밀  4.땅콩  5.대두  6.밀  7.고등어  8.게  9.새우  10.돼지고기  11.복숭아  12.토마토  13.아황산류  14.호두  15.닭고기  16.쇠고기  17.오징어  18.조개류(굴,전복,홍합 포함)  19.잣"},
];

const SUB_CATS = ["📝 수행평가","📚 학업·시험","🎓 입시 정보","📊 SLAT","🎨 동아리","📅 행사·일정","🍱 급식·학교생활","📢 학교 공지","🙋 질문 게시판"];
const ALL_CATS = ["전체",...SUB_CATS];

const MEAL = {
  "5/6":["참쌀밥","배추된장국5.6","제육볶음5.6.10","계란말이1.5","진미채도라지무침5.6.17","깍두기9","대추방울토마토12"],
  "5/7":["김치볶음밥2.5.6.9.10.15","핫도그/케첩1.2.5.6.10.12.15","스크램블에그3","들기름막국수3.5.6","백김치","쥬시쿨에이드2"],
  "5/8":["현미밥","비지찌개5.6.9.10","봉추ST.찜닭5.6.15","가마보꼬볶음5.6.16","검정콩조림5","열무김치9","상하목장요구르트2"],
  "5/11":["보리밥","황태두부국1.5","칠리깐풍새우1.5.6.9.10.12.15","미역줄기볶음5","츄러스1.2.5.6.16","포기김치9"],
  "5/12":["기장밥","콩가루배추국5.6","소고기계란장조림1.5.16","빨간어묵볶음5.6.16","고감콘고로케1.5.6","포기김치9","젤리볼리"],
  "5/13":["치킨마요덮밥(찹쌀밥)","얼큰콩나물국5","치킨마요덮밥재료1.2.5.6.15","데리마요소스1.2.5.6","한섬만두1.2.5.6.10.16","볶음김치5.6.9","엠프로키즈요구르트2"],
  "5/14":["찹쌀밥","돈갈비김치찌개5.6.9.10","안심까스/소스1.2.5.6.12.16","베이컨계란찜1.5.6.10","레몬피클5","열무김치9","제리뽀"],
  "5/15":["수수밥","호박된장찌개5.6","LA갈비찜5.6.10","브로콜리들깨무침5.6","건새우마늘쫑볶음5.6.9","깍두기9","사과즙(학교지원)"],
  "5/18":["흑미밥","소고기무국5.6.16","김치삼겹볶음5.6.9.10","콩나물부추무침5","야채춘권5.6","깍두기9"],
  "5/19":["기장밥","육개장1.2.5.6.10.12.16","가자미볼/소스1.5.6.12","우엉잡채5.6.10","도토리묵치커리무침5","포기김치9"],
  "5/20":["찹쌀밥","진미짜장야채소스1.2.5.6.10","순살가라아케치킨1.5.6.10.15.16","한식탕평채1.5.6.16","깍독단무침5","포기김치9","수박"],
  "5/21":["잡곡밥","차돌된장국5.6.16","오징어치즈떡볶음2.5.6.17","새콤오이무침5","스팸버섯볶음5.6.10","총각김치9","허쉬드링크2"],
  "5/22":["차조밥","부대찌개1.2.5.6.9.10.12.16","닭볼고기5.6.15","청경채나물무침5","포기김치9","방울토마토(학교지원)"],
  "5/26":["현미밥","웅심이계란국1.5.6.10.16","명란한떡갈비5.6.7.10.16","진미채조림5.6.17","포기김치9","파인애플"],
  "5/27":["찹쌀밥","하이라이스1.2.5.6.10.12.15","고추장떡볶이5.6","김말이튀김5.6","쫄면야채무침5.6","포기김치9","스위트믹스"],
  "5/28":["찹쌀밥","우렁된장찌개5.6","소고기숙주파채볶음5.6.16","참나물쌈장무침5.6","허니버터알감자1.2.5.6","열무김치9"],
  "5/29":["보조밥","소고기스프2.5.6.15.16","토마토스파게티1.2.5.6.10.12","스노우순살치킨1.2.5.6.10.12.15.16","수제오이피클5","포기김치9","마늘빵2.5.6"],
};

const CAL_EV = {
  1:"재량휴업", 4:"재량휴업", 7:"학력평가", 15:"체육대회",
  18:"진로컨설팅",19:"진로컨설팅",20:"진로컨설팅",21:"진로컨설팅",
  22:"진로컨설팅",23:"진로컨설팅",24:"진로컨설팅",25:"진로컨설팅",
  26:"진로컨설팅",27:"진로컨설팅",28:"진로컨설팅",29:"진로컨설팅",
};

// ── 공통 컴포넌트 ──
const Btn = ({onClick,children,style={}}) =>
  <button onClick={onClick} style={{fontFamily:"inherit",cursor:"pointer",border:"none",...style}}>{children}</button>;

const Toast = ({msg}) => msg
  ? <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:N,color:"#fff",padding:"11px 22px",borderRadius:10,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>{msg}</div>
  : null;

const Modal = ({open,onClose,title,children}) => !open ? null : (
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,padding:24,width:"100%",maxWidth:460,maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{fontSize:17,fontWeight:700,color:TX,marginBottom:18}}>{title}</div>
      {children}
    </div>
  </div>
);

const Chip = ({type,status}) => {
  if(type==="teacher") return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:"#ede9fe",color:"#5b21b6"}}>👩‍🏫 선생님 인증</span>;
  if(type==="verified"&&status==="verified") return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:MS,color:"#0e8a5f"}}>✅ 확인된 정보</span>;
  if(type==="verified"&&status==="pending") return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:"#fef3c7",color:"#92400e"}}>🔍 검토 중</span>;
  return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:"#fff7ed",color:"#c2410c"}}>⚠️ 미확인</span>;
};

const inp0 = {width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
const inp1 = {width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:10,padding:"11px 14px",fontSize:14,outline:"none",color:TX,fontFamily:"inherit",boxSizing:"border-box"};
const lbl0 = {color:"rgba(255,255,255,0.65)",fontSize:12,display:"block",marginBottom:6};
const lbl1 = {fontSize:12,fontWeight:500,color:SO,display:"block",marginBottom:6};
const authBox = {minHeight:"100vh",background:"linear-gradient(135deg,#0f1f3d 0%,#233f7a 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:16};
const authCard = {background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:22,padding:"40px 32px",width:"100%",maxWidth:420,maxHeight:"95vh",overflowY:"auto"};

const AuthHeader = () => (
  <>
    <div style={{fontFamily:"serif",fontSize:22,fontWeight:800,color:M}}>INNERSCHOOL</div>
    <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:24}}>교육기회 공정성 실현을 위한 정보 공유 시스템</div>
  </>
);

// ── 로그인 화면들 ──
function LoginRole({onSelect,onReg}) {
  return (
    <div style={authBox}>
      <div style={authCard}>
        <AuthHeader/>
        <div style={{color:"#fff",fontSize:18,fontWeight:700,marginBottom:6}}>로그인</div>
        <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginBottom:20}}>로그인할 계정을 선택해주세요</div>
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          {[{k:"student",i:"🎒",l:"학생"},{k:"teacher",i:"👩‍🏫",l:"선생님"}].map(r=>(
            <div key={r.k} onClick={()=>onSelect(r.k)} style={{flex:1,border:"2px solid rgba(45,212,160,0.3)",borderRadius:14,padding:"22px 12px",textAlign:"center",cursor:"pointer",background:"rgba(255,255,255,0.04)"}}>
              <div style={{fontSize:32,marginBottom:8}}>{r.i}</div>
              <div style={{color:"#fff",fontSize:15,fontWeight:700}}>{r.l}</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",color:"rgba(255,255,255,0.45)",fontSize:13}}>
          계정이 없으신가요? <span onClick={onReg} style={{color:M,fontWeight:600,cursor:"pointer"}}>가입하기</span>
        </div>
      </div>
    </div>
  );
}

function LoginStudent({onBack,onLogin,onReg}) {
  const [id,setId]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  const go=()=>{
    if(id.length!==5){setErr("학번은 5자리 숫자여야 합니다");return;}
    if(!pw.trim()){setErr("비밀번호를 입력해주세요");return;}
    setErr(""); onLogin(id,pw,"student");
  };
  return (
    <div style={authBox}><div style={authCard}>
      <AuthHeader/>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <span onClick={onBack} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
        <span style={{color:"#fff",fontSize:18,fontWeight:700}}>🎒 학생 로그인</span>
      </div>
      <div style={{marginBottom:4}}><label style={lbl0}>학번</label>
        <input value={id} onChange={e=>{const v=e.target.value.replace(/[^0-9]/g,"");if(v.length<=5)setId(v);}} placeholder="예: 10101" style={inp0}/>
      </div>
      <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginBottom:14}}>학년(1)+반(2자리)+번호(2자리) · 예: 1학년 1반 1번 → 10101</div>
      <div style={{marginBottom:18}}><label style={lbl0}>비밀번호</label>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="비밀번호 입력" style={inp0}/>
      </div>
      {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
      <button onClick={go} style={{width:"100%",background:M,color:N,border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>로그인</button>
      <div style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,0.45)",fontSize:13}}>
        계정이 없으신가요? <span onClick={onReg} style={{color:M,fontWeight:600,cursor:"pointer"}}>가입하기</span>
      </div>
    </div></div>
  );
}

function LoginTeacher({onBack,onLogin,onReg}) {
  const [name,setName]=useState(""); const [sub,setSub]=useState("국어"); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  const SUBS=["국어","영어","수학","과학","사회","역사","도덕","체육","음악","미술","기술·가정","정보","한문","제2외국어","진로"];
  const go=()=>{
    if(!name.trim()){setErr("이름을 입력해주세요");return;}
    if(!pw.trim()){setErr("비밀번호를 입력해주세요");return;}
    setErr(""); onLogin(name,pw,sub);
  };
  return (
    <div style={authBox}><div style={authCard}>
      <AuthHeader/>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <span onClick={onBack} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
        <span style={{color:"#fff",fontSize:18,fontWeight:700}}>👩‍🏫 선생님 로그인</span>
      </div>
      <div style={{marginBottom:14}}><label style={lbl0}>이름</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="성함을 입력하세요" style={inp0}/></div>
      <div style={{marginBottom:14}}><label style={lbl0}>담당 교과목</label>
        <select value={sub} onChange={e=>setSub(e.target.value)} style={inp0}>
          {SUBS.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{marginBottom:18}}><label style={lbl0}>비밀번호</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="비밀번호 입력" style={inp0}/></div>
      {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
      <button onClick={go} style={{width:"100%",background:M,color:N,border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>로그인</button>
      <div style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,0.45)",fontSize:13}}>
        계정이 없으신가요? <span onClick={onReg} style={{color:M,fontWeight:600,cursor:"pointer"}}>가입하기</span>
      </div>
    </div></div>
  );
}

function Login({onLogin,onReg}) {
  const [role,setRole]=useState(null);
  if(!role) return <LoginRole onSelect={setRole} onReg={onReg}/>;
  if(role==="student") return <LoginStudent onBack={()=>setRole(null)} onLogin={onLogin} onReg={onReg}/>;
  return <LoginTeacher onBack={()=>setRole(null)} onLogin={onLogin} onReg={onReg}/>;
}

// ── 가입 화면 ──
const TEACHER_CODE="changjo2605";
function makeSid(g,r,n){ return g+String(r).padStart(2,"0")+String(n).padStart(2,"0"); }

function Register({onDone,onBack}) {
  const [role,setRole]=useState(null);
  const [name,setName]=useState(""); const [pw,setPw]=useState(""); const [pwConfirm,setPwConfirm]=useState(""); const [err,setErr]=useState("");
  const [showPw,setShowPw]=useState(false); const [showPwConfirm,setShowPwConfirm]=useState(false);
  const [grade,setGrade]=useState("1"); const [room,setRoom]=useState("1"); const [num,setNum]=useState("1");
  const [preview,setPreview]=useState(null);
  const [agreed,setAgreed]=useState(false);
  const [sub,setSub]=useState("국어"); const [code,setCode]=useState(""); const [showCode,setShowCode]=useState(false);
  const SUBS=["국어","영어","수학","과학","사회","역사","도덕","체육","음악","미술","기술·가정","정보","한문","제2외국어","진로"];
  const sid=makeSid(grade,room,num);
  const rooms=Array.from({length:10},(_,i)=>i+1);
  const nums=Array.from({length:35},(_,i)=>i+1);

  const doStudent=()=>{
    if(!name.trim()){setErr("이름을 입력해주세요");return;}
    if(!pw.trim()){setErr("비밀번호를 입력해주세요");return;}
    if(pw.length<4){setErr("비밀번호는 4자 이상이어야 해요");return;}
    if(pw!==pwConfirm){setErr("비밀번호가 일치하지 않아요");return;}
    if(!preview){setErr("학생증 사진을 첨부해주세요");return;}
    if(!agreed){setErr("개인정보 수집·이용에 동의해주세요");return;}
    setErr(""); onDone({role:"student",name,sid,grade,room,pw});
  };
  const doTeacher=()=>{
    if(!name.trim()){setErr("이름을 입력해주세요");return;}
    if(!pw.trim()){setErr("비밀번호를 입력해주세요");return;}
    if(pw.length<4){setErr("비밀번호는 4자 이상이어야 해요");return;}
    if(pw!==pwConfirm){setErr("비밀번호가 일치하지 않아요");return;}
    if(code!==TEACHER_CODE){setErr("인증코드가 올바르지 않습니다");return;}
    setErr(""); onDone({role:"teacher",name,subject:sub,pw});
  };

  if(!role) return (
    <div style={authBox}><div style={authCard}>
      <AuthHeader/>
      <div style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:16}}>가입할 계정을 선택해주세요</div>
      <div style={{display:"flex",gap:12,marginBottom:20}}>
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
    </div></div>
  );

  if(role==="student") return (
    <div style={authBox}><div style={authCard}>
      <AuthHeader/>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
        <span onClick={()=>{setRole(null);setErr("");}} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
        <span style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>🎒 학생으로 가입</span>
      </div>
      <div style={{marginBottom:12}}><label style={lbl0}>이름</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="본명을 입력하세요" style={inp0}/></div>
      <div style={{marginBottom:4}}><label style={lbl0}>학년 · 반 · 번호</label>
        <div style={{display:"flex",gap:6}}>
          <select value={grade} onChange={e=>setGrade(e.target.value)} style={{...inp0,flex:1}}><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>
          <select value={room} onChange={e=>setRoom(e.target.value)} style={{...inp0,flex:1}}>{rooms.map(n=><option key={n} value={n}>{n}반</option>)}</select>
          <select value={num} onChange={e=>setNum(e.target.value)} style={{...inp0,flex:1}}>{nums.map(n=><option key={n} value={n}>{n}번</option>)}</select>
        </div>
      </div>
      <div style={{background:"rgba(45,212,160,0.08)",border:"1px solid rgba(45,212,160,0.15)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
        <span>🪪</span><span>자동 생성된 학번: <strong style={{color:M,fontSize:14}}>{sid}</strong></span>
      </div>
      <div style={{marginBottom:12}}>
        <label style={lbl0}>비밀번호</label>
        <div style={{position:"relative"}}>
          <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="4자 이상 입력" style={{...inp0,paddingRight:42}}/>
          <span onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,0.5)"}}>{showPw?"🙈":"👁"}</span>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <label style={lbl0}>비밀번호 확인</label>
        <div style={{position:"relative"}}>
          <input type={showPwConfirm?"text":"password"} value={pwConfirm} onChange={e=>setPwConfirm(e.target.value)} placeholder="비밀번호 다시 입력" style={{...inp0,paddingRight:42,border:pwConfirm&&pw!==pwConfirm?"1px solid #ff8a8a":inp0.border}}/>
          <span onClick={()=>setShowPwConfirm(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,0.5)"}}>{showPwConfirm?"🙈":"👁"}</span>
        </div>
        {pwConfirm&&pw!==pwConfirm&&<div style={{fontSize:11,color:"#ff8a8a",marginTop:4}}>비밀번호가 일치하지 않아요</div>}
        {pwConfirm&&pw===pwConfirm&&<div style={{fontSize:11,color:"#2dd4a0",marginTop:4}}>✅ 비밀번호가 일치해요</div>}
      </div>
      <div style={{marginBottom:14}}>
        <label style={lbl0}>학생증 사진 <span style={{color:M}}>*필수</span></label>
        <label style={{display:"block",border:`2px dashed rgba(45,212,160,${preview?0.6:0.3})`,borderRadius:10,padding:preview?6:18,textAlign:"center",cursor:"pointer"}}>
          {preview?<img src={preview} alt="" style={{width:"100%",maxHeight:110,objectFit:"cover",borderRadius:8}}/>
            :<><div style={{fontSize:26,marginBottom:6}}>🪪</div><div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}><span style={{color:M,fontWeight:600}}>클릭하여 첨부</span></div></>}
          <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
            const f=e.target.files[0]; if(!f) return;
            setPreview(URL.createObjectURL(f));
          }}/>
        </label>

      </div>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"14px",marginBottom:14}}>
        <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,fontWeight:600,marginBottom:8}}>📋 개인정보 수집·이용 동의</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,lineHeight:1.7,marginBottom:10}}>
          <strong style={{color:"rgba(255,255,255,0.7)"}}>수집 항목:</strong> 학생증 사진, 이름, 학번<br/>
          <strong style={{color:"rgba(255,255,255,0.7)"}}>수집 목적:</strong> 재학생 여부 확인<br/>
          <strong style={{color:"rgba(255,255,255,0.7)"}}>보유 기간:</strong> 총관리자 검토 완료 즉시 삭제<br/>
          <strong style={{color:"rgba(255,255,255,0.7)"}}>제3자 제공:</strong> 없음
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{width:16,height:16,accentColor:M}}/>
          <span style={{color:"rgba(255,255,255,0.75)",fontSize:12,fontWeight:500}}>위 개인정보 수집·이용에 동의합니다 <span style={{color:M}}>*필수</span></span>
        </label>
      </div>
      {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"8px 12px"}}>{err}</div>}
      <button onClick={doStudent} style={{width:"100%",background:agreed?M:"rgba(45,212,160,0.3)",color:N,border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:agreed?"pointer":"not-allowed",fontFamily:"inherit"}}>가입하기</button>
    </div></div>
  );

  return (
    <div style={authBox}><div style={authCard}>
      <AuthHeader/>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
        <span onClick={()=>{setRole(null);setErr("");}} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
        <span style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>👩‍🏫 선생님으로 가입</span>
      </div>
      <div style={{marginBottom:12}}><label style={lbl0}>이름</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="성함을 입력하세요" style={inp0}/></div>
      <div style={{marginBottom:14}}><label style={lbl0}>담당 교과목</label>
        <select value={sub} onChange={e=>setSub(e.target.value)} style={inp0}>{SUBS.map(s=><option key={s}>{s}</option>)}</select>
      </div>
      <div style={{marginBottom:12}}>
        <label style={lbl0}>비밀번호</label>
        <div style={{position:"relative"}}>
          <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="4자 이상 입력" style={{...inp0,paddingRight:42}}/>
          <span onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,0.5)"}}>{showPw?"🙈":"👁"}</span>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <label style={lbl0}>비밀번호 확인</label>
        <div style={{position:"relative"}}>
          <input type={showPwConfirm?"text":"password"} value={pwConfirm} onChange={e=>setPwConfirm(e.target.value)} placeholder="비밀번호 다시 입력" style={{...inp0,paddingRight:42,border:pwConfirm&&pw!==pwConfirm?"1px solid #ff8a8a":inp0.border}}/>
          <span onClick={()=>setShowPwConfirm(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,0.5)"}}>{showPwConfirm?"🙈":"👁"}</span>
        </div>
        {pwConfirm&&pw!==pwConfirm&&<div style={{fontSize:11,color:"#ff8a8a",marginTop:4}}>비밀번호가 일치하지 않아요</div>}
        {pwConfirm&&pw===pwConfirm&&<div style={{fontSize:11,color:"#2dd4a0",marginTop:4}}>✅ 비밀번호가 일치해요</div>}
      </div>
      <div style={{marginBottom:6}}><label style={lbl0}>교사 인증코드 <span style={{color:M}}>*필수</span></label><input type="password" value={code} onChange={e=>setCode(e.target.value)} placeholder="인증코드를 입력하세요" style={inp0}/></div>
      {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"8px 12px"}}>{err}</div>}
      <button onClick={doTeacher} style={{width:"100%",background:M,color:N,border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>가입하기</button>
    </div></div>
  );
}

// ── 프로필 페이지 ──
function ProfilePage({user,isTeacher,isAdmin,accounts,onUpdate}) {
  const [tab,setTab]=useState("info");
  const [newName,setNewName]=useState(user.name);
  const [newSub,setNewSub]=useState(user.room||"국어");
  const [curPw,setCurPw]=useState(""); const [newPw,setNewPw]=useState(""); const [confirmPw,setConfirmPw]=useState("");
  const [err,setErr]=useState(""); const [ok,setOk]=useState("");
  const [deleteReason,setDeleteReason]=useState("");
  const [deleteReasonText,setDeleteReasonText]=useState("");
  const [deleteConfirm,setDeleteConfirm]=useState(false);
  const SUBS=["국어","영어","수학","과학","사회","역사","도덕","체육","음악","미술","기술·가정","정보","한문","제2외국어","진로"];

  const saveInfo=async()=>{
    if(!newName.trim()){setErr("이름을 입력해주세요");setOk("");return;}
    const newAcc=isTeacher?{...accounts.find(a=>a.id===user.id),name:newName.trim(),subject:newSub}:{...accounts.find(a=>a.id===user.id),name:newName.trim()};
    const updated=[...accounts.filter(a=>a.id!==user.id),newAcc];
    await fbSet("accounts",updated);
    onUpdate(updated,{...user,name:newName.trim(),...(isTeacher?{room:newSub}:{})});
    setErr("");setOk("정보가 수정되었어요 ✅");
  };

  const doDelete=async()=>{
    if(!deleteReason){setErr("삭제 이유를 선택해주세요");return;}
    if(!deleteConfirm){setErr("계정 삭제에 동의해주세요");return;}
    const reason=deleteReason==="기타"?deleteReasonText.trim()||"기타":deleteReason;
    // Firebase에서 계정 삭제
    const updated=accounts.filter(a=>a.id!==user.id);
    await fbSet("accounts",updated);
    await fbDel("sess");
    onUpdate(updated,user);
    alert(`계정이 삭제됐어요. 이유: ${reason}`);
    window.location.reload();
  };

  const savePw=async()=>{
    const acc=accounts.find(a=>a.id===user.id);
    if(!acc){setErr("계정을 찾을 수 없어요");return;}
    if(acc.pw!==curPw){setErr("현재 비밀번호가 일치하지 않아요");setOk("");return;}
    if(!newPw.trim()){setErr("새 비밀번호를 입력해주세요");return;}
    if(newPw!==confirmPw){setErr("새 비밀번호가 서로 일치하지 않아요");return;}
    if(newPw.length<4){setErr("비밀번호는 4자 이상이어야 해요");return;}
    const updated=[...accounts.filter(a=>a.id!==user.id),{...acc,pw:newPw}];
    await fbSet("accounts",updated);
    onUpdate(updated,user);
    setCurPw("");setNewPw("");setConfirmPw("");
    setErr("");setOk("비밀번호가 변경되었어요 ✅");
  };

  return (
    <div>
      <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>내 계정</h1><p style={{color:SO,fontSize:13,marginTop:3}}>계정 정보를 확인하고 수정하세요</p></div>
      <div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`,marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${M},#1a9e76)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:N,flexShrink:0}}>{user.name[0]}</div>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:TX,marginBottom:3}}>{user.name}</div>
          <div style={{fontSize:13,color:SO}}>{isAdmin?"총관리자":isTeacher?user.room+" 선생님":user.grade+" "+user.room}</div>
          <div style={{fontSize:12,color:LI,marginTop:2}}>ID: {user.id}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:3,background:BG,padding:3,borderRadius:10,marginBottom:16}}>
        {[{k:"info",l:"✏️ 정보 수정"},{k:"pw",l:"🔑 비밀번호 변경"},{k:"delete",l:"🗑 계정 삭제"}].map(t=>(
          <Btn key={t.k} onClick={()=>{setTab(t.k);setErr("");setOk("");}} style={{flex:1,padding:"9px",borderRadius:8,fontSize:13,fontWeight:tab===t.k?700:500,color:tab===t.k?N:SO,background:tab===t.k?CA:"transparent"}}>
            {t.l}
          </Btn>
        ))}
      </div>
      {tab==="info"&&(
        <div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`}}>
          <div style={{marginBottom:14}}><label style={lbl1}>이름</label><input value={newName} onChange={e=>setNewName(e.target.value)} style={inp1}/></div>
          {isTeacher&&<div style={{marginBottom:14}}><label style={lbl1}>담당 교과목</label><select value={newSub} onChange={e=>setNewSub(e.target.value)} style={inp1}>{SUBS.map(s=><option key={s}>{s}</option>)}</select></div>}
          {!isTeacher&&<div style={{marginBottom:14}}><label style={lbl1}>학번</label><input value={user.id} disabled style={{...inp1,opacity:0.5,cursor:"not-allowed"}}/><div style={{fontSize:11,color:LI,marginTop:4}}>학번은 변경할 수 없어요</div></div>}
          {err&&<div style={{color:"#c2410c",fontSize:12,marginBottom:10,background:"#fff7ed",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
          {ok&&<div style={{color:"#0e8a5f",fontSize:12,marginBottom:10,background:MS,borderRadius:7,padding:"7px 11px"}}>{ok}</div>}
          <Btn onClick={saveInfo} style={{width:"100%",background:N,color:"#fff",borderRadius:10,padding:12,fontSize:14,fontWeight:700}}>저장하기</Btn>
        </div>
      )}
      {tab==="pw"&&(
        <div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`}}>
          <div style={{marginBottom:14}}><label style={lbl1}>현재 비밀번호</label><input type="password" value={curPw} onChange={e=>setCurPw(e.target.value)} placeholder="현재 비밀번호 입력" style={inp1}/></div>
          <div style={{marginBottom:14}}><label style={lbl1}>새 비밀번호</label><input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="새 비밀번호 입력 (4자 이상)" style={inp1}/></div>
          <div style={{marginBottom:16}}><label style={lbl1}>새 비밀번호 확인</label><input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="새 비밀번호 다시 입력" style={inp1}/></div>
          {err&&<div style={{color:"#c2410c",fontSize:12,marginBottom:10,background:"#fff7ed",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
          {ok&&<div style={{color:"#0e8a5f",fontSize:12,marginBottom:10,background:MS,borderRadius:7,padding:"7px 11px"}}>{ok}</div>}
          <Btn onClick={savePw} style={{width:"100%",background:N,color:"#fff",borderRadius:10,padding:12,fontSize:14,fontWeight:700}}>비밀번호 변경</Btn>
        </div>
      )}
      {tab==="delete"&&(
        <div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`}}>
          <div style={{background:"#fee2e2",border:"1px solid #fecaca",borderRadius:10,padding:"14px",marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:"#991b1b",marginBottom:6}}>⚠️ 계정 삭제 주의사항</div>
            <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.7}}>
              • 삭제한 계정은 복구할 수 없어요<br/>
              • 작성한 게시글과 댓글은 삭제되지 않아요<br/>
              • 재가입 시 동일 학번으로 가입 가능해요
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={lbl1}>삭제 이유 선택 *</label>
            <select value={deleteReason} onChange={e=>setDeleteReason(e.target.value)} style={inp1}>
              <option value="">선택해주세요</option>
              {["졸업 또는 전학","개인정보 보호","사이트 이용 안 함","기타"].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          {deleteReason==="기타"&&(
            <div style={{marginBottom:14}}>
              <label style={lbl1}>기타 이유 입력</label>
              <textarea value={deleteReasonText} onChange={e=>setDeleteReasonText(e.target.value)} rows={3} placeholder="삭제 이유를 입력해주세요" style={{...inp1,resize:"none",boxSizing:"border-box"}}/>
            </div>
          )}
          <div style={{marginBottom:16}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:TX}}>
              <input type="checkbox" checked={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.checked)} style={{accentColor:"#ef4444",width:16,height:16}}/>
              계정을 삭제하면 복구할 수 없음을 이해했어요
            </label>
          </div>
          {err&&<div style={{color:"#c2410c",fontSize:12,marginBottom:10,background:"#fff7ed",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
          <Btn onClick={doDelete} style={{width:"100%",background:"#ef4444",color:"#fff",borderRadius:10,padding:12,fontSize:14,fontWeight:700}}>계정 삭제하기</Btn>
        </div>
      )}
    </div>
  );
}

// ── 문의 탭 컴포넌트 ──
function InquiryTab({db,onSnapshot,collection}){
  const [items,setItems]=useState([]);
  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"inquiries"),snap=>{
      const list=snap.docs.map(d=>({id:d.id,...d.data()}));
      list.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
      setItems(list);
    });
    return ()=>unsub();
  },[]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {items.length===0&&<div style={{background:"#fff",borderRadius:12,padding:"24px",textAlign:"center",color:"#9aa5c0",border:"1px solid #e2e8f4"}}>접수된 문의가 없어요 🎉</div>}
      {items.map(item=>(
        <div key={item.id} style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #e2e8f4"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:"#ede9fe",color:"#5b21b6"}}>{item.type}</span>
              <span style={{fontSize:12,color:"#5a6a8a"}}>{item.author} · {item.isTeacher?"교사":item.userId} · {item.date}</span>
            </div>
            <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:5,background:item.status==="미확인"?"#fef3c7":"#dcfce7",color:item.status==="미확인"?"#92400e":"#166534"}}>{item.status}</span>
          </div>
          <div style={{fontSize:13,color:"#1a2540",lineHeight:1.6,background:"#f4f6fb",borderRadius:8,padding:"10px 12px"}}>{item.text}</div>
        </div>
      ))}
    </div>
  );
}

// ── 메인 앱 ──
export default function App() {
  const [scr,setScr]=useState("loading");
  const [isAdmin,setIsAdmin]=useState(false);
  const [isTeacher,setIsTeacher]=useState(false);
  const [user,setUser]=useState({name:"",id:"",grade:"",room:""});
  const [accounts,setAccounts]=useState(INIT_ACCOUNTS);
  const [page,setPage]=useState("board");
  const [sidebar,setSidebar]=useState(false);
  const [posts,setPosts]=useState([]);
  const [cmts,setCmts]=useState({});
  const [wiki,setWiki]=useState(INIT_WIKI);
  const [idList,setIdList]=useState([]);
  const [vq,setVq]=useState([]);
  const [gradTab,setGradTab]=useState("전체");
  const [cat,setCat]=useState("전체");
  const [curPost,setCurPost]=useState(null);
  const [curWiki,setCurWiki]=useState(null);
  const [adminTab,setAdminTab]=useState("id");
  const [toast,setToast]=useState("");
  const [wModal,setWModal]=useState(false);
  const [wType,setWType]=useState(null);
  const [wCat,setWCat]=useState("📝 수행평가");
  const [wGrade,setWGrade]=useState("공통");
  const [wTitle,setWTitle]=useState("");
  const [wBody,setWBody]=useState("");
  const [wSrc,setWSrc]=useState("");
  const [cText,setCText]=useState("");
  const [anon,setAnon]=useState(false);
  const [fcModal,setFcModal]=useState(false);
  const [fcTarget,setFcTarget]=useState(null);
  const [fcText,setFcText]=useState("");
  const [editModal,setEditModal]=useState(false);
  const [editPost,setEditPost]=useState(null);
  const [editTitle,setEditTitle]=useState("");
  const [editBody,setEditBody]=useState("");
  const [wikiEditModal,setWikiEditModal]=useState(false);
  const [editWiki,setEditWiki]=useState(null);
  const [wikiAddModal,setWikiAddModal]=useState(false);
  const [inquiryModal,setInquiryModal]=useState(false);
  const [inquiryText,setInquiryText]=useState("");
  const [inquiryType,setInquiryType]=useState("오류 신고");
  const [newWikiIcon,setNewWikiIcon]=useState("📄");
  const [newWikiTitle,setNewWikiTitle]=useState("");
  const [newWikiDesc,setNewWikiDesc]=useState("");
  const [newWikiContent,setNewWikiContent]=useState("");
  const [newWikiOk,setNewWikiOk]=useState(false);

  const toast_ = msg => { setToast(msg); setTimeout(()=>setToast(""),2800); };
  const goPage = p => { setPage(p); setSidebar(false); setCurWiki(null); };

  // ── 앱 시작: Firebase에서 모든 데이터 로드 ──
  useEffect(()=>{
    (async()=>{
      // 1. accounts 불러오기
      const savedAcc = await fbGet("accounts");
      const accList = (savedAcc&&savedAcc.length>0) ? savedAcc : INIT_ACCOUNTS;
      setAccounts(accList);

      // 2. wiki 불러오기
      const savedWiki = await fbGet("wiki");
      if(savedWiki&&savedWiki.length>0) setWiki(savedWiki);

      // 3. 세션 확인 (userId로 자동 로그인) - 각자 브라우저에 저장
      const sessStr = localStorage.getItem("innerschool_sess");
      const sess = sessStr ? JSON.parse(sessStr) : null;
      if(sess&&sess.userId) {
        const acc = accList.find(a=>a.id===sess.userId);
        if(acc) {
          setIsAdmin(acc.id==="11025");
          setIsTeacher(acc.role==="teacher");
          setUser(acc.role==="teacher"
            ? {name:acc.name,id:acc.id,grade:"교사",room:acc.subject||""}
            : {name:acc.name,id:acc.id,grade:acc.grade+"학년",room:acc.room+"반"}
          );
          setScr("app");
          return;
        }
      }
      setScr("login");
    })();
  },[]);

  // ── Firestore 실시간 구독: 게시글 ──
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"posts"), snap=>{
      const loaded = snap.docs.map(d=>({id:d.id,...d.data()}));
      loaded.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
      setPosts(loaded);
    });
    return ()=>unsub();
  },[]);

  // ── Firestore 실시간 구독: 댓글 ──
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"comments"), snap=>{
      const m={};
      snap.docs.forEach(d=>{ const dt=d.data(); if(!m[dt.postId])m[dt.postId]=[]; m[dt.postId].push({id:d.id,...dt}); });
      setCmts(m);
    });
    return ()=>unsub();
  },[]);

  // ── 로그인 ──
  const doLogin = async(idOrName,pw,roleOrSub) => {
    const savedAcc = await fbGet("accounts");
    const list = (savedAcc&&savedAcc.length>0) ? savedAcc : INIT_ACCOUNTS;
    setAccounts(list);
    let acc;
    if(roleOrSub==="student") {
      acc = list.find(a=>a.role==="student"&&a.id===idOrName&&a.pw===pw);
      if(!acc){alert("학번 또는 비밀번호가 일치하지 않습니다.");return;}
      if(acc.status==="blocked"){alert("차단된 계정이에요. 총관리자에게 문의해주세요.");return;}
      setIsAdmin(acc.id==="11025"); setIsTeacher(false);
      setUser({name:acc.name,id:acc.id,grade:acc.grade+"학년",room:acc.room+"반",status:acc.status||"pending"});
    } else {
      acc = list.find(a=>a.role==="teacher"&&a.name===idOrName&&a.pw===pw&&a.subject===roleOrSub);
      if(!acc){alert("이름, 비밀번호 또는 교과목이 일치하지 않습니다.");return;}
      setIsAdmin(false); setIsTeacher(true);
      setUser({name:acc.name,id:acc.id,grade:"교사",room:acc.subject||""});
    }
    localStorage.setItem("innerschool_sess", JSON.stringify({userId:acc.id}));
    setScr("app"); setPage("board");
  };

  // ── 가입 ──
  const doReg = async(info) => {
    const savedAcc = await fbGet("accounts");
    const base = (savedAcc&&savedAcc.length>0) ? savedAcc : INIT_ACCOUNTS;
    let updated, newUser;
    if(info.role==="teacher") {
      const tid="T"+Date.now().toString().slice(-4);
      const newAcc={role:"teacher",id:tid,name:info.name,pw:info.pw,subject:info.subject,status:"ok"};
      updated=[...base,newAcc];
      newUser={name:info.name,id:tid,grade:"교사",room:info.subject};
      setIsTeacher(true); setIsAdmin(false);
    } else {
      const newAcc={role:"student",id:info.sid,name:info.name,pw:info.pw,grade:info.grade,room:info.room,status:"pending"};
      updated=[...base,newAcc];
      newUser={name:info.name,id:info.sid,grade:info.grade+"학년",room:info.room+"반"};
      setIsTeacher(false); setIsAdmin(false);
      setIdList(prev=>[{id:info.sid,name:info.name,grade:info.grade+"학년 "+info.room+"반",date:"방금 전",status:"pending",isTeacher:false},...prev]);
    }
    await fbSet("accounts",updated);
    localStorage.setItem("innerschool_sess", JSON.stringify({userId:newUser.id}));
    setAccounts(updated);
    setUser(newUser);
    setScr("app"); setPage("board");
    toast_(info.role==="teacher"?"가입 완료! 👩‍🏫":"가입 완료! 바로 이용하실 수 있어요 😊");
  };

  // ── 로그아웃 ──
  const doLogout = async() => { localStorage.removeItem("innerschool_sess"); setScr("login"); };

  // ── 계정 정보 업데이트 (프로필 페이지에서 호출) ──
  const onAccountUpdate = (newAccounts, newUser) => {
    setAccounts(newAccounts);
    setUser(newUser);
    localStorage.setItem("innerschool_sess", JSON.stringify({userId:newUser.id})); // 세션 유지
  };

  // ── 게시글 작성 ──
  const submitPost = async() => {
    if(!isTeacher&&!wType){toast_("유형을 선택해주세요");return;}
    if(!wTitle.trim()||!wBody.trim()){toast_("제목과 내용을 입력해주세요");return;}
    if(hasBad(wTitle)||hasBad(wBody)){toast_("⚠️ 비속어가 포함되어 있습니다.");return;}
    if(!isTeacher&&wType==="verified"&&!wSrc.trim()){toast_("확인 근거를 입력해주세요");return;}
    const grade = isTeacher?wGrade:user.grade.replace("학년","");
    const now = new Date();
    const dateStr = now.getFullYear()+"."+String(now.getMonth()+1).padStart(2,"0")+"."+String(now.getDate()).padStart(2,"0");
    const np = isTeacher
      ? {title:wTitle.trim(),cat:wCat,type:"teacher",status:"teacher",author:user.name,grade,date:dateStr,views:0,source:"",body:wBody.trim(),fc:0,fcR:[],createdAt:Date.now()}
      : {title:wTitle.trim(),cat:wCat,type:wType,status:wType==="verified"?"pending":"unverified",author:user.name,grade,date:dateStr,views:0,source:wSrc.trim(),body:wBody.trim(),fc:0,fcR:[],createdAt:Date.now()};
    try {
      const ref = await addDoc(collection(db,"posts"),np);
      if(!isTeacher&&wType==="verified") setVq(q=>[{id:ref.id,title:np.title,author:user.name,cat:wCat,source:np.source},...q]);
      setWModal(false);setWType(null);setWTitle("");setWBody("");setWSrc("");
      toast_(isTeacher?"게시됐어요! 👩‍🏫":wType==="verified"?"게시됐어요! 검토 후 배지 부여됩니다 ✅":"게시됐어요!");
    } catch(e) { console.error(e); toast_("게시 중 오류가 발생했어요."); }
  };

  // ── 게시글 삭제 ──
  const deletePost = async(id) => {
    if(!window.confirm("이 게시글을 삭제할까요?")) return;
    try { await deleteDoc(doc(db,"posts",id)); } catch(e){console.error(e);}
    setPage("board"); toast_("게시글이 삭제됐어요");
  };

  // ── 게시글 수정 저장 ──
  const saveEditPost = async() => {
    if(!editTitle.trim()||!editBody.trim()){toast_("제목과 내용을 입력해주세요");return;}
    try { await updateDoc(doc(db,"posts",editPost.id),{title:editTitle.trim(),body:editBody.trim()}); } catch(e){console.error(e);}
    setCurPost(p=>p?{...p,title:editTitle.trim(),body:editBody.trim()}:p);
    setEditModal(false); toast_("게시글이 수정됐어요 ✅");
  };

  // ── 관리자 문의 제출 ──
  const submitInquiry = async() => {
    if(!inquiryText.trim()){toast_("내용을 입력해주세요");return;}
    try{
      await addDoc(collection(db,"inquiries"),{
        type:inquiryType,
        text:inquiryText.trim(),
        author:user.name,
        userId:user.id,
        isTeacher:isTeacher,
        date:new Date().toLocaleDateString("ko-KR"),
        createdAt:Date.now(),
        status:"미확인"
      });
      setInquiryText("");setInquiryModal(false);
      toast_("문의가 접수됐어요! 총관리자가 확인할게요 😊");
    }catch(e){console.error(e);toast_("문의 접수 중 오류가 발생했어요");}
  };

  // ── 위키 추가 ──
  const addWiki = async() => {
    if(!newWikiTitle.trim()||!newWikiContent.trim()){toast_("제목과 내용을 입력해주세요");return;}
    const newItem={icon:newWikiIcon,title:newWikiTitle.trim(),desc:newWikiDesc.trim(),ok:newWikiOk,content:newWikiContent.trim()};
    const updated=[...wiki,newItem];
    setWiki(updated);
    await fbSet("wiki",updated);
    setWikiAddModal(false);
    setNewWikiIcon("📄");setNewWikiTitle("");setNewWikiDesc("");setNewWikiContent("");setNewWikiOk(false);
    toast_("위키가 추가됐어요 ✅");
  };

  // ── 위키 삭제 ──
  const deleteWiki = async(idx) => {
    if(!window.confirm("이 위키 항목을 삭제할까요?")) return;
    const updated=wiki.filter((_,i)=>i!==idx);
    setWiki(updated);
    await fbSet("wiki",updated);
    setCurWiki(null);
    toast_("위키가 삭제됐어요");
  };

  // ── 위키 수정 저장 ──
  const saveWiki = async(idx,newTitle,newContent) => {
    const updated = wiki.map((w,i)=>i===idx?{...w,title:newTitle,content:newContent}:w);
    setWiki(updated);
    await fbSet("wiki",updated);
    setWikiEditModal(false); toast_("위키가 수정됐어요 ✅");
  };

  // ── 댓글 작성 ──
  const submitCmt = async() => {
    if(!cText.trim()){toast_("댓글을 입력해주세요");return;}
    if(hasBad(cText)){toast_("⚠️ 비속어가 포함되어 있습니다.");return;}
    try { await addDoc(collection(db,"comments"),{postId:curPost.id,author:user.name,anon,text:cText.trim(),time:"방금 전",createdAt:Date.now()}); }
    catch(e){console.error(e);}
    setCText(""); toast_("댓글이 등록됐어요!");
  };

  // ── 댓글 삭제 ──
  const deleteCmt = async(cid) => {
    try { await deleteDoc(doc(db,"comments",cid)); } catch(e){console.error(e);}
    toast_("댓글이 삭제됐어요");
  };

  // ── 사실확인 요청 ──
  const submitFc = async() => {
    if(!isTeacher&&!fcText.trim()){toast_("사유를 입력해주세요");return;}
    const entry = isTeacher?`[👩‍🏫 ${user.name} 선생님 확인]${fcText.trim()?" "+fcText.trim():""}`:fcText.trim();
    const p = posts.find(x=>x.id===fcTarget);
    if(!p) return;
    try { await updateDoc(doc(db,"posts",fcTarget),{fc:(p.fc||0)+1,fcR:[...(p.fcR||[]),entry]}); } catch(e){console.error(e);}
    setFcModal(false); setFcText("");
    toast_(isTeacher?"사실 확인이 등록됐어요 ✅":"사실 확인 요청이 접수됐어요");
  };

  // ── 인증 승인 ──
  const verifyPost = async(id) => {
    try { await updateDoc(doc(db,"posts",id),{status:"verified"}); } catch(e){console.error(e);}
    setVq(q=>q.filter(v=>v.id!==id));
    toast_("✅ 확인된 정보 배지가 부여됐어요!");
  };

  const filtered = posts.filter(p=>{
    const catOk = cat==="전체"||p.cat===cat;
    const gradOk = gradTab==="전체"||(gradTab==="공통"&&p.grade==="공통")||(gradTab!=="공통"&&(p.grade===gradTab.replace("학년","")||p.grade==="공통"));
    return catOk&&gradOk;
  });
  const pending = idList.filter(r=>r.status==="pending").length+vq.length+posts.filter(p=>p.fc>0).length;

  if(scr==="loading") return <div style={{minHeight:"100vh",background:N,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:M,fontSize:20,fontWeight:700}}>INNERSCHOOL</div></div>;
  if(scr==="login") return <Login onLogin={doLogin} onReg={()=>setScr("register")}/>;
  if(scr==="register") return <Register onDone={doReg} onBack={()=>setScr("login")}/>;

  const navs=[{k:"board",i:"📋",l:"정보 게시판"},{k:"wiki",i:"📖",l:"교내 위키"},{k:"calendar",i:"📅",l:"공유 캘린더"},{k:"meal",i:"🍱",l:"이달의 급식"},{k:"profile",i:"👤",l:"내 계정"}];

  return (
    <div style={{minHeight:"100vh",background:BG,color:TX,fontFamily:"'Noto Sans KR',sans-serif"}}>
      {/* 워터마크 */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9990,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:13,color:"rgba(15,31,61,0.05)",transform:"rotate(-35deg)",whiteSpace:"nowrap",letterSpacing:2,fontWeight:600,userSelect:"none"}}>{user.id} {user.name} · INNERSCHOOL 교내전용</div>
      </div>

      {/* 사이드바 오버레이 */}
      {sidebar&&<div onClick={()=>setSidebar(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:99}}/>}

      {/* 사이드바 */}
      <aside style={{width:240,background:N,minHeight:"100vh",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,zIndex:100,transform:sidebar?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease",boxShadow:sidebar?"4px 0 24px rgba(0,0,0,0.2)":"none"}}>
        <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontFamily:"serif",fontSize:19,fontWeight:800,color:M}}>INNERSCHOOL</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:1}}>경기창조고 교내 정보 공유 플랫폼</div></div>
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
        <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",flexDirection:"column",gap:6}}>
          <Btn onClick={()=>{setInquiryModal(true);setSidebar(false);}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:8,color:"rgba(255,255,255,0.5)",fontSize:12}}>💬 관리자 문의</Btn>
          <Btn onClick={doLogout} style={{width:"100%",background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:10,padding:10,color:"#ff8a8a",fontSize:13}}>로그아웃</Btn>
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

        {/* 게시판 */}
        {page==="board"&&<div>
          <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>정보 게시판</h1><p style={{color:SO,fontSize:13,marginTop:3}}>우리 학교의 모든 정보를 한 곳에서</p></div>
          {!isAdmin&&!isTeacher&&user.status==="pending"&&(
            <div style={{background:"#fef3c7",border:"1px solid #fde047",borderRadius:14,padding:"28px 20px",textAlign:"center",marginTop:20}}>
              <div style={{fontSize:36,marginBottom:12}}>🔒</div>
              <div style={{fontSize:16,fontWeight:700,color:"#92400e",marginBottom:8}}>승인 대기 중이에요</div>
              <div style={{fontSize:13,color:"#a16207",lineHeight:1.7}}>총관리자가 학생증을 확인 후 승인하면<br/>게시판을 이용할 수 있어요.<br/><br/>승인까지 보통 1~2일 소요됩니다.</div>
            </div>
          )}
          {!isAdmin&&!isTeacher&&user.status==="blocked"&&(
            <div style={{background:"#fee2e2",border:"1px solid #fecaca",borderRadius:14,padding:"28px 20px",textAlign:"center",marginTop:20}}>
              <div style={{fontSize:36,marginBottom:12}}>🚫</div>
              <div style={{fontSize:16,fontWeight:700,color:"#991b1b",marginBottom:8}}>차단된 계정이에요</div>
              <div style={{fontSize:13,color:"#7f1d1d",lineHeight:1.7}}>이 계정은 총관리자에 의해 차단됐어요.<br/>문의사항이 있으면 관리자에게 연락해주세요.</div>
              <Btn onClick={()=>setInquiryModal(true)} style={{marginTop:16,background:"#991b1b",color:"#fff",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600}}>💬 관리자 문의</Btn>
            </div>
          )}
          {(!(!isAdmin&&!isTeacher&&user.status==="pending"))&&<>
          {/* 학년 탭 */}
          <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
            {["전체","1학년","2학년","3학년","공통"].map(g=>(
              <Btn key={g} onClick={()=>{setGradTab(g);setCat("전체");}} style={{padding:"7px 14px",borderRadius:18,border:`1.5px solid ${gradTab===g?N:BO}`,background:gradTab===g?N:CA,color:gradTab===g?"#fff":SO,fontSize:13,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>
                {g}
              </Btn>
            ))}
          </div>
          {/* 세부 카테고리 */}
          <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
            {ALL_CATS.map(c=>(
              <Btn key={c} onClick={()=>setCat(c)} style={{padding:"5px 12px",borderRadius:16,border:`1.5px solid ${cat===c?M:BO}`,background:cat===c?M:CA,color:cat===c?N:SO,fontSize:12,fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>
                {c}
              </Btn>
            ))}
          </div>
          <Btn onClick={()=>{setWType(null);setWTitle("");setWBody("");setWSrc("");setWModal(true);}} style={{display:"flex",alignItems:"center",gap:6,background:M,color:N,borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:700,marginBottom:14}}>
            ✏️ 글쓰기
          </Btn>
          {filtered.length===0&&<div style={{textAlign:"center",color:LI,padding:"40px 0",fontSize:14}}>아직 게시글이 없어요. 첫 글을 올려보세요!</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(p=>(
              <div key={p.id} onClick={()=>{setCurPost(p);setPage("detail");}} style={{background:CA,borderRadius:12,padding:"16px",border:`1px solid ${BO}`,cursor:"pointer"}}>
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
                  <span style={{marginLeft:"auto"}}>👁{p.views||0} 💬{(cmts[p.id]||[]).length}</span>
                </div>
              </div>
            ))}
          </div>
          </>
          }
        </div>}

        {/* 게시글 상세 */}
        {page==="detail"&&curPost&&<div>
          <Btn onClick={()=>setPage("board")} style={{display:"flex",alignItems:"center",gap:4,background:BG,color:SO,border:`1.5px solid ${BO}`,borderRadius:8,padding:"7px 14px",fontSize:13,marginBottom:16}}>← 목록으로</Btn>
          <div style={{background:CA,borderRadius:12,padding:"20px 16px",border:`1px solid ${BO}`,marginBottom:12}}>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}><Chip type={curPost.type} status={curPost.status}/></div>
            <div style={{fontSize:18,fontWeight:700,color:TX,lineHeight:1.4,marginBottom:10}}>{curPost.title}</div>
            <div style={{display:"flex",gap:12,fontSize:11,color:LI,marginBottom:12,flexWrap:"wrap"}}>
              <span>👤 {curPost.author} · {curPost.grade==="공통"?"공통":curPost.grade+"학년"}</span>
              <span>📅 {curPost.date}</span><span>👁 {curPost.views||0}</span>
            </div>
            {curPost.type==="unverified"&&<div style={{background:"#fff7ed",borderLeft:"3px solid #f59e0b",borderRadius:"0 8px 8px 0",padding:"8px 12px",fontSize:12,color:"#92400e",marginBottom:12}}>⚠️ 미검증 정보입니다. 출처를 직접 확인하세요.</div>}
            <div style={{fontSize:14,lineHeight:1.9,color:TX,padding:"14px 0",borderTop:`1px solid ${BO}`,borderBottom:`1px solid ${BO}`,whiteSpace:"pre-line"}}>{curPost.body}</div>
            {curPost.source&&<div style={{background:MS,border:`1px solid ${MM}`,borderRadius:9,padding:"12px 14px",fontSize:13,color:"#0e7a5a",marginTop:12}}><div style={{fontSize:11,fontWeight:700,marginBottom:3}}>📎 확인 근거</div>{curPost.source}</div>}
            {isAdmin&&curPost.fc>0&&<div style={{background:"#fee2e2",borderRadius:9,padding:"10px 14px",marginTop:10}}>
              <div style={{fontSize:13,color:"#991b1b",fontWeight:700,marginBottom:6}}>🚨 사실확인 요청 {curPost.fc}건</div>
              {(curPost.fcR||[]).map((r,i)=><div key={i} style={{fontSize:12,color:"#7f1d1d",background:"rgba(255,255,255,0.5)",borderRadius:5,padding:"5px 9px",marginBottom:3}}>"{r}"</div>)}
            </div>}
            {isAdmin&&<div style={{display:"flex",gap:8,marginTop:14}}>
              <Btn onClick={()=>{setEditPost(curPost);setEditTitle(curPost.title);setEditBody(curPost.body);setEditModal(true);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,background:"#f0f9ff",color:"#0369a1",border:"1.5px solid #bae6fd",fontSize:13}}>✏️ 수정</Btn>
              <Btn onClick={()=>deletePost(curPost.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,background:"#fee2e2",color:"#991b1b",border:"1.5px solid #fecaca",fontSize:13}}>🗑 삭제</Btn>
            </div>}
            {curPost.type!=="teacher"&&<Btn onClick={()=>{setFcTarget(curPost.id);setFcText("");setFcModal(true);}} style={{marginTop:isAdmin?8:14,display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,background:isTeacher?"#ede9fe":"#fff7ed",color:isTeacher?"#5b21b6":"#c2410c",border:`1.5px solid ${isTeacher?"#c4b5fd":"#fed7aa"}`,fontSize:13}}>
              {isTeacher?"✅ 사실 확인 체크":"🚨 사실 확인 요청"}
            </Btn>}
          </div>
          {/* 댓글 */}
          <div style={{background:CA,borderRadius:12,padding:"18px 16px",border:`1px solid ${BO}`}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>💬 댓글 <span style={{color:SO,fontWeight:400,fontSize:12}}>({(cmts[curPost.id]||[]).length}개)</span></div>
            {(cmts[curPost.id]||[]).length===0&&<div style={{color:LI,fontSize:13,paddingBottom:12}}>아직 댓글이 없어요.</div>}
            {(cmts[curPost.id]||[]).map(c=>(
              <div key={c.id} style={{padding:"12px 0",borderBottom:`1px solid ${BO}`}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:c.anon?"linear-gradient(135deg,#94a3b8,#64748b)":"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{c.anon?"익":c.author[0]}</div>
                  <span style={{fontSize:13,fontWeight:600}}>{c.anon?"익명":c.author}</span>
                  <span style={{fontSize:11,color:LI,marginLeft:"auto"}}>{c.time}</span>
                  {isAdmin&&<Btn onClick={()=>deleteCmt(c.id)} style={{fontSize:11,color:AC,background:"none",padding:0}}>🗑</Btn>}
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
        </div>}

        {/* 교내 위키 목록 */}
        {page==="wiki"&&!curWiki&&<div>
          <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>교내 위키</h1><p style={{color:SO,fontSize:13,marginTop:3}}>학교의 모든 제도와 자원을 찾아보세요</p></div>
          {isAdmin&&<Btn onClick={()=>setWikiAddModal(true)} style={{display:"flex",alignItems:"center",gap:6,background:M,color:N,borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:700,marginBottom:14}}>➕ 위키 추가</Btn>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {wiki.map((w,i)=>(
              <div key={i} onClick={()=>setCurWiki({...w,idx:i})} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:30,flexShrink:0}}>{w.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:TX,marginBottom:3}}>{w.title}</div>
                  <span style={{display:"inline-block",marginTop:6,padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:w.ok?MS:"#fef3c7",color:w.ok?"#0e8a5f":"#92400e"}}>{w.ok?"✅ 교사 인증":"📝 학생 작성"}</span>
                </div>
                <span style={{fontSize:16,color:LI,flexShrink:0}}>›</span>
              </div>
            ))}
          </div>
        </div>}

        {/* 교내 위키 상세 */}
        {page==="wiki"&&curWiki&&<div>
          <Btn onClick={()=>setCurWiki(null)} style={{display:"flex",alignItems:"center",gap:4,background:BG,color:SO,border:`1.5px solid ${BO}`,borderRadius:8,padding:"7px 14px",fontSize:13,marginBottom:16}}>← 위키 목록으로</Btn>
          <div style={{background:CA,borderRadius:12,padding:"20px 16px",border:`1px solid ${BO}`}}>
            <div style={{fontSize:34,marginBottom:10}}>{curWiki.icon}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
              <h1 style={{fontSize:19,fontWeight:700,color:TX}}>{curWiki.title}</h1>
            </div>
            <span style={{display:"inline-block",padding:"3px 9px",borderRadius:5,fontSize:11,fontWeight:700,background:curWiki.ok?MS:"#fef3c7",color:curWiki.ok?"#0e8a5f":"#92400e",marginBottom:10}}>{curWiki.ok?"✅ 교사 인증":"📝 학생 작성"}</span>
            <div style={{borderTop:`1px solid ${BO}`,paddingTop:16,fontSize:14,lineHeight:1.9,color:TX,whiteSpace:"pre-line"}}>{curWiki.content}</div>
            {curWiki.link&&<a href={curWiki.link.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:14,background:N,color:"#fff",borderRadius:9,padding:"10px 18px",fontSize:13,fontWeight:600,textDecoration:"none"}}>🔗 {curWiki.link.label}</a>}
            {curWiki.ok&&<div style={{marginTop:16,background:MS,border:`1px solid ${MM}`,borderRadius:9,padding:"11px 14px",fontSize:12,color:"#0e7a5a"}}>✅ 교사가 직접 검토하고 인증한 공식 정보입니다.</div>}
            {isAdmin&&<div style={{display:"flex",gap:8,marginTop:14}}>
              <Btn onClick={()=>setWikiEditModal(true)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#f0f9ff",color:"#0369a1",border:"1.5px solid #bae6fd",borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:600}}>✏️ 수정</Btn>
              <Btn onClick={()=>deleteWiki(curWiki.idx)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#fee2e2",color:"#991b1b",border:"1.5px solid #fecaca",borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:600}}>🗑 삭제</Btn>
            </div>}
          </div>
        </div>}

        {/* 캘린더 */}
        {page==="calendar"&&(()=>{
          const blanks=5;
          const cellSt={padding:"5px 0 4px",minHeight:52,background:CA,borderRight:`1px solid ${BO}`,borderBottom:`1px solid ${BO}`,display:"flex",flexDirection:"column",alignItems:"center",gap:3};
          return <div>
            <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>공유 캘린더</h1><p style={{color:SO,fontSize:13,marginTop:3}}>2026년 5월</p></div>
            <div style={{background:CA,borderRadius:14,border:`1px solid ${BO}`,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:N}}>
                {["일","월","화","수","목","금","토"].map(d=><div key={d} style={{textAlign:"center",padding:"9px 0",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>{d}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
                {Array.from({length:blanks}).map((_,i)=><div key={`b${i}`} style={{...cellSt,background:"#fafafa"}}/>)}
                {Array.from({length:31},(_,i)=>i+1).map(d=>{
                  const ev=CAL_EV[d], holiday=d===1||d===4;
                  return <div key={d} style={cellSt}>
                    <div style={{fontSize:12,fontWeight:600,color:holiday?"#ef4444":TX}}>{d}</div>
                    {ev&&<div style={{background:N,color:"#fff",borderRadius:3,padding:"1px 4px",fontSize:7,fontWeight:600,lineHeight:1.5,textAlign:"center",width:"90%",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{ev}</div>}
                  </div>;
                })}
              </div>
            </div>
            <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:6}}>
              {[{d:"5월 1일·4일",l:"🏫 학교장재량휴업일"},{d:"5월 7일",l:"📝 고3 전국연합학력평가"},{d:"5월 15일",l:"🎽 1·2학년 체육대회 / 3학년 졸업앨범 실내촬영"},{d:"5월 18~29일",l:"👨‍👩‍👧 학부모 진로 진학 컨설팅"}].map((x,i)=>(
                <div key={i} style={{background:CA,border:`1px solid ${BO}`,borderRadius:10,padding:"11px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{fontSize:12,fontWeight:700,color:N,whiteSpace:"nowrap",paddingTop:1,minWidth:72}}>{x.d}</div>
                  <div style={{fontSize:13,color:TX,lineHeight:1.5}}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>;
        })()}

        {/* 이달의 급식 */}
        {page==="meal"&&(()=>{
          const weeks=[
            {label:"1주차",days:[{d:"5/6",day:"수"},{d:"5/7",day:"목"},{d:"5/8",day:"금"}]},
            {label:"2주차",days:[{d:"5/11",day:"월"},{d:"5/12",day:"화"},{d:"5/13",day:"수"},{d:"5/14",day:"목"},{d:"5/15",day:"금"}]},
            {label:"3주차",days:[{d:"5/18",day:"월"},{d:"5/19",day:"화"},{d:"5/20",day:"수"},{d:"5/21",day:"목"},{d:"5/22",day:"금"}]},
            {label:"4주차",days:[{d:"5/26",day:"화"},{d:"5/27",day:"수"},{d:"5/28",day:"목"},{d:"5/29",day:"금"}]},
          ];
          return <div>
            <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>🍱 이달의 급식</h1><p style={{color:SO,fontSize:13,marginTop:3}}>2026년 5월 · 세종캐터링 제공</p></div>
            {weeks.map((w,wi)=>(
              <div key={wi} style={{marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:SO,marginBottom:8,paddingLeft:2}}>{w.label}</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {w.days.map(({d,day})=>{
                    const menu=MEAL[d];
                    const today=new Date();
                    const isToday=today.getMonth()===4&&today.getDate()===parseInt(d.split("/")[1]);
                    return <div key={d} style={{background:isToday?"#f0fdf9":CA,border:`1.5px solid ${isToday?M:BO}`,borderRadius:12,padding:"12px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:menu?8:0}}>
                        <span style={{background:isToday?M:N,color:isToday?N:"#fff",borderRadius:6,padding:"2px 10px",fontSize:12,fontWeight:700}}>{day}</span>
                        <span style={{fontSize:13,fontWeight:700,color:isToday?M:TX}}>5월 {d.split("/")[1]}일</span>
                        {isToday&&<span style={{fontSize:11,fontWeight:700,color:M,background:"#d1fae5",padding:"1px 7px",borderRadius:10}}>오늘</span>}
                      </div>
                      {menu?<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {menu.map((item,i)=><span key={i} style={{background:BG,border:`1px solid ${BO}`,borderRadius:5,padding:"3px 8px",fontSize:12,color:TX}}>{item.replace(/[\d.]+$/,"")}</span>)}
                      </div>:<div style={{fontSize:12,color:LI}}>휴업일</div>}
                    </div>;
                  })}
                </div>
              </div>
            ))}
          </div>;
        })()}

        {/* 내 계정 */}
        {page==="profile"&&<ProfilePage user={user} isTeacher={isTeacher} isAdmin={isAdmin} accounts={accounts} onUpdate={onAccountUpdate}/>}

        {/* 관리자 대시보드 */}
        {page==="admin"&&isAdmin&&<div>
          <div style={{marginBottom:16}}><h1 style={{fontSize:21,fontWeight:700}}>⚙️ 관리자 대시보드</h1><p style={{color:SO,fontSize:13,marginTop:3}}>총관리자 전용 페이지</p></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
            {[{i:"🪪",n:idList.filter(r=>r.status==="pending").length,l:"학생증 대기",c:"#f59e0b"},{i:"✅",n:vq.length,l:"인증 대기",c:"#16a34a"},{i:"🚨",n:posts.filter(p=>p.fc>0).length,l:"사실확인 요청",c:AC},{i:"👥",n:accounts.length,l:"전체 계정",c:N}].map((s,i)=>(
              <div key={i} style={{background:CA,borderRadius:12,padding:"16px",border:`1px solid ${BO}`}}>
                <div style={{fontSize:20,marginBottom:6}}>{s.i}</div>
                <div style={{fontSize:26,fontWeight:800,color:s.c,fontFamily:"serif"}}>{s.n}</div>
                <div style={{fontSize:11,color:SO,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:3,background:BG,padding:3,borderRadius:10,marginBottom:16,overflowX:"auto"}}>
            {[{k:"id",l:"🪪 학생증"},{k:"verify",l:"✅ 인증"},{k:"fc",l:"🚨 사실확인"},{k:"users",l:"👥 사용자"},{k:"inquiry",l:"💬 문의"}].map(t=>(
              <Btn key={t.k} onClick={()=>setAdminTab(t.k)} style={{flex:1,padding:"8px 4px",textAlign:"center",borderRadius:8,fontSize:12,fontWeight:adminTab===t.k?700:500,color:adminTab===t.k?N:SO,background:adminTab===t.k?"#fff":"transparent",whiteSpace:"nowrap"}}>
                {t.l}
              </Btn>
            ))}
          </div>
          {adminTab==="id"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {idList.length===0&&<div style={{background:CA,borderRadius:12,padding:"24px",textAlign:"center",color:LI,border:`1px solid ${BO}`}}>검토할 학생증이 없어요 🎉</div>}
            {idList.map(r=>(
              <div key={r.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700}}>{r.name}{r.isTeacher&&<span style={{marginLeft:6,fontSize:10,fontWeight:700,background:"#ede9fe",color:"#5b21b6",padding:"2px 6px",borderRadius:4}}>교사</span>}</div>
                    <div style={{fontSize:12,color:SO}}>{r.grade} · {r.id} · {r.date}</div>
                  </div>
                  <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:r.status==="pending"?"#fef3c7":r.status==="ok"?"#dcfce7":"#fee2e2",color:r.status==="pending"?"#92400e":r.status==="ok"?"#166534":"#991b1b"}}>
                    {r.status==="pending"?"검토 대기":r.status==="ok"?"승인됨":"차단됨"}
                  </span>
                </div>
                <div style={{background:BG,border:`1px dashed ${BO}`,borderRadius:8,padding:"10px",textAlign:"center",fontSize:12,color:LI,marginBottom:r.status==="pending"?10:0,cursor:"pointer"}}>🪪 학생증 사진 보기</div>
                {r.status==="pending"&&<div style={{display:"flex",gap:8}}>
                  <Btn onClick={async()=>{
                    setIdList(p=>p.map(x=>x.id===r.id?{...x,status:"ok"}:x));
                    const updated=accounts.map(a=>a.id===r.id?{...a,status:"ok"}:a);
                    setAccounts(updated);
                    await fbSet("accounts",updated);
                    toast_(`${r.name} 승인됐어요 ✅`);
                  }} style={{flex:1,background:"#dcfce7",color:"#166534",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>✅ 승인</Btn>
                  <Btn onClick={async()=>{
                    setIdList(p=>p.map(x=>x.id===r.id?{...x,status:"blocked"}:x));
                    const updated=accounts.map(a=>a.id===r.id?{...a,status:"blocked"}:a);
                    setAccounts(updated);
                    await fbSet("accounts",updated);
                    toast_(`${r.name} 차단됐어요 🚫`);
                  }} style={{flex:1,background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>🚫 차단</Btn>
                </div>}
              </div>
            ))}
          </div>}
          {adminTab==="verify"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {vq.length===0&&<div style={{background:CA,borderRadius:12,padding:"24px",textAlign:"center",color:LI,border:`1px solid ${BO}`}}>검토할 항목이 없어요 🎉</div>}
            {vq.map(v=>(
              <div key={v.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{v.title}</div>
                <div style={{fontSize:12,color:SO,marginBottom:4}}>{v.author} · {v.cat}</div>
                <div style={{background:MS,border:`1px solid ${MM}`,borderRadius:7,padding:"8px 11px",fontSize:12,color:"#0e7a5a",marginBottom:10}}>📎 "{v.source}"</div>
                <Btn onClick={()=>verifyPost(v.id)} style={{width:"100%",background:MS,color:"#0e8a5f",borderRadius:8,padding:"9px",fontSize:13,fontWeight:600}}>✅ 확인된 정보 승인</Btn>
              </div>
            ))}
          </div>}
          {adminTab==="fc"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {posts.filter(p=>p.fc>0).length===0&&<div style={{background:CA,borderRadius:12,padding:"24px",textAlign:"center",color:LI,border:`1px solid ${BO}`}}>접수된 요청이 없어요 🎉</div>}
            {posts.filter(p=>p.fc>0).map(p=>(
              <div key={p.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{p.title}</div>
                <div style={{fontSize:13,color:AC,fontWeight:700,marginBottom:6}}>요청 {p.fc}건</div>
                {(p.fcR||[]).map((r,i)=><div key={i} style={{fontSize:12,color:SO,background:BG,borderRadius:6,padding:"5px 9px",marginBottom:4}}>· {r}</div>)}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <Btn onClick={async()=>{try{await updateDoc(doc(db,"posts",p.id),{status:"blinded",fc:0,fcR:[]});}catch(e){}toast_("블라인드 처리됐어요");}} style={{flex:1,background:"#fff7ed",color:"#c2410c",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>🙈 블라인드</Btn>
                  <Btn onClick={async()=>{try{await updateDoc(doc(db,"posts",p.id),{fc:0,fcR:[]});}catch(e){}toast_("정상 처리됐어요 ✅");}} style={{flex:1,background:MS,color:"#0e8a5f",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>✅ 정상 처리</Btn>
                </div>
              </div>
            ))}
          </div>}
          {adminTab==="users"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {accounts.map(u=>(
              <div key={u.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700}}>{u.name}</div>
                  <div style={{fontSize:12,color:SO}}>{u.role==="teacher"?u.subject+" 선생님":u.grade+"학년 "+u.room+"반"} · {u.id}</div>
                </div>
                {u.id!=="11025"&&<Btn onClick={async()=>{const updated=accounts.filter(a=>a.id!==u.id);await fbSet("accounts",updated);setAccounts(updated);toast_(`${u.name} 계정이 삭제됐어요`);}} style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600}}>🗑 삭제</Btn>}
              </div>
            ))}
          </div>}
          {adminTab==="inquiry"&&<InquiryTab db={db} onSnapshot={onSnapshot} collection={collection}/>}
        </div>}
      </main>

      {/* 글쓰기 모달 */}
      <Modal open={wModal} onClose={()=>setWModal(false)} title="✏️ 새 글 작성">
        {isTeacher&&<div style={{background:"#ede9fe",border:"1px solid #c4b5fd",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#5b21b6",marginBottom:14}}>👩‍🏫 선생님 계정으로 게시하면 <strong>'선생님 인증'</strong> 배지가 자동으로 부여됩니다.</div>}
        {isTeacher&&<div style={{marginBottom:12}}><label style={lbl1}>대상 학년</label>
          <select value={wGrade} onChange={e=>setWGrade(e.target.value)} style={inp1}>
            <option value="공통">공통 (전체 학년)</option><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option>
          </select>
        </div>}
        {!isTeacher&&<div style={{marginBottom:14}}>
          <label style={{...lbl1,marginBottom:8}}>정보 유형 선택 *</label>
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
        {!isTeacher&&wType==="verified"&&<div style={{marginBottom:14}}>
          <div style={{background:MS,border:`1px solid ${MM}`,borderRadius:8,padding:"9px 11px",fontSize:12,color:"#0e7a5a",marginBottom:8}}>💡 텍스트만으로도 입력 가능해요.<br/>예: "선생님께서 종례 시간에 공지해주셨습니다."</div>
          <label style={lbl1}>확인 근거 *</label>
          <textarea value={wSrc} onChange={e=>setWSrc(e.target.value)} rows={3} placeholder="이 정보를 어떻게 확인하셨나요?" style={{...inp1,resize:"none",boxSizing:"border-box"}}/>
        </div>}
        <div style={{marginBottom:12}}><label style={lbl1}>카테고리</label>
          <select value={wCat} onChange={e=>setWCat(e.target.value)} style={inp1}>
            {SUB_CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:12}}><label style={lbl1}>제목</label><input value={wTitle} onChange={e=>setWTitle(e.target.value)} placeholder="제목을 입력하세요" style={inp1}/></div>
        <div style={{marginBottom:4}}><label style={lbl1}>내용</label><textarea value={wBody} onChange={e=>setWBody(e.target.value)} rows={5} placeholder="내용을 입력하세요" style={{...inp1,resize:"none",boxSizing:"border-box"}}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
          <Btn onClick={()=>setWModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
          <Btn onClick={submitPost} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>게시하기</Btn>
        </div>
      </Modal>

      {/* 사실확인 모달 */}
      <Modal open={fcModal} onClose={()=>setFcModal(false)} title={isTeacher?"✅ 사실 확인 체크":"🚨 사실 확인 요청"}>
        <p style={{fontSize:13,color:SO,marginBottom:16}}>{isTeacher?"이 게시글의 내용이 사실임을 확인합니다. 추가로 전달할 내용이 있다면 아래에 입력해주세요.":"사실과 다르다고 생각하시나요? 구체적인 사유를 입력해주세요."}</p>
        <textarea value={fcText} onChange={e=>setFcText(e.target.value)} rows={4} placeholder={isTeacher?"추가로 할 말이 있으면 입력하세요 (선택사항)":"예: 시험 범위가 실제로는 2단원까지입니다."} style={{...inp1,resize:"none",boxSizing:"border-box",marginBottom:16}}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setFcModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
          <Btn onClick={submitFc} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>제출</Btn>
        </div>
      </Modal>

      {/* 게시글 수정 모달 */}
      <Modal open={editModal} onClose={()=>setEditModal(false)} title="✏️ 게시글 수정">
        <div style={{marginBottom:12}}><label style={lbl1}>제목</label><input value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={inp1}/></div>
        <div style={{marginBottom:4}}><label style={lbl1}>내용</label><textarea value={editBody} onChange={e=>setEditBody(e.target.value)} rows={8} style={{...inp1,resize:"vertical",boxSizing:"border-box"}}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
          <Btn onClick={()=>setEditModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
          <Btn onClick={saveEditPost} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>저장</Btn>
        </div>
      </Modal>

      {/* 위키 수정 모달 */}
      <Modal open={wikiEditModal} onClose={()=>setWikiEditModal(false)} title="✏️ 위키 수정">
        {curWiki&&<>
          <div style={{marginBottom:12}}><label style={lbl1}>제목</label>
            <input value={curWiki.title} onChange={e=>setCurWiki(w=>({...w,title:e.target.value}))} style={inp1}/>
          </div>
          <div style={{marginBottom:4}}><label style={lbl1}>내용</label>
            <textarea value={curWiki.content} onChange={e=>setCurWiki(w=>({...w,content:e.target.value}))} rows={12} style={{...inp1,resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
            <Btn onClick={()=>setWikiEditModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
            <Btn onClick={()=>saveWiki(curWiki.idx,curWiki.title,curWiki.content)} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>저장</Btn>
          </div>
        </>}
      </Modal>

      {/* 관리자 문의 모달 */}
      <Modal open={inquiryModal} onClose={()=>setInquiryModal(false)} title="💬 관리자 문의">
        <p style={{fontSize:13,color:SO,marginBottom:16}}>사이트 오류 신고나 건의사항을 남겨주세요. 총관리자(11025 이윤진)가 확인 후 처리할게요.</p>
        <div style={{marginBottom:12}}>
          <label style={lbl1}>문의 유형</label>
          <select value={inquiryType} onChange={e=>setInquiryType(e.target.value)} style={inp1}>
            {["오류 신고","기능 건의","계정 문의","기타"].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{marginBottom:16}}>
          <label style={lbl1}>내용 *</label>
          <textarea value={inquiryText} onChange={e=>setInquiryText(e.target.value)} rows={5} placeholder="문의 내용을 자세히 입력해주세요" style={{...inp1,resize:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setInquiryModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
          <Btn onClick={submitInquiry} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>문의 접수</Btn>
        </div>
      </Modal>

      {/* 위키 추가 모달 */}
      <Modal open={wikiAddModal} onClose={()=>setWikiAddModal(false)} title="➕ 위키 항목 추가">
        <div style={{marginBottom:12}}>
          <label style={lbl1}>아이콘 (이모지)</label>
          <input value={newWikiIcon} onChange={e=>setNewWikiIcon(e.target.value)} placeholder="예: 📄" style={inp1}/>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl1}>제목 *</label>
          <input value={newWikiTitle} onChange={e=>setNewWikiTitle(e.target.value)} placeholder="위키 제목" style={inp1}/>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl1}>설명 (목록에 표시)</label>
          <input value={newWikiDesc} onChange={e=>setNewWikiDesc(e.target.value)} placeholder="간단한 설명" style={inp1}/>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl1}>내용 *</label>
          <textarea value={newWikiContent} onChange={e=>setNewWikiContent(e.target.value)} rows={8} placeholder="위키 내용을 입력하세요" style={{...inp1,resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:TX}}>
            <input type="checkbox" checked={newWikiOk} onChange={e=>setNewWikiOk(e.target.checked)} style={{accentColor:M,width:16,height:16}}/>
            ✅ 교사 인증 배지 부여
          </label>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setWikiAddModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
          <Btn onClick={addWiki} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>추가하기</Btn>
        </div>
      </Modal>

      <Toast msg={toast}/>
    </div>
  );
}
