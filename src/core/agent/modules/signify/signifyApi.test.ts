import { CredentialFilter, ready } from "signify-ts";
import { utils } from "@aries-framework/core";
import { MultiSigRoute } from "./signifyApi.types";
import { SignifyApi } from "./signifyApi";
import { ConfigurationService } from "../../../configuration";

const firstAid = "aid1";
const secondAid = "aid2";
const aidPrefix = "keri-";
const witnessPrefix = "witness.";
const uuidToThrow = "throwMe";
const oobiPrefix = "oobi.";

let connectMock = jest.fn();
const bootMock = jest.fn();
const admitMock = jest
  .fn()
  .mockImplementation(
    (name: string, message: string, grant: string, datetime?: string) => {
      return [{}, ["sigs"], "aend"];
    }
  );
const submitAdmitMock = jest.fn();
const interactMock = jest.fn().mockImplementation((name, _config) => {
  return {
    done: false,
    name: `${witnessPrefix}${name}`,
    op: jest.fn().mockResolvedValue({
      done: true,
      name: "oobi.test",
    }),
    serder: {
      ked: { i: name },
    },
    sigs: [
      "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
    ],
  };
});
const rotateMock = jest.fn().mockImplementation((name, _config) => {
  return {
    done: false,
    name: `${witnessPrefix}${name}`,
    op: jest.fn().mockResolvedValue({
      name: "oobi.test",
    }),
    serder: {
      ked: { i: name },
    },
    sigs: [
      "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
    ],
  };
});
const membersMock = jest.fn();

const exchangeSendMock = jest.fn();

const contacts = [
  {
    id: "id",
    alias: "alias",
  },
];
const notifications = { notes: [] };
const credentials: any[] = [];
const exchange = {};

jest.mock("signify-ts", () => ({
  ready: jest.fn(),
  SignifyClient: jest.fn().mockImplementation(() => {
    return {
      connect: connectMock,
      boot: bootMock,
      identifiers: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue({
          aids: [
            { name: firstAid, prefix: "1" },
            { name: secondAid, prefix: "2" },
          ],
        }),
        get: jest.fn().mockImplementation((name: string) => {
          return {
            name,
            id: `${aidPrefix}${name}`,
            state: {
              di: "delegatorPrefix",
            },
          };
        }),
        create: jest.fn().mockImplementation((name, _config) => {
          return {
            done: false,
            name: `${witnessPrefix}${name}`,
            op: jest.fn().mockResolvedValue({
              name: "oobi.test",
            }),
            serder: {
              ked: { i: name },
            },
            sigs: [
              "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
            ],
          };
        }),
        addEndRole: jest.fn(),
        interact: interactMock,
        rotate: rotateMock,
        members: membersMock,
      }),
      operations: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation((name: string) => {
          if (
            name === `${witnessPrefix}${uuidToThrow}` ||
            name === `${oobiPrefix}${uuidToThrow}`
          ) {
            return { done: false, name };
          }
          return { done: true, name };
        }),
      }),
      oobis: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation((name: string) => {
          return {
            oobis: [`${oobiPrefix}${name}`],
          };
        }),
        resolve: jest.fn().mockImplementation((name, _config) => {
          return { done: false, name, response: {} };
        }),
      }),
      contacts: jest.fn().mockReturnValue({
        list: jest
          .fn()
          .mockImplementation(
            (
              group?: string | undefined,
              filterField?: string | undefined,
              filterValue?: string | undefined
            ) => {
              return contacts;
            }
          ),
        get: jest.fn().mockImplementation((id: string) => {
          return {
            alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
            oobi: "oobi",
            id,
          };
        }),
      }),
      notifications: jest.fn().mockReturnValue({
        list: jest.fn().mockImplementation((start?: number, end?: number) => {
          return notifications;
        }),
        mark: jest.fn().mockImplementation((said: string) => {
          return "marked";
        }),
      }),
      ipex: jest.fn().mockReturnValue({
        admit: admitMock,
        submitAdmit: submitAdmitMock,
      }),
      credentials: jest.fn().mockReturnValue({
        list: jest.fn().mockImplementation((kargs?: CredentialFilter) => {
          return credentials;
        }),
      }),
      exchanges: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation((name: string, said: string) => {
          return exchange;
        }),
        send: exchangeSendMock,
      }),
      agent: {
        pre: "pre",
      },
      keyStates: jest.fn().mockReturnValue({
        query: jest.fn().mockReturnValue({
          name: "operation",
          done: true,
        }),
      }),
    };
  }),
  Tier: { low: "low" },
  randomPasscode: jest.fn().mockImplementation(() => {
    return "passcode";
  }),
  Algos: {
    group: "group",
  },
  Siger: jest.fn(),
  d: jest.fn().mockReturnValue("string"),
  messagize: jest.fn(),
}));

// Set low timeout - fake timers would be better but having issues advancing timer at exact right time
const api = new SignifyApi(5, 1);

describe("Signify API", () => {
  beforeAll(async () => {
    await api.start();
    await new ConfigurationService().start();
  });

  test("should call boot if connect fails", async () => {
    connectMock = jest.fn().mockImplementationOnce(() => {
      throw new Error("Connect error");
    });
    await api.start();
    expect(ready).toBeCalled();
    expect(bootMock).toBeCalled();
    expect(connectMock).toBeCalledTimes(2);
  });

  test("can create an identifier", async () => {
    const mockName = "keriuuid";
    jest.spyOn(utils, "uuid").mockReturnValue(mockName);
    const { signifyName, identifier } = await api.createIdentifier();
    expect(signifyName).toBe(mockName);
    expect(identifier).toBe(mockName);
  });

  test("can get identifier by name", async () => {
    const mockName = "keriuuid";
    expect(await api.getIdentifierByName(mockName)).toEqual({
      name: mockName,
      id: `${aidPrefix}${mockName}`,
      state: {
        di: "delegatorPrefix",
      },
    });
  });

  test("can get oobi by name", async () => {
    const mockName = "keriuuid";
    expect(await api.getOobi(mockName)).toEqual(oobiPrefix + mockName);
  });

  test("can resolve oobi", async () => {
    const aid = "keriuuid";
    const url = oobiPrefix + aid;
    const op = await api.resolveOobi(url);
    expect(op).toEqual({
      name: url,
      alias: expect.any(String),
      done: true,
    });
  });

  test("should timeout if oobi resolving is not completing", async () => {
    const url = oobiPrefix + uuidToThrow;
    await expect(api.resolveOobi(url)).rejects.toThrowError(
      SignifyApi.FAILED_TO_RESOLVE_OOBI
    );
  });

  test("should get contacts successfully", async () => {
    expect(await api.getContacts()).toEqual(contacts);
  });

  test("can get notifications", async () => {
    expect(await api.getNotifications()).toEqual(notifications);
  });

  test("can mark a notification as read", async () => {
    const notificationId = "keriuuid";
    expect(await api.markNotification(notificationId)).toEqual("marked");
  });

  test("can submit admit to ipex", async () => {
    const notificationId = "keriuuid";
    const holderAidName = "holderAidName";
    const issuerAid = "issuerAid";
    await api.admitIpex(notificationId, holderAidName, issuerAid);
    expect(admitMock).toBeCalled();
    expect(submitAdmitMock).toBeCalled();
  });

  test("can get credentials", async () => {
    expect(await api.getCredentials()).toEqual(credentials);
  });

  test("can get KERI exchange", async () => {
    const notificationId = "keriuuid";
    expect(await api.getKeriExchange(notificationId)).toEqual(exchange);
  });

  test("Should return undefined when there's no credential", async () => {
    const said = "not-found-said";
    const { acdc } = await api.getCredentialBySaid(said);
    expect(acdc).toBeUndefined();
  });

  test("can get identifier by id", async () => {
    const id = "1";
    expect(await api.getIdentifierById(id)).toEqual({
      name: firstAid,
      prefix: id,
    });
  });

  test("Return undefined when getting the identifier by the ID that does not exist", async () => {
    const id = "3";
    expect(await api.getIdentifierById(id)).toEqual(undefined);
  });

  test("can get contact by id", async () => {
    const id = "1";
    expect(await api.getContactById(id)).toEqual({
      alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
      oobi: "oobi",
      id,
    });
  });

  test("can create Keri multisig", async () => {
    const aid = {
      name: "0d5d804a-eb44-42e9-a67a-7e24ab4b7e42",
      prefix: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
      salty: {},
      transferable: true,
      state: {
        vn: [1, 0],
        i: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
        s: "0",
        p: "",
        d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
        f: "0",
        dt: "2023-12-25T07:37:32.006185+00:00",
        et: "icp",
        kt: "1",
        k: ["DOBaDQOTbreUoqMzCzX0f2ywCB2Qbv17qeHMlm85QjZZ"],
        nt: "1",
        n: ["EJqXepNeybydv7fb0FdRsDhWxia6i_bDCv1LyucSegMj"],
        bt: "1",
        b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
        c: [],
        ee: {
          s: "0",
          d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
          br: [],
          ba: [],
        },
        di: "",
      },
      windexes: [0],
    };
    const otherAids = [
      {
        state: {
          vn: [1, 0],
          i: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
          s: "0",
          p: "",
          d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
          f: "0",
          dt: "2023-12-25T07:42:44.975239+00:00",
          et: "icp",
          kt: "1",
          k: ["DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5"],
          nt: "1",
          n: ["EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u"],
          bt: "1",
          b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
          c: [],
          ee: {
            s: "0",
            d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
            br: [],
            ba: [],
          },
          di: "",
        },
      },
    ];
    const result = await api.createMultisig(aid, otherAids, utils.uuid());
    expect(result).toHaveProperty("op");
    expect(result).toHaveProperty("icpResult");
    expect(result).toHaveProperty("name");
  });

  test("can create Keri delegatation multisig", async () => {
    const aid = {
      name: "0d5d804a-eb44-42e9-a67a-7e24ab4b7e42",
      prefix: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
      salty: {},
      transferable: true,
      state: {
        vn: [1, 0],
        i: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
        s: "0",
        p: "",
        d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
        f: "0",
        dt: "2023-12-25T07:37:32.006185+00:00",
        et: "icp",
        kt: "1",
        k: ["DOBaDQOTbreUoqMzCzX0f2ywCB2Qbv17qeHMlm85QjZZ"],
        nt: "1",
        n: ["EJqXepNeybydv7fb0FdRsDhWxia6i_bDCv1LyucSegMj"],
        bt: "1",
        b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
        c: [],
        ee: {
          s: "0",
          d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
          br: [],
          ba: [],
        },
        di: "",
      },
      windexes: [0],
    };
    const otherAids = [
      {
        state: {
          vn: [1, 0],
          i: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
          s: "0",
          p: "",
          d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
          f: "0",
          dt: "2023-12-25T07:42:44.975239+00:00",
          et: "icp",
          kt: "1",
          k: ["DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5"],
          nt: "1",
          n: ["EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u"],
          bt: "1",
          b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
          c: [],
          ee: {
            s: "0",
            d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
            br: [],
            ba: [],
          },
          di: "",
        },
      },
    ];

    const delegateAid = {
      name: "0d5d804a-eb44-42e9-a67a-7e24ab4b7e42",
      prefix: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_2",
      salty: {},
      transferable: true,
      state: {
        vn: [1, 0],
        i: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_2",
        s: "0",
        p: "",
        d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_2",
        f: "0",
        dt: "2023-12-25T07:37:32.006185+00:00",
        et: "icp",
        kt: "1",
        k: ["DOBaDQOTbreUoqMzCzX0f2ywCB2Qbv17qeHMlm85QjZZ"],
        nt: "1",
        n: ["EJqXepNeybydv7fb0FdRsDhWxia6i_bDCv1LyucSegMj"],
        bt: "1",
        b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
        c: [],
        ee: {
          s: "0",
          d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_2",
          br: [],
          ba: [],
        },
        di: "",
      },
      windexes: [0],
    };
    const result = await api.createMultisig(
      aid,
      otherAids,
      utils.uuid(),
      delegateAid
    );
    expect(result).toHaveProperty("op");
    expect(result).toHaveProperty("icpResult");
    expect(result).toHaveProperty("name");
  });

  test("Should able to join multisig", async () => {
    const exn = {
      v: "KERI10JSON0007bf_",
      t: "exn",
      d: "EPwR9xi7f8yMFYb31uRiPjwSWgzD40jLCUosxJe2k1aM",
      i: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
      p: "",
      dt: "2023-12-25T07:57:40.307000+00:00",
      r: "/multisig/icp",
      q: {},
      a: {
        gid: "ENWBYC6g1-e3SyAB6PnjYwKMpQNw-jUwO_I9VUvYzM8_",
        smids: [
          "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
          "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
        ],
        rmids: [
          "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
          "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
        ],
        rstates: [
          {
            vn: [1, 0],
            i: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
            s: "0",
            p: "",
            d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
            f: "0",
            dt: "2023-12-25T07:37:32.006185+00:00",
            et: "icp",
            kt: "1",
            k: ["DOBaDQOTbreUoqMzCzX0f2ywCB2Qbv17qeHMlm85QjZZ"],
            nt: "1",
            n: ["EJqXepNeybydv7fb0FdRsDhWxia6i_bDCv1LyucSegMj"],
            bt: "1",
            b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
            c: [],
            ee: {
              s: "0",
              d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
              br: [],
              ba: [],
            },
            di: "",
          },
          {
            vn: [1, 0],
            i: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
            s: "0",
            p: "",
            d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
            f: "0",
            dt: "2023-12-25T07:42:44.975239+00:00",
            et: "icp",
            kt: "1",
            k: ["DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5"],
            nt: "1",
            n: ["EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u"],
            bt: "1",
            b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
            c: [],
            ee: {
              s: "0",
              d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
              br: [],
              ba: [],
            },
            di: "",
          },
        ],
        name: "6eaf3e83-eb11-4146-bfb3-17e67c38199a",
      },
      e: {
        icp: {
          v: "KERI10JSON0001b7_",
          t: "icp",
          d: "ENWBYC6g1-e3SyAB6PnjYwKMpQNw-jUwO_I9VUvYzM8_",
          i: "ENWBYC6g1-e3SyAB6PnjYwKMpQNw-jUwO_I9VUvYzM8_",
          s: "0",
          kt: "2",
          k: [
            "DOBaDQOTbreUoqMzCzX0f2ywCB2Qbv17qeHMlm85QjZZ",
            "DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5",
          ],
          nt: "2",
          n: [
            "EJqXepNeybydv7fb0FdRsDhWxia6i_bDCv1LyucSegMj",
            "EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u",
          ],
          bt: "1",
          b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
          c: [],
          a: [],
        },
        d: "EGG3Bma__y5CHGYDlGWKCcJNoO826bIXgrGwJBhz9OyV",
      },
    };
    const aid = {
      name: "4130a76b-21d9-4a21-bdd4-40219b157be5",
      prefix: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
      salty: {
        sxlt: "1AAHhHKLzBwuO8s6Ntzb0OJ3vd8apYe5SsqAvaA_k3ac-Qu9Om-HHJCUac5Wh0EIuhySrrHYoiJV9KdJrEJiRjLULVdS0UR7T4cv",
        pidx: 0,
        kidx: 0,
        stem: "signify:aid",
        tier: "low",
        dcode: "E",
        icodes: ["A"],
        ncodes: ["A"],
        transferable: true,
      },
      transferable: true,
      state: {
        vn: [1, 0],
        i: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
        s: "0",
        p: "",
        d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
        f: "0",
        dt: "2023-12-25T07:36:32.350862+00:00",
        et: "icp",
        kt: "1",
        k: ["DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5"],
        nt: "1",
        n: ["EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u"],
        bt: "1",
        b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
        c: [],
        ee: {
          s: "0",
          d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
          br: [],
          ba: [],
        },
        di: "",
      },
      windexes: [0],
    };
    const result = await api.joinMultisig(exn, aid, utils.uuid());
    expect(result).toHaveProperty("op");
    expect(result).toHaveProperty("icpResult");
    expect(result).toHaveProperty("name");
  });

  test("should create a new delegation identifier with a random UUID as the name", async () => {
    const delegatorPrefix = "ABC123";
    const result = await api.createDelegationIdentifier(delegatorPrefix);
    expect(result).toEqual({
      signifyName: expect.any(String),
      identifier: expect.any(String),
    });
  });

  test("should wait for the key state query operation to complete", async () => {
    const signifyName = "exampleSignifyName";
    const result = await api.delegationApproved(signifyName);
    expect(result).toEqual(true);
  });

  test("should call signifyClient.identifiers().interact with the correct parameters", async () => {
    const signifyName = "exampleSignifyName";
    const delegatePrefix = "exampleDelegatePrefix";

    const result = await api.interactDelegation(signifyName, delegatePrefix);

    expect(result).toEqual(true);

    expect(interactMock).toHaveBeenCalledWith(signifyName, {
      i: delegatePrefix,
      s: "0",
      d: delegatePrefix,
    });
  });

  test("should call signifyClient.identifiers().rotate with the correct parameters", async () => {
    const signifyName = "exampleSignifyName";
    await api.rotateIdentifier(signifyName);
    expect(rotateMock).toHaveBeenCalledWith(signifyName);
  });

  test("can create Keri multisig rotation", async () => {
    const aid = {
      name: "0d5d804a-eb44-42e9-a67a-7e24ab4b7e42",
      prefix: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
      salty: {},
      transferable: true,
      state: {
        vn: [1, 0],
        i: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
        s: "0",
        p: "",
        d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
        f: "0",
        dt: "2023-12-25T07:37:32.006185+00:00",
        et: "icp",
        kt: "1",
        k: ["DOBaDQOTbreUoqMzCzX0f2ywCB2Qbv17qeHMlm85QjZZ"],
        nt: "1",
        n: ["EJqXepNeybydv7fb0FdRsDhWxia6i_bDCv1LyucSegMj"],
        bt: "1",
        b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
        c: [],
        ee: {
          s: "0",
          d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
          br: [],
          ba: [],
        },
        di: "",
      },
      windexes: [0],
    };
    const otherAids = [
      {
        state: {
          vn: [1, 0],
          i: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
          s: "0",
          p: "",
          d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
          f: "0",
          dt: "2023-12-25T07:42:44.975239+00:00",
          et: "icp",
          kt: "1",
          k: ["DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5"],
          nt: "1",
          n: ["EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u"],
          bt: "1",
          b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
          c: [],
          ee: {
            s: "0",
            d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
            br: [],
            ba: [],
          },
          di: "",
        },
      },
    ];
    const result = await api.rotateMultisigAid(aid, otherAids, utils.uuid());
    expect(result).toHaveProperty("op");
    expect(result).toHaveProperty("icpResult");
    expect(exchangeSendMock).toBeCalledWith(
      expect.any(String),
      "multisig",
      expect.any(Object),
      MultiSigRoute.ROT,
      expect.any(Object),
      {
        rot: [{ ked: { i: expect.any(String) } }, "string"],
      },
      ["EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb"]
    );
  });
  test("can join Keri multisig rotation", async () => {
    const exn = {
      v: "KERI10JSON0007bf_",
      t: "exn",
      d: "EPwR9xi7f8yMFYb31uRiPjwSWgzD40jLCUosxJe2k1aM",
      i: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
      p: "",
      dt: "2023-12-25T07:57:40.307000+00:00",
      r: "/multisig/icp",
      q: {},
      a: {
        gid: "ENWBYC6g1-e3SyAB6PnjYwKMpQNw-jUwO_I9VUvYzM8_",
        smids: [
          "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
          "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
        ],
        rmids: [
          "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
          "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
        ],
        rstates: [
          {
            vn: [1, 0],
            i: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
            s: "0",
            p: "",
            d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
            f: "0",
            dt: "2023-12-25T07:37:32.006185+00:00",
            et: "icp",
            kt: "1",
            k: ["DOBaDQOTbreUoqMzCzX0f2ywCB2Qbv17qeHMlm85QjZZ"],
            nt: "1",
            n: ["EJqXepNeybydv7fb0FdRsDhWxia6i_bDCv1LyucSegMj"],
            bt: "1",
            b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
            c: [],
            ee: {
              s: "0",
              d: "EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7",
              br: [],
              ba: [],
            },
            di: "",
          },
          {
            vn: [1, 0],
            i: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
            s: "0",
            p: "",
            d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
            f: "0",
            dt: "2023-12-25T07:42:44.975239+00:00",
            et: "icp",
            kt: "1",
            k: ["DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5"],
            nt: "1",
            n: ["EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u"],
            bt: "1",
            b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
            c: [],
            ee: {
              s: "0",
              d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
              br: [],
              ba: [],
            },
            di: "",
          },
        ],
        name: "6eaf3e83-eb11-4146-bfb3-17e67c38199a",
      },
      e: {
        icp: {
          v: "KERI10JSON0001b7_",
          t: "icp",
          d: "ENWBYC6g1-e3SyAB6PnjYwKMpQNw-jUwO_I9VUvYzM8_",
          i: "ENWBYC6g1-e3SyAB6PnjYwKMpQNw-jUwO_I9VUvYzM8_",
          s: "0",
          kt: "2",
          k: [
            "DOBaDQOTbreUoqMzCzX0f2ywCB2Qbv17qeHMlm85QjZZ",
            "DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5",
          ],
          nt: "2",
          n: [
            "EJqXepNeybydv7fb0FdRsDhWxia6i_bDCv1LyucSegMj",
            "EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u",
          ],
          bt: "1",
          b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
          c: [],
          a: [],
        },
        d: "EGG3Bma__y5CHGYDlGWKCcJNoO826bIXgrGwJBhz9OyV",
      },
    };
    const aid = {
      name: "4130a76b-21d9-4a21-bdd4-40219b157be5",
      prefix: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
      salty: {
        sxlt: "1AAHhHKLzBwuO8s6Ntzb0OJ3vd8apYe5SsqAvaA_k3ac-Qu9Om-HHJCUac5Wh0EIuhySrrHYoiJV9KdJrEJiRjLULVdS0UR7T4cv",
        pidx: 0,
        kidx: 0,
        stem: "signify:aid",
        tier: "low",
        dcode: "E",
        icodes: ["A"],
        ncodes: ["A"],
        transferable: true,
      },
      transferable: true,
      state: {
        vn: [1, 0],
        i: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
        s: "0",
        p: "",
        d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
        f: "0",
        dt: "2023-12-25T07:36:32.350862+00:00",
        et: "icp",
        kt: "1",
        k: ["DIDpyM3TPrV5-ZwpiFDU9HtI9-zXpHtOGLNzfUrzLOs5"],
        nt: "1",
        n: ["EMnyXeI28CtemqNmxget-4Xn1DrKehDect1qHwfREo1u"],
        bt: "1",
        b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"],
        c: [],
        ee: {
          s: "0",
          d: "EJz3axjzmaJOracwpOXTyxtghohwAK7ly0qhCq9-5Bsb",
          br: [],
          ba: [],
        },
        di: "",
      },
      windexes: [0],
    };
    const result = await api.joinMultisigRotation(exn, aid, utils.uuid());
    expect(result).toHaveProperty("op");
    expect(result).toHaveProperty("icpResult");
    expect(result).toHaveProperty("name");
    expect(exchangeSendMock).toBeCalledWith(
      expect.any(String),
      "multisig",
      expect.any(Object),
      MultiSigRoute.IXN,
      expect.any(Object),
      {
        rot: [{ ked: { i: expect.any(String) } }, "string"],
      },
      ["EAEMpz0cdBEQN5GSr6NYRYV3PIeF-eBNn64kg4yLFu_7"]
    );
  });

  test("should call signifyClient.identifiers().members with the correct parameters", async () => {
    const signifyName = "exampleSignifyName";
    await api.getMultisigMembers(signifyName);
    expect(membersMock).toHaveBeenCalledWith(signifyName);
  });
});
