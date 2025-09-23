// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CertificateRegistry} from "../src/Certifcate.sol";

contract Deploy is Script {
    function run() external returns (CertificateRegistry) {
        // The address that will be the DEFAULT_ADMIN_ROLE
        // address admin = vm.envAddress("PUBLIC_KEY"); // Your public wallet address

        vm.startBroadcast();

        CertificateRegistry registry = new CertificateRegistry();

        vm.stopBroadcast();
        return registry;
    }
}
