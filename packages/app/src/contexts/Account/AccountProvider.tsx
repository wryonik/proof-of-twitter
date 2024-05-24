import { useEffect, useState, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWallets } from '@privy-io/react-auth';
// import { useSwitchNetwork } from '@privy-io/wagmi-connector';
import {useSetActiveWallet} from '@privy-io/wagmi'; 

import { usePrivy } from '@privy-io/react-auth';

import AccountContext from './AccountContext';
import { esl } from '../../constants';
import { formatAddress } from '../../helpers/addressFormat';
import { LoginStatus, LoginStatusType } from '../../helpers/types/loginStatus';
import { sepolia } from 'viem/chains';

interface ProvidersProps {
  children: ReactNode;
}

const AccountProvider = ({ children }: ProvidersProps) => {
  const { address } = useAccount();
  // const { chains } = useSwitchNetwork();
  const chain = sepolia;
  const { disconnect } = useDisconnect();
  const { status: connectStatus } = useConnect();
  
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const activeWallet = wallets.filter(wallet => wallet.address === address)
  const {
    authenticated,
    logout: authenticatedLogout,
    user,
    login: authenticatedLogin,
    exportWallet: exportAuthenticatedWallet
  } = usePrivy();

  /*
   * State
   */

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<LoginStatusType>(LoginStatus.LOGGED_OUT);
  const [loggedInEthereumAddress, setLoggedInEthereumAddress] = useState<string | null>(null);
  const [accountDisplay, setAccountDisplay] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  /*
   * Hooks
   */

  useEffect(() => {
    esl && console.log('activeWallet_1');
    esl && console.log('checking wallets: ', wallets);
    esl && console.log('checking activeWallet: ', activeWallet);

    if (wallets[0] && !activeWallet) {
      esl && console.log('activeWallet_2');
      setActiveWallet(wallets[0]);
    }
  }, [activeWallet, wallets, setActiveWallet]);

  useEffect(() => {
    esl && console.log('loginStatus_1');
    esl && console.log('user: ', user);

    if (authenticated && user?.wallet?.connectorType) {
      const connectorType = user.wallet.connectorType;
      if (connectorType === 'embedded') {
        esl && console.log('loginStatus_2');

        setLoginStatus(LoginStatus.AUTHENTICATED);
      } else if (
          connectorType === 'injected' ||
          connectorType === 'coinbase_wallet' ||
          connectorType === 'wallet_connect' ||
          connectorType === 'wallet_connect_v2'
        ) {
        esl && console.log('loginStatus_3');

        setLoginStatus(LoginStatus.EOA);
      } else {
        esl && console.log('loginStatus_4');

        setLoginStatus(LoginStatus.LOGGED_OUT);
      }
    } else {
      esl && console.log('loginStatus_5');

      setLoginStatus(LoginStatus.LOGGED_OUT);
    }
  }, [authenticated, user]);

  useEffect(() => {
    esl && console.log('isLoggedIn_1');
    esl && console.log('checking loginStatus: ', loginStatus);
    esl && console.log('user: ', user);
    esl && console.log('address: ', address);
    
    switch (loginStatus) {
      case LoginStatus.AUTHENTICATED:
        if (address && user) {
          esl && console.log('isLoggedIn_2');

          if (user.email && user.email.address) {
            setAccountDisplay(user.email.address);
          } else if (user.google && user.google.email) {
            setAccountDisplay(user.google.email);
          } else if (user.twitter && user.twitter.username) {
            setAccountDisplay(user.twitter.username);
          } else if (user.farcaster && user.farcaster.displayName) {
            setAccountDisplay(user.farcaster.displayName);
          } else {
            setAccountDisplay('Account');
          }

          setIsLoggedIn(true);
          setLoggedInEthereumAddress(address);
        }
        break;

      case LoginStatus.EOA:
        if (address) {
          esl && console.log('isLoggedIn_3');

          const formattedAddress = formatAddress(address);

          setAccountDisplay(formattedAddress);
          setIsLoggedIn(true);
          setLoggedInEthereumAddress(address);
        }
        break;
      
      case LoginStatus.LOGGED_OUT:
      default:
        esl && console.log('isLoggedIn_4');

        setAccountDisplay(null);
        setIsLoggedIn(false);
        setLoggedInEthereumAddress(null);
    }
  }, [user, address, loginStatus, disconnect]);

  useEffect(() => {
    esl && console.log('networkRaw_1');
    esl && console.log('checking chain: ', chain);

    if (chain) {
      esl && console.log('networkRaw_2');

      setNetwork(chain.network);
    } else {
      esl && console.log('networkRaw_3');

      setNetwork(null);
    }
  }, [chain]);

  return (
    <AccountContext.Provider
      value={{
        isLoggedIn,
        loggedInEthereumAddress,
        loginStatus,
        authenticatedLogin,
        authenticatedLogout,
        accountDisplay,
        network,
        connectStatus,
        exportAuthenticatedWallet
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
