/* eslint-disable */
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";

// ── Firebase ──
const fb = initializeApp({
  apiKey: "AIzaSyDJQ003TtRZwL9LQM0YMPH9GKaqSmMnh_g",
  authDomain: "innerschool-9589a.firebaseapp.com",
  projectId: "innerschool-9589a",
  storageBucket: "innerschool-9589a.firebasestorage.app",
  messagingSenderId: "877561889584",
  appId: "1:877561889584:web:a6f04a0f32e1548a5d3ef5"
});
const db = getFirestore(fb);
const fbGet = async k => { try { const d=await getDoc(doc(db,"kv",k)); return d.exists()?d.data().v:null; } catch { return null; }};
const fbSet = async (k,v) => { try { await setDoc(doc(db,"kv",k),{v}); } catch(e){console.error(e);} };
const fbDel = async k => { try { await deleteDoc(doc(db,"kv",k)); } catch {} };

// ── 색상 ──
const N="#0f1f3d",M="#2dd4a0",MS="#e6faf4",MM="#a8edcf",AC="#ff6b6b",BG="#f4f6fb",CA="#fff",TX="#1a2540",SO="#5a6a8a",LI="#9aa5c0",BO="#e2e8f4";

// ── Cloudinary 이미지 업로드 ──
const CLOUD_NAME = "DM3GF1VXQ";
const UPLOAD_PRESET = "innerschool_unsigned"; // Unsigned preset 이름

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "innerschool");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  if(data.secure_url) return data.secure_url;
  const msg = data.error?.message || "업로드 실패";
  if(msg.includes("preset")) throw new Error("Cloudinary preset 설정이 필요해요. 관리자에게 문의해주세요.");
  throw new Error(msg);
};

// ── 비속어 필터 ──
const BAD=["씨발","시발","씨팔","시팔","개새끼","새끼","병신","지랄","미친놈","미친년","꺼져","닥쳐","존나","개소리","찐따","멍청이","바보새끼","개년","보지","자지","섹스","개같은","썅","개쓰레기","ㅅㅂ","ㅂㅅ","ㄱㅅㄲ","fuck","shit","bitch","asshole","bastard"];
const hasBad = t => { if(!t) return false; const s=t.toLowerCase().replace(/ /g,""); return BAD.some(w=>s.includes(w)); };

// ── 상수 ──
const TEACHER_CODE = "changjo2605";
const SUB_CATS = ["📝 수행평가","📚 학업·시험","🎓 입시 정보","📊 SLAT","🎨 동아리","📅 행사·일정","🍱 급식·학교생활","📢 학교 공지","🙋 질문 게시판"];
const SUBS = ["국어","영어","수학","과학","사회","역사","도덕","체육","음악","미술","기술·가정","정보","한문","제2외국어","진로"];

const INIT_ACCOUNTS = [
  {role:"student",id:"11025",name:"이윤진",pw:"100130",grade:"1",room:"10",status:"ok"},
  {role:"teacher",id:"T0001",name:"테스트",pw:"1234",subject:"도덕",status:"ok"},
];

const INIT_WIKI = [
  {icon:"🏫",title:"상담실 이용 안내",ok:true,content:"📍 위치: 본관 1층 107호\n\n⏰ 운영 시간\n평일 09:00~17:00 (점심시간 포함)\n\n📝 예약 방법\n1. 담임 선생님께 상담 신청서 제출\n2. 또는 상담실 앞 예약 노트에 직접 기재\n3. 긴급 상담은 예약 없이 방문 가능"},
  {icon:"📚",title:"도서관 이용 규칙",ok:true,link:{label:"도서 검색",url:"https://read365.edunet.net/PureScreen/SchoolSearch?schoolName=%EA%B2%BD%EA%B8%B0%EC%B0%BD%EC%A1%B0%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90&provCode=J10&neisCode=J100005831"},content:"📍 위치: 본관 3층\n\n⏰ 운영 시간: 평일 08:00~18:00\n\n📖 대출 규정\n• 1인 최대 3권 대출\n• 대출 기간: 2주\n• 1회 1주 연장 가능\n\n⚠️ 연체 시 연체일수만큼 대출 정지"},
  {icon:"🎨",title:"동아리 목록 & 소개",ok:false,content:"🎨 색채 (미술)\n활동: 회화, 소묘, 전시회 기획\n활동일: 화·목 방과 후\n\n🎵 하모니 (합창)\n활동: 합창, 교내 행사 공연\n활동일: 월·수 방과 후\n\n💻 코딩클럽\n활동: 프로그래밍, 앱 개발\n활동일: 금 방과 후"},
  {icon:"🎓",title:"수시 지원 절차",ok:false,content:"📋 학교장 추천 전형\n• 추천 기준: 교과 석차등급 평균 2등급 이내\n• 봉사 시간: 50시간 이상 권장\n\n📝 자기소개서 팁\n1. 구체적인 경험과 성장 과정 중심\n2. 학교 활동과 연결\n3. 지원 학과와의 연관성 명확히"},
  {icon:"🏥",title:"보건실 이용 안내",ok:true,content:"📍 위치: 본관 1층 103호\n\n⏰ 운영 시간: 평일 08:30~17:00\n\n💊 구비 약품\n두통약, 소화제, 밴드, 소독약 등\n\n🚨 응급 상황\n1. 즉시 보건실 방문 또는 담임 선생님께 연락\n2. 심각한 경우 119 신고 후 보호자 연락"},
  {icon:"🍱",title:"급식 알레르기 정보",ok:true,content:"1.난류  2.우유  3.메밀  4.땅콩  5.대두  6.밀  7.고등어  8.게  9.새우  10.돼지고기  11.복숭아  12.토마토  13.아황산류  14.호두  15.닭고기  16.쇠고기  17.오징어  18.조개류(굴,전복,홍합 포함)  19.잣"},
];

const MEAL = {
  "6/1":["흑미밥","소고기미역국","닭갈비","콩나물베이비채소무침","열무김치","한컵오렌지주스"],
  "6/2":["차조밥","돈육김치찌개","대구생선까스/소스","어묵잡채","도토리묵/양념장","깍두기","짜요짜요"],
  "6/4":["수수밥","근대된장국","수제닭강정","두부조림","포기김치","수박"],
  "6/5":["찹쌀밥","순두부맑은국","김치사태찜","매추리알감자조림","김말이떡갈조림","총각김치","오렌지"],
  "6/8":["찹쌀밥","콩나물국","고메함박/소스","김자반볶음","진미채고추장볶음","깍두기","단칸도넛"],
  "6/9":["수수밥","곤약어묵국","오삼불고기(대패)","아채계란찜","연근조림","포기김치","서울초코우유"],
  "6/10":["찹쌀밥","팽이미소국","스팸마요덮밥재료","청양마요소스","닭꼬지","포기김치"],
  "6/11":["기장밥","황태해장국","돼지갈비찜","아란치니","깍두기","흔들어먹는골드키위퓨레"],
  "6/12":["찹쌀밥","닭개장국","가자미소스구이","매운떡볶이","청경채나물","총각김치"],
  "6/15":["흑미밥","뼈없는순살감자탕","멘치까스/소스","감자튀김/케찹","열무김치","마카롱"],
  "6/16":["보리밥","청국장찌개","당면소불고기","김치전","깻순나물들깨볶음","포기김치","수박"],
  "6/17":["찹쌀밥","나가사끼짬뽕국","진미짜장야채볶음","스크램블에그","단무지","깍두기","딸바라데"],
  "6/18":["기장밥","배추된장국","목살찹스테이크","멕시칸샐러드","뮤즐리멸치볶음","총각김치","미니바나나우유"],
  "6/19":["차조밥","사골우거지국","묵은지찜닭","알감자조림","새우튀김","열무김치","방울토마토(학교지원)"],
  "6/22":["수수밥","닭곰탕","고추장불고기","통살표고튀김","마늘쫑베이컨볶음","깍두기"],
  "6/23":["찹쌀밥","소고기육개장","꼬치없는갈떡볶음","비름나물무침","구이김","포기김치","한국야쿠르트"],
  "6/24":["보리밥","유부숙주우동국물","야채비빔밥재료","김가루/약고추장","팝콘치킨","볶음김치","프룻프룻주스"],
  "6/25":["현미밥","참치김치찌개","훈제오리야채볶음","부추적채무침","허니버터연근튀김","포기김치","포카리스웨트"],
  "6/26":["보조밥","쇠고기스프","스파게티/소스","왕교만두구이(고기/김치)","비트무오이피클","포기김치","블루베리(학교지원)"],
  "6/29":["현미밥","우렁된장국","동심돈까스/소스","쫄면야채무침","청포묵김가루무침","열무김치","요플레"],
  "6/30":["보리밥","북어채무국","닭조림","시금치나물","참치김치볶음","수박"],
  "5/6":["참쌀밥","배추된장국","제육볶음","계란말이","진미채도라지무침","깍두기","대추방울토마토"],
  "5/7":["김치볶음밥","핫도그/케첩","스크램블에그","들기름막국수","백김치","쥬시쿨에이드"],
  "5/8":["현미밥","비지찌개","봉추ST.찜닭","가마보꼬볶음","검정콩조림","열무김치","상하목장요구르트"],
  "5/11":["보리밥","황태두부국","칠리깐풍새우","미역줄기볶음","츄러스","포기김치"],
  "5/12":["기장밥","콩가루배추국","소고기계란장조림","빨간어묵볶음","고감콘고로케","포기김치","젤리볼리"],
  "5/13":["치킨마요덮밥(찹쌀밥)","얼큰콩나물국","치킨마요덮밥재료","데리마요소스","한섬만두","볶음김치","엠프로키즈요구르트"],
  "5/14":["찹쌀밥","돈갈비김치찌개","안심까스/소스","베이컨계란찜","레몬피클","열무김치","제리뽀"],
  "5/15":["수수밥","호박된장찌개","LA갈비찜","브로콜리들깨무침","건새우마늘쫑볶음","깍두기","사과즙(학교지원)"],
  "5/18":["흑미밥","소고기무국","김치삼겹볶음","콩나물부추무침","야채춘권","깍두기"],
  "5/19":["기장밥","육개장","가자미볼/소스","우엉잡채","도토리묵치커리무침","포기김치"],
  "5/20":["찹쌀밥","진미짜장야채소스","순살가라아케치킨","한식탕평채","깍독단무침","포기김치","수박"],
  "5/21":["잡곡밥","차돌된장국","오징어치즈떡볶음","새콤오이무침","스팸버섯볶음","총각김치","허쉬드링크"],
  "5/22":["차조밥","부대찌개","닭볼고기","청경채나물무침","포기김치","방울토마토(학교지원)"],
  "5/26":["현미밥","웅심이계란국","명란한떡갈비","진미채조림","포기김치","파인애플"],
  "5/27":["찹쌀밥","하이라이스","고추장떡볶이","김말이튀김","쫄면야채무침","포기김치","스위트믹스"],
  "5/28":["찹쌀밥","우렁된장찌개","소고기숙주파채볶음","참나물쌈장무침","허니버터알감자","열무김치"],
  "5/29":["보조밥","소고기스프","토마토스파게티","스노우순살치킨","수제오이피클","포기김치","마늘빵"],
};

// ── 공통 컴포넌트 ──
const Btn = ({onClick,children,style={}}) => <button onClick={onClick} style={{fontFamily:"inherit",cursor:"pointer",border:"none",...style}}>{children}</button>;
const Toast = ({msg}) => msg ? <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:N,color:"#fff",padding:"11px 22px",borderRadius:10,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",whiteSpace:"nowrap"}}>{msg}</div> : null;
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

// ── 스타일 상수 ──
const authBox = {minHeight:"100vh",background:"linear-gradient(135deg,#0f1f3d 0%,#233f7a 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:16};
const authCard = {background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:22,padding:"40px 32px",width:"100%",maxWidth:420,maxHeight:"95vh",overflowY:"auto"};
const inp0 = {width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
const inp1 = {width:"100%",background:BG,border:`1.5px solid ${BO}`,borderRadius:10,padding:"11px 14px",fontSize:14,outline:"none",color:TX,fontFamily:"inherit",boxSizing:"border-box"};
const lbl0 = {color:"rgba(255,255,255,0.65)",fontSize:12,display:"block",marginBottom:6};
const lbl1 = {fontSize:12,fontWeight:500,color:SO,display:"block",marginBottom:6};

const AuthHeader = () => <>
  <div style={{fontFamily:"serif",fontSize:22,fontWeight:800,color:M}}>INNERSCHOOL</div>
  <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginBottom:24}}>교육기회 공정성 실현을 위한 정보 공유 시스템</div>
</>;

// ── 로그인 화면 ──
function LoginRole({onSelect,onReg}) {
  return <div style={authBox}><div style={authCard}>
    <AuthHeader/>
    <div style={{color:"#fff",fontSize:20,fontWeight:700,marginBottom:6}}>로그인</div>
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
  </div></div>;
}

function LoginStudent({onBack,onLogin,onReg}) {
  const [id,setId]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  return <div style={authBox}><div style={authCard}>
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
    <button onClick={()=>{if(id.length!==5){setErr("학번은 5자리 숫자여야 합니다");return;}if(!pw.trim()){setErr("비밀번호를 입력해주세요");return;}setErr("");onLogin(id,pw,"student");}} style={{width:"100%",background:M,color:N,border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>로그인</button>
    <div style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,0.45)",fontSize:13}}>
      계정이 없으신가요? <span onClick={onReg} style={{color:M,fontWeight:600,cursor:"pointer"}}>가입하기</span>
    </div>
  </div></div>;
}

function LoginTeacher({onBack,onLogin,onReg}) {
  const [name,setName]=useState(""); const [sub,setSub]=useState("국어"); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  return <div style={authBox}><div style={authCard}>
    <AuthHeader/>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
      <span onClick={onBack} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
      <span style={{color:"#fff",fontSize:18,fontWeight:700}}>👩‍🏫 선생님 로그인</span>
    </div>
    <div style={{marginBottom:14}}><label style={lbl0}>이름</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="성함을 입력하세요" style={inp0}/></div>
    <div style={{marginBottom:14}}><label style={lbl0}>담당 교과목</label>
      <select value={sub} onChange={e=>setSub(e.target.value)} style={inp0}>{SUBS.map(s=><option key={s}>{s}</option>)}</select>
    </div>
    <div style={{marginBottom:18}}><label style={lbl0}>비밀번호</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="비밀번호 입력" style={inp0}/></div>
    {err&&<div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
    <button onClick={()=>{if(!name.trim()){setErr("이름을 입력해주세요");return;}if(!pw.trim()){setErr("비밀번호를 입력해주세요");return;}setErr("");onLogin(name,pw,sub);}} style={{width:"100%",background:M,color:N,border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>로그인</button>
    <div style={{textAlign:"center",marginTop:16,color:"rgba(255,255,255,0.45)",fontSize:13}}>
      계정이 없으신가요? <span onClick={onReg} style={{color:M,fontWeight:600,cursor:"pointer"}}>가입하기</span>
    </div>
  </div></div>;
}

function Login({onLogin,onReg}) {
  const [role,setRole]=useState(null);
  if(!role) return <LoginRole onSelect={setRole} onReg={onReg}/>;
  if(role==="student") return <LoginStudent onBack={()=>setRole(null)} onLogin={onLogin} onReg={onReg}/>;
  return <LoginTeacher onBack={()=>setRole(null)} onLogin={onLogin} onReg={onReg}/>;
}

// ── 가입 화면 ──
function makeSid(g,r,n){ return g+String(r).padStart(2,"0")+String(n).padStart(2,"0"); }

function Register({onDone,onBack}) {
  const [role,setRole]=useState(null);
  const [name,setName]=useState(""); const [pw,setPw]=useState(""); const [pwC,setPwC]=useState(""); const [err,setErr]=useState("");
  const [grade,setGrade]=useState("1"); const [room,setRoom]=useState("1"); const [num,setNum]=useState("1");
  const [preview,setPreview]=useState(null); const [previewFile,setPreviewFile]=useState(null); const [agreed,setAgreed]=useState(false); const [uploading,setUploading]=useState(false);
  const [sub,setSub]=useState("국어"); const [code,setCode]=useState("");
  const sid=makeSid(grade,room,num);

  const doStudent=async()=>{
    if(!name.trim()){setErr("이름을 입력해주세요");return;}
    if(pw.length<4){setErr("비밀번호는 4자 이상이어야 해요");return;}
    if(pw!==pwC){setErr("비밀번호가 일치하지 않아요");return;}
    if(!preview){setErr("학생증 사진을 첨부해주세요");return;}
    if(!agreed){setErr("개인정보 수집·이용에 동의해주세요");return;}
    setErr("");
    // 학생증 사진 업로드
    if(preview&&previewFile){
      try{
        const url=await uploadImage(previewFile);
        onDone({role:"student",name,sid,grade,room,pw,idPhoto:url});
      }catch{
        onDone({role:"student",name,sid,grade,room,pw,idPhoto:null});
      }
    } else {
      onDone({role:"student",name,sid,grade,room,pw,idPhoto:null});
    }
  };
  const doTeacher=()=>{
    if(!name.trim()){setErr("이름을 입력해주세요");return;}
    if(pw.length<4){setErr("비밀번호는 4자 이상이어야 해요");return;}
    if(pw!==pwC){setErr("비밀번호가 일치하지 않아요");return;}
    if(code!==TEACHER_CODE){setErr("인증코드가 올바르지 않습니다");return;}
    setErr(""); onDone({role:"teacher",name,subject:sub,pw});
  };

  const ErrBox = () => err ? <div style={{color:"#ff8a8a",fontSize:12,marginBottom:12,background:"rgba(255,107,107,0.1)",borderRadius:7,padding:"8px 12px"}}>{err}</div> : null;

  if(!role) return <div style={authBox}><div style={authCard}>
    <AuthHeader/>
    <div style={{color:"#fff",fontSize:20,fontWeight:700,marginBottom:6}}>가입</div>
    <div style={{color:"rgba(255,255,255,0.45)",fontSize:13,marginBottom:20}}>가입할 계정을 선택해주세요</div>
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
  </div></div>;

  if(role==="student") return <div style={authBox}><div style={authCard}>
    <AuthHeader/>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
      <span onClick={()=>{setRole(null);setErr("");}} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
      <span style={{color:"#fff",fontSize:18,fontWeight:700}}>🎒 학생으로 가입</span>
    </div>
    <div style={{marginBottom:12}}><label style={lbl0}>이름</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="본명을 입력하세요" style={inp0}/></div>
    <div style={{marginBottom:4}}><label style={lbl0}>학년 · 반 · 번호</label>
      <div style={{display:"flex",gap:6}}>
        <select value={grade} onChange={e=>setGrade(e.target.value)} style={{...inp0,flex:1}}><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>
        <select value={room} onChange={e=>setRoom(e.target.value)} style={{...inp0,flex:1}}>{Array.from({length:10},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}반</option>)}</select>
        <select value={num} onChange={e=>setNum(e.target.value)} style={{...inp0,flex:1}}>{Array.from({length:35},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}번</option>)}</select>
      </div>
    </div>
    <div style={{background:"rgba(45,212,160,0.08)",border:"1px solid rgba(45,212,160,0.15)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
      <span>🪪</span><span>자동 생성된 학번: <strong style={{color:M,fontSize:14}}>{sid}</strong></span>
    </div>
    <div style={{marginBottom:12}}><label style={lbl0}>비밀번호</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="4자 이상 입력" style={inp0}/></div>
    <div style={{marginBottom:14}}>
      <label style={lbl0}>비밀번호 확인</label>
      <input type="password" value={pwC} onChange={e=>setPwC(e.target.value)} placeholder="비밀번호 다시 입력" style={{...inp0,border:pwC&&pw!==pwC?"1px solid #ff8a8a":inp0.border}}/>
      {pwC&&pw!==pwC&&<div style={{fontSize:11,color:"#ff8a8a",marginTop:4}}>비밀번호가 일치하지 않아요</div>}
      {pwC&&pw===pwC&&<div style={{fontSize:11,color:M,marginTop:4}}>✅ 비밀번호가 일치해요</div>}
    </div>
    <div style={{marginBottom:14}}>
      <label style={lbl0}>학생증 사진 <span style={{color:M}}>*필수</span></label>
      <label style={{display:"block",border:`2px dashed rgba(45,212,160,${preview?0.6:0.3})`,borderRadius:10,padding:preview?6:18,textAlign:"center",cursor:"pointer"}}>
        {preview?<img src={preview} alt="" style={{width:"100%",maxHeight:110,objectFit:"cover",borderRadius:8}}/>
          :<><div style={{fontSize:26,marginBottom:6}}>🪪</div><div style={{color:"rgba(255,255,255,0.45)",fontSize:12}}><span style={{color:M,fontWeight:600}}>클릭하여 첨부</span></div></>}
        <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setPreview(URL.createObjectURL(f));setPreviewFile(f);}}}/>
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
    <ErrBox/>
    <button onClick={doStudent} style={{width:"100%",background:agreed?M:"rgba(45,212,160,0.3)",color:N,border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:agreed?"pointer":"not-allowed",fontFamily:"inherit"}}>가입하기</button>
  </div></div>;

  return <div style={authBox}><div style={authCard}>
    <AuthHeader/>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
      <span onClick={()=>{setRole(null);setErr("");}} style={{color:M,fontSize:13,cursor:"pointer"}}>← 뒤로</span>
      <span style={{color:"#fff",fontSize:18,fontWeight:700}}>👩‍🏫 선생님으로 가입</span>
    </div>
    <div style={{marginBottom:12}}><label style={lbl0}>이름</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="성함을 입력하세요" style={inp0}/></div>
    <div style={{marginBottom:14}}><label style={lbl0}>담당 교과목</label><select value={sub} onChange={e=>setSub(e.target.value)} style={inp0}>{SUBS.map(s=><option key={s}>{s}</option>)}</select></div>
    <div style={{marginBottom:12}}><label style={lbl0}>비밀번호</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="4자 이상 입력" style={inp0}/></div>
    <div style={{marginBottom:14}}>
      <label style={lbl0}>비밀번호 확인</label>
      <input type="password" value={pwC} onChange={e=>setPwC(e.target.value)} placeholder="비밀번호 다시 입력" style={{...inp0,border:pwC&&pw!==pwC?"1px solid #ff8a8a":inp0.border}}/>
      {pwC&&pw!==pwC&&<div style={{fontSize:11,color:"#ff8a8a",marginTop:4}}>비밀번호가 일치하지 않아요</div>}
      {pwC&&pw===pwC&&<div style={{fontSize:11,color:M,marginTop:4}}>✅ 비밀번호가 일치해요</div>}
    </div>
    <div style={{marginBottom:6}}><label style={lbl0}>교사 인증코드 <span style={{color:M}}>*필수</span></label><input type="password" value={code} onChange={e=>setCode(e.target.value)} placeholder="인증코드를 입력하세요" style={inp0}/></div>
    <ErrBox/>
    <button onClick={doTeacher} style={{width:"100%",background:M,color:N,border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:12}}>가입하기</button>
  </div></div>;
}

// ── 프로필 페이지 ──
function ProfilePage({user,isTeacher,isAdmin,accounts,onUpdate,onDelete}) {
  const [tab,setTab]=useState("info");
  const [newName,setNewName]=useState(user.name); const [newSub,setNewSub]=useState(user.room||"국어");
  const [curPw,setCurPw]=useState(""); const [newPw,setNewPw]=useState(""); const [confirmPw,setConfirmPw]=useState("");
  const [delReason,setDelReason]=useState(""); const [delReasonTxt,setDelReasonTxt]=useState(""); const [delConfirm,setDelConfirm]=useState(false);
  const [err,setErr]=useState(""); const [ok,setOk]=useState("");

  const saveInfo=async()=>{
    if(!newName.trim()){setErr("이름을 입력해주세요");setOk("");return;}
    const newAcc=isTeacher?{...accounts.find(a=>a.id===user.id),name:newName.trim(),subject:newSub}:{...accounts.find(a=>a.id===user.id),name:newName.trim()};
    const updated=[...accounts.filter(a=>a.id!==user.id),newAcc];
    await fbSet("accounts",updated);
    onUpdate(updated,{...user,name:newName.trim(),...(isTeacher?{room:newSub}:{})});
    setErr("");setOk("정보가 수정되었어요 ✅");
  };
  const savePw=async()=>{
    const acc=accounts.find(a=>a.id===user.id);
    if(!acc){setErr("계정을 찾을 수 없어요");return;}
    if(acc.pw!==curPw){setErr("현재 비밀번호가 일치하지 않아요");setOk("");return;}
    if(newPw.length<4){setErr("비밀번호는 4자 이상이어야 해요");return;}
    if(newPw!==confirmPw){setErr("새 비밀번호가 일치하지 않아요");return;}
    const updated=[...accounts.filter(a=>a.id!==user.id),{...acc,pw:newPw}];
    await fbSet("accounts",updated);
    onUpdate(updated,user);
    setCurPw("");setNewPw("");setConfirmPw("");
    setErr("");setOk("비밀번호가 변경되었어요 ✅");
  };
  const doDelete=async()=>{
    if(!delReason){setErr("삭제 이유를 선택해주세요");return;}
    if(!delConfirm){setErr("계정 삭제에 동의해주세요");return;}
    const updated=accounts.filter(a=>a.id!==user.id);
    await fbSet("accounts",updated);
    localStorage.removeItem("innerschool_sess");
    onDelete();
  };

  return <div>
    <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>내 계정</h1><p style={{color:SO,fontSize:13,marginTop:3}}>계정 정보를 확인하고 수정하세요</p></div>
    <div style={{background:CA,borderRadius:14,padding:"18px",border:`1px solid ${BO}`,marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
      <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${M},#1a9e76)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:N,flexShrink:0}}>{user.name[0]}</div>
      <div>
        <div style={{fontSize:16,fontWeight:700,color:TX,marginBottom:3}}>{user.name}</div>
        <div style={{fontSize:13,color:SO}}>{isAdmin?"총관리자":isTeacher?user.room+" 선생님":user.grade+" "+user.room}</div>
        <div style={{fontSize:12,color:LI,marginTop:2}}>ID: {user.id}</div>
      </div>
    </div>
    <div style={{display:"flex",gap:3,background:BG,padding:3,borderRadius:10,marginBottom:16}}>
      {[{k:"info",l:"✏️ 정보 수정"},{k:"pw",l:"🔑 비밀번호 변경"},{k:"del",l:"🗑 계정 삭제"}].map(t=>(
        <Btn key={t.k} onClick={()=>{setTab(t.k);setErr("");setOk("");}} style={{flex:1,padding:"9px 4px",borderRadius:8,fontSize:12,fontWeight:tab===t.k?700:500,color:tab===t.k?N:SO,background:tab===t.k?CA:"transparent",whiteSpace:"nowrap"}}>
          {t.l}
        </Btn>
      ))}
    </div>
    {tab==="info"&&<div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`}}>
      <div style={{marginBottom:14}}><label style={lbl1}>이름</label><input value={newName} onChange={e=>setNewName(e.target.value)} style={inp1}/></div>
      {isTeacher&&<div style={{marginBottom:14}}><label style={lbl1}>담당 교과목</label><select value={newSub} onChange={e=>setNewSub(e.target.value)} style={inp1}>{SUBS.map(s=><option key={s}>{s}</option>)}</select></div>}
      {!isTeacher&&<div style={{marginBottom:14}}><label style={lbl1}>학번</label><input value={user.id} disabled style={{...inp1,opacity:0.5,cursor:"not-allowed"}}/><div style={{fontSize:11,color:LI,marginTop:4}}>학번은 변경할 수 없어요</div></div>}
      {err&&<div style={{color:"#c2410c",fontSize:12,marginBottom:10,background:"#fff7ed",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
      {ok&&<div style={{color:"#0e8a5f",fontSize:12,marginBottom:10,background:MS,borderRadius:7,padding:"7px 11px"}}>{ok}</div>}
      <Btn onClick={saveInfo} style={{width:"100%",background:N,color:"#fff",borderRadius:10,padding:12,fontSize:14,fontWeight:700}}>저장하기</Btn>
    </div>}
    {tab==="pw"&&<div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`}}>
      <div style={{marginBottom:14}}><label style={lbl1}>현재 비밀번호</label><input type="password" value={curPw} onChange={e=>setCurPw(e.target.value)} placeholder="현재 비밀번호 입력" style={inp1}/></div>
      <div style={{marginBottom:14}}><label style={lbl1}>새 비밀번호</label><input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="새 비밀번호 입력 (4자 이상)" style={inp1}/></div>
      <div style={{marginBottom:16}}><label style={lbl1}>새 비밀번호 확인</label><input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="새 비밀번호 다시 입력" style={inp1}/></div>
      {err&&<div style={{color:"#c2410c",fontSize:12,marginBottom:10,background:"#fff7ed",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
      {ok&&<div style={{color:"#0e8a5f",fontSize:12,marginBottom:10,background:MS,borderRadius:7,padding:"7px 11px"}}>{ok}</div>}
      <Btn onClick={savePw} style={{width:"100%",background:N,color:"#fff",borderRadius:10,padding:12,fontSize:14,fontWeight:700}}>비밀번호 변경</Btn>
    </div>}
    {tab==="del"&&<div style={{background:CA,borderRadius:14,padding:"20px 18px",border:`1px solid ${BO}`}}>
      <div style={{background:"#fee2e2",border:"1px solid #fecaca",borderRadius:10,padding:"14px",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:"#991b1b",marginBottom:6}}>⚠️ 계정 삭제 주의사항</div>
        <div style={{fontSize:12,color:"#7f1d1d",lineHeight:1.7}}>• 삭제한 계정은 복구할 수 없어요<br/>• 작성한 게시글과 댓글은 삭제되지 않아요<br/>• 재가입 시 동일 학번으로 가입 가능해요</div>
      </div>
      <div style={{marginBottom:14}}><label style={lbl1}>삭제 이유 선택 *</label>
        <select value={delReason} onChange={e=>setDelReason(e.target.value)} style={inp1}>
          <option value="">선택해주세요</option>
          {["졸업 또는 전학","개인정보 보호","사이트 이용 안 함","기타"].map(r=><option key={r}>{r}</option>)}
        </select>
      </div>
      {delReason==="기타"&&<div style={{marginBottom:14}}><label style={lbl1}>기타 이유 입력</label><textarea value={delReasonTxt} onChange={e=>setDelReasonTxt(e.target.value)} rows={3} placeholder="삭제 이유를 입력해주세요" style={{...inp1,resize:"none",boxSizing:"border-box"}}/></div>}
      <div style={{marginBottom:16}}>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:TX}}>
          <input type="checkbox" checked={delConfirm} onChange={e=>setDelConfirm(e.target.checked)} style={{accentColor:"#ef4444",width:16,height:16}}/>
          계정을 삭제하면 복구할 수 없음을 이해했어요
        </label>
      </div>
      {err&&<div style={{color:"#c2410c",fontSize:12,marginBottom:10,background:"#fff7ed",borderRadius:7,padding:"7px 11px"}}>{err}</div>}
      <Btn onClick={doDelete} style={{width:"100%",background:"#ef4444",color:"#fff",borderRadius:10,padding:12,fontSize:14,fontWeight:700}}>계정 삭제하기</Btn>
    </div>}
  </div>;
}

// ── 문의 탭 ──
function InquiryTab() {
  const [items,setItems]=useState([]);
  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"inquiries"),snap=>{
      const list=snap.docs.map(d=>({id:d.id,...d.data()}));
      list.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
      setItems(list);
    });
    return ()=>unsub();
  },[]);
  return <div style={{display:"flex",flexDirection:"column",gap:10}}>
    {items.length===0&&<div style={{background:CA,borderRadius:12,padding:"24px",textAlign:"center",color:LI,border:`1px solid ${BO}`}}>접수된 문의가 없어요 🎉</div>}
    {items.map(item=>(
      <div key={item.id} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,background:"#ede9fe",color:"#5b21b6"}}>{item.type}</span>
            <span style={{fontSize:12,color:SO}}>{item.author} · {item.isTeacher?"교사":item.userId} · {item.date}</span>
          </div>
          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:5,background:item.status==="미확인"?"#fef3c7":"#dcfce7",color:item.status==="미확인"?"#92400e":"#166534"}}>{item.status}</span>
        </div>
        <div style={{fontSize:13,color:TX,lineHeight:1.6,background:BG,borderRadius:8,padding:"10px 12px"}}>{item.text}</div>
      </div>
    ))}
  </div>;
}

// ── 캘린더 ──
function CalendarPage() {
  const [cur,setCur]=useState(5);
  const N2="#0f1f3d",M2="#2dd4a0",CA2="#fff",BO2="#e2e8f4",TX2="#1a2540";
  const MONTHS={
    5:{year:2026,month:5,days:31,startDay:4,holidays:[1,4],
      single:{1:"재량휴업",4:"재량휴업",7:"학력평가",15:"체육대회"},
      ranges:[{from:18,to:29,label:"진로컨설팅",color:N2}],
      list:[{d:"5월 1일·4일",l:"🏫 학교장재량휴업일"},{d:"5월 7일",l:"📝 고3 전국연합학력평가"},{d:"5월 15일",l:"🎽 1·2학년 체육대회 / 3학년 졸업앨범 실내촬영"},{d:"5월 18~29일",l:"👨‍👩‍👧 학부모 진로 진학 컨설팅"}]},
    6:{year:2026,month:6,days:30,startDay:0,holidays:[3],
      single:{3:"지방선거",4:"전국연합·모의평가"},
      ranges:[{from:30,to:30,label:"2차 지필평가",color:M2}],
      list:[{d:"6월 3일",l:"🗳 지방선거 (공휴일)"},{d:"6월 4일",l:"📝 고1·2 전국연합학력평가 / 고3 대수능 모의평가"},{d:"6월 30일~7월 3일",l:"📋 2차 지필평가"}]},
    7:{year:2026,month:7,days:31,startDay:3,holidays:[],
      single:{8:"고3 학력평가",9:"진로진학탐방",10:"SLAT·자율과정",16:"성적사정회",21:"방학식"},
      ranges:[{from:1,to:3,label:"2차 지필평가",color:M2}],
      list:[{d:"7월 1~3일",l:"📋 2차 지필평가"},{d:"7월 8일",l:"📝 고3 전국연합학력평가"},{d:"7월 9일",l:"🗺 1·2학년 진로진학탐방프로그램 / 3학년 자율과정"},{d:"7월 10일",l:"📊 SLAT - 1·2학년 졸업생멘토링 / 자율과정 - 3학년 교과융합프로젝트"},{d:"7월 16일",l:"📋 성적사정회"},{d:"7월 21일",l:"🏖 방학식"}]}
  };
  const m=MONTHS[cur]; const today=new Date(); const keys=Object.keys(MONTHS).map(Number);
  const getRng=d=>{for(const r of m.ranges){if(d>=r.from&&d<=r.to){const col=(m.startDay+d-1)%7;return{...r,isStart:d===r.from,isEnd:d===r.to,col};}}return null;};
  const cellSt={padding:"5px 0 2px",minHeight:56,background:CA2,borderRight:`1px solid ${BO2}`,borderBottom:`1px solid ${BO2}`,display:"flex",flexDirection:"column",alignItems:"center",gap:2};
  return <div>
    <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>공유 캘린더</h1></div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,background:CA2,borderRadius:12,padding:"10px 16px",border:`1px solid ${BO2}`}}>
      <button onClick={()=>setCur(v=>Math.max(Math.min(...keys),v-1))} style={{background:cur>Math.min(...keys)?N2:"#e2e8f4",color:cur>Math.min(...keys)?"#fff":"#9aa5c0",border:"none",borderRadius:8,width:32,height:32,fontSize:18,cursor:"pointer"}}>‹</button>
      <div style={{fontWeight:700,fontSize:16,color:TX2}}>2026년 {cur}월</div>
      <button onClick={()=>setCur(v=>Math.min(Math.max(...keys),v+1))} style={{background:cur<Math.max(...keys)?N2:"#e2e8f4",color:cur<Math.max(...keys)?"#fff":"#9aa5c0",border:"none",borderRadius:8,width:32,height:32,fontSize:18,cursor:"pointer"}}>›</button>
    </div>
    <div style={{background:CA2,borderRadius:14,border:`1px solid ${BO2}`,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:N2}}>
        {["일","월","화","수","목","금","토"].map(d=><div key={d} style={{textAlign:"center",padding:"9px 0",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
        {Array.from({length:m.startDay}).map((_,i)=><div key={`b${i}`} style={{...cellSt,background:"#fafafa"}}/>)}
        {Array.from({length:m.days},(_,i)=>i+1).map(d=>{
          const holiday=m.holidays.includes(d),isToday=today.getFullYear()===m.year&&today.getMonth()+1===m.month&&today.getDate()===d;
          const single=m.single[d],rng=getRng(d);
          return <div key={d} style={{...cellSt,background:isToday?"#f0fdf9":CA2}}>
            <div style={{fontSize:12,fontWeight:600,color:holiday?"#ef4444":isToday?M2:TX2,marginTop:4}}>{d}</div>
            {single&&<div style={{background:N2,color:"#fff",borderRadius:3,padding:"1px 4px",fontSize:7,fontWeight:600,lineHeight:1.5,textAlign:"center",width:"90%",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{single}</div>}
            {rng&&(()=>{
              const col=(m.startDay+d-1)%7,isLS=col===0||rng.isStart,isLE=col===6||rng.isEnd;
              return <div style={{background:rng.color,borderRadius:isLS&&isLE?"4px":isLS?"4px 0 0 4px":isLE?"0 4px 4px 0":"0",marginLeft:isLS?"2px":"0",marginRight:isLE?"2px":"0",height:14,width:"100%",display:"flex",alignItems:"center",overflow:"hidden"}}>
                {isLS&&<span style={{fontSize:7,fontWeight:700,color:"#fff",whiteSpace:"nowrap",paddingLeft:4}}>{rng.label}</span>}
              </div>;
            })()}
          </div>;
        })}
      </div>
    </div>
    <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:6}}>
      {m.list.map((x,i)=>(
        <div key={i} style={{background:CA2,border:`1px solid ${BO2}`,borderRadius:10,padding:"11px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{fontSize:12,fontWeight:700,color:N2,whiteSpace:"nowrap",paddingTop:1,minWidth:80}}>{x.d}</div>
          <div style={{fontSize:13,color:TX2,lineHeight:1.5}}>{x.l}</div>
        </div>
      ))}
    </div>
  </div>;
}


// ── 이달의 급식 ──
function MealPage(){
  const today = new Date();
  const curMon = today.getMonth()+1===6?6:5;
  const [mealMonth,setMealMonth]=useState(curMon);
  const MEAL_MONTHS={
    5:{
      label:"2026년 5월",
      weeks:[
        {label:"1주차",days:[{d:"5/6",day:"수"},{d:"5/7",day:"목"},{d:"5/8",day:"금"}]},
        {label:"2주차",days:[{d:"5/11",day:"월"},{d:"5/12",day:"화"},{d:"5/13",day:"수"},{d:"5/14",day:"목"},{d:"5/15",day:"금"}]},
        {label:"3주차",days:[{d:"5/18",day:"월"},{d:"5/19",day:"화"},{d:"5/20",day:"수"},{d:"5/21",day:"목"},{d:"5/22",day:"금"}]},
        {label:"4주차",days:[{d:"5/26",day:"화"},{d:"5/27",day:"수"},{d:"5/28",day:"목"},{d:"5/29",day:"금"}]},
      ]
    },
    6:{
      label:"2026년 6월",
      weeks:[
        {label:"1주차",days:[{d:"6/1",day:"월"},{d:"6/2",day:"화"},{d:"6/3",day:"수"},{d:"6/4",day:"목"},{d:"6/5",day:"금"}]},
        {label:"2주차",days:[{d:"6/8",day:"월"},{d:"6/9",day:"화"},{d:"6/10",day:"수"},{d:"6/11",day:"목"},{d:"6/12",day:"금"}]},
        {label:"3주차",days:[{d:"6/15",day:"월"},{d:"6/16",day:"화"},{d:"6/17",day:"수"},{d:"6/18",day:"목"},{d:"6/19",day:"금"}]},
        {label:"4주차",days:[{d:"6/22",day:"월"},{d:"6/23",day:"화"},{d:"6/24",day:"수"},{d:"6/25",day:"목"},{d:"6/26",day:"금"}]},
        {label:"5주차",days:[{d:"6/29",day:"월"},{d:"6/30",day:"화"}]},
      ]
    }
  };
  const mealKeys=Object.keys(MEAL_MONTHS).map(Number);
  const weeks=MEAL_MONTHS[mealMonth].weeks;
  return(
    <div>
      <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>🍱 이달의 급식</h1><p style={{color:"#5a6a8a",fontSize:13,marginTop:3}}>세종캐터링 제공</p></div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,background:"#fff",borderRadius:12,padding:"10px 16px",border:"1px solid #e2e8f4"}}>
        <button onClick={()=>setMealMonth(v=>Math.max(Math.min(...mealKeys),v-1))} style={{background:mealMonth>Math.min(...mealKeys)?"#0f1f3d":"#e2e8f4",color:mealMonth>Math.min(...mealKeys)?"#fff":"#9aa5c0",border:"none",borderRadius:8,width:32,height:32,fontSize:18,cursor:"pointer"}}>‹</button>
        <div style={{fontWeight:700,fontSize:15,color:"#1a2540"}}>{MEAL_MONTHS[mealMonth].label}</div>
        <button onClick={()=>setMealMonth(v=>Math.min(Math.max(...mealKeys),v+1))} style={{background:mealMonth<Math.max(...mealKeys)?"#0f1f3d":"#e2e8f4",color:mealMonth<Math.max(...mealKeys)?"#fff":"#9aa5c0",border:"none",borderRadius:8,width:32,height:32,fontSize:18,cursor:"pointer"}}>›</button>
      </div>
      {weeks.map((w,wi)=>(
        <div key={wi} style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:"#5a6a8a",marginBottom:8,paddingLeft:2}}>{w.label}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {w.days.map(({d,day})=>{
              const menu=MEAL[d];
              const isToday=today.getMonth()+1===parseInt(d.split("/")[0])&&today.getDate()===parseInt(d.split("/")[1]);
              return(
                <div key={d} style={{background:isToday?"#f0fdf9":"#fff",border:`1.5px solid ${isToday?"#2dd4a0":"#e2e8f4"}`,borderRadius:12,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:menu?8:0}}>
                    <span style={{background:isToday?"#2dd4a0":"#0f1f3d",color:isToday?"#0f1f3d":"#fff",borderRadius:6,padding:"2px 10px",fontSize:12,fontWeight:700}}>{day}</span>
                    <span style={{fontSize:13,fontWeight:700,color:isToday?"#2dd4a0":"#1a2540"}}>{d.split("/")[0]}월 {d.split("/")[1]}일</span>
                    {isToday&&<span style={{fontSize:11,fontWeight:700,color:"#2dd4a0",background:"#d1fae5",padding:"1px 7px",borderRadius:10}}>오늘</span>}
                  </div>
                  {menu
                    ?<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {menu.map((item,i)=><span key={i} style={{background:"#f4f6fb",border:"1px solid #e2e8f4",borderRadius:5,padding:"3px 8px",fontSize:12,color:"#1a2540"}}>{item}</span>)}
                    </div>
                    :<div style={{fontSize:12,color:"#9aa5c0"}}>휴업일</div>
                  }
                </div>
              );
            })}
          </div>
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
  const [user,setUser]=useState({name:"",id:"",grade:"",room:"",status:""});
  const [accounts,setAccounts]=useState(INIT_ACCOUNTS);
  const [posts,setPosts]=useState([]);
  const [cmts,setCmts]=useState({});
  const [wiki,setWiki]=useState(INIT_WIKI);
  const [idList,setIdList]=useState([]);
  const [vq,setVq]=useState([]);
  const [page,setPage]=useState("board");
  const [sidebar,setSidebar]=useState(false);
  const [gradTab,setGradTab]=useState("전체");
  const [cat,setCat]=useState("전체");
  const [searchQ,setSearchQ]=useState("");
  const [sortBy,setSortBy]=useState("latest");
  const [curPost,setCurPost]=useState(null);
  const [curWiki,setCurWiki]=useState(null);
  const [adminTab,setAdminTab]=useState("id");
  const [toast,setToast]=useState("");
  // 글쓰기
  const [wModal,setWModal]=useState(false);
  const [wAnon,setWAnon]=useState(false);
  const [wType,setWType]=useState(null);
  const [wCat,setWCat]=useState("📝 수행평가");
  const [wGrade,setWGrade]=useState("공통");
  const [wTitle,setWTitle]=useState("");
  const [wBody,setWBody]=useState("");
  const [wSrc,setWSrc]=useState("");
  const [wImages,setWImages]=useState([]);
  const [wImgLoading,setWImgLoading]=useState(false);
  // 댓글
  const [cText,setCText]=useState("");
  const [anon,setAnon]=useState(false);
  // 사실확인
  const [fcModal,setFcModal]=useState(false);
  const [fcTarget,setFcTarget]=useState(null);
  const [fcText,setFcText]=useState("");
  // 게시글 수정
  const [editModal,setEditModal]=useState(false);
  const [editPost,setEditPost]=useState(null);
  const [editTitle,setEditTitle]=useState("");
  const [editBody,setEditBody]=useState("");
  // 위키
  const [wikiEditModal,setWikiEditModal]=useState(false);
  const [wikiAddModal,setWikiAddModal]=useState(false);
  const [editWiki,setEditWiki]=useState(null);
  const [nwIcon,setNwIcon]=useState("📄");
  const [nwTitle,setNwTitle]=useState("");
  const [nwContent,setNwContent]=useState("");
  const [nwOk,setNwOk]=useState(false);
  const [nwImages,setNwImages]=useState([]);
  const [nwImgLoading,setNwImgLoading]=useState(false);
  const [wikiEditImages,setWikiEditImages]=useState([]);
  const [wikiEditImgLoading,setWikiEditImgLoading]=useState(false);
  // 문의
  const [inquiryModal,setInquiryModal]=useState(false);
  const [inquiryType,setInquiryType]=useState("오류 신고");
  const [inquiryText,setInquiryText]=useState("");

  const toast_ = msg => { setToast(msg); setTimeout(()=>setToast(""),2800); };
  const [deferredPrompt,setDeferredPrompt]=useState(null);
  const [showInstall,setShowInstall]=useState(false);
  const [showIosGuide,setShowIosGuide]=useState(false);
  const isIos=/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isStandalone=window.matchMedia('(display-mode: standalone)').matches;

  useEffect(()=>{
    const handler=e=>{ e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt",handler);
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);

  const installApp=async()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const result=await deferredPrompt.userChoice;
    if(result.outcome==="accepted") toast_("앱이 설치됐어요! 😊");
    setDeferredPrompt(null); setShowInstall(false);
  };
  const goPage = p => { setPage(p); setSidebar(false); setCurWiki(null); };

  // ── 초기 로드 ──
  useEffect(()=>{
    (async()=>{
      const savedAcc=await fbGet("accounts");
      // status 보정 - 없거나 이상한 값이면 role에 따라 기본값 설정
      const rawList=(savedAcc&&savedAcc.length>0)?savedAcc:INIT_ACCOUNTS;
      const accList=rawList.map(a=>({
        ...a,
        status: a.id==="11025" ? "ok" :
                a.role==="teacher" ? "ok" :
                (a.status==="ok"||a.status==="pending"||a.status==="blocked") ? a.status : "pending"
      }));
      setAccounts(accList);
      const savedWiki=await fbGet("wiki");
      if(savedWiki&&savedWiki.length>0) setWiki(savedWiki);
      const savedIdList=await fbGet("idList");
      if(savedIdList&&savedIdList.length>0) setIdList(savedIdList);
      const sessStr=localStorage.getItem("innerschool_sess");
      const sess=sessStr?JSON.parse(sessStr):null;
      if(sess&&sess.userId){
        const acc=accList.find(a=>a.id===sess.userId);
        if(acc){
          setIsAdmin(acc.id==="11025"); setIsTeacher(acc.role==="teacher");
          setUser(acc.role==="teacher"?{name:acc.name,id:acc.id,grade:"교사",room:acc.subject||"",status:"ok"}:{name:acc.name,id:acc.id,grade:acc.grade+"학년",room:acc.room+"반",status:acc.status||"pending"});
          setScr("app"); return;
        }
      }
      setScr("login");
    })();
  },[]);

  // ── 실시간 구독 ──
  useEffect(()=>{ const u=onSnapshot(collection(db,"posts"),snap=>{ const l=snap.docs.map(d=>({id:d.id,...d.data()})); l.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)); setPosts(l); }); return()=>u(); },[]);
  useEffect(()=>{ const u=onSnapshot(collection(db,"comments"),snap=>{ const m={}; snap.docs.forEach(d=>{const dt=d.data();if(!m[dt.postId])m[dt.postId]=[];m[dt.postId].push({id:d.id,...dt});}); setCmts(m); }); return()=>u(); },[]);

  // ── 로그인 ──
  const doLogin=async(idOrName,pw,roleOrSub)=>{
    const savedAcc=await fbGet("accounts");
    const list=(savedAcc&&savedAcc.length>0)?savedAcc:INIT_ACCOUNTS;
    setAccounts(list);
    let acc;
    if(roleOrSub==="student"){
      acc=list.find(a=>a.role==="student"&&a.id===idOrName&&a.pw===pw);
      if(!acc){alert("학번 또는 비밀번호가 일치하지 않습니다.");return;}
      if(acc.status==="blocked"){alert("차단된 계정이에요. 총관리자에게 문의해주세요.");return;}
      setIsAdmin(acc.id==="11025"); setIsTeacher(false);
      const stu_status = acc.id==="11025" ? "ok" : (acc.status||"pending");
      setUser({name:acc.name,id:acc.id,grade:acc.grade+"학년",room:acc.room+"반",status:stu_status});
    } else {
      acc=list.find(a=>a.role==="teacher"&&a.name===idOrName&&a.pw===pw&&a.subject===roleOrSub);
      if(!acc){alert("이름, 비밀번호 또는 교과목이 일치하지 않습니다.");return;}
      setIsAdmin(false); setIsTeacher(true);
      setUser({name:acc.name,id:acc.id,grade:"교사",room:acc.subject||"",status:"ok"});
    }
    localStorage.setItem("innerschool_sess",JSON.stringify({userId:acc.id}));
    setScr("app"); setPage("board");
  };

  // ── 가입 ──
  const doReg=async(info)=>{
    const savedAcc=await fbGet("accounts");
    const base=(savedAcc&&savedAcc.length>0)?savedAcc:INIT_ACCOUNTS;
    if(info.role==="student"){
      if(base.find(a=>a.id===info.sid)){alert(`이미 가입된 학번이에요 (${info.sid}).`);return;}
    }
    let updated,newUser;
    if(info.role==="teacher"){
      const tid="T"+Date.now().toString().slice(-4);
      const newAcc={role:"teacher",id:tid,name:info.name,pw:info.pw,subject:info.subject,status:"ok"};
      updated=[...base,newAcc]; newUser={name:info.name,id:tid,grade:"교사",room:info.subject,status:"ok"};
      setIsTeacher(true); setIsAdmin(false);
    } else {
      const newAcc={role:"student",id:info.sid,name:info.name,pw:info.pw,grade:info.grade,room:info.room,status:"pending"};
      updated=[...base,newAcc]; newUser={name:info.name,id:info.sid,grade:info.grade+"학년",room:info.room+"반",status:"pending"};
      setIsTeacher(false); setIsAdmin(false);
      const newItem={id:info.sid,name:info.name,grade:info.grade+"학년 "+info.room+"반",date:new Date().toLocaleDateString("ko-KR"),status:"pending",isTeacher:false,idPhoto:info.idPhoto||null};
      const savedIdList=await fbGet("idList");
      const newIdList=[newItem,...(savedIdList||[])];
      setIdList(newIdList); await fbSet("idList",newIdList);
    }
    await fbSet("accounts",updated);
    localStorage.setItem("innerschool_sess",JSON.stringify({userId:newUser.id}));
    setAccounts(updated); setUser(newUser);
    setScr("app"); setPage("board");
    toast_(info.role==="teacher"?"가입 완료! 👩‍🏫":"가입 완료! 총관리자 승인 후 게시판 이용 가능해요 😊");
  };

  const doLogout=()=>{ localStorage.removeItem("innerschool_sess"); setScr("login"); };
  const onAccountUpdate=(newAcc,newUser)=>{ setAccounts(newAcc); setUser(newUser); };
  const onAccountDelete=()=>{ setScr("login"); };

  // ── 게시글 ──
  const submitPost=async()=>{
    if(!isTeacher&&!wType){toast_("유형을 선택해주세요");return;}
    if(!wTitle.trim()){toast_("제목을 입력해주세요");return;}
    if(!wBody.trim()&&wImages.length===0){toast_("내용을 입력하거나 이미지를 첨부해주세요");return;}
    if(hasBad(wTitle)||hasBad(wBody)){toast_("⚠️ 비속어가 포함되어 있습니다.");return;}
    if(!isTeacher&&wType==="verified"&&!wSrc.trim()){toast_("확인 근거를 입력해주세요");return;}
    const grade=isTeacher?wGrade:user.grade.replace("학년","");
    const now=new Date();
    const dateStr=now.getFullYear()+"."+String(now.getMonth()+1).padStart(2,"0")+"."+String(now.getDate()).padStart(2,"0");
    const np=isTeacher
      ?{title:wTitle.trim(),cat:wCat,type:"teacher",status:"teacher",author:user.name,realAuthor:user.name,anon:false,grade,date:dateStr,views:0,source:"",body:wBody.trim(),images:wImages,fc:0,fcR:[],createdAt:Date.now()}
      :{title:wTitle.trim(),cat:wCat,type:wType,status:wType==="verified"?"pending":"unverified",author:wAnon?"익명":user.name,realAuthor:user.name,anon:wAnon,grade,date:dateStr,views:0,source:wSrc.trim(),body:wBody.trim(),images:wImages,fc:0,fcR:[],createdAt:Date.now()};
    try{
      const ref=await addDoc(collection(db,"posts"),np);
      if(!isTeacher&&wType==="verified") setVq(q=>[{id:ref.id,title:np.title,author:user.name,cat:wCat,source:np.source},...q]);
      setWModal(false);setWType(null);setWTitle("");setWBody("");setWSrc("");setWImages([]);setWAnon(false);
      toast_(isTeacher?"게시됐어요! 👩‍🏫":wType==="verified"?"검토 후 배지가 부여됩니다 ✅":"게시됐어요!");
    }catch(e){console.error(e);toast_("게시 중 오류가 발생했어요.");}
  };
  const deletePost=async(id)=>{ if(!window.confirm("이 게시글을 삭제할까요?"))return; try{await deleteDoc(doc(db,"posts",id));}catch(e){console.error(e);} setPage("board"); toast_("게시글이 삭제됐어요"); };
  const saveEditPost=async()=>{ if(!editTitle.trim()||!editBody.trim()){toast_("제목과 내용을 입력해주세요");return;} try{await updateDoc(doc(db,"posts",editPost.id),{title:editTitle.trim(),body:editBody.trim()});}catch(e){console.error(e);} setCurPost(p=>p?{...p,title:editTitle.trim(),body:editBody.trim()}:p); setEditModal(false); toast_("게시글이 수정됐어요 ✅"); };
  const verifyPost=async(id)=>{ try{await updateDoc(doc(db,"posts",id),{status:"verified"});}catch(e){console.error(e);} setVq(q=>q.filter(v=>v.id!==id)); toast_("✅ 확인된 정보 배지가 부여됐어요!"); };
  const submitFc=async()=>{
    if(!isTeacher&&!fcText.trim()){toast_("사유를 입력해주세요");return;}
    const entry=isTeacher?`[👩‍🏫 ${user.name} 선생님 확인]${fcText.trim()?" "+fcText.trim():""}`:fcText.trim();
    const p=posts.find(x=>x.id===fcTarget); if(!p)return;
    try{await updateDoc(doc(db,"posts",fcTarget),{fc:(p.fc||0)+1,fcR:[...(p.fcR||[]),entry]});}catch(e){console.error(e);}
    setFcModal(false);setFcText(""); toast_(isTeacher?"사실 확인이 등록됐어요 ✅":"사실 확인 요청이 접수됐어요");
  };

  // ── 댓글 ──
  const submitCmt=async()=>{ if(!cText.trim()){toast_("댓글을 입력해주세요");return;} if(hasBad(cText)){toast_("⚠️ 비속어가 포함되어 있습니다.");return;} try{await addDoc(collection(db,"comments"),{postId:curPost.id,author:user.name,anon,text:cText.trim(),time:"방금 전",createdAt:Date.now()});}catch(e){console.error(e);} setCText(""); toast_("댓글이 등록됐어요!"); };
  const deleteCmt=async(cid)=>{ try{await deleteDoc(doc(db,"comments",cid));}catch(e){console.error(e);} toast_("댓글이 삭제됐어요"); };

  // ── 위키 ──
  const saveWiki=async(idx,title,content,images=[])=>{ const updated=wiki.map((w,i)=>i===idx?{...w,title,content,images}:w); setWiki(updated); await fbSet("wiki",updated); setWikiEditModal(false); toast_("위키가 수정됐어요 ✅"); };
  const addWiki=async(imgs=[])=>{ if(!nwTitle.trim()||!nwContent.trim()){toast_("제목과 내용을 입력해주세요");return;} const updated=[...wiki,{icon:nwIcon,title:nwTitle.trim(),ok:nwOk,content:nwContent.trim(),images:imgs}]; setWiki(updated); await fbSet("wiki",updated); setWikiAddModal(false);setNwIcon("📄");setNwTitle("");setNwContent("");setNwOk(false);setNwImages([]); toast_("위키가 추가됐어요 ✅"); };
  const deleteWiki=async(idx)=>{ if(!window.confirm("이 위키 항목을 삭제할까요?"))return; const updated=wiki.filter((_,i)=>i!==idx); setWiki(updated); await fbSet("wiki",updated); setCurWiki(null); toast_("위키가 삭제됐어요"); };

  // ── 문의 ──
  const submitInquiry=async()=>{ if(!inquiryText.trim()){toast_("내용을 입력해주세요");return;} try{await addDoc(collection(db,"inquiries"),{type:inquiryType,text:inquiryText.trim(),author:user.name,userId:user.id,isTeacher,date:new Date().toLocaleDateString("ko-KR"),createdAt:Date.now(),status:"미확인"});setInquiryText("");setInquiryModal(false);toast_("문의가 접수됐어요! 총관리자(11025 이윤진)가 확인 후 처리할게요 😊");}catch(e){console.error(e);} };

  // ── 필터/정렬 ──
  const filtered=posts.filter(p=>{
    const catOk=cat==="전체"||p.cat===cat;
    const gradOk=gradTab==="전체"||(gradTab==="공통"&&p.grade==="공통")||(gradTab!=="공통"&&(p.grade===gradTab.replace("학년","")||p.grade==="공통"));
    const searchOk=!searchQ.trim()||(p.title+p.body).toLowerCase().includes(searchQ.toLowerCase());
    return catOk&&gradOk&&searchOk;
  }).sort((a,b)=>sortBy==="popular"?(b.views||0)-(a.views||0):(b.createdAt||0)-(a.createdAt||0));

  const pending=idList.filter(r=>r.status==="pending").length+vq.length+posts.filter(p=>p.fc>0).length;
  const canWrite=isAdmin||isTeacher||user.status==="ok";

  if(scr==="loading") return <div style={{minHeight:"100vh",background:N,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:M,fontSize:20,fontWeight:700,fontFamily:"serif"}}>INNERSCHOOL</div></div>;
  if(scr==="login") return <Login onLogin={doLogin} onReg={()=>setScr("register")}/>;
  if(scr==="register") return <Register onDone={doReg} onBack={()=>setScr("login")}/>;

  const navs=[{k:"board",i:"📋",l:"정보 공유 게시판"},{k:"wiki",i:"📖",l:"교내 위키"},{k:"calendar",i:"📅",l:"공유 캘린더"},{k:"meal",i:"🍱",l:"이달의 급식"},{k:"profile",i:"👤",l:"내 계정"}];

  return <div style={{minHeight:"100vh",background:BG,color:TX,fontFamily:"'Noto Sans KR',sans-serif"}}>
    {/* 워터마크 */}
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9990,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:13,color:"rgba(15,31,61,0.05)",transform:"rotate(-35deg)",whiteSpace:"nowrap",letterSpacing:2,fontWeight:600,userSelect:"none"}}>{user.id} {user.name} · INNERSCHOOL 교내전용</div>
    </div>

    {/* 사이드바 오버레이 */}
    {sidebar&&<div onClick={()=>setSidebar(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:99}}/>}

    {/* 사이드바 */}
    <aside style={{width:240,background:N,height:"100vh",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,zIndex:100,transform:sidebar?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease",boxShadow:sidebar?"4px 0 24px rgba(0,0,0,0.2)":"none",overflowY:"auto"}}>
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
        <div style={{color:"rgba(255,255,255,0.25)",fontSize:10,fontWeight:600,letterSpacing:1,padding:"0 8px",marginBottom:6}}>메인</div>
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
        {showInstall&&<Btn onClick={installApp} style={{width:"100%",background:"rgba(45,212,160,0.15)",border:"1px solid rgba(45,212,160,0.3)",borderRadius:10,padding:8,color:"#2dd4a0",fontSize:12,marginBottom:4}}>📲 앱으로 설치하기</Btn>}
        {!showInstall&&isIos&&!isStandalone&&<Btn onClick={()=>{setShowIosGuide(true);setSidebar(false);}} style={{width:"100%",background:"rgba(45,212,160,0.15)",border:"1px solid rgba(45,212,160,0.3)",borderRadius:10,padding:8,color:"#2dd4a0",fontSize:12,marginBottom:4}}>📲 홈 화면에 추가</Btn>}
        <Btn onClick={()=>{setInquiryModal(true);setSidebar(false);}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:8,color:"rgba(255,255,255,0.5)",fontSize:12}}>💬 관리자 문의</Btn>
        <Btn onClick={doLogout} style={{width:"100%",background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:10,padding:10,color:"#ff8a8a",fontSize:13}}>로그아웃</Btn>
      </div>
    </aside>

    {/* 헤더 */}
    <div style={{position:"fixed",top:0,left:0,right:0,height:52,background:N,display:"flex",alignItems:"center",padding:"0 14px",zIndex:98,boxShadow:"0 2px 10px rgba(15,31,61,0.15)"}}>
      <Btn onClick={()=>setSidebar(true)} style={{background:"rgba(255,255,255,0.08)",borderRadius:9,width:38,height:38,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}>
        {[0,1,2].map(i=><div key={i} style={{width:18,height:2,background:M,borderRadius:2}}/>)}
      </Btn>
      <div style={{fontFamily:"serif",fontSize:16,fontWeight:800,color:M,marginLeft:12}}>INNERSCHOOL</div>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
        {showInstall&&<Btn onClick={installApp} style={{background:"rgba(45,212,160,0.2)",border:"1px solid rgba(45,212,160,0.4)",borderRadius:8,padding:"5px 10px",color:"#2dd4a0",fontSize:11,fontWeight:600}}>📲 앱 설치</Btn>}
        {!showInstall&&isIos&&!isStandalone&&<Btn onClick={()=>setShowIosGuide(true)} style={{background:"rgba(45,212,160,0.2)",border:"1px solid rgba(45,212,160,0.4)",borderRadius:8,padding:"5px 10px",color:"#2dd4a0",fontSize:11,fontWeight:600}}>📲 앱 추가</Btn>}
        {isAdmin&&pending>0&&<span style={{background:AC,color:"#fff",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:10}}>{pending}건 대기</span>}
      </div>
    </div>

    {/* 콘텐츠 */}
    <main style={{padding:"68px 14px 32px",minHeight:"100vh"}}>

      {/* ── 게시판 ── */}
      {page==="board"&&<div>
        <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>정보 공유 게시판</h1><p style={{color:SO,fontSize:13,marginTop:3}}>우리 학교의 모든 정보를 한 곳에서</p></div>

        {/* 승인 대기 */}
        {!isAdmin&&!isTeacher&&user.status==="pending"&&<div style={{background:"#fef3c7",border:"1px solid #fde047",borderRadius:14,padding:"28px 20px",textAlign:"center",marginTop:20}}>
          <div style={{fontSize:36,marginBottom:12}}>🔒</div>
          <div style={{fontSize:16,fontWeight:700,color:"#92400e",marginBottom:8}}>승인 대기 중이에요</div>
          <div style={{fontSize:13,color:"#a16207",lineHeight:1.7}}>총관리자가 학생증을 확인 후 승인하면<br/>게시판을 이용할 수 있어요.</div>
        </div>}

        {/* 차단 */}
        {!isAdmin&&!isTeacher&&user.status==="blocked"&&<div style={{background:"#fee2e2",border:"1px solid #fecaca",borderRadius:14,padding:"28px 20px",textAlign:"center",marginTop:20}}>
          <div style={{fontSize:36,marginBottom:12}}>🚫</div>
          <div style={{fontSize:16,fontWeight:700,color:"#991b1b",marginBottom:8}}>차단된 계정이에요</div>
          <div style={{fontSize:13,color:"#7f1d1d",lineHeight:1.7}}>이 계정은 총관리자에 의해 차단됐어요.</div>
          <Btn onClick={()=>setInquiryModal(true)} style={{marginTop:16,background:"#991b1b",color:"#fff",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600}}>💬 관리자 문의</Btn>
        </div>}

        {(isAdmin||isTeacher||user.status==="ok")&&<>
          {/* 학년 탭 */}
          <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
            {["전체","1학년","2학년","3학년","공통"].map(g=>(
              <Btn key={g} onClick={()=>{setGradTab(g);setCat("전체");}} style={{padding:"7px 14px",borderRadius:18,border:`1.5px solid ${gradTab===g?N:BO}`,background:gradTab===g?N:CA,color:gradTab===g?"#fff":SO,fontSize:13,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>{g}</Btn>
            ))}
          </div>
          {/* 세부 카테고리 */}
          <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:12,paddingBottom:4}}>
            {["전체",...SUB_CATS].map(c=>(
              <Btn key={c} onClick={()=>setCat(c)} style={{padding:"5px 12px",borderRadius:16,border:`1.5px solid ${cat===c?M:BO}`,background:cat===c?M:CA,color:cat===c?N:SO,fontSize:12,fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>{c}</Btn>
            ))}
          </div>
          {/* 검색 */}
          <div style={{position:"relative",marginBottom:10}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍 제목이나 내용으로 검색하세요" style={{width:"100%",background:CA,border:`1.5px solid ${BO}`,borderRadius:10,padding:"10px 14px",fontSize:13,outline:"none",color:TX,fontFamily:"inherit",boxSizing:"border-box"}}/>
            {searchQ&&<span onClick={()=>setSearchQ("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",color:LI,fontSize:16}}>✕</span>}
          </div>
          {/* 정렬 + 글쓰기 */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",gap:6}}>
              {[{k:"latest",l:"🕐 최신순"},{k:"popular",l:"🔥 인기순"}].map(s=>(
                <Btn key={s.k} onClick={()=>setSortBy(s.k)} style={{padding:"6px 12px",borderRadius:18,border:`1.5px solid ${sortBy===s.k?N:BO}`,background:sortBy===s.k?N:CA,color:sortBy===s.k?"#fff":SO,fontSize:12,fontWeight:600}}>{s.l}</Btn>
              ))}
            </div>
            {canWrite&&<Btn onClick={()=>{setWType(null);setWTitle("");setWBody("");setWSrc("");setWModal(true);}} style={{display:"flex",alignItems:"center",gap:6,background:M,color:N,borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:700}}>✏️ 글쓰기</Btn>}
          </div>
          {filtered.length===0&&<div style={{textAlign:"center",color:LI,padding:"40px 0",fontSize:14}}>아직 게시글이 없어요. 첫 글을 올려보세요!</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(p=>(
              <div key={p.id} onClick={async()=>{const latest=posts.find(x=>x.id===p.id)||p;setCurPost(latest);setPage("detail");try{await updateDoc(doc(db,"posts",p.id),{views:(p.views||0)+1});}catch{}}} style={{background:CA,borderRadius:12,padding:"16px",border:`1px solid ${BO}`,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
                  <Chip type={p.type} status={p.status}/>
                  <div style={{fontSize:14,fontWeight:600,color:TX,flex:1,lineHeight:1.4}}>{p.title}</div>
                  {p.images&&p.images.length>0&&<img src={p.images[0]} alt="" style={{width:56,height:56,objectFit:"cover",borderRadius:8,border:`1px solid ${BO}`,flexShrink:0}}/>}
                </div>
                {p.type==="unverified"&&<div style={{background:"#fff7ed",borderLeft:"3px solid #f59e0b",borderRadius:"0 6px 6px 0",padding:"6px 10px",fontSize:11,color:"#92400e",marginBottom:6}}>⚠️ 미검증 정보입니다. 주의하세요.</div>}

                <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:LI,flexWrap:"wrap"}}>
                  <span style={{background:BG,padding:"2px 7px",borderRadius:4,color:SO}}>{p.cat}</span>
                  <span>{p.anon?"익명":p.author} · {p.grade==="공통"?"공통":p.grade+"학년"}</span>
                  <span>{p.date}</span>
                  {isAdmin&&p.fc>0&&<span style={{color:AC,fontWeight:700}}>🚨 {p.fc}건</span>}
                  <span style={{marginLeft:"auto",display:"flex",gap:6}}>
                    <span style={{background:BG,padding:"2px 7px",borderRadius:6,fontSize:11}}>👁 {p.views||0}</span>
                    <span style={{background:BG,padding:"2px 7px",borderRadius:6,fontSize:11}}>💬 {(cmts[p.id]||[]).length}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>}
      </div>}

      {/* ── 게시글 상세 ── */}
      {page==="detail"&&curPost&&<div>
        <Btn onClick={()=>setPage("board")} style={{display:"flex",alignItems:"center",gap:4,background:BG,color:SO,border:`1.5px solid ${BO}`,borderRadius:8,padding:"7px 14px",fontSize:13,marginBottom:16}}>← 목록으로</Btn>
        <div style={{background:CA,borderRadius:12,padding:"20px 16px",border:`1px solid ${BO}`,marginBottom:12}}>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}><Chip type={curPost.type} status={curPost.status}/></div>
          <div style={{fontSize:18,fontWeight:700,color:TX,lineHeight:1.4,marginBottom:10}}>{curPost.title}</div>
          <div style={{display:"flex",gap:12,fontSize:11,color:LI,marginBottom:12,flexWrap:"wrap"}}>
            <span>👤 {curPost.anon?(isAdmin?`익명 (${curPost.realAuthor||curPost.author})`:'익명'):curPost.author} · {curPost.grade==="공통"?"공통":curPost.grade+"학년"}</span>
            <span>📅 {curPost.date}</span><span>👁 {curPost.views||0}</span>
          </div>
          {curPost.type==="unverified"&&<div style={{background:"#fff7ed",borderLeft:"3px solid #f59e0b",borderRadius:"0 8px 8px 0",padding:"8px 12px",fontSize:12,color:"#92400e",marginBottom:12}}>⚠️ 미검증 정보입니다. 출처를 직접 확인하세요.</div>}
          <div style={{fontSize:14,lineHeight:1.9,color:TX,padding:"14px 0",borderTop:`1px solid ${BO}`,borderBottom:`1px solid ${BO}`,whiteSpace:"pre-line"}}>{curPost.body}</div>
          {curPost.source&&<div style={{background:MS,border:`1px solid ${MM}`,borderRadius:9,padding:"12px 14px",fontSize:13,color:"#0e7a5a",marginTop:12}}><div style={{fontSize:11,fontWeight:700,marginBottom:3}}>📎 확인 근거</div>{curPost.source}</div>}
          {curPost.images&&curPost.images.length>0&&<div style={{marginTop:14}}>
            <div style={{fontSize:12,fontWeight:700,color:SO,marginBottom:8}}>📷 첨부 이미지</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {curPost.images.map((url,i)=><img key={i} src={url} alt={`첨부${i+1}`} style={{width:"100%",borderRadius:10,border:`1px solid ${BO}`,cursor:"pointer"}} onClick={()=>window.open(url,"_blank")}/>)}
            </div>
          </div>}
          {isAdmin&&curPost.fc>0&&<div style={{background:"#fee2e2",borderRadius:9,padding:"10px 14px",marginTop:10}}>
            <div style={{fontSize:13,color:"#991b1b",fontWeight:700,marginBottom:6}}>🚨 사실확인 요청 {curPost.fc}건</div>
            {(curPost.fcR||[]).map((r,i)=><div key={i} style={{fontSize:12,color:"#7f1d1d",background:"rgba(255,255,255,0.5)",borderRadius:5,padding:"5px 9px",marginBottom:3}}>"{r}"</div>)}
          </div>}
          <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
            {(isAdmin||curPost.author===user.name)&&<>
              <Btn onClick={()=>{setEditPost(curPost);setEditTitle(curPost.title);setEditBody(curPost.body);setEditModal(true);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,background:"#f0f9ff",color:"#0369a1",border:"1.5px solid #bae6fd",fontSize:13}}>✏️ 수정</Btn>
              <Btn onClick={()=>deletePost(curPost.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,background:"#fee2e2",color:"#991b1b",border:"1.5px solid #fecaca",fontSize:13}}>🗑 삭제</Btn>
            </>}
            {curPost.type!=="teacher"&&<Btn onClick={()=>{setFcTarget(curPost.id);setFcText("");setFcModal(true);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,background:isTeacher?"#ede9fe":"#fff7ed",color:isTeacher?"#5b21b6":"#c2410c",border:`1.5px solid ${isTeacher?"#c4b5fd":"#fed7aa"}`,fontSize:13}}>{isTeacher?"✅ 사실 확인 체크":"🚨 사실 확인 요청"}</Btn>}
          </div>
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

      {/* ── 교내 위키 목록 ── */}
      {page==="wiki"&&!curWiki&&<div>
        <div style={{marginBottom:14}}><h1 style={{fontSize:21,fontWeight:700}}>교내 위키</h1><p style={{color:SO,fontSize:13,marginTop:3}}>학교생활에 필요한 정보를 찾아보세요</p></div>
        {isAdmin&&<Btn onClick={()=>setWikiAddModal(true)} style={{display:"flex",alignItems:"center",gap:6,background:M,color:N,borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:700,marginBottom:14}}>➕ 위키 추가</Btn>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {wiki.map((w,i)=>(
            <div key={i} onClick={()=>setCurWiki({...w,idx:i})} style={{background:CA,borderRadius:12,padding:"14px 16px",border:`1px solid ${BO}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:30,flexShrink:0}}>{w.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:TX,marginBottom:3}}>{w.title}</div>
                <span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:w.ok?MS:"#fef3c7",color:w.ok?"#0e8a5f":"#92400e"}}>{w.ok?"✅ 교사 인증":"📝 학생 작성"}</span>
              </div>
              <span style={{fontSize:16,color:LI,flexShrink:0}}>›</span>
            </div>
          ))}
        </div>
      </div>}

      {/* ── 교내 위키 상세 ── */}
      {page==="wiki"&&curWiki&&<div>
        <Btn onClick={()=>setCurWiki(null)} style={{display:"flex",alignItems:"center",gap:4,background:BG,color:SO,border:`1.5px solid ${BO}`,borderRadius:8,padding:"7px 14px",fontSize:13,marginBottom:16}}>← 위키 목록으로</Btn>
        <div style={{background:CA,borderRadius:12,padding:"20px 16px",border:`1px solid ${BO}`}}>
          <div style={{fontSize:34,marginBottom:10}}>{curWiki.icon}</div>
          <h1 style={{fontSize:19,fontWeight:700,color:TX,marginBottom:6}}>{curWiki.title}</h1>
          <span style={{display:"inline-block",padding:"3px 9px",borderRadius:5,fontSize:11,fontWeight:700,background:curWiki.ok?MS:"#fef3c7",color:curWiki.ok?"#0e8a5f":"#92400e",marginBottom:14}}>{curWiki.ok?"✅ 교사 인증":"📝 학생 작성"}</span>
          <div style={{borderTop:`1px solid ${BO}`,paddingTop:16,fontSize:14,lineHeight:1.9,color:TX,whiteSpace:"pre-line"}}>{curWiki.content}</div>
          {curWiki.link&&<a href={curWiki.link.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:14,background:N,color:"#fff",borderRadius:9,padding:"10px 18px",fontSize:13,fontWeight:600,textDecoration:"none"}}>🔗 {curWiki.link.label}</a>}
          {curWiki.images&&curWiki.images.length>0&&<div style={{marginTop:14}}>
            <div style={{fontSize:12,fontWeight:700,color:SO,marginBottom:8}}>📷 첨부 이미지</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {curWiki.images.map((url,i)=><img key={i} src={url} alt={`첨부${i+1}`} style={{width:"100%",borderRadius:10,border:`1px solid ${BO}`,cursor:"pointer"}} onClick={()=>window.open(url,"_blank")}/>)}
            </div>
          </div>}
          {curWiki.ok&&<div style={{marginTop:16,background:MS,border:`1px solid ${MM}`,borderRadius:9,padding:"11px 14px",fontSize:12,color:"#0e7a5a"}}>✅ 교사가 직접 검토하고 인증한 공식 정보입니다.</div>}
          {isAdmin&&<div style={{display:"flex",gap:8,marginTop:14}}>
            <Btn onClick={()=>setWikiEditModal(true)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#f0f9ff",color:"#0369a1",border:"1.5px solid #bae6fd",borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:600}}>✏️ 수정</Btn>
            <Btn onClick={()=>deleteWiki(curWiki.idx)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#fee2e2",color:"#991b1b",border:"1.5px solid #fecaca",borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:600}}>🗑 삭제</Btn>
          </div>}
        </div>
      </div>}

      {/* ── 캘린더 ── */}
      {page==="calendar"&&<CalendarPage/>}

      {/* ── 이달의 급식 ── */}
      {page==="meal"&&<MealPage/>}

      {/* ── 내 계정 ── */}
      {page==="profile"&&<ProfilePage user={user} isTeacher={isTeacher} isAdmin={isAdmin} accounts={accounts} onUpdate={onAccountUpdate} onDelete={onAccountDelete}/>}

      {/* ── 관리자 대시보드 ── */}
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
            <Btn key={t.k} onClick={()=>setAdminTab(t.k)} style={{flex:1,padding:"8px 4px",textAlign:"center",borderRadius:8,fontSize:12,fontWeight:adminTab===t.k?700:500,color:adminTab===t.k?N:SO,background:adminTab===t.k?"#fff":"transparent",whiteSpace:"nowrap"}}>{t.l}</Btn>
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
              {r.idPhoto
                ? <img src={r.idPhoto} alt="학생증" style={{width:"100%",maxHeight:200,objectFit:"contain",borderRadius:8,border:`1px solid ${BO}`,marginBottom:r.status==="pending"?10:0,cursor:"pointer"}} onClick={()=>window.open(r.idPhoto,"_blank")}/>
                : <div style={{background:BG,border:`1px dashed ${BO}`,borderRadius:8,padding:"10px",textAlign:"center",fontSize:12,color:LI,marginBottom:r.status==="pending"?10:0}}>🪪 학생증 사진 없음</div>
              }
              {r.status==="pending"&&<div style={{display:"flex",gap:8}}>
                <Btn onClick={async()=>{
                  const newIdList=idList.map(x=>x.id===r.id?{...x,status:"ok"}:x);
                  setIdList(newIdList); await fbSet("idList",newIdList);
                  const updatedAcc=accounts.map(a=>a.id===r.id?{...a,status:"ok"}:a);
                  setAccounts(updatedAcc); await fbSet("accounts",updatedAcc);
                  toast_(`${r.name} 승인됐어요 ✅`);
                }} style={{flex:1,background:"#dcfce7",color:"#166534",borderRadius:8,padding:"8px",fontSize:13,fontWeight:600}}>✅ 승인</Btn>
                <Btn onClick={async()=>{
                  const newIdList=idList.map(x=>x.id===r.id?{...x,status:"blocked"}:x);
                  setIdList(newIdList); await fbSet("idList",newIdList);
                  const updatedAcc=accounts.map(a=>a.id===r.id?{...a,status:"blocked"}:a);
                  setAccounts(updatedAcc); await fbSet("accounts",updatedAcc);
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
                <span style={{display:"inline-block",marginTop:4,padding:"2px 8px",borderRadius:5,fontSize:11,fontWeight:700,background:(!u.status||u.status==="ok"||u.role==="teacher")?"#dcfce7":u.status==="pending"?"#fef3c7":"#fee2e2",color:(!u.status||u.status==="ok"||u.role==="teacher")?"#166534":u.status==="pending"?"#92400e":"#991b1b"}}>{(!u.status||u.status==="ok"||u.role==="teacher")?"정상":u.status==="pending"?"검토 중":"차단됨"}</span>
              </div>
              {u.id!=="11025"&&<Btn onClick={async()=>{const updated=accounts.filter(a=>a.id!==u.id);await fbSet("accounts",updated);setAccounts(updated);toast_(`${u.name} 계정이 삭제됐어요`);}} style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600}}>🗑 삭제</Btn>}
            </div>
          ))}
        </div>}
        {adminTab==="inquiry"&&<InquiryTab/>}
      </div>}
    </main>

    {/* ── 모달들 ── */}

    {/* 글쓰기 */}
    <Modal open={wModal} onClose={()=>setWModal(false)} title="✏️ 새 글 작성">
      {isTeacher&&<div style={{background:"#ede9fe",border:"1px solid #c4b5fd",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#5b21b6",marginBottom:14}}>👩‍🏫 선생님 계정으로 게시하면 <strong>'선생님 인증'</strong> 배지가 자동으로 부여됩니다.</div>}
      {isTeacher&&<div style={{marginBottom:12}}><label style={lbl1}>대상 학년</label>
        <select value={wGrade} onChange={e=>setWGrade(e.target.value)} style={inp1}><option value="공통">공통 (전체 학년)</option><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>
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
        <select value={wCat} onChange={e=>setWCat(e.target.value)} style={inp1}>{SUB_CATS.map(c=><option key={c}>{c}</option>)}</select>
      </div>
      <div style={{marginBottom:12}}><label style={lbl1}>제목</label><input value={wTitle} onChange={e=>setWTitle(e.target.value)} placeholder="제목을 입력하세요" style={inp1}/></div>
      <div style={{marginBottom:4}}><label style={lbl1}>내용 {wImages.length>0&&<span style={{color:LI,fontWeight:400,fontSize:11}}>(이미지 첨부 시 선택사항)</span>}</label><textarea value={wBody} onChange={e=>setWBody(e.target.value)} rows={5} placeholder={wImages.length>0?"내용을 입력하세요 (선택사항)":"내용을 입력하세요"} style={{...inp1,resize:"none",boxSizing:"border-box"}}/></div>
      {!isTeacher&&<div style={{marginTop:10}}>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:TX}}>
          <input type="checkbox" checked={wAnon} onChange={e=>setWAnon(e.target.checked)} style={{accentColor:N,width:15,height:15}}/>
          익명으로 게시
        </label>
        {wAnon&&<div style={{fontSize:11,color:SO,marginTop:5,marginLeft:23}}>작성자 이름이 '익명'으로 표시됩니다. 총관리자에게는 실명이 확인되며, 익명이더라도 비속어 등 부적절한 언행은 삼가주시기 바랍니다.</div>}
      </div>}
      {/* 이미지 첨부 */}
      <div style={{marginBottom:16}}>
        <label style={lbl1}>이미지 첨부 (선택사항 · 최대 3장)</label>
        <label style={{display:"flex",alignItems:"center",gap:8,background:BG,border:`1.5px dashed ${BO}`,borderRadius:10,padding:"11px 14px",cursor:wImages.length>=3?"not-allowed":"pointer",opacity:wImages.length>=3?0.5:1}}>
          <span style={{fontSize:18}}>📷</span>
          <span style={{fontSize:13,color:SO}}>{wImgLoading?"업로드 중...":wImages.length>=3?"최대 3장까지 첨부 가능":"이미지 선택"}</span>
          <input type="file" accept="image/*" style={{display:"none"}} disabled={wImages.length>=3||wImgLoading} onChange={async e=>{
            const f=e.target.files[0]; if(!f)return;
            if(f.size>20*1024*1024){alert("이미지는 20MB 이하만 가능해요");return;}
            setWImgLoading(true);
            try{ const url=await uploadImage(f); setWImages(prev=>[...prev,url]); }
            catch{ alert("이미지 업로드에 실패했어요. 다시 시도해주세요."); }
            finally{ setWImgLoading(false); }
          }}/>
        </label>
        {wImages.length>0&&<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
          {wImages.map((url,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={url} alt="" style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:`1px solid ${BO}`}}/>
              <span onClick={()=>setWImages(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,background:AC,color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,cursor:"pointer",fontWeight:700}}>✕</span>
            </div>
          ))}
        </div>}
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
        <Btn onClick={()=>setWModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
        <Btn onClick={submitPost} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>게시하기</Btn>
      </div>
    </Modal>

    {/* 사실확인 */}
    <Modal open={fcModal} onClose={()=>setFcModal(false)} title={isTeacher?"✅ 사실 확인 체크":"🚨 사실 확인 요청"}>
      <p style={{fontSize:13,color:SO,marginBottom:16}}>{isTeacher?"이 게시글의 내용이 사실임을 확인합니다. 추가로 전달할 내용이 있다면 아래에 입력해주세요.":"사실과 다르다고 생각하시나요? 구체적인 사유를 입력해주세요."}</p>
      <textarea value={fcText} onChange={e=>setFcText(e.target.value)} rows={4} placeholder={isTeacher?"추가로 할 말이 있으면 입력하세요 (선택사항)":"예: 시험 범위가 실제로는 2단원까지입니다."} style={{...inp1,resize:"none",boxSizing:"border-box",marginBottom:16}}/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn onClick={()=>setFcModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
        <Btn onClick={submitFc} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>제출</Btn>
      </div>
    </Modal>

    {/* 게시글 수정 */}
    <Modal open={editModal} onClose={()=>setEditModal(false)} title="✏️ 게시글 수정">
      <div style={{marginBottom:12}}><label style={lbl1}>제목</label><input value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={inp1}/></div>
      <div style={{marginBottom:4}}><label style={lbl1}>내용</label><textarea value={editBody} onChange={e=>setEditBody(e.target.value)} rows={8} style={{...inp1,resize:"vertical",boxSizing:"border-box"}}/></div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
        <Btn onClick={()=>setEditModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
        <Btn onClick={saveEditPost} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>저장</Btn>
      </div>
    </Modal>

    {/* 위키 수정 */}
    <Modal open={wikiEditModal} onClose={()=>setWikiEditModal(false)} title="✏️ 위키 수정">
      {curWiki&&<>
        <div style={{marginBottom:12}}><label style={lbl1}>제목</label><input value={curWiki.title} onChange={e=>setCurWiki(w=>({...w,title:e.target.value}))} style={inp1}/></div>
        <div style={{marginBottom:4}}><label style={lbl1}>내용</label><textarea value={curWiki.content} onChange={e=>setCurWiki(w=>({...w,content:e.target.value}))} rows={12} style={{...inp1,resize:"vertical",boxSizing:"border-box"}}/></div>
        {/* 위키 수정 이미지 */}
        <div style={{marginBottom:12,marginTop:8}}>
          <label style={lbl1}>이미지 첨부 (최대 5장)</label>
          <label style={{display:"flex",alignItems:"center",gap:8,background:BG,border:`1.5px dashed ${BO}`,borderRadius:10,padding:"11px 14px",cursor:(curWiki.images||[]).length>=5?"not-allowed":"pointer"}}>
            <span style={{fontSize:18}}>📷</span>
            <span style={{fontSize:13,color:SO}}>{wikiEditImgLoading?"업로드 중...":"이미지 추가"}</span>
            <input type="file" accept="image/*" style={{display:"none"}} disabled={wikiEditImgLoading} onChange={async e=>{
              const f=e.target.files[0]; if(!f)return;
              if(f.size>20*1024*1024){alert("이미지는 20MB 이하만 가능해요");return;}
              setWikiEditImgLoading(true);
              try{ const url=await uploadImage(f); setCurWiki(w=>({...w,images:[...(w.images||[]),url]})); }
              catch{ alert("이미지 업로드에 실패했어요."); }
              finally{ setWikiEditImgLoading(false); }
            }}/>
          </label>
          {(curWiki.images||[]).length>0&&<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
            {(curWiki.images||[]).map((url,i)=>(
              <div key={i} style={{position:"relative"}}>
                <img src={url} alt="" style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:`1px solid ${BO}`}}/>
                <span onClick={()=>setCurWiki(w=>({...w,images:(w.images||[]).filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-6,right:-6,background:AC,color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,cursor:"pointer",fontWeight:700}}>✕</span>
              </div>
            ))}
          </div>}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
          <Btn onClick={()=>setWikiEditModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
          <Btn onClick={()=>saveWiki(curWiki.idx,curWiki.title,curWiki.content,curWiki.images||[])} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>저장</Btn>
        </div>
      </>}
    </Modal>

    {/* 위키 추가 */}
    <Modal open={wikiAddModal} onClose={()=>setWikiAddModal(false)} title="➕ 위키 항목 추가">
      <div style={{marginBottom:12}}><label style={lbl1}>아이콘 (이모지)</label><input value={nwIcon} onChange={e=>setNwIcon(e.target.value)} placeholder="예: 📄" style={inp1}/></div>
      <div style={{marginBottom:12}}><label style={lbl1}>제목 *</label><input value={nwTitle} onChange={e=>setNwTitle(e.target.value)} placeholder="위키 제목" style={inp1}/></div>
      <div style={{marginBottom:12}}><label style={lbl1}>내용 *</label><textarea value={nwContent} onChange={e=>setNwContent(e.target.value)} rows={8} placeholder="위키 내용을 입력하세요" style={{...inp1,resize:"vertical",boxSizing:"border-box"}}/></div>
      <div style={{marginBottom:12}}>
        <label style={lbl1}>이미지 첨부 (선택사항 · 최대 5장)</label>
        <label style={{display:"flex",alignItems:"center",gap:8,background:BG,border:`1.5px dashed ${BO}`,borderRadius:10,padding:"11px 14px",cursor:nwImages.length>=5?"not-allowed":"pointer",opacity:nwImages.length>=5?0.5:1}}>
          <span style={{fontSize:18}}>📷</span>
          <span style={{fontSize:13,color:SO}}>{nwImgLoading?"업로드 중...":nwImages.length>=5?"최대 5장까지 첨부 가능":"이미지 선택"}</span>
          <input type="file" accept="image/*" style={{display:"none"}} disabled={nwImages.length>=5||nwImgLoading} onChange={async e=>{
            const f=e.target.files[0]; if(!f)return;
            if(f.size>20*1024*1024){alert("이미지는 20MB 이하만 가능해요");return;}
            setNwImgLoading(true);
            try{ const url=await uploadImage(f); setNwImages(prev=>[...prev,url]); }
            catch{ alert("이미지 업로드에 실패했어요."); }
            finally{ setNwImgLoading(false); }
          }}/>
        </label>
        {nwImages.length>0&&<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
          {nwImages.map((url,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={url} alt="" style={{width:80,height:80,objectFit:"cover",borderRadius:8,border:`1px solid ${BO}`}}/>
              <span onClick={()=>setNwImages(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,background:AC,color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,cursor:"pointer",fontWeight:700}}>✕</span>
            </div>
          ))}
        </div>}
      </div>
      <div style={{marginBottom:16}}>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:TX}}>
          <input type="checkbox" checked={nwOk} onChange={e=>setNwOk(e.target.checked)} style={{accentColor:M,width:16,height:16}}/>
          ✅ 교사 인증 배지 부여
        </label>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn onClick={()=>setWikiAddModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
        <Btn onClick={()=>{ addWiki(nwImages); }} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>추가하기</Btn>
      </div>
    </Modal>

    {/* 관리자 문의 */}
    <Modal open={inquiryModal} onClose={()=>setInquiryModal(false)} title="💬 관리자 문의">
      <p style={{fontSize:13,color:SO,marginBottom:16}}>사이트 오류 신고나 건의사항을 남겨주세요. 총관리자(11025 이윤진)가 확인 후 처리할게요.</p>
      <div style={{marginBottom:12}}><label style={lbl1}>문의 유형</label>
        <select value={inquiryType} onChange={e=>setInquiryType(e.target.value)} style={inp1}>
          {["오류 신고","기능 건의","계정 문의","기타"].map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{marginBottom:16}}><label style={lbl1}>내용 *</label><textarea value={inquiryText} onChange={e=>setInquiryText(e.target.value)} rows={5} placeholder="문의 내용을 자세히 입력해주세요" style={{...inp1,resize:"none",boxSizing:"border-box"}}/></div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn onClick={()=>setInquiryModal(false)} style={{padding:"9px 18px",borderRadius:8,border:`1.5px solid ${BO}`,background:BG,color:SO,fontSize:13}}>취소</Btn>
        <Btn onClick={submitInquiry} style={{padding:"9px 22px",borderRadius:8,background:N,color:"#fff",fontSize:13,fontWeight:700}}>문의 접수</Btn>
      </div>
    </Modal>

    <Toast msg={toast}/>
  </div>;
}
