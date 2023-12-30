"use client"
import Header from './header';
import Footer from './footer';
import { Fragment } from 'react';
import { useRouter } from 'next/router';

const Layout = ({children}) => {

  const router = useRouter();

  if ( router.pathname !== "/" ) {
    return (
      <Fragment>
        <Header/>
          {children}
        <Footer/>
      </Fragment>
    )
  } else {
    return (
      <Fragment>
        {children}
      </Fragment>
    )
  }
}

export default Layout;