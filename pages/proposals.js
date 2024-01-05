import { Icon } from '@iconify/react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react'
import useWeb3 from '../src/hooks/useWeb3';
import { _timestampToDateForVotingProposal } from  "../src/customUtils";
import useNotification from '../src/hooks/useNotification';
import useSpinner from '../src/hooks/useSpinner';
import { useRouter } from 'next/router';
import { _calcRemainTime } from '../src/customUtils';



const Proposals = () => {

  const router = useRouter();
  /**
   * import variables from web3 context
   */
  const {
      walletAddress,
      proposals,
      BlockumDAOContract,
      updateProposalById,
      removeProposal
    } = useWeb3();


/**
 * calc percent for main
 * @param {*} main active votes
 * @param {*} forVotes forVotes
 * @param {*} againstVotes  againstVotes
 */
  const _calcProgress = ( main, forVotes, againstVotes ) => {
    let mainVotes = Number(main);
    let totalVotes = Number(forVotes) + Number(againstVotes);

    if ( totalVotes === 0 ) {
      return 0;
    } else {
      return mainVotes * 100 / totalVotes;
    }
  }

  const { openSpin, closeSpin } = useSpinner();
  const { showNotification } = useNotification();

  const gotoPresentationLink = (url) => {
    window.open(url, '_blank');
  }

  const _renderProgress = (value) => (
    <Box 
      height={14}
      borderRadius={3}
      padding='1px'
      border="1px solid #00000099"
    >
      <Box backgroundColor="#2683F6" width={`${value}%`} height={10} borderRadius={3}></Box>
    </Box>
  );

  React.useEffect(() => {
    console.log(proposals)
  }, [proposals]);

  /**
   * Vote this proposal 
   * @param {*} proposalId proposal Id
   */
  const handleVoteYesClick = async ({ proposalId, voted }) => {

    if ( voted ) {
      return showNotification("Already voted", "success");
    }

    try {
      openSpin("Voting this proposal");

      console.log(walletAddress, proposalId);
      await BlockumDAOContract.methods.vote(proposalId, true).send({
        from: walletAddress,
      });

      showNotification("Vote success", "success");
      await updateProposalById(proposalId);
      
    } catch (err) {
      console.log(err);
      
      showNotification("Vote failed", "error");
      closeSpin();
    } 
  };

  /**
   * unlike this proposal
   * @param {*} proposalId proposal ID
   */
  const handleVoteNoClick = async ({ proposalId, voted }) => {

    if ( voted ) {
      return showNotification("Already voted", "success");
    }

    try {
      openSpin("Voting this proposal");
      await BlockumDAOContract.methods.vote(proposalId, false).send({
        from: walletAddress,
      });
      showNotification("Vote success.", "success");
      await updateProposalById(proposalId);
      
    } catch (err) {
      console.log(err);
      
      showNotification("Vote failed", "error");
      closeSpin();
    }
  };

  /**
   * delete own proposal
   */
  const handleDeleteProposal = async({ proposalId }) => {

    try {
      openSpin("Deleting this proposal");

      await BlockumDAOContract.methods.removeProposal(proposalId).send({ from: walletAddress });
      openSpin('Updating Proposals');
      //all update require
      await removeProposal( proposalId );
      showNotification("Delete success.", "success");
    } catch (err) {
      console.log(err);
      
      showNotification("Delete failed", "error");
      
    } finally {
      closeSpin();
    }

  }


  const _renderItem = (data) => {

    const { d, h, m, s } = _calcRemainTime(data.endTime);

    return (
      <Grid key={data.proposalId + "_proposal"} item container sm={12} md={6} px={{sm:0, md:'7px'}} mt={1}>
        <Grid item container borderRadius={6} backgroundColor="white" padding={2} alignItems={'start'}>
          <Typography width='100%' color='black' fontSize={{xs:20, sm:25}} px={1} borderBottom='4px solid #C9C9C9'>{ data.title }</Typography>
          <Grid container justifyContent='space-between'>
            <Typography color='#2683F6' fontSize={15}>Proposal Description</Typography>
            <Typography color='#2683F6' fontSize={15}>You voted <span style={{fontWeight:800, fontSize:15}}>{ data.voted ? 'Yes' : 'No' }</span></Typography>
          </Grid>
          <Typography width='100%' height={100} className='scroller_view' sx={{overflowY:'scroll'}} fontSize={15} mt={1} color='black' backgroundColor='#E6E6E6' borderRadius={3} padding={1} justifyContent='space-between'>
            { data.description }
          </Typography>

          <Grid container mt={1}>
            <Grid item container xs={12} sm={4} md={12} lg={4} pr={{xs:0,sm:2,md:0,lg:2}} mt={{xs:3,sm:0,md:3,lg:0}} flexDirection='column'>
              <Typography color='#2683F6' fontSize={15}>Created in:</Typography>
              <Typography color='black' fontSize={13}>{ _timestampToDateForVotingProposal(data.endTime) }</Typography>
              <Typography color='black' pl={1} fontSize={15} fontWeight={600} mt='8px'>Members Quorum</Typography>
              { _renderProgress(data.memberProgressForProposal <= 100 ? data.memberProgressForProposal: 100) }
              <Typography color='black' mt={1} pl={1} fontSize={15} fontWeight={600}>Capital Quorum</Typography>
              { _renderProgress(data.capitalProgressForProposal <= 100 ? data.capitalProgressForProposal: 100) }
              <Typography color='black' mt={1} pl={1} fontSize={15} fontWeight={600}>Quorum Met: { data.proposalVotings.quorumMet ? "Yes" : "No" }</Typography>
            </Grid>
            <Grid item container xs={12} sm={4} md={12} lg={4} pr={{xs:0,sm:2,md:0,lg:2}} mt={{xs:3,sm:0,md:3,lg:0}} flexDirection='column'>
              <Grid container alignItems='center'>
                <Grid item xs='auto'>
                  <img height={40} width={40} src="/icons/calendar.png"/>
                </Grid>
                <Grid item xs='auto' container flexDirection='column' mt='6px'>
                  <Typography color='black' pl={{xs:2, lg:'2px'}} fontSize={12}>{d} remaining days</Typography>
                  <Typography color='black' pl={{xs:2, lg:'2px'}} fontSize={12}>{h}h:{m}min:{s}</Typography>
                </Grid>
              </Grid>
              <Typography color='black' pl={1} fontSize={15} fontWeight={600} mt={1}>For Votes</Typography>
              { _renderProgress( _calcProgress( data.proposalVotings.forVotes, data.proposalVotings.forVotes, data.proposalVotings.againstVotes ) )}
              <Typography color='black' mt={1} pl={1} fontSize={15} fontWeight={600}>Against Votes</Typography>
              { _renderProgress( _calcProgress( data.proposalVotings.againstVotes, data.proposalVotings.forVotes, data.proposalVotings.againstVotes ) )}
              <Typography color='black' mt={1} pl={1} fontSize={15} fontWeight={600} >Total Votes: { (Number(data.proposalVotings.againstVotes) / Math.pow(10, 18) + Number(data.proposalVotings.forVotes) / Math.pow(10, 18)).toFixed(3) }</Typography>
            </Grid>
            <Grid item container xs={12} sm={4} md={12} lg={4} mt={{xs:3,sm:0,md:3,lg:0}} flexDirection='column'>
              <Grid container alignItems='center' justifyContent='end'>
                <Button onClick={() => gotoPresentationLink(data.presentationLink)} variant="contained" fontSize={12} sx={{backgroundColor:"#2683F6", borderRadius:3, width:{xs:'100%',sm:'auto',md:'100%',lg:'auto'}}} size='small'>VIEW PRESENTATION</Button>
              </Grid>
              <Typography color='black' pl={1} fontSize={15} fontWeight={600} pt='5px' pb='2px' textAlign='center'>Status</Typography>
              <Grid container backgroundColor='#E6E6E6' borderRadius={3} px={1}>
                <Box sx={{borderLeft:'2px solid #2683F6'}} width='100%' py='2px' minHeight='94px' display='flex' justifyContent='start' flexDirection='column' alignItems='center'>
                {
                  data.proposalVotings.funded &&                 
                  <Grid container alignItems='center' flexWrap='nowrap'>
                    <Grid item ml='-6px'><Box width={10} height={10} borderRadius='50%' backgroundColor='#2683F6'></Box></Grid>
                    <Grid item flexGrow={1} color='black' fontSize={12} textAlign='center'>Funded</Grid>
                  </Grid>
                }
                {
                  data.proposalVotings.approvedByCommunity &&                 
                  <Grid container alignItems='center' flexWrap='nowrap'>
                    <Grid item ml='-6px'><Box width={10} height={10} borderRadius='50%' backgroundColor='#2683F6'></Box></Grid>
                    <Grid item flexGrow={1} color='black' fontSize={12} textAlign='center'>Approved By Community</Grid>
                  </Grid>
                }
                {
                  data.proposalVotings.executed &&                 
                  <Grid container alignItems='center' flexWrap='nowrap'>
                    <Grid item ml='-6px'><Box width={10} height={10} borderRadius='50%' backgroundColor='#2683F6'></Box></Grid>
                    <Grid item flexGrow={1} color='black' fontSize={12} textAlign='center'>Executed</Grid>
                  </Grid>
                }
                {
                  data.proposalVotings.underReview &&                 
                  <Grid container alignItems='center' flexWrap='nowrap'>
                    <Grid item ml='-6px'><Box width={10} height={10} borderRadius='50%' backgroundColor='#2683F6'></Box></Grid>
                    <Grid item flexGrow={1} color='black' fontSize={12} textAlign='center'>Under Review</Grid>
                  </Grid>
                }
                {
                  data.proposalVotings.approved &&                 
                  <Grid container alignItems='center' flexWrap='nowrap'>
                    <Grid item ml='-6px'><Box width={10} height={10} borderRadius='50%' backgroundColor='#2683F6'></Box></Grid>
                    <Grid item flexGrow={1} color='black' fontSize={12} textAlign='center'>Proposal Created</Grid>
                  </Grid>
                }
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Typography color='#2683F6' fontSize={15} mt={1}>Are you in favor of Promoting this Proposal?</Typography>
          <Grid container mt={1}>
            <Grid item container justifyContent='start' md={12} lg={7} gap={{xs:1, lg:3}}>
              <Button onClick={ () => handleVoteYesClick(data) } variant="contained" sx={{backgroundColor:"#2683F6", borderRadius:5, fontSize:'15px!important', width:{xs:'100%', lg:130}}} size='small'>YES</Button>
              <Button onClick={ () => handleVoteNoClick(data) } variant="contained" sx={{backgroundColor:"#041431", borderRadius:5, fontSize:'15px!important', width:{xs:'100%', lg:130}}} size='small'>N O</Button>
            </Grid>
            { 
              ( walletAddress === data.proposer ) &&
              <Grid item container justifyContent='end' md={12} lg={5} mt={{xs:1, lg:0}}>
                <Button onClick={() => handleDeleteProposal(data)} variant="contained" sx={{backgroundColor:"#D9D9D9", borderRadius:5, fontSize:'15px!important', width:{xs:'100%', lg:200}}} size='small'>DELETE PROPOSAL</Button>
              </Grid>
            }
          </Grid>
        </Grid>
      </Grid>
    )
  }

  return (
    <Box padding={{xs:1, md:5}}>
      <Grid container justifyContent='space-between' gap={1} alignItems='start'>
        <Box sx={{cursor:'pointer'}} display='flex' onClick={() => router.push("/home")} alignItems='center'><Icon width={25} height={25} icon="ic:round-reply" color='#2683F6'/><Typography color="#2683F6" fontWeight={600}>BACK</Typography></Box>
        <Button onClick={() => router.push("/payperproposal")} fullWidth variant="contained" sx={{borderRadius:4,paddingY:1, textTransform:'none', backgroundColor:'#2683F6!important', width: {xs:'100%', sm: '200px'}}} size='large'>ADD NEW PROPOSAL</Button>
      </Grid>
      <Grid container px={3} mt={1} alignItems='end'>
        <Grid item xs={6} textAlign='left' color='black' fontSize={23} fontWeight={600}>Proposals for Voting:</Grid>
        <Grid item xs={6} textAlign='right' color='black' fontSize={18}>Total of <Typography fontWeight={600} fontSize={20} display='inline'>{proposals.length.toString().length === 1 ? '0' + proposals.length : proposals.length}</Typography> proposals</Grid>
      </Grid>
      <Grid container
        borderRadius={5} backgroundColor='#041431'
        pt={{xs:0, md:2}} pb={{xs:1, md:3}} px={{xs:1, md:2}}
      >
      {
        proposals.map(item => _renderItem(item))
      }
      </Grid>
    </Box>
  )
}

export default Proposals;