import{a as z,b as q}from"./chunk-K4ADRF7Q.js";import{a as k}from"./chunk-CQEOSPX7.js";import{g as j}from"./chunk-U3KBDVZQ.js";import{a as F}from"./chunk-645FAGHM.js";import"./chunk-4APLD2AU.js";import{F as P}from"./chunk-QHTNG2KD.js";import"./chunk-AHFGQY6Y.js";import"./chunk-JIQI44HU.js";import{b as d}from"./chunk-SR7YBPTI.js";import{A as E,z as x}from"./chunk-4AMJPQ4C.js";import"./chunk-WYOR3IGU.js";import"./chunk-WARGVHWQ.js";import"./chunk-O2MRNPFZ.js";import"./chunk-ZORWRBO4.js";import{Cb as O,Eb as I,Fa as N,Q as L,T as A,Ua as U,V as f,qb as M}from"./chunk-DKPWK2ZK.js";import{a as B,b as X}from"./chunk-BP4SBRKO.js";import"./chunk-QCZJZLKO.js";import{b as v}from"./chunk-7UYL7WT2.js";import"./chunk-5QKHTV5Q.js";import"./chunk-RN6XFKSK.js";import"./chunk-INJRZWQM.js";import"./chunk-BRNF7K6T.js";import"./chunk-IBBXSV73.js";import{S as D,y as R}from"./chunk-C4UTQ352.js";import"./chunk-EAN3JHF6.js";import{f as _}from"./chunk-7Y2ZY6FR.js";var t=_(X(),1);var a=_(B(),1);var Y=d.img`
  && {
    height: ${e=>e.size==="sm"?"65px":"140px"};
    width: ${e=>e.size==="sm"?"65px":"140px"};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`,Z=e=>{if(!R(e))return e;try{let i=D(e);return i.includes("\uFFFD")?e:i}catch{return e}},ee=e=>{try{let i=v.decode(e),o=new TextDecoder().decode(i);return o.includes("\uFFFD")?e:o}catch{return e}},te=e=>{let{types:i,primaryType:o,...l}=e.typedData;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(ae,{data:l}),(0,t.jsx)(k,{text:(s=e.typedData,JSON.stringify(s,null,2)),itemName:"full payload to clipboard"})," "]});var s},re=({method:e,messageData:i,copy:o,iconUrl:l,isLoading:s,success:p,walletProxyIsLoading:g,errorMessage:u,isCancellable:h,onSign:c,onCancel:C,onClose:m})=>(0,t.jsx)(F,{title:o.title,subtitle:o.description,showClose:!0,onClose:m,icon:P,iconVariant:"subtle",helpText:u?(0,t.jsx)(oe,{children:u}):void 0,primaryCta:{label:o.buttonText,onClick:c,disabled:s||p||g,loading:s},secondaryCta:h?{label:"Not now",onClick:C,disabled:s||p||g}:void 0,watermark:!0,children:(0,t.jsxs)(j,{children:[l?(0,t.jsx)(Y,{style:{alignSelf:"center"},size:"sm",src:l,alt:"app image"}):null,(0,t.jsxs)(ie,{children:[e==="personal_sign"&&(0,t.jsx)(V,{children:Z(i)}),e==="eth_signTypedData_v4"&&(0,t.jsx)(te,{typedData:i}),e==="solana_signMessage"&&(0,t.jsx)(V,{children:ee(i)})]})]})}),Ee={component:()=>{let{authenticated:e}=I(),{initializeWalletProxy:i,closePrivyModal:o}=N(),{navigate:l,data:s,onUserCloseViaDialogOrKeybindRef:p}=O(),[g,u]=(0,a.useState)(!0),[h,c]=(0,a.useState)(""),[C,m]=(0,a.useState)(),[S,T]=(0,a.useState)(null),[J,w]=(0,a.useState)(!1);(0,a.useEffect)(()=>{e||l("LandingScreen")},[e]),(0,a.useEffect)(()=>{i(M).then(r=>{u(!1),r||(c("An error has occurred, please try again."),m(new E(new x(h,f.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))})},[]);let{method:W,data:$,confirmAndSign:G,onSuccess:H,onFailure:K,uiOptions:n}=s.signMessage,Q={title:n?.title||"Sign message",description:n?.description||"Signing this message will not cost you any fees.",buttonText:n?.buttonText||"Sign and continue"},y=r=>{r?H(r):K(C||new E(new x("The user rejected the request.",f.E4001_USER_REJECTED_REQUEST.eipCode))),o({shouldCallAuthOnSuccess:!1}),setTimeout(()=>{T(null),c(""),m(void 0)},200)};return p.current=()=>{y(S)},(0,t.jsx)(re,{method:W,messageData:$,copy:Q,iconUrl:n?.iconUrl&&typeof n.iconUrl=="string"?n.iconUrl:void 0,isLoading:J,success:S!==null,walletProxyIsLoading:g,errorMessage:h,isCancellable:n?.isCancellable,onSign:async()=>{w(!0),c("");try{let r=await G();T(r),w(!1),setTimeout(()=>{y(r)},U)}catch(r){console.error(r);let b=r instanceof A&&r.code===L.MISSING_MFA_ENROLLMENT?r.message:"An error has occurred, please try again.";c(b),m(new E(new x(b,f.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),w(!1)}},onCancel:()=>y(null),onClose:()=>y(S)})}},ie=d.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,oe=d.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,ae=d(q)`
  margin-top: 0;
`,V=d(z)`
  margin-top: 0;
`;export{Ee as SignRequestScreen,re as SignRequestView,Ee as default};
