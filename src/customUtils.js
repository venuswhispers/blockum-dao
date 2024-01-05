export const _timestampToDateForDeposit = (timestamp) => {

  const date = new Date(timestamp);

  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-indexed
  const year = date.getFullYear();

  const dateString = `${day}/${month}/${year}`;
  return dateString;
};

export const _timestampToDateForDistribute = (timestamp) => {

  const date = new Date(timestamp);

  let day = date.getDate();
  let month = date.getMonth() + 1; // Months are 0-indexed
  let year = date.getFullYear();

  month = month > 10 ? month : "0" + month;
  day = day > 10 ? day : "0" + day;

  const dateString = `${day}/${month}/${year}`;
  return dateString;
};

export const _truncateText = (walletAddress) => {
  if (walletAddress.length > 10) {
    return (
      walletAddress.substring(0, 6) +
      '...' +
      walletAddress.substring(walletAddress.length - 4)
    );
  } else {
    return walletAddress;
  }
}

/**
 * convert timestamp to full time
 * @param {*} timestamp 0010
 * @returns 
 */
export const _timestampToDateForVotingProposal = (timestamp) => {

  if ( timestamp === "0" ) {
    return "0000-00-00 00:00:00";
  }
  
  const date = new Date(timestamp * 1000);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  month = month > 10 ? month : "0" + month;
  day = day >= 10 ? day : "0" + day;
  hours = hours >= 10 ? hours : "0" + hours;
  minutes = minutes >= 10 ? minutes : "0" + minutes;
  seconds = seconds >= 10 ? seconds : "0" + seconds;


  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * calculate the remaining time to vote
 * @param {*} endTime 
 * @returns { d, h, m, s }
 */
export const _calcRemainTime = (endTime = 0) => {
  if ( Number(endTime) === 0 ) {
    return { d: "00", h: "00", m: "00", s: "00" }
  } else {

    let seconds = endTime - new Date().getTime() / 1000;

    if( seconds <= 0 ) {
      return { d: 0, h: 0, m: 0, s: 0 }
    }

    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    d = ( d > 9 ) ? d : ( "0" + d ); 
    m = ( m > 9 ) ? m : ( "0" + m ); 
    h = ( h > 9 ) ? h : ( "0" + h ); 
    s = ( s > 9 ) ? s : ( "0" + s ); 
    return { d, h, m, s }
  }
}