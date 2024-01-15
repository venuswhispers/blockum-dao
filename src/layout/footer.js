"use client"

import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react';
import useNotification from '../hooks/useNotification';
import useWeb3 from '../hooks/useWeb3';

const addressOfLPToken = '0x6007485F7329166d699824765554F4ca5baF5b58'.toLocaleLowerCase();
const addressOfFGOLToken = '0x7Ab4CD9d41b7577198ac6aaD84E5f3F5C7EF1bd9'.toLocaleLowerCase();

const Footer = ({ cookie }) => {

  const { showNotification } = useNotification();
  const { _web3 } = useWeb3();

  const copy2Clipboard = async( text ) => {
    try {
      await navigator.clipboard.writeText( text );
      showNotification("Copied to clipboard", "success")
    } catch ( err ) {
      console.log(err)
    }
  }

  const importLPTokens = async() => {

    if (window.ethereum) {
      try {
        await _web3.currentProvider.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: addressOfLPToken,
              symbol: "LP",
              decimals: 18,
              // image: tokenImage, // if you have the image, it goes here
            },
          },
        });
        showNotification("You have successfully imported LP tokens", "success");
      } catch (error) {
        if ( error.code !== 4001 ) {
          showNotification(error.message, "error")
        } else {
          showNotification("Your request has been cancelled", "info");
        }
      }
    }
  }
  const impotFGOLTokens = async() => {

    if (window.ethereum) {
      try {
        await _web3.currentProvider.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: addressOfFGOLToken,
              symbol: "FGOL",
              decimals: 18,
              // image: tokenImage, // if you have the image, it goes here
            },
          },
        });
        showNotification("You have successfully imported FGOL tokens", "success");
      } catch (error) {
        if ( error.code !== 4001 ) {
          showNotification(error.message, "error")
        } else {
          showNotification("Your request has been cancelled", "info");
        }
      }
    }
  }

  const cookieAsentNo = () => {
    window.localStorage.setItem("cookie", "no");
    window.dispatchEvent(new Event("storage"));
  }
  const cookieAsentYes = () => {
    window.localStorage.setItem("cookie", "yes");
    window.dispatchEvent(new Event("storage"));
    /**
     * set cookies for this site
     */
    const d = new Date();
    const exdays = 1;
    const cname = "venus";
    const cvalue = 123;
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  const cookieAsentClose = () => {
    window.localStorage.setItem("cookie", "close");
    window.dispatchEvent(new Event("storage"));
  }

  React.useEffect(() => {
    if(!window.localStorage.getItem("cookie")) {
      console.log("cookie asent bar...")
    }
  });

  const _gotBlank = (url) => {
    window.open(url, '_blank');
  }

  return (
    <Grid container 
      sx={{
        backgroundColor:'#041431', 
      }}
      paddingBottom={2}
    >
      {
        !cookie &&
        <Grid container pb={{ xs:1.5, md:0 }} sx={{ backgroundColor:"#2683F6" }} alignItems="center" justifyContent='space-between'> 
          <Grid item color="white" textAlign={{ xs:'center', md:'right' }} xs={12} md={7} fontSize={20} padding={1}>
            Do you accept our entire Cookies policy?
          </Grid>
          <Grid container item xs={12} md={5} gap={2} alignItems='center' justifyContent='center'>
            <Button onClick={cookieAsentYes} variant="contained"  sx={{borderRadius:5, width:'150px', fontSize:16, textTransform:'none', backgroundColor:'#041431!important'}} size='small'>YES</Button>
            <Button onClick={cookieAsentNo} variant="contained"  sx={{borderRadius:5, width:'150px', fontSize:16, textTransform:'none', backgroundColor:'#041431!important'}} size='small'>NO</Button>
            <Icon onClick={cookieAsentClose} width={40} icon="ic:outline-close" />
          </Grid>
        </Grid>
      }
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
                <Typography color="white" fontSize={15} lineHeight={1} mt='2px'>LP:</Typography>
                <Typography fontSize={12} color="white" display={{ xs:'none', sm:"flex" }} lineHeight={1} mt='2px'>{ addressOfLPToken }</Typography>
                <Typography fontSize={12} color="white" display={{ xs:'flex', sm:"none" }} lineHeight={1} mt='2px'>{ addressOfLPToken.substring(0, 13) + "..." + addressOfLPToken.substring(addressOfLPToken.length - 13) }</Typography>
              </Box>
              <Icon onClick={() => copy2Clipboard(addressOfLPToken)} style={{ cursor: 'pointer' }} width={30} height={35} icon="solar:copy-line-duotone" color="white" hFlip={true} />
              <Icon icon="logos:metamask-icon" width={30} onClick={importLPTokens} style={{ cursor:'pointer' }}/>
            </Grid>
            <Grid container item xs="auto" gap={1} alignItems="center" mt={2}>
              <img src='/icons/fgolToken.png' width={30} height={30}/>
              <Box>
                <Typography color="white" fontSize={15} lineHeight={1} mt='2px'>FGOL:</Typography>
                <Typography fontSize={12} color="white" display={{ xs:'none', sm:"flex" }} lineHeight={1} mt='2px'>{ addressOfFGOLToken }</Typography>
                <Typography fontSize={12} color="white" display={{ xs:'flex', sm:"none" }} lineHeight={1} mt='2px'>{ addressOfFGOLToken.substring(0,13) + "..." + addressOfFGOLToken.substring(addressOfFGOLToken.length - 13) }</Typography>
              </Box>
              <Icon onClick={() => copy2Clipboard(addressOfFGOLToken)} style={{ cursor: 'pointer' }} width={30} height={35} icon="solar:copy-line-duotone" color="white" hFlip={true} />
              <Icon icon="logos:metamask-icon" width={30} onClick={impotFGOLTokens} style={{ cursor:'pointer' }}/>
            </Grid>
            
          </Box>
        </Grid>

        <Grid color='white' item container xs={12} md={2} alignItems='center' flexDirection='column'>
          <Grid item width={100}>
            <Typography fontSize={16} onClick={() => _gotBlank("https://blockumdao.org/about-us")}>About us</Typography>
            <Typography fontSize={16} onClick={() => _gotBlank("https://blockumdao.org/privacy-policy/")}>Privacy Policy</Typography>
            <Typography fontSize={16} onClick={() => _gotBlank("https://blockumdao.org/privacy-policy/")}>Terms of use</Typography>
            <Typography fontSize={16} onClick={() => _gotBlank("https://blockumdao.org/risk-warning/")}>Risk warning</Typography>
            <Typography fontSize={16} onClick={() => _gotBlank("https://blockumdao.org/faq")}>FAQ</Typography>
            <Typography fontSize={16} onClick={() => _gotBlank("https://blockumdao.org/support/")}>Support</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Typography color='white' width='100%' marginTop={1} fontSize={15} textAlign='center'>BLOCKUM DAO 2024</Typography>
    </Grid>
  )
}

export default Footer;