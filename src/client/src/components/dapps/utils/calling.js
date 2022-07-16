import { ethers } from "ethers";

function formatMsgVal(value) {
    return ethers.utils.parseUnits(value.toString(), "wei");
}

export { formatMsgVal }
