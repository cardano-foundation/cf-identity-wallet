import type { AgentContext } from "@aries-framework/core";
import type { DidRegistrar } from "@aries-framework/core";
import type {
  DidCreateResult,
  DidDeactivateResult,
  DidUpdateResult,
} from "@aries-framework/core";

import { DidDocumentRole } from "@aries-framework/core";
import { DidRepository, DidRecord, DidKey } from "@aries-framework/core";
import { LabelledKeyDidCreateOptions } from "./labelledKeyDidRegistrar.types";

class LabelledKeyDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ["key"];

  public async create(
    agentContext: AgentContext,
    options: LabelledKeyDidCreateOptions
  ): Promise<DidCreateResult> {
    const didRepository = agentContext.dependencyManager.resolve(DidRepository);

    const keyType = options.options.keyType;

    try {
      const key = await agentContext.wallet.createKey({
        keyType,
      });

      const didKey = new DidKey(key);

      const didRecord = new DidRecord({
        did: didKey.did,
        role: DidDocumentRole.Created,
        tags: {
          displayName: options.displayName,
        },
      });
      await didRepository.save(agentContext, didRecord);

      return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
          state: "finished",
          did: didKey.did,
          didDocument: didKey.didDocument,
        },
      };
    } catch (error: any) {
      return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
          state: "failed",
          reason: `unknownError: ${error.message}`,
        },
      };
    }
  }

  public async update(): Promise<DidUpdateResult> {
    return {
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: "failed",
        reason: `notSupported: cannot update did:key did`,
      },
    };
  }

  public async deactivate(): Promise<DidDeactivateResult> {
    return {
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: "failed",
        reason: `notSupported: cannot deactivate did:key did`,
      },
    };
  }
}

export { LabelledKeyDidRegistrar };
