import {
  AgentContext,
  AriesFrameworkError, CREDENTIALS_CONTEXT_V1_URL,
  DidResolverService,
  DocumentLoader,
  JsonObject,
  vcLibraries,
} from "@aries-framework/core";
import { getNativeDocumentLoader } from "@aries-framework/core/build/modules/vc/data-integrity/libraries/nativeDocumentLoader";
import { CREDENTIALS_V1 } from "./contexts/credentialsV1";
import { CITIZENSHIP_V1 } from "./contexts/citizenshipV1";
import { CREDENTIALS_EXAMPLES_V1 } from "./contexts/credentialsExamplesV1";
import { Ed25519_2020V1 } from "./contexts/ed25519_2020V1";
import { Ed25519_2018V1 } from "./contexts/ed25519_2018V1";
import { ODRL } from "./contexts/odrl";
import { DID_V1 } from "./contexts/didV1";
import { X25519_2019 } from "./contexts/x25519_2019";

const { jsonld } = vcLibraries;

function isDid(potentialDid: string) {
  return potentialDid.startsWith("did:");
}
const DOCUMENTS: { [key: string]: any }= {
  [CREDENTIALS_CONTEXT_V1_URL]: CREDENTIALS_V1,
  "https://w3id.org/citizenship/v1": CITIZENSHIP_V1,
  "https://www.w3.org/2018/credentials/examples/v1": CREDENTIALS_EXAMPLES_V1,
  "https://w3id.org/security/suites/ed25519-2020/v1": Ed25519_2020V1,
  "https://w3id.org/security/suites/ed25519-2018/v1": Ed25519_2018V1,
  "https://ns.did.ai/suites/x25519-2019/v1/": X25519_2019,
  "https://www.w3.org/ns/odrl.jsonld": ODRL,
  "https://w3id.org/did/v1": DID_V1,
}

function documentLoader(agentContext: AgentContext): DocumentLoader {
  const didResolver =
    agentContext.dependencyManager.resolve(DidResolverService);
  async function loader(url: string) {
    // Cache context documents
    let context = DOCUMENTS[url];
    if (!context) {
      const withoutFragment = url.split("#")[0]
      context = DOCUMENTS[withoutFragment]
    }
    if (context) {
      return {
        contextUrl: null,
        documentUrl: url,
        document: context as JsonObject,
      }
    }

    if (isDid(url)) {
      const result = await didResolver.resolve(agentContext, url);
      if (result.didResolutionMetadata.error || !result.didDocument) {
        throw new AriesFrameworkError(`Unable to resolve DID: ${url}`);
      }
      const framed = await jsonld.frame(
        result.didDocument.toJSON(),
        {
          "@context": result.didDocument.context,
          "@embed": "@never",
          id: url,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { documentLoader: this }
      );
      return {
        contextUrl: null,
        documentUrl: url,
        document: framed,
      };
    }
    const platformLoader = getNativeDocumentLoader();
    const nativeLoader = platformLoader.apply(jsonld, []);
    return await nativeLoader(url);
  }

  return loader.bind(loader);
}

export { documentLoader };
