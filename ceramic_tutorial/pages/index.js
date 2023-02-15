import styles from "@/styles/Home.module.css";

import { Web3Provider } from "@ethersproject/providers";
//add hooks
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";

// Before we initialize Web3Modal, we will setup a React Hook provided to us by the Self.ID SDK.
// Self.ID provides a hook called useViewerConnection which gives us an easy way to connect
// and disconnect to the Ceramic Network.
import { useViewerConnection } from "@self.id/react";

// The last thing we need to be able to connect to the Ceramic Network is something called an EthereumAuthProvider.
// It is a class exported by the Self.ID SDK which takes an Ethereum provider and an address as an argument,
// and uses it to connect your Ethereum wallet to your 3ID.
import { EthereumAuthProvider } from "@self.id/web";

export default function Home() {
  // create a reference using the useRef react hook to a Web3Modal instance
  const web3ModalRef = useRef();

  // initialize React Hook provided to us by the Self.ID SDK
  const [connection, connect, disconnect] = useViewerConnection();

  // helper function to get the provider
  // This function will prompt the user to connect their Ethereum wallet, if not already connected, and then return a Web3Provider.
  // However, if you try running it right now, it will fail because we have not yet initialized web3Modal
  const getProvider = async () => {
    const provider = await web3ModalRef.current.connect();
    const wrappedProvider = new Web3Provider(provider);
    return wrappedProvider;
  };

  // We have seen this code before many times.
  // The only difference is the conditional here.
  // We are checking that if the user has not yet been connected to Ceramic,
  // we are going to initialize the web3Modal.
  useEffect(() => {
    if (connection.status !== "connected") {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [connection.status]);

  const connectToSelfID = async () => {
    const ethereumAuthProvider = await getEthereumAuthProvider();
    connect(ethereumAuthProvider);
  };

  // getEthereumAuthProvider creates an instance of the EthereumAuthProvider.
  // we are passing it wrappedProvider.provider instead of wrappedProvider directly
  // because ethers abstracts away the low level provider calls with helper functions
  // so it's easier for developers to use, but since not everyone uses ethers.js,
  // Self.ID maintains a generic interface to actual provider specification,
  // instead of the ethers wrapped version
  const getEthereumAuthProvider = async () => {
    const wrappedProvider = await getProvider();
    const signer = wrappedProvider.getSigner();
    const address = await signer.getAddress();
    return new EthereumAuthProvider(wrappedProvider.provider, address);
  };

  return (
    <div className={styles.main}>
      <div className={styles.navbar}>
        <span className={styles.title}>Ceramic Demo</span>
        {connection.status === "connected" ? (
          <span className={styles.subtitle}>Connected</span>
        ) : (
          <button
            onClick={connectToSelfID}
            className={styles.button}
            disabled={connection.status === "connecting"}
          >
            Connect
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.connection}>
          {connection.status === "connected" ? (
            <div>
              <span className={styles.subtitle}>
                Your 3ID is {connection.selfID.id}
              </span>
              <RecordSetter />
            </div>
          ) : (
            <span className={styles.subtitle}>
              Connect with your wallet to access your 3ID
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// hook provided to us by Self.ID called useViewerRecord which allows storing and retrieving profile information on Ceramic Network.
import { useViewerRecord } from "@self.id/react";

//component to update our profile on ceramic network
function RecordSetter() {
  const record = useViewerRecord("basicProfile");
  const [name, setName] = useState("");

  const updateRecordName = async (name) => {
    await record.merge({
      name: name,
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles.mt2}>
        {record.content ? (
          <div className={styles.flexCol}>
            <span className={styles.subtitle}>
              Hello {record.content.name}!
            </span>

            <span>
              The above name was loaded from Ceramic Network. Try updating it
              below.
            </span>
          </div>
        ) : (
          <span>
            You do not have a profile record attached to your 3ID. Create a
            basic profile by setting a name below.
          </span>
        )}
      </div>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.mt2}
      />
      <button onClick={() => updateRecordName(name)}>Update</button>
    </div>
  );
}
