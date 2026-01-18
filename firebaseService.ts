
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const workspaceConfig = {
  apiKey: "AIzaSyDXXDsJKnKb_0HynSTnP22QYc0yrUdx-cw",
  authDomain: "mzj-workspace-c7d4e.firebaseapp.com",
  projectId: "mzj-workspace-c7d4e",
  storageBucket: "mzj-workspace-c7d4e.firebasestorage.app",
  messagingSenderId: "1080687990992",
  appId: "1:1080687990992:web:4a496249bbf330fc37a6d5"
};

const agendaConfig = {
  apiKey: "AIzaSyC614bGqnYf4Q-weTNemzWENTpa8DjGeHw",
  authDomain: "mzj-agenda.firebaseapp.com",
  projectId: "mzj-agenda",
  storageBucket: "mzj-agenda.firebasestorage.app",
  messagingSenderId: "834700407721",
  appId: "1:834700407721:web:75c17665d4f032fd65cab8"
};

// Initialize Primary App
const app = getApps().length === 0 ? initializeApp(workspaceConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Agenda App for Stock Data
export const agendaApp = getApps().find(a => a.name === "agenda") || initializeApp(agendaConfig, "agenda");
export const agendaAuth = getAuth(agendaApp);
export const agendaDb = getFirestore(agendaApp);

// Initialize Admin App for User Management
export const adminApp = getApps().find(a => a.name === "admin") || initializeApp(workspaceConfig, "admin");
export const adminAuth = getAuth(adminApp);
