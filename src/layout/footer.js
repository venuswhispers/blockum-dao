import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react';
import useNotification from '../hooks/useNotification';

const addressOfLPToken = '0x6007485F7329166d699824765554F4ca5baF5b58'.toLocaleLowerCase();
const addressOfFGOLToken = '0x7Ab4CD9d41b7577198ac6aaD84E5f3F5C7EF1bd9'.toLocaleLowerCase();

const Footer = () => {

  const { showNotification } = useNotification();

  const copy2Clipboard = async( text ) => {
    try {
      await navigator.clipboard.writeText( text );
      showNotification("Copied to clipboard", "success")
    } catch ( err ) {
      console.log(err)
    }
  }

  const openMetaMask = () => {
    
  }

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
        alignItems='center'
      >
        <Grid item container xs={12} md="auto" sx={{justifyContent:{xs:'center', md:'left'}}} flexDirection="column">
          <Grid item container xs="auto" alignItems='center' gap={2} sx={{justifyContent:{xs:'center', md:'left'}}}>
            <img src='/icons/logo.png' width={50}/>
            <Typography color='white' fontSize={30} fontWeight={600}>BLOCKUM</Typography>
          </Grid>
          <Grid item color='white' fontSize={14} textAlign={{xs:'center', md:'left'}}>
            Decentralized Autonomous Organization
          </Grid>
        </Grid>

        <Grid item xs container justifyContent="center" alignItems="center">
          <Box my={5}>
            <Grid container item xs="auto" gap={1} alignItems="center">
              <img src='/icons/lpToken.png' width={30} height={30}/>
              <Box>
                <Typography color="white" fontSize={15} lineHeight={1} mt='2px'>FGOL:</Typography>
                <Typography fontSize={12} color="white" display={{ xs:'none', sm:"flex" }} lineHeight={1} mt='2px'>{ addressOfLPToken }</Typography>
                <Typography fontSize={12} color="white" display={{ xs:'flex', sm:"none" }} lineHeight={1} mt='2px'>{ addressOfLPToken.substring(0, 13) + "..." + addressOfLPToken.substring(addressOfLPToken.length - 13) }</Typography>
              </Box>
              <Icon onClick={() => copy2Clipboard(addressOfLPToken)} style={{ cursor: 'pointer' }} width={30} height={35} icon="solar:copy-line-duotone" color="white" hFlip={true} />
              <img onClick={openMetaMask} style={{ cursor:'pointer' }} src='/icons/metamask.webp' width={30} height={30}/>
            </Grid>
            <Grid container item xs="auto" gap={1} alignItems="center" mt={2}>
              <img src='/icons/lpToken.png' width={30} height={30}/>
              <Box>
                <Typography color="white" fontSize={15} lineHeight={1} mt='2px'>FGOL:</Typography>
                <Typography fontSize={12} color="white" display={{ xs:'none', sm:"flex" }} lineHeight={1} mt='2px'>{ addressOfFGOLToken }</Typography>
                <Typography fontSize={12} color="white" display={{ xs:'flex', sm:"none" }} lineHeight={1} mt='2px'>{ addressOfFGOLToken.substring(0,13) + "..." + addressOfFGOLToken.substring(addressOfFGOLToken.length - 13) }</Typography>
              </Box>
              <Icon onClick={() => copy2Clipboard(addressOfFGOLToken)} style={{ cursor: 'pointer' }} width={30} height={35} icon="solar:copy-line-duotone" color="white" hFlip={true} />
              <img onClick={openMetaMask} style={{ cursor:'pointer' }} src='/icons/metamask.webp' width={30} height={30}/>
            </Grid>
            
          </Box>
        </Grid>

        <Grid color='white' item container xs={12} md={2} alignItems='center' flexDirection='column'>
          <Grid item width={100}>
            <Typography fontSize={16}>About us</Typography>
            <Typography fontSize={16}>Privacy Policy</Typography>
            <Typography fontSize={16}>Terms of use</Typography>
            <Typography fontSize={16}>Risk warning</Typography>
            <Typography fontSize={16}>FAQ</Typography>
            <Typography fontSize={16}>Support</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Typography color='white' width='100%' marginTop={1} fontSize={15} textAlign='center'>BLOCKUM DAO 2024</Typography>
    </Grid>
  )
}

export default Footer;