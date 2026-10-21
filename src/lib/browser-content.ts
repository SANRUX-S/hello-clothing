'use client';
import {useSyncExternalStore} from 'react';
function subscribe(callback:()=>void){window.addEventListener('storage',callback);window.addEventListener('hello:demo-settings',callback);return()=>{window.removeEventListener('storage',callback);window.removeEventListener('hello:demo-settings',callback);};}
const server=()=>'';
export function useDemoContent(){const raw=useSyncExternalStore(subscribe,()=>{try{return localStorage.getItem('hello-demo-content-v1')??'';}catch{return '';}},server);try{const value=JSON.parse(raw||'{}');return {heroTitle:typeof value.heroTitle==='string'?value.heroTitle.slice(0,80):'',heroSubtitle:typeof value.heroSubtitle==='string'?value.heroSubtitle.slice(0,180):'',aboutText:typeof value.aboutText==='string'?value.aboutText.slice(0,600):''};}catch{return {heroTitle:'',heroSubtitle:'',aboutText:''};}}
