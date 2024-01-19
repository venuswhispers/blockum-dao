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

import { ADD_DEPOSIT } from '../src/redux/action/type';

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
    isConnected,
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

  const [vestingDuration, setVestingDuration] = React.useState("00days 00hrs 00mins 00secs");
  const [earlyWithdrawalFee, setEarlyWidthdrawalFee] = React.useState(0);

  const { deposits, distributes } = useSelector((state) => state.history);
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

      const _originGasPrice = await _web3.eth.getGasPrice();
      const gasPrice = parseInt(_originGasPrice * 1.5);
      let nonce = await _web3.eth.getTransactionCount(walletAddress);

      const res = await BlockumVaultContract.methods
        .withdraw(withdrawValueWei)
        .send({
          from: walletAddress,
          gasPrice,
          nonce
        });
      showNotification("Withdraw Success.", "success")

      const response = await axios.post('/blockum-vault/withdraw', {
        walletAddress: walletAddress,
        amount: value,
        created: new Date(),
        type: false,
        transactionHash: res.transactionHash,
        blockHash: res.blockHash,
        transactionIndex: res.transactionIndex
      });

      dispatch({
        type: ADD_DEPOSIT,
        payload: response.data,
      });

      await updateWallet();//update wallet data
      router.push("/home");
    } catch (error) {
      if ( error.code ) {
        if ( error.code !== 4001 ) {
          showNotification(error.message, "error")
        } else {
          showNotification("Your request has been cancelled", "info");
        }
      } else {
        console.log(error);
        showNotification("Widthdraw failed", "error");
      }
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

  React.useEffect(() => {

    async function initialFetch () {
      let _vestingDuration = await BlockumVaultContract.methods.getVestingTimeRemaining(walletAddress).call();
      console.log(_vestingDuration)
      let _days = Math.floor( _vestingDuration / (24*3600) );
      _vestingDuration %= ( 24*3600 );
      let _hours = Math.floor( _vestingDuration / 3600 );
      _vestingDuration %= 3600;
      let _minutes = Math.floor( _vestingDuration / 60 );
      let _seconds = _vestingDuration % 60;

      _days = _days >= 10 ? _days : `0${_days}`;
      _hours = _hours >= 10 ? _hours : `0${_hours}`;
      _minutes = _minutes >= 10 ? _minutes : `0${_minutes}`;
      _seconds = _seconds >= 10 ? _seconds : `0${_seconds}`;
      setVestingDuration(`${_days}days ${_hours}hrs ${_minutes}mins ${_seconds}secs`);

      let _earlyWithdrawalFee = await BlockumVaultContract.methods.earlyWithdrawalFee().call();
      setEarlyWidthdrawalFee(_earlyWithdrawalFee);
    }

    if ( BlockumVaultContract ) {
      initialFetch();
    }
  }, [ BlockumVaultContract ])

  return (
    <Box backgroundColor='#041431' position='fixed' top={0} left={0} right={0} bottom={0} sx={{overflowY:'auto'}}>
      <Box px={{ xs:3, sm:10 }} position='relative' backgroundColor='#1C1C39' maxWidth={550} pt={10} minHeight='100vh' pb={4} margin='auto'>
        <Box position='absolute' top={15} right={15} sx={{cursor:'pointer', '&:hover':{opacity:0.7}}}><Icon onClick={() => router.push("/home")} icon="mingcute:close-fill" width={30} color="white" /></Box>
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
          Vesting Duration - Remaining time: { vestingDuration }
        </Typography>
        <Typography width='100%' color='white' fontSize='1rem' my={1}>
          Fee: { vestingDuration === "00days 00hrs 00mins 00secs" ? "0" : earlyWithdrawalFee }%
        </Typography>
        <Box width='100%'>
          <Button onClick={handleWidthDraw} fullWidth variant="contained" sx={{borderRadius:5, fontSize:'17px!important', backgroundColor:'#041431!important'}} size='small'>Withdraw</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default Withdraw;