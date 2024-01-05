import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react'
import TextField from '../src/components/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'next/router';
import useWeb3 from '../src/hooks/useWeb3';
import useNotification from '../src/hooks/useNotification';
import axios from 'axios';
import useSpinner from '../src/hooks/useSpinner';
import { useDispatch, useSelector } from 'react-redux';


import { ADD_DEPOSIT, ADD_DISTRIBUTE } from '../src/redux/action/type';


const Distribute = () => {

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
    updateWallet,
    lpTokenEth,
    lpDepositedTokenEth,
    isConnected,
    fgolTokenEth,
    fgolBalanceEth,
    _init

  } = useWeb3();

  
  const { showNotification } = useNotification();
  const { openSpin, closeSpin } = useSpinner();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [value, setValue] = React.useState(0);
  const [isValidate, setIsValidate] = React.useState(false);
  const [isBegin, setIsBegin] = React.useState(false);
  
  const { deposits, distributes } = useSelector((state) => state.history);

  const handleBuyFGOLClick = () => {
    // window.open('https://app.1inch.io/#/137/simple/swap/amWETH/FGOL', '_blank');
    // window.open('https://app.1inch.io/#/137/simple/swap/amWETH/FGOL');
    router.push('https://app.1inch.io/#/137/simple/swap/amWETH/FGOL');
  }
  /**
   * set the max LP token values
   * @returns 
   */
  const setMaxFGOLToken = () => {
    if(!fgolBalanceEth) return;
    setValue(fgolBalanceEth);
  }

  /**
   * distribute FGOL tokens
   */
  const handleDistribute = async() => {
  
    setIsValidate(true);

    if(Number(value) === 0) {
      return showNotification("Input amount of FGOL token", "error");
    }

    try {

      setIsLoading(true);
      openSpin(`Distributing ${value} FGOL tokens`);

      const distributeValueWei = _web3.utils.toWei( value, 'ether' );

      await FGOLTokenContract.methods.approve(addressOfFGOLDistribution, distributeValueWei).send({ from: walletAddress });
      showNotification("Distribute Approved!", "success");

      const res = await FGOLDistributionContract.methods.allocateForDistribution(distributeValueWei).send({from: walletAddress});
      console.log(res)
      showNotification("Distribute success!", "success");

      const response = await axios.post('/fgol-distribution/distribution', {
        distributionAmount: value,
        walletAddress,
        blockHash: res.blockHash,
        transactionHash: res.transactionHash,
        transactionIndex: res.transactionIndex
      });

      dispatch({
        type: ADD_DISTRIBUTE,
        payload: {
          ...response.data,
          user: {
            walletAddress
          }
        },
      });

      await updateWallet();
      router.push("/home");
    } catch (error) {
      console.log(error);
      showNotification("Distribution failed.", "error");
    } finally {
      setValue(0);
      setIsLoading(false);
      closeSpin();
    }
  }

  
  const _initialize = async() => {
    try {
      await _init();
    } catch ( err ) {
      console.log(err)
    }
  }

  React.useEffect(() => {

    if ( !isBegin && !isConnected && deposits.length === 0 ) {
      console.log("...................")
      _initialize();
    }

    setIsBegin(true);
  }, [isConnected]);



  return (
    <Box backgroundColor='#041431' position='fixed' top={0} left={0} right={0} bottom={0} sx={{overflowY:'auto'}}>
      <Box px={{ xs:3, sm:10 }} position='relative' backgroundColor='#1C1C39' maxWidth={550} pt={10} minHeight='100vh' pb={4} margin='auto'>
        <Box position='absolute' top={15} right={15} sx={{cursor:'pointer', '&:hover':{opacity:0.7}}}><Icon onClick={() => router.push("/home")} icon="mingcute:close-fill" width={30} color="white" /></Box>
        <Grid item container justifyContent='center' gap={1}>
          <img src='/icons/logo.png' width={50}/>
          <Typography color='white' fontSize={25} fontWeight={600}>BLOCKUM</Typography>
        </Grid>
        
        <Typography width='100%' color='white' fontSize={20} mt={6}>DISTRIBUTE FGOL TOKEN:</Typography>
        <Box width='100%' textAlign='right' mb='3px'>
          <Button onClick={setMaxFGOLToken} variant="contained" sx={{borderRadius:5, height:25, fontSize:'12px!important', backgroundColor:'#041431!important'}} size='small'>MAX</Button>
        </Box>
        <Box width='100%'>
          <TextField
            label="amount"
            fullWidth
            id="margin-none"
            type="number"
            value={value.toString()}
            onChange={e => setValue(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>FGOL</InputAdornment>,
            }}
            helperText={(Number(value) === 0 && isValidate) ? "Input amount of FGOL token.": ''}
          />
        </Box>
        <Typography width='100%' color='white' fontSize={14} textAlign='right'>
          Assets: FGOL {fgolBalanceEth && Number(fgolBalanceEth).toFixed(2)}
        </Typography>
        <Box width='100%' mt={1}>
          <Button onClick={handleDistribute} fullWidth variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#041431!important'}} size='small'>DISTRIBUTE</Button>
        </Box>
        <Typography width='100%' color='white' fontSize='1rem' mt={10} textAlign='center'>
          To make a distribution, you need to have FGOL:
        </Typography>
        <Box width='100%' textAlign='center' mt={1}>
          <Button onClick={handleBuyFGOLClick} variant="contained" sx={{borderRadius:4, px:4, fontSize:'17px!important', backgroundColor:'#2683F6!important', width:{xs:'100%', sm:'150px'}}} size='small'>BUY FGOL</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default Distribute;