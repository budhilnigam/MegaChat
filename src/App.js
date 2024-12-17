import './App.css';

import React, { useState, useRef } from 'react';

import GoogleButton from 'react-google-button';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
});

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  
  const [user] = useAuthState(auth);

  return (
    <div className="AppNav">
      <header className='flex text-white text-2xl bg-green-500 justify-between text-center'>
        <h1 style={{fontStyle: 'platypus'}} className='content-center mx-auto'>MegaChat</h1>
        <SignOut />
      </header>
      
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <>
    <GoogleButton onClick={signInWithGoogle} className='sign-in'/>
    <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} className='rounded-full bg-green-700 hover:bg-green-600 transition ease-in duration-200 hover:outline hover:outline-2 hover:outline-white my-2'>Sign Out</button>
  );
}

function ChatRoom() {

  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  return (
    <>
      <main style={{border: "1px solid red"}}>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage} className="flex justify-center self-center mx-auto">
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message something" />
        <button type="submit" disabled={!formValue}>Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="user image"/>
      <p>{text}</p>
    </div>
  );
}

console.log(process.env.REACT_APP_API_KEY);
export default App;
