"use client"
import React from 'react';
import Header from './header';
import Footer from './footer';
import { Fragment } from 'react';
import { useRouter } from 'next/router';
import Grid from '@mui/material/Grid';

const Layout = ({children}) => {

  const router = useRouter();

  const [cookie, setCookie] = React.useState(null);

  React.useEffect(() => {
    if( typeof window != 'undefined' ) {
      setCookie(window.localStorage.getItem("cookie"))
      window.addEventListener("storage",function (e) {
        setCookie(window.localStorage.getItem("cookie"));
      });
    }
  }, [])
  

  if ( router.pathname !== "/" ) {
    return (
      
      <Grid sx={{ minHeight:'100vh' }} container flexDirection="column" justifyContent="space-between">
        <Header/>
          { cookie && children }
        <Footer cookie = { cookie } />
      </Grid>
    )
  } else {
    return (
      <Fragment>
        { children }
      </Fragment>
    )
  }
}

export default Layout;