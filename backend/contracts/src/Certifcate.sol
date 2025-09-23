// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/access/AccessControl.sol";
import {ERC721URIStorage} from "@openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/token/ERC721/ERC721.sol";

contract CertificateRegistry is AccessControl, ERC721URIStorage {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct CertificateData {
        bytes32 dataHash;
        address learner;
        address issuer;
        string certType;
        uint256 issuedAt;
        uint256 validUntil;
        bool revoked;
    }

    mapping(uint256 => CertificateData) public certificates;
    uint256 private _nextTokenId = 1;

    mapping(bytes32 => uint256) public customIdToTokenId;
    mapping(uint256 => bytes32) public tokenIdToCustomId;

    constructor() ERC721("CertificateRegistry", "CERT") AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantIssuerRole(address _account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ISSUER_ROLE, _account);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // The main function to issue the certificate
    function issueCertificate(
        address learner,
        string calldata customCertId,
        bytes32 datahash,
        string memory metadataURI,
        string calldata certType,
        uint256 validUntil
    ) external onlyRole(ISSUER_ROLE) {
        bytes32 customIdHash = keccak256(abi.encodePacked(customCertId));

        // --- Call our new helper functions step-by-step ---
        _validateIssuance(customIdHash);

        uint256 newCertId = _generateNewTokenId();

        _mintCertificate(learner, newCertId, metadataURI);

        _linkIds(customIdHash, newCertId);

        _storeCertificateData(newCertId, datahash, learner, certType, validUntil);
    }

    // --- Revoke certificate ---
    // give it issuer only role
    // it can only be revoked once not be validated again
    function revokeCertificate(uint256 certId) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender), "Not authorized");
        // By calling ownerOf, we implicitly check for existence.
        // If the token doesn't exist, this line will revert the transaction
        // with a standard "token nonexistent" error message.
        ownerOf(certId);
        certificates[certId].revoked = true;
    }

    // --- Verify ---
    function verifyCertificate(uint256 certId, bytes32 providedHash)
        external
        view
        returns (bool valid, address issuer, uint256 issuedAt, bool revoked)
    {
        // If the timestamp is 0, it means we never created this certificate record.
        if (certificates[certId].issuedAt == 0) {
            return (false, address(0), 0, false);
        }

        CertificateData memory cert = certificates[certId];
        bool hashMatches = (cert.dataHash == providedHash);

        return (
            hashMatches && !cert.revoked,
            ownerOf(certId), // learner’s wallet = owner
            cert.issuedAt,
            cert.revoked
        );
    }

    // --- INTERNAL HELPER FUNCTIONS ---

    function _validateIssuance(bytes32 customIdHash) internal view {
        require(customIdToTokenId[customIdHash] == 0, "Custom Cert ID already in use");
    }

    function _generateNewTokenId() internal returns (uint256) {
        uint256 newCertId = _nextTokenId;
        _nextTokenId++;
        return newCertId;
    }

    function _mintCertificate(address learner, uint256 tokenId, string memory uri) internal {
        _safeMint(learner, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _linkIds(bytes32 customIdHash, uint256 tokenId) internal {
        customIdToTokenId[customIdHash] = tokenId;
        tokenIdToCustomId[tokenId] = customIdHash; // Corrected a small bug here
    }

    function _storeCertificateData(
        uint256 tokenId,
        bytes32 datahash,
        address learner,
        string calldata certType,
        uint256 validUntil
    ) internal {
        certificates[tokenId] = CertificateData({
            dataHash: datahash,
            revoked: false,
            issuedAt: block.timestamp,
            learner: learner,
            issuer: msg.sender,
            certType: certType,
            validUntil: validUntil
        });
    }

    // Soulbound restriction (OZ v5.x style)
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0)) {
            revert("Soulbound: transfers disabled");
        }

        return super._update(to, tokenId, auth);
    }
}

// Layout of Contract:
// version
// imports
// interfaces, libraries, contracts
// errors
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions
