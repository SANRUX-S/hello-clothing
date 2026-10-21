"use client";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// The Firebase browser config is intentionally public; never place service-account credentials here.
const firebaseConfig = {
  apiKey: "AIzaSyDkmhu3a8PEZOruvtGKXwwbyNBUT0k03Sk",
  authDomain: "hello-clothing.firebaseapp.com",
  projectId: "hello-clothing",
  storageBucket: "hello-clothing.firebasestorage.app",
  messagingSenderId: "163937506918",
  appId: "1:163937506918:web:7e079e32772e2e68f37fa7",
};

export const firebaseAuth = getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig));
