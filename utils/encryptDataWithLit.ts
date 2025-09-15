import { LitNetwork } from "@lit-protocol/constants";
import { encryptFile as litEncryptFile } from "@lit-protocol/encryption";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  type AcceptedFileType,
  type AccessControlConditions,
  type AuthSig,
  type EvmContractConditions,
  type SessionSigsMap,
  type SolRpcConditions,
  type UnifiedAccessControlConditions,
} from "@lit-protocol/types";
import { hashData } from "./hashData";

export interface EncryptDataRequest {
  accessControlConditions?: AccessControlConditions;
  authSig?: AuthSig;
  chain: string;
  evmContractConditions?: EvmContractConditions;
  file: AcceptedFileType;
  sessionSigs?: SessionSigsMap;
  solRpcConditions?: SolRpcConditions;
  unifiedAccessControlConditions?: UnifiedAccessControlConditions;
}

export const encryptDataWithLit = async (
  encryptDataRequest: EncryptDataRequest,
  debug = false
) => {
  // Convert Blob to Buffer for hashing
  const fileBuffer = Buffer.from(await encryptDataRequest.file.arrayBuffer());
  const dataToEncryptHash = hashData(fileBuffer);

  if (debug) {
    console.log("\n=== ENCRYPT DEBUG INFO ===");
    console.log("DataToEncryptHash:", dataToEncryptHash);
    console.log("Encrypt Request Config:", encryptDataRequest);
    console.log("\n🔄 Connecting to Lit network...");
  }

  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    debug: false,
  });
  await litNodeClient.connect();
  
  if (debug) {
    console.log("✅ Connected to Lit network");
    console.log("🔄 Encrypting file...");
  }

  const litEncryptedFile = await litEncryptFile(
    encryptDataRequest,
    litNodeClient,
  );

  if (debug) {
    console.log("✅ File encrypted");
  }

  return { ...litEncryptedFile, dataToEncryptHash };
};