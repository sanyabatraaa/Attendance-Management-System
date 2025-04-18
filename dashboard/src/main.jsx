import { StrictMode, createContext , useState } from 'react'
import App from './App.jsx'
import ReactDOM from "react-dom/client";


export const Context= createContext({isAuthenticated:false});

const AppWrapper = ()=>{
  const [isAuthenticated,setIsAuthenticated]= useState(false);
  const [user,setUser]= useState(null);

  return (
    <Context.Provider value={{isAuthenticated,setIsAuthenticated,user,setUser}}>
      <App/>
    </Context.Provider>
  )
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>

    <AppWrapper/>
  </StrictMode>,
)