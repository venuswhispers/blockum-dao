import React from 'react';
import Box from '@mui/material/Box';



export const SpinnerContext = React.createContext(null);

const SpinnerProvider = ({children}) => {
  const [isSpin, setIsSpin] = React.useState(false);
  const [title, setTitle] = React.useState('');

  /**
   * 
   * @param {*} text loading title
   */
  const openSpin = (text) => {
    setTitle(text);
    setIsSpin(true);
  }

  /**
   * close the spin page
   */
  const closeSpin = () => {
    setIsSpin(false);
  }

  return (
    <SpinnerContext.Provider value={{ openSpin, closeSpin }}>
      { children }
      {
        isSpin && 
        <div className="spinner-wrapper">
          <div className="loader"></div>
          <div style={{color:'white'}}>{title}...</div>
        </div>
      }
    </SpinnerContext.Provider>
  )

}

export default SpinnerProvider;