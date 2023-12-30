import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react'
import TextField from '../../src/components/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useRouter } from 'next/router';
import useWeb3 from '../../src/hooks/useWeb3';
import useNotification from '../../src/hooks/useNotification';
import axios from 'axios';
import useSpinner from '../../src/hooks/useSpinner';
import { useDispatch } from 'react-redux';

import { ADD_DEPOSIT } from '../../src/redux/action/type';

const Withdraw = () => {

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
    isConnected
  } = useWeb3();

  const { showNotification } = useNotification();
  const { openSpin, closeSpin } = useSpinner();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [value, setValue] = React.useState(0);
  const [isValidate, setIsValidate] = React.useState(false);


  /**
   * set the max LP token values
   * @returns 
   */
  const setMaxLPToken = () => {
    if(!lpTokenEth) return;
    setValue(lpDepositedTokenEth);
  }

  /**
   * withdraw LP tokens
   */
  const handleWidthDraw = async() => {
    
    setIsValidate(true);

    if(Number(value) === 0) {
      return showNotification("Input amount of LP token", "error");
    }

    try {

      setIsLoading(true);
      openSpin(`Withdrawing ${value} LP tokens`);

      const withdrawValueWei = _web3.utils.toWei(value, 'ether');
      await BlockumVaultContract.methods
        .withdraw(withdrawValueWei)
        .send({
          from: walletAddress,
        });
      showNotification("Withdraw Success.", "success")

      const response = await axios.post('/blockum-vault/withdraw', {
        walletAddress: walletAddress,
        amount: value,
        created: new Date(),
        type: false
      });

      dispatch({
        type: ADD_DEPOSIT,
        payload: response.data,
      });

      await updateWallet();//update wallet data
      router.push("/new/home");
    } catch (error) {
      console.log(error);
      showNotification("Deposit failed.", "error");
    } finally {
      setValue(0);
      setIsLoading(false);
      closeSpin();
    }
  }

  return (
    <Box backgroundColor='#041431' position='fixed' top={0} left={0} right={0} bottom={0} sx={{overflowY:'auto'}}>
      <Box px={{ xs:3, sm:10 }} position='relative' backgroundColor='#1C1C39' maxWidth={550} pt={10} minHeight='100vh' pb={4} margin='auto'>
        <Box position='absolute' top={15} right={15} sx={{cursor:'pointer', '&:hover':{opacity:0.7}}}><Icon onClick={() => router.push("/new/home")} icon="mingcute:close-fill" width={30} color="white" /></Box>
        <Grid item container justifyContent='center' gap={1}>
          <img src='/icons/logo.png' width={50}/>
          <Typography color='white' fontSize={25} fontWeight={600}>BLOCKUM</Typography>
        </Grid>
        
        <Typography width='100%' color='white' fontSize={20} mt={6}>Withdraw LP TOKEN:</Typography>

        <Box width='100%' textAlign='right' mb='3px'>
          <Button onClick={setMaxLPToken} variant="contained" sx={{borderRadius:5, height:25, fontSize:'12px!important', backgroundColor:'#041431!important'}} size='small'>MAX</Button>
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
              startAdornment: <InputAdornment position="start" sx={{'& p':{color:'white!important'}}}>LP</InputAdornment>,
            }}
            helperText={(Number(value) === 0 && isValidate) ? "Input amount of LP token.": ''}
          />
        </Box>
        <Typography width='100%' color='white' fontSize={14} textAlign='right'>
          Assets: LP {lpTokenEth && Number(lpDepositedTokenEth).toFixed(2)}
        </Typography>
        <Typography width='100%' color='white' fontSize='0.8rem' mt={1}>
          Vesting Duration - Remaining time: 00days 00hours
        </Typography>
        <Typography width='100%' color='white' fontSize='1rem' my={1}>
          Fee: 10%
        </Typography>
        <Box width='100%'>
          <Button onClick={handleWidthDraw} fullWidth variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#041431!important'}} size='small'>Withdraw</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default Withdraw;