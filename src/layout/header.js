"use client"
import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';

import useWeb3 from '../hooks/useWeb3';
import useSpinner from '../hooks/useSpinner';
// import { ADD_DEPOSIT } from '../../../redux/action/type';
import useNotification from '../hooks/useNotification';
import { useRouter } from 'next/router';

import { _truncateText } from '../customUtils'


const Header = () => {

  const [collapse, setCollapse] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { showNotification } = useNotification();

  const router = useRouter();

  /**
   * import variables from web3 context
   */
  const {
    _web3,
    connectMetaMask,
    walletAddress,
    isMember,
    BlockumVaultContract,
    LPTokenContract,
    FGOLTokenContract,
    FGOLDistributionContract,
    addressOfBlockumVault,
    addressOfFGOLDistribution,
    lpTokenEth,
    lpDepositedTokenEth,
    isConnected,
    isConnecting,
    disconnectMetaMask
  } = useWeb3();
  
  //spinner
  const {openSpin, closeSpin} = useSpinner();
  const [ showConfirmModal,  setShowConfirmModal ] = React.useState(false)

  const handleConnectClick = async() => {

    if (isConnected) { 
      handleDisconnectClick();     
      return;
    }
    
    await connectMetaMask();
  };

  const _renderConnectButtonText = () => {
    if(isConnecting) {
      return "connecting..."
      // return <Box display="flex" alignItems="center" height={26}><Icon icon="eos-icons:three-dots-loading" width={50} color="white" /></Box>
    }else if(walletAddress) {
      // return _truncateText(walletAddress)
      return "DISCONNECT WALLET"
    } else {
      return "CONNECT WALLET"
    }
  }

  const handleDisconnectClick = () => {
    disconnectMetaMask();
    showNotification("DisConnected", "success");
  }



  const handleSwitchToPolygon = async() => {
    const _chainId = 137;
    const _chainIdAsHex = _web3.utils.toHex(_chainId);

    if ( window.ethereum.networkVersion == _chainId ) {
      setShowConfirmModal(false);
      return showNotification("Current chain is Polygon", "success")
    }
    

    setShowConfirmModal(false);

    try {

      openSpin("Switching to Polygon")
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: _chainIdAsHex }]
      });
      showNotification("Successfully switched to Polygon", "success");
    } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        openSpin("Adding Polygon network")
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: 'Polygon Mainnet',
              chainId: _chainIdAsHex,
              nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
              rpcUrls: ['https://polygon-rpc.com/']
            }
          ]
        });
        showNotification("Successfully switched to Polygon", "success");
      }
    } finally {
      closeSpin();
    }

    
  }

  // const _renderSwitchModal = () => {

  //   return ( 
  //     <Box zIndex={10000} position='fixed' top={0} left={0} right={0} bottom={0} display='flex' justifyContent='center' alignItems='center'>
  //       <Box position='fixed' top={0} left={0} right={0} bottom={0} sx={{backgroundColor: '#041431b9'}}/>
  //       <Box zIndex={10000000} width={300} sx={{backgroundColor:'white'}} padding={3} borderRadius={10}>
  //         <Box 
  //           padding={1}
  //           borderRadius={5}
  //           onClick = { () => handleSwitchChain( 5 ) }
  //           sx={{ 
  //             cursor: 'pointer',
  //             '&:hover':{
  //               backgroundColor:'#04143139'
  //             },
  //             // backgroundColor: window.ethereum.networkVersion === '5' ? '#04143139' : 'white'
  //           }} 
  //           display='flex' alignItems='center' gap={2}>
  //           <Icon width={30} height={30} icon="logos:ethereum" hFlip={true} />
  //           <Typography>Ethereum</Typography>
  //         </Box>
  //         <Box 
  //           onClick = { () => handleSwitchChain( 137 ) }
  //           mt={1}
  //           padding={1}
  //           borderRadius={5}
  //           sx={{ 
  //             cursor: 'pointer',
  //             '&:hover':{
  //               backgroundColor:'#04143139'
  //             },
  //           }} 
  //           display='flex' alignItems='center' gap={2}
  //         >
  //           <Icon height={30} className='t-cursor-pointer hover:t-opacity-[0.6]' icon="cryptocurrency-color:matic" rotate={1} />
  //           <Typography>Polygon</Typography>
  //         </Box>
  //       </Box>
  //     </Box>
  //   )
  // }
  const _renderSwitchConfirmModal = () => {

    return ( 
      <Box zIndex={10000} position='fixed' top={0} left={0} right={0} bottom={0} display='flex' justifyContent='center' alignItems='center'>
        <Box onClick={() => setShowConfirmModal(false)} position='fixed' top={0} left={0} right={0} bottom={0} sx={{backgroundColor: '#041431b9'}}/>
        <Box zIndex={10000000} width={400} sx={{backgroundColor:'white'}} padding={3} borderRadius={10}>
          <Box
            textAlign='center' 
            padding={1}
            borderRadius={5}
            sx={{ 
              cursor: 'pointer',
              '&:hover':{
                backgroundColor:'#04143139'
              },
            }} 
            display='flex' alignItems='center' gap={2}
          >
            <Icon height={30} className='t-cursor-pointer hover:t-opacity-[0.6]' icon="cryptocurrency-color:matic" rotate={1} />
            <Typography>Are you agree to switch to Polygon?</Typography>
          </Box>
          <Grid container gap={1} justifyContent='center' mt={1}>
            <Button onClick={handleSwitchToPolygon} variant="contained" sx={{borderRadius:4,textTransform:'none', width:100,  backgroundColor:'#2683F6!important'}} size='small'>O K</Button>
            <Button onClick={() => setShowConfirmModal(false)}  variant="contained" sx={{borderRadius:4,textTransform:'none', width:100,  backgroundColor:'#ff22F6!important'}} size='small'>CANCEL</Button>
          </Grid>
        </Box>
      </Box>
    )
  }

  return (
    <Grid container sx={{
        backgroundColor:'#041431', 
        paddingY:'20px', 
        px:{
          xs: '10px',
          md: '20px'
        }
      }}
    >
      { showConfirmModal && _renderSwitchConfirmModal() }
      <Grid item container xs={12} sm={6} marginBottom={{xs: collapse ? 2 : 0, sm:0}} gap={3} justifyContent='space-between' alignItems='center'>
        <Grid item container xs='auto' gap={2} alignItems='center'>
          <Grid item sx={{cursor:'pointer'}}>
            <img src='/icons/logo.png' width={50} onClick={() => router.push("/")}/>
          </Grid>
          <Grid item container flexDirection='column' xs='auto'>
            <Typography fontSize={22} color='white' fontWeight={600} noWrap sx={{maxWidth:'200px'}}>{ walletAddress && _truncateText(walletAddress) }</Typography>
            <Typography fontSize={22} marginTop={-1} color='white' fontWeight={600} >Member</Typography>
          </Grid>
        </Grid>

        <Grid item xs='auto' alignItems='center' sx={{display:{xs:'block',sm:'none'}}}>
          <Icon onClick={() => setCollapse(!collapse)} width={25} icon="fluent-mdl2:collapse-menu" className='t-cursor-pointer' color="white" />
        </Grid>
      </Grid>
      <Grid 
        item 
        container xs={12} sm={6} gap={1} 
        justifyContent='end' 
        alignItems='center' 
        sx={{
          display: {
            xs: collapse ? 'flex' : 'none',
            sm: 'flex'
          }
        }}
      >
        <Icon style={{cursor:'pointer'}} onClick={() => setShowConfirmModal(true)} height={40} className='t-cursor-pointer hover:t-opacity-[0.6]' icon="cryptocurrency-color:matic" rotate={1} />
        <Button onClick={handleConnectClick} variant="contained" sx={{borderRadius:4,paddingY:1, textTransform:'none', width:{xs:'calc(100% - 50px)', sm:'auto'}, backgroundColor:'#2683F6!important'}} size='large'>{_renderConnectButtonText()}</Button>
      </Grid>
    </Grid>
  )
}

export default Header;