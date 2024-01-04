'use client';

import React, { createContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import BlockumVaultABI from '../web3/constants/BlockumVaultABI.json';
import FGOLDistributionABI from '../web3/constants/FGOLDistributionABI.json';
import BlockumDAOABI from '../web3/constants/BlockumDAOABI.json';
import LPTokenABI from '../web3/constants/LPTokenABI.json';
import FGOLTokenABI from '../web3/constants/FGOLTokenABI.json';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import useNotification from '../hooks/useNotification';
import { useRouter } from 'next/router';

import useSpinner from '../hooks/useSpinner';

import { getHeaderData } from '../redux/action/utils';

const Web3Context = createContext();

const addressOfBlockumVault = '0x696dA2B5968f33F8C60e02F660e84B04709Da30b'.toLocaleLowerCase();
const addressOfFGOLDistribution = '0x3978dfff811Dc43e250a293f32c51448DDC62584'.toLocaleLowerCase();
const addressOfBlockumDAO = '0x64e5aa7324d9e00e265faecd1fa257aa30044f82'.toLocaleLowerCase();//modified
const addressOfLPToken = '0x6007485F7329166d699824765554F4ca5baF5b58'.toLocaleLowerCase();
const addressOfFGOLToken = '0x7Ab4CD9d41b7577198ac6aaD84E5f3F5C7EF1bd9'.toLocaleLowerCase();


export const Web3Provider = ({ children }) => {

  const dispatch = useDispatch();
  const router = useRouter();
  const { showNotification } = useNotification();

  const [_web3, setWeb3] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [LPTokenContract, setLPTokenContract] = useState(null);
  const [FGOLTokenContract, setFGOLTokenContract] = useState(null);
  const [BlockumVaultContract, setBlockumVaultContract] = useState(null);
  const [FGOLDistributionContract, setFGOLDistributionContract] = useState(null);
  const [BlockumDAOContract, setBlockumDAOContract] = useState(null);
  const [lpTokenEth, setLPTokenEth] = useState(null);
  const [fgolTokenEth, setFGOLTokenEth] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [currentProposalCreationFee, setCurrentProposalCreationFee] = useState(null);
  const [lpDepositedTokenEth, setLpDepositedTokenEth] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const {openSpin, closeSpin} = useSpinner();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetchingHomeData, setIsFetchingHomeData] = React.useState(false);
  const [fgolBalanceEth, setFGOLBalanceEth] = React.useState(null);

  const [totalMemberBalance, setTotalMemberBalance] = React.useState(null);
 
  /**
   * 
   * @param {*} _id 
   * @param {*} web3 
   * @param {*} _contract 
   * @param {*} _walletAddress 
   * @returns 
   */
  const getProposalDetailsById = async(_id, web3 = _web3, _contract = BlockumDAOContract, _walletAddress = walletAddress) => new Promise(async(resolve, reject) => {
    try {
      const proposal = await _contract.methods.proposalDetails(_id).call();
      const totalMembersForProposal = await _contract.methods.getTotalMembersVotedForProposal(_id).call();
      const voted = await _contract.methods.votes(_walletAddress, _id).call();

      const proposalVotings = await _contract.methods.proposalVotings(_id).call();
      const isMember = await _contract.methods.isMember(_walletAddress).call();
      const memberProgressForProposal = await _contract.methods.getMemberProgressForProposal(_id).call();

      const capitalProgressForProposal = await _contract.methods.getCapitalProgressForProposal(_id).call();



      if ( proposal.proposer == '0x0000000000000000000000000000000000000000' ) {
        return resolve(null);
      }

      proposal.isMember = isMember;
      proposal.voted = voted;
      proposal.proposalId = _id;
      proposal.proposalVotings = proposalVotings;
      proposal.totalMembersForProposal = totalMembersForProposal;
      proposal.memberProgressForProposal = memberProgressForProposal;
      proposal.capitalProgressForProposal = capitalProgressForProposal;

      resolve(proposal);

    } catch ( err ) {
      console.log(err);
      reject();
    }
  })

  /**
   * connect to wallet using Metamask
   * @returns 
   */
  const connectMetaMask = (web3 = _web3) => new Promise(async (resolve, reject) => {

    setIsConnecting(true);
    openSpin("Connecting to Wallet");
    

    let totalNumberOfProposal = 0;
    let temp = 0;
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const walletAccount = await web3.eth.getAccounts();
      const _walletAddress = walletAccount[0];

      await axios.post('/users/connect', { walletAddress: _walletAddress });

      openSpin("Loading contracts");
      //contracts
      const tempBlockumVaultContract = new web3.eth.Contract( BlockumVaultABI, addressOfBlockumVault );
      const tempFGOLDistributionContract = new web3.eth.Contract( FGOLDistributionABI, addressOfFGOLDistribution );
      const tempBlockumDAOContract = new web3.eth.Contract( BlockumDAOABI, addressOfBlockumDAO );
      const tempLPTokenContract = new web3.eth.Contract( LPTokenABI, addressOfLPToken );
      const tempFGOLTokenContract = new web3.eth.Contract( FGOLTokenABI, addressOfFGOLToken );



      try {
        const isMember_ = await tempBlockumDAOContract.methods.isMember(_walletAddress).call();

        if (isMember_) {
          setIsMember(true);
        } else {
          setIsMember(false);
        }
      } catch (err) {
        showNotification("Running out of gas or network issues", "error");
        router.push("/");
        return reject();
      }

      openSpin("Loading data from chain");
      const tempLpTokenWei = await tempLPTokenContract.methods.balanceOf( _walletAddress ).call();
      const lpTokenEth = web3.utils.fromWei( tempLpTokenWei, 'ether' );

      const tempFGOLTokenWei = await tempFGOLDistributionContract.methods.pendingClaims( _walletAddress ).call();
      const fgolTokenEth = web3.utils.fromWei( tempFGOLTokenWei, 'ether' );

      const tempFGOLBalance = await tempFGOLTokenContract.methods.balanceOf( _walletAddress ).call();
      const fgolBalanceEth = web3.utils.fromWei( tempFGOLBalance, 'ether' );
      setFGOLBalanceEth(fgolBalanceEth);

      const tempMemberBalance = await tempBlockumDAOContract.methods.totalMemberBalance( _walletAddress ).call();
      const _totalMemberBalance = web3.utils.fromWei( tempDepositedLpTokenWei, 'ether' );
      setTotalMemberBalance(_totalMemberBalance);
      
      
      const tempDepositedLpTokenWei = await tempBlockumVaultContract.methods.getMemberBalance( _walletAddress ).call();
      const lpDepositedTokenEth = web3.utils.fromWei( tempDepositedLpTokenWei, 'ether' );


      //number of proposals
      totalNumberOfProposal = await tempBlockumDAOContract.methods.getTotalProposals().call();

      const currentProposalCreationFeeWei = await tempFGOLDistributionContract.methods.proposalCreationFee().call();
      const currentProposalCreationFee = web3.utils.fromWei( currentProposalCreationFeeWei, 'ether' );

      let _proposals = [];
      for (let i = 0; i < totalNumberOfProposal; i++) {
        const _proposal = await getProposalDetailsById(i, web3, tempBlockumDAOContract, _walletAddress);
        if ( _proposal ) {
          _proposals = [_proposal, ..._proposals];
        }
      }

      setProposals(_proposals);
      setLPTokenContract(tempLPTokenContract);
      setFGOLTokenContract(tempFGOLTokenContract);
      setBlockumVaultContract(tempBlockumVaultContract);
      setFGOLDistributionContract(tempFGOLDistributionContract);
      setBlockumDAOContract(tempBlockumDAOContract);
      setLPTokenEth(lpTokenEth);
      setFGOLTokenEth(fgolTokenEth);
      setWalletAddress(_walletAddress);
      setCurrentProposalCreationFee(currentProposalCreationFee);
      setLpDepositedTokenEth(lpDepositedTokenEth);

      setIsConnected(true);
      resolve();
    } catch (err) {
      router.push("/");
      console.log("@venuswhispers we3 error");
      reject(err);
    } finally {
      setIsConnecting(false);
      closeSpin();
    }
  });

  const disconnectMetaMask = () => {
    // setWeb3(null);
    setWalletAddress(null);
    setLPTokenContract(null);
    setFGOLTokenContract(null);
    setBlockumVaultContract(null);
    setFGOLDistributionContract(null);
    setBlockumDAOContract(null);
    setLPTokenEth(null);
    setFGOLTokenEth(null);
    setProposals([]);
    setIsMember(false);
    setCurrentProposalCreationFee(null);
    setLpDepositedTokenEth([]);
    setIsConnected(false);
    setIsConnecting(false);
    setIsFetchingHomeData(false);

    dispatch({
      type: 'INIT_HISTORY',
      payload: {
        deposits: [],
        distributes: [],
      },
    });

    router.push("/");
  }

  const updateProposalById = ( proposalId ) => new Promise(async(resolve, reject) => {

    try{
      openSpin("Updating Proposal");
      const _proposal = await getProposalDetailsById(proposalId);
      if ( _proposal ) {
        let tempProposals = proposals.map(proposal => proposal.proposalId === proposalId ? _proposal : proposal);
        setProposals( tempProposals );
      } 
      closeSpin();
      resolve();
    } catch ( err ) {
      console.log( err );
      closeSpin();
      reject();
    }
  })

  /**
   * add proposal
   * @returns 
   */
  const addProposal = ( proposalId ) => new Promise(async(resolve, reject) => {
    try {
      openSpin("Updating Proposal");
      const _proposal = await getProposalDetailsById(proposalId);
      setProposals([_proposal, ...proposals]);
      closeSpin();
      resolve();
    } catch ( err ) {
      console.log( err );
      closeSpin();
      reject();
    }
  })

    /**
   * remove proposal
   * @returns 
   */
    const removeProposal = ( proposalId ) => new Promise(async(resolve, reject) => {
      try {
        let _proposals = [...proposals];
        const removeIndex = _proposals.map( item => item.proposalId ).indexOf( proposalId );
        _proposals.splice(removeIndex, 1);
        setProposals(_proposals);
        resolve();
      } catch ( err ) {
        console.log(err)
        reject();
      }
    })

  /**
   * update wallet balance, LP balance..
   * @returns 
   */
  const updateWallet = () => new Promise( async (resolve, reject) => {

    if( !_web3 ){
      return;         
    }

    try{
      const tempLPTokenContract = new _web3.eth.Contract( LPTokenABI, addressOfLPToken );
      const tempFGOLDistributionContract = new _web3.eth.Contract( FGOLDistributionABI, addressOfFGOLDistribution );
      const tempBlockumVaultContract = new _web3.eth.Contract( BlockumVaultABI, addressOfBlockumVault );
      
      const tempLpTokenWei = await tempLPTokenContract.methods.balanceOf(walletAddress).call();
      const lpTokenEth = _web3.utils.fromWei(tempLpTokenWei, 'ether');

      const tempFGOLTokenWei = await tempFGOLDistributionContract.methods.pendingClaims(walletAddress).call();
      const fgolTokenEth = _web3.utils.fromWei(tempFGOLTokenWei, 'ether');

      const tempDepositedLpTokenWei = await tempBlockumVaultContract.methods.getMemberBalance(walletAddress).call();
      const lpDepositedTokenEth = _web3.utils.fromWei(tempDepositedLpTokenWei,'ether');

      const tempFGOLBalance = await FGOLTokenContract.methods.balanceOf(walletAddress).call();
      const fgolBalanceEth = _web3.utils.fromWei( tempFGOLBalance, 'ether' );
      
      setFGOLBalanceEth(fgolBalanceEth)
      setLPTokenEth(lpTokenEth);
      setFGOLTokenEth(fgolTokenEth);
      setLpDepositedTokenEth(lpDepositedTokenEth);

      resolve();
    } catch (err) {
      console.log("@venus err");
      reject(err);
    } 

  });
  

  /**
   * init and connect wallet once it is available
   */
  const _init = async() => {

    const web3 = new Web3(window.ethereum);
    setWeb3(web3);

    if(!window.ethereum) {
      window.alert('Please install MetaMask');
      window.open('https://metamask.io/download.html', '_self');
      return;
    }

    if(window.ethereum._state.accounts.length > 0){

      await connectMetaMask(web3);
    }
    getHeaderData();
  }

  /**
   * init and connect wallet once it is available
   */
  useEffect(() => {
    _init();
  }, []);

  /**
   * fetch data fro /home 
   */
  const _fetchHomeData = async() => {
    try{
      setIsFetchingHomeData("START");
      let tempDistributionHistory = await axios.get('/fgol-distribution/history');
      tempDistributionHistory = tempDistributionHistory.data;
  
      let tempDepositHistory = await axios.get(`/history/${walletAddress}`);
      tempDepositHistory = tempDepositHistory.data;
  
      dispatch({
        type: 'INIT_HISTORY',
        payload: {
          deposits: tempDepositHistory,
          distributes: tempDistributionHistory,
        },
      });
  
    }catch(e){
      console.log("err while fetching home data.")
    } finally {
      setIsFetchingHomeData("DONE");
    }
  }

  /**
   * when the wallet address is available, start fetching data for home page
   */
  useEffect(() => {
    if (!walletAddress) {
      return;
    }
    _fetchHomeData();
  }, [walletAddress])

  return (
    <Web3Context.Provider
      value={{
        _web3,
        connectMetaMask,
        setWalletAddress,
        walletAddress,
        lpTokenEth,
        fgolTokenEth,
        BlockumVaultContract,
        proposals,
        isMember,
        FGOLDistributionContract,
        LPTokenContract,
        FGOLTokenContract,
        addressOfBlockumVault,
        addressOfFGOLDistribution,
        BlockumDAOContract,
        currentProposalCreationFee,
        lpDepositedTokenEth,
        isConnected,
        isConnecting,
        updateWallet,
        isFetchingHomeData,
        disconnectMetaMask,
        fgolBalanceEth,
        updateProposalById,
        addProposal,
        removeProposal
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
