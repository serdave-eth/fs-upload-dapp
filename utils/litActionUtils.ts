import { LIT_NETWORK } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  type AccessControlConditions,
  type AuthSig,
  // type CustomNetwork,
  type LIT_NETWORKS_KEYS,
  type SessionSigsMap,
} from "@lit-protocol/types";

export const executeProxyLitAction = async (
  ciphertext: string,
  dataToEncryptHash: string,
  proxyMetadata: string,
  sessionSigs: SessionSigsMap,
  authSig: AuthSig,
  params?: string,
  dataMetadata?: string,
  dataIdentifier?: string,
) => {
  let litNodeClient: LitNodeClient;
  try {
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev as LIT_NETWORKS_KEYS,
      debug: true,
    });

    await litNodeClient.connect();

    // convert proxyMetadata to a string
    const litActionCid = JSON.parse(proxyMetadata).proxyAddress;

    const accessControlConditions: AccessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":currentActionIpfsId"],
        returnValueTest: {
          comparator: "=",
          value: litActionCid,
        },
      },
    ];

    const litActionSignatures = await litNodeClient.executeJs({
      sessionSigs,
      ipfsId: litActionCid,
      jsParams: {
        accessControlConditions,
        ciphertext,
        dataToEncryptHash,
        authSig: authSig,
        params,
        dataMetadata,
        dataIdentifier,
      },
    });

    return litActionSignatures;
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }

  return null;
};