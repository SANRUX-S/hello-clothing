'use client';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="empty-state empty-page"><h1>A little interruption.</h1><p>Let’s give that another try.</p><button className="button dark" onClick={reset}>TRY AGAIN ↗</button></div>;}
