import {Blockfrost} from "../api/ApiProvider/Blockfrost/BlockfrostApi";

export const Playground = async (props?: any) => {

    console.log("lets init blockfrost");
    await Blockfrost.init('preview');
    const latestParameters = await Blockfrost.epochsLatestParameters();
    console.log("latestParameters");
    console.log(latestParameters);
    const accountState = await Blockfrost.accountState('stake_test1uz4j5w46kceey5kflku62xh9szvk2n3rj88qwct0pcdhxjc4vk9ws');
    console.log("accountState");
    console.log(accountState);

}
