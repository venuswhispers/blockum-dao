import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react'


const Footer = () => {

  return (
    <Grid container 
      sx={{
        backgroundColor:'#041431', 
      }}
      paddingBottom={2}
    >
      <Grid container 
        paddingX={4}
        paddingY={2}
      >
        <Grid item container xs={12} sm={6} sx={{justifyContent:{xs:'center',sm:'left'}}}>
          <Grid item container alignItems='center' gap={2} sx={{justifyContent:{xs:'center',sm:'left'}}}>
            <img src='/icons/logo.png' width={50}/>
            <Typography color='white' fontSize={30} fontWeight={600}>BLOCKUM</Typography>
          </Grid>
          <Grid item color='white' fontSize={14} textAlign={{xs:'center',sm:'left'}}>
            Decentralized Autonomous Organization
          </Grid>
        </Grid>

        <Grid color='white' item container xs={12} sm={6} justifyContent='center' alignItems='center' flexDirection='column' marginTop={{xs:4,sm:0}}>
          <Grid item width={100}>
            <Typography fontSize={14}>About us</Typography>
            <Typography fontSize={14}>Privacy Policy</Typography>
            <Typography fontSize={14}>Terms of use</Typography>
            <Typography fontSize={14}>Risk warning</Typography>
            <Typography fontSize={14}>FAQ</Typography>
            <Typography fontSize={14}>Support</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Typography color='white' width='100%' marginTop={1} fontSize={15} textAlign='center'>BLOCKUM DAO 2024</Typography>
    </Grid>
  )
}

export default Footer;