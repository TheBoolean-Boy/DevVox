// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import type { any } from "zod/v4";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2n-JsccQoxhNs1VcE5Tk_GwbyOvqHsSg",
  authDomain: "devvox-60497.firebaseapp.com",
  projectId: "devvox-60497",
  storageBucket: "devvox-60497.firebasestorage.app",
  messagingSenderId: "44415495891",
  appId: "1:44415495891:web:610bdee915eb2c427f6e26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

export async function uploadFile(file:File, setProgress?: (progress: number) => void) {
  return new Promise( (resolve, reject )=> {
    try {
      const storageRef = ref(storage, file.name)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed', snapshot => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        if(setProgress) setProgress(progress)
        switch(snapshot.state){
          case 'paused':
              console.log('Upload is paused'); break;
          case 'running':
              console.log('Upload is running on firebase console'); break;
        }
      }, 
      error => {
          reject(error)
      },
      () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadurl) => {
            resolve(downloadurl)
          })
      }
    )

    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
  
}